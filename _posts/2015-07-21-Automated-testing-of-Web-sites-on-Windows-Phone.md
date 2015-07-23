---
layout: post
title:  "Automated testing of Web sites on Windows Phone"
author: "Ville Rantala"
author-link: "http://github.com/vjrantal"
#author-image: "{{ site.baseurl }}/images/VillaRantala/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Windows-Phone WebDriver Automated-Testing Websites Internet-Explorer
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Testing with web sites on Windows Phone.
---

This case study walks through how a developer can create an automated test suite to test Web sites on Windows Phone devices. Anyone who is building Web sites for Windows Phone can use this solution to automate their on-device testing.

## Customer Problem

Web sites need to work on various Web browsers including multiple versions of mobile browsers on many different mobile operating systems. Testing on each one manually is time consuming, error-prone, and expensive; creating an automated test suite is a preferable strategy.

A commonly used approach is to build a test suite on top of frameworks and tooling that rely on the target browser’s support for the [Selenium project](http://www.seleniumhq.org/)’s [WebDriver](http://www.w3.org/TR/webdriver/) API.

There are many popular solutions to run WebDriver-based tests on Android and iOS based devices. Examples of such solutions are [Selendroid](http://selendroid.io/) for Android and [ios-driver](http://ios-driver.github.io/ios-driver/) for iOS. However, the options for Windows Phone devices aren't as widely available.

## Overview of the Solution

One solution for running tests on Windows Phones devices is the open source [Windows Phone WebDriver](http://winphonewebdriver.codeplex.com/). It enables tests to be run on both Windows Phone emulators and real devices.

An overview of the solution architecture is illustrated below.

![Figure 1]({{site.baseurl}}/images/2015-07-21-Automated-testing-of-Web-sites-on-Windows-Phone_images/image001.png)

More information about the project can be found on its CodePlex [pages](http://winphonewebdriver.codeplex.com/).

## Implementation

The project uses “[automation atoms](https://code.google.com/p/selenium/wiki/AutomationAtoms)” from the Selenium open source project, which enables developers to add new functionality without writing lots of code in the driver. Each “atom” is a reusable building block written in JavaScript, and abstracts the browser-specific implementations of commonly-used functionality. For example, there is JavaScript atom to find elements in the DOM, so that the developer doesn’t have to re-implement that functionality for every browser.

While the driver tests how Web sites behave in Internet Explorer on Windows Phone devices, the driver doesn’t actually use the Internet Explorer app, but performs all testing inside an embedded Web browser control. This approach isn’t 100% accurate in replicating the target context, but since the Web browser and browser control share the same rendering engine, enough similarities exists to make the test results meaningful in the development process.  A final verification should be done manually using Internet Explorer.

## Challenges

### End-to-end solution limitations

Providing a reliable end-to-end solution for running automated tests involves more than just supporting WebDriver on the target browser. Typically, the automated tests are run within a continuous integration (CI) system where the reliability of the entire system is a must.

To do continuous integration, you must be able to reliably and continuously run a Windows Phone device that can be invoked by the CI system used. The testing software must not crash and in case of app (or device) crashes, there must be failover mechanisms in place that don’t require manual intervention.

While this driver is fairly easy to setup and can be used from any operating system, it doesn’t contain components that handle the reliability aspects such as ensuring the driver app is always running and able to respond to test requests. Such functionality should be either built on top of the driver or it should be expected that sometimes manual intervention is necessary.

These limitations are specific to how this WebDriver solution is implemented. For example, [Selendroid](http://selendroid.io/) for Android and [ios-driver](http://ios-driver.github.io/ios-driver/) for iOS have a desktop server component that manages the lifecycle of the components running in the device. There is also [another WebDriver solution](https://github.com/forcedotcom/windowsphonedriver) for Windows Phones that has a desktop server, but that solution requires a Windows PC.

### WebBrowser Control Limitations

The [WebBrowser Control](https://msdn.microsoft.com/en-us/library/windows/apps/ff431797%28v=vs.105%29.aspx) on Windows Phone has the required API to inject the automation atoms into the Web context, but sometimes JavaScript errors occur inside the WebBrowser that are hard to debug. Each time an error occurs, an unknown error is reported by the system without enough context about what went wrong.

Consequently, debugging the root cause of these failures can be difficult. An easier approach is to debug these specific cases in the Internet Explorer browser using the [new tools](http://blogs.msdn.com/b/visualstudioalm/archive/2014/04/04/diagnosing-mobile-website-issues-on-windows-phone-8-1-with-visual-studio.aspx) available in Visual Studio.

### Requiring Windows Phone tooling

The tests can be executed from any computer (Mac, Linux, Windows).  To initially deploy the app package to a Windows Phone and to unlock a device for side-loading, the Windows Phone SDK is required.

If requiring the Windows Phone SDK is a blocker, one solution is to publish the app in Windows Phone Store so that developers could download the app to any consumer device via the Store app.

## Getting Started

- Clone the [source](http://winphonewebdriver.codeplex.com/SourceControl/network/forks/vjrantal/winphonewebdriver) <span class="MsoHyperlink">code</span>

1.  Open the solution file in Visual Studio and deploy the solution to a Windows Phone 8.1 device (or emulator)
2.  Have existing WebDriver-based test suite available or write some tests using some of the [supported language bindings](http://www.seleniumhq.org/download/#client-drivers) (see example test from below)
3.  Configure your test runner to use the driver as the remote WebDriver endpoint

A [blog post](http://blog.vjrantal.net/2015/02/05/angularjs-automated-testing-on-windows-phone/) contains more information about how to setup the driver and gives details on how to setup tests of an AngularJS-based app to be executed against the driver.

The blog post also includes a [video](https://www.youtube.com/watch?v=juU2GHyCOJc) that shows Ionic framework’s tests running on a physical device.

### Example test

This example test uses the [selenium-webdriver](https://www.npmjs.com/package/selenium-webdriver), which is a language binding for JavaScript and can be used in node.js apps.

First, install the package with:

```
$ npm install selenium-webdriver
```

Then, add a file called _example.js_ with this content:

```
1.	var webdriver = require('selenium-webdriver'),  
2.	    By = require('selenium-webdriver').By,  
3.	    until = require('selenium-webdriver').until;  
4.
5.	var capabilities = {  
6.	  'seleniumProtocol': 'WebDriver',  
7.	  'browserName': 'Internet Explorer'  
8.	}  
9.
10.	// This needs to be the IP of the Windows Phone device  
11.	var server = 'http://<IP.OF.THE.DEVICE>:8080';  
12.
13.	var driver = new webdriver.Builder()  
14.	    .usingServer(server)  
15.	    .withCapabilities(capabilities)  
16.	    .build();  
17.
18.	driver.get('https://github.com/search');  
19.	driver.findElement(By.name('q')).sendKeys('Microsoft');  
20.	driver.findElement(By.css('#search_form .btn')).click();  
21.	driver.wait(until.titleContains('Microsoft'), 10000);  
22.	// At this point, the search results are available  
23.	driver.quit();  
```

After that, you should be able to run the test with:

```
$ node example.js
```

If the connection to the device works, the script should exit without any errors and the device should have a screen that shows something like this:

![Screenshot]({{site.baseurl}}/images/2015-07-21-Automated-testing-of-Web-sites-on-Windows-Phone_images/image002.png)

In above screen, we can see that the right page was loaded, the text was inputted to the right input field and results were received to the search made.
