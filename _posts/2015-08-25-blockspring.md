---
layout: post
title:  "Wicked Cool Excel Function with Blockspring"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
#author-image: "{{ site.baseurl }}/images/FelixRieseberg/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
tags: Office OfficeJS Excel Blockspring Desktop
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Wicked Cool Excel Function with Blockspring
---

A small Y Combinator startup is trying to completely remove all constraints for functions in spreadsheets: It enables users to create and share custom functions for Google Sheets and Office in Node.js, Python, R, JavaScript, PHP and Ruby, running complex calculations in the cloud and pushing the results to your spreadsheet. 

You can easily create a spreadsheet that searches Twitter for “#Windows10”, take all the names of the people who wrote tweets, find their LinkedIn profiles, and run image analysis on their profile pics. Or do anything else. Blockspring has thousands of functions at this point. This case study describes how we helped turn the Blockspring addon into a modern Office Add-In and made it available in Excel 2015, Excel Online, and Excel for iPad.

![Blockspring in Action]({{site.baseurl}}/images/2015-08-25-blockspring_images/preview.gif)

## It’s More Difficult if it’s Cross-Platform
Plugins for Office are not necessarily a new idea, but the old plugin model is gone - with Office now running on tablets and computers as well as on all major operating systems (iOS, Android, Windows), the Office team was forced to rethink the interaction between add-ins and Office entirely. The result is OfficeJS, a clever, but still limited approach to building add-ons with HTML5 and JavaScript. While more and more features are added as time goes on, one thing is still missing from the cross-platform OfficeJS: Custom functions.

Custom functions seem like a core feature for any startup trying to build a business around user-defined functions, but through clever engineering, we managed to find a way enabling Excel users to use Blockspring’s amazing repository of custom functions.

## Overview of the Solution
We started with various hacks around the current platform limitation, but Blockspring ended up with a smart implementation: Instead of using the official function `call=function(param)` they are now simply using function(param), thus not baiting Office into complaining about an incorrect function call.

Observing the whole table or getting access to the table data remains tricky, but OfficeJS does allow developers to read and write to the current selection. The add-in now features a simple flow: select a function, insert the function call into a cell, and execute the calculation by clicking a "Run function in Current Cell" button.

 
## Implementation
Modern Office Add-Ins are basically just small web apps, written in HTML5 and JavaScript. They are displayed in a small WebView next to the spreadsheet and given access to office methods through OfficeJS, which provides various APIs to communicate with the native parts of Office. For those readers familiar with the concept behind Apache Cordova, this approach is very similar.

Let’s take a look at some code, starting with observing the spreadsheet. As outlined earlier, OfficeJS does not allow observation of the whole spreadsheet, so as a workaround, one has to observe the current user selection and read the data therein.

##### Getting Cell Data
```
function getDataFromSelection(callback) {  
  Office.context.document.getSelectedDataAsync(Office.CoercionType.Matrix,
    function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        callback(null, result);
      } else {
        callback(result.error);
      }
    }
  )
};
```

We can now read function calls from the selected cells, parse them, and kick off an asynchronous computation on Blockspring's servers. Once the result is returned, we can insert it into the document with a simple call:

##### Setting Cell Data
```
function setDataForSelection (newValue, callback) {  
  Office.context.document.setSelectedDataAsync(newValue, callback);
};
```

## Keeping the Functions Intact
OfficeJS does not currently support custom functions unlike the old plugin model does. So how do you make sure that Desktop installations of Excel are presented with a spreadsheet with functions intact?
To help developers cope with the missing access to the whole spreadsheet, OfficeJS allows the creation of named bindings. Those bindings are references to certain areas in the spreadsheet (cells, matrixes) that can be stored as part of the document. Even though the cell might contain raw text, the binding can be used to persist information about the original function. Let’s look at some code:

##### Creating a Named Binding
```
function bindNamedItem() {
  Office.context.document.bindings.addFromNamedItemAsync('myRange', 'matrix', {
    id:'myMatrix'
  }, function (result) {
    if (result.status === 'succeeded') {
      console.log('Added new binding with type: ' + result.value.type + ' and id: ' + result.value.id);
    } else {
      console.log('Error: ' + result.error.message);
    }
  });
}
```

Since the bindings are stored in the document, they can be accessed by a native plugin – and used to restore the function inside the cell.

## Opportunities for Reuse
While this workaround might feel a bit cumbersome compared to a native “custom functions” API, it does work for any kind of custom function implementation: In order to parse and execute a "custom function" in a cell, one simply has to get the current selection, parse the content with regular expressions (or anything else that runs in JavaScript) and send the result off to a web service running the actual function in a language of your choice. Once the service returns, you can overwrite the cell with the new value.

## Check out the Result!
All in all, Blockspring is an impressive showcase of how to use OfficeJS. If you want to turn your spreadsheets into magic, go get the add-in for Office here, for Google Sheets here, or visit their homepage here.