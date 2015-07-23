---
layout: post
title:  "Massively Scalable Graph-Based Computing in Azure"
author: "Barry Briggs"
author-link: "http://blogs.msdn.com/b/msarchitecture/"
#author-image: "{{ site.baseurl }}/images/BarryBriggs/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure Graph-Based Computing
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Massively Scalable Graph-Based Computing in Azure
---

Many customers are looking for ways to exploit the massive computing capability afforded by Microsoft Azure. On the one hand, enterprises are gathering, in real time, enormous amounts of data, gigabytes or even terabytes per day. On the other hand, they see the almost unlimited capacity in the cloud: but how best to take advantage of it to extract insights from all this data? This Case Study describes a computing pattern called “actor model” with one sample implementation that has been adapted for use by customers.

The sample application (more accurately, a _service)_ is a massively scalable parallelized, graph-based compute engine. Astute readers will recognize that graph-based processing is at the heart of one of the most compelling and popular computing paradigms of all time, the electronic spreadsheet. If such graphs could be placed in the cloud, could be spread out over dozens or hundreds of processors, then real-time computation (in this case using the world’s most common scripting language, Excel formulas) could be exponentially expanded.[2](#_ftn2)

## Overview of the Solution

This project has an unlikely underpinning: video games. The “Orleans” project at Microsoft was created to support multi-player gaming. Each user in multi-player mode communicates with a small body of code in Microsoft Azure which tracks that user’s relevant state – is s/he online, where in the game is s/he, and so on. Each such object communicates with other such objects representing other users in the particular game instance.

In Azure, Orleans runs as worker role instances. An Orleans application can transparently span multiple servers, where the runtime framework abstracts away from the developer much of the complexity of game and other sorts of Azure programming.

Orleans is an example of what has been called “actor model” programming. Actors are "the universal primitives of concurrent computation: in response to a message that it receives, an actor can make local decisions, create more actors, send more messages, and determine how to respond to the next message received.[3](#_ftn3) As implemented by Orleans, actors are simple, single-threaded .NET objects, usually fairly small, using asynchronous calling methods, and not blocking under any circumstances. Unlike other concurrency models, actors depend on a “shared-nothing” model; while actor instances may (and do) communicate with each other, they do not depend on shared resources and therefore do not implement locks (a message-passing pattern).[4](#_ftn4)

In many circumstances, the Orleans actor model can simplify the complexity of distributed computing. For example, a call from one actor to another – no matter what server the destination may be running on – is as simple as an asynchronous method call:

```
await result=anotherActor.getSomethingAsync();
```

This simplicity enables us to recreate the notion of a spreadsheet graph in a very straightforward way, with each cell represented as an instance of an actor.

The CloudSheet project used actor-model programming to implement “cells” in a cloud-based spreadsheet-like engine. We say “spreadsheet-like” because in CloudSheet the user interface is completely decoupled from the calculation engine, as shown below:

![Architecture]({{site.baseurl}}/images/2015-07-21-Massively-Scalable-Graph-Based-Computing-in-Azure_images/image001.png)

Figure 1. CloudSheet Architecture

The boxes labeled “cell” represent instances of the cell actor class, the core of CloudSheet. Each cell contains both code and data; the code includes a full recursive descent parser for Excel-like formulas,[5](#_ftn5) and a recalculation component, also recursive. The cell’s data comprises, among other things, the input provided by a user interface or another cell, lists of dependencies (i.e., other cells), current value, and so on.

When a new cell is created, say, when a user requests a cell via a UI, the Orleans runtime instantiates this new instance. Where the cell resides physically – that is, on which server or VM – is completely opaque to the application.

Here is how a cell is instantiated:

```
ICell thecell = CellFactory.GetGrain((long)cellasnumber);
ValType v = await thecell.CellGrainCreateNewCellV(text, addr);
```

The `GetGrain()` call creates a local reference to the soon-to-be-instantiated cell. `GetGrain()` can take a long, a string, or a GUID as its parameter; here we have converted the cell address into a long. The second call, which actually instantiates the cell in the cloud, passes the text to placed and evaluated in the cell (a number, text or formula) and the cell’s address as a structure. (A `Valtype` is a structure holding the cell’s input, formula, type, and other data useful in for a user interface.)

### User Interface

Of course, the most obvious UI for such a calculation engine is that of a spreadsheet:

![Screenshot]({{site.baseurl}}/images/2015-07-21-Massively-Scalable-Graph-Based-Computing-in-Azure_images/image002.jpg)

Figure 2. CloudSheet UI Sample

To be clear, this web-based UI does very little: it merely accepts input in the input box and places results in the appropriate grid locations. Since cells can change asynchronously, either in response to a recalculation of a predecessor cell or as the result of an external event, the UI polls the cloud-based engine for updates every 500ms, which, empirically, seems fast enough. The UI can issue other primitive commands, such as loading a file or clearing the entire sheet, which are passed on through the Web API to the engine.

The application data format of the messages is very simple: it is Excel. Any application that can send numbers, text or formulas in Excel format can use this engine.

Here is a trivial little XAML/C# application to prove the point:

![Screenshot]({{site.baseurl}}/images/2015-07-21-Massively-Scalable-Graph-Based-Computing-in-Azure_images/image003.png)

Figure 3. Another UI

When the user clicks “Submit”, in this case indicating that a new sale has occurred (and new data has been created), the three data items in the edit boxes are sent as new cells to CloudSheet. In this case these cells form a new row and the spreadsheet-like UI can be used to visualize all the purchases.

Of course, CloudSheet also supports import/export from Excel itself (through an Excel addin).

_Predecessors and Successors_

Each cell maintains a list of cells that it depends on, and cells that depend on it; these are called predecessors and successors, respectively (in other words, a directed acyclic graph). When a cell’s value is updated (which _follows_ its recalculation), it calls the method:

```
UpdateSuccessors();
```

which iterates through the list of successor cells and invokes their recalculation method:

```
await thecell.Recalc(_thechain);
```

When a given cell is recalculated, in turn, it iterates through the list of predecessors, if any, to retrieve their values, and so on.

The argument passed to the `Recalc()` method is a list of cells recalculated so far as part of this chain. If a given cell _finds itself_ in the chain, then a circular reference error is declared and recalculation of this chain is terminated.

### Taking Advantage of Cloud Scale

It is not enough that CloudSheet simply replicates Excel semantics and syntax in the cloud. What else can we do to take advantage of the scale available in Azure?

Since in the cloud we now have memory and compute resources limited only by the size of a subscription, we can take advantage of these essentially limitless capabilities. Now, it is certainly possible that we could load enormous data files taking up vast quantities of sheet real estate, but this would become unmanageable quickly. What would be a better way of loading and analyzing vast quantities of data such as are readily available from public sources?

One approach is to enhance the entire semantic of a cell. The new formula type _=DATA(file)_ permits users to load a tabular file into a single cell. Here is an example of such a file (an excerpt):

![Screenshot]({{site.baseurl}}/images/2015-07-21-Massively-Scalable-Graph-Based-Computing-in-Azure_images/image004.jpg)

Figure 4. GSOD for Greenland, 1986

Here, courtesy of the National Oceanic and Atmospheric Administration (NOAA), we see the Global Summary of the Day: the weather, in other words, for one year for one reporting station – here, in Greenland. High and low temperatures, dew point, wind speeds, and so on, are fairly self-explanatory.

We can load this entire file in a cell (say, A1) by using _=DATA(sheetcsvs\sample.op)_ where _sheetcsvs_ is the Azure container. Once loaded, we can query it with _=SELECT(A1, 2, 19860301, 3)_ which says “for the file in A1, find the key 1986030 in column 2, and return the value in column 3.” [6](#_ftn6)

We can also use _=DATAAVG()_ to find the average value of a column; for example, the average temperature for Greenland in 1986 would be found by _=DATAAVG(A1, 3). =DATAMIN()_ and _=DATAMAX()_ find minimum and maximum values, respectively.

_=DATA_ cells evolve the notion of a spreadsheet to that of what was once called a “spreadbase”. =_DATA_ and related cells enable real-time, interactive analysis of very large bodies of data using the most common scripting language in use today, Excel formulas.

Given that CloudSheet lives in the cloud, and thus, on the web, other things are easy to implement. CloudSheet is Web-native. For example, an _=STOCK(symbol)_ retrieves real-time values of a particular equity. _=LOCATION(cell1, cell2)_ uses the values of two cells as latitude and longitude and, using Bing Maps API’s, returns the city and state/country in text.

### Events

It is trivially easy to enable cells to accept events from other sources (say, IoT devices or a streaming stock feed, for an active trader trade station analytical tool):

```
public async Task<bool> UpdateValue(int val)
{
    _value = val;
    await _celldir.CellChange(_celladdr);
    return true;
}
```

 Since cells are .NET objects, incidentally, it is also quite easy to create a new cell type (say, a “sensor” cell to receive events).

### Why This Matters

Unlike traditional big data solutions, CloudSheet implements a live, in-memory calculation engine in which new data or formulas can be added at any time, or interactively, in a manner that is very approachable by ordinary mortals. Thus, when a massive amount of data is loaded, users can easily manipulate directly – as they do today with Excel – but potentially using the scale of the cloud.

How big can a spreadsheet be?

CloudSheet currently holds the record (as far as we know) for the largest spreadsheet in history, with 470,000 cells holding (using _=DATA_) just less than 2.3 billion data items (all the world’s weather data for just under a century; over 13,000 reporting stations).  This spreadsheet – all of it in memory – utilized 146 processors on 18 servers in Azure. CloudSheet will _always_ hold this record; all that is needed is more data and more processors.

Here is a screenshot of the “record.” Each cell holds the number of data items in the file loaded by the cell; for example, in cell cc6 the file in that cell has 8052 data points. (Note not every station reports every year, for various reasons – wars, closings, etc.; hence the blank cells.) The red circle holds a simple _=sum()_ formula (typed in manually, after the data was loaded) to add the total number of data items.

![Screenshot]({{site.baseurl}}/images/2015-07-21-Massively-Scalable-Graph-Based-Computing-in-Azure_images/image005.png)

Figure 5\. CloudSheet Holding All the World's Weather

Second, as mentioned in passing earlier, CloudSheet is _not_ an application. It is a _service_ in the cloud. As such it is intrinsically multi-user. Moreover any application can use its REST API’s to send and receive data – regardless of user interface modality.

## Challenges

There are a number of challenges and potential “gotcha’s” in a massively distributed system such as Orleans/Cloudsheet.

_Directory_

Orleans does not, out of the box, provide a “directory” function, that is, a way to find out if a given object already exists or not. This is important because any reference to a nonexistent actor will instantiate it, causing needless overhead.[7](#_ftn7)

In CloudSheet, therefore, there is a CellDirectory actor which holds a list of every cell that has been instantiated in the sheet. Any range operation, then, will iterate over the range in a two-step process, first ascertaining if the cell actually exists:

```
¬bool bExists=await _cellDirectory.CellExists(long celladdress);
```

And then if so, retrieving the value.

### To Parallelize or Not?

It is tempting with a massively distributed system to make extensive use of the Task Parallel Library (TPL)[8](#_ftn8) and in particular use scatter/gather approaches in certain cases. For example, when refreshing the screen, one can conceive of a number of parallel “get” operations (to retrieve the values from cell instances), concluding with a `.WhenAll` when all the values are in; something conceptually like this:

```
ICell cella=GetCellInterface(a1);
ICell cellb=GetCellInterface(b1);
Task<double> a= cella.GetCellValue();
Task<double> b= cellb.GetCellValue();
Task tall=Task.WhenAll(a,b);
await tall;
```

It turns out that on each server actors run as DLLs in a single-threaded address space and so the degree of parallelism isn’t as significant as might appear. When retrieving a lot of data (hundreds of cell values for example) this approach is surprisingly slow – and is far better implemented as a cache.

### Reentrancy

For speed, it is possible to make actors “reentrant” by adding the [Reentrant] directive. For example, here is the class declaration for the cell actor:

```
[Reentrant]  
public class Cell: Orleans.Grain<ICellState>, ICell  
{
```

Reentrant here means that multiple threads may be executing _different_ methods in the class _simultaneously._ This can cause problems if the programmer is not careful. For example, we may have a method that adds data to a `List<>:`

```
public Task<int> AddCellToDirectory(CellAddress cell)
{
   _mdcells.Add(cell);
   return Task.FromResult(_mdcells.Count);
}
```

However, we may also have another method which is iterating over the list, in this case `_mdcells`. This will cause an unexpected error as the List size will change during the iteration, causing an exception.

## Code Artifacts

As CloudSheet has been filed for a US patent, the source code is not, at this writing, available, as licensing terms are being worked out.

The Orleans framework can be viewed and downloaded from [http://www.github.com/dotnet/orleans](http://www.github.com/dotnet/orleans).

## Opportunities for Reuse

The architectural pattern in CloudSheet – a directory, a large number of same-type actors, one or more caches of various types – is one that has potential for considerable reuse. In fact, one large financial services customer has already adapted some of CloudSheet’s architectural patterns for an application which is going into production imminently (2QCY15).

Actors are an efficient, easy way to develop scalable applications in which there are many, many objects that are relatively autonomous but require computation. For example, in the Internet of Things, actors can represent “things” that require some level of cloud control; and the actor instances themselves can also have logic to log activity, provide information to reporting and machine learning components, and so on. Similarly, in financial applications, CloudSheet can enable users to see, manipulate and analyze vast quantities of historical and real-time data.

Ultimately, services like CloudSheet and frameworks such as the actor model provide examples of how cloud computing can remove nearly all resource limitations from applications.


* * *

<a id="_ftn1"></a>

[1](#_ftn1) NOTE: a patent application has been submitted to the USPTO for technology described in this paper.

<a id="_ftn2"></a>

[2](#_ftn2) A video describing CloudSheet and its architecture can be found here: [https://www.youtube.com/v/IxqkcgKEX8I](https://www.youtube.com/v/IxqkcgKEX8I)

<a id="_ftn3"></a>

[3](#_ftn3) Wikipedia, [http://en.wikipedia.org/wiki/Actor_model](http://en.wikipedia.org/wiki/Actor_model)

<a id="_ftn4"></a>

[4](#_ftn4) If multiple actor instances are calling a single method, the framework (Orleans) manages the queuing. This is opaque to the actual actors themselves.

<a id="_ftn5"></a>

[5](#_ftn5) The cell actor class supports approximate 60 Excel-style formula types (_=sum(), =pow,_ etc) and formulas can be of arbitrary complexity and depth.

<a id="_ftn6"></a>

[6](#_ftn6) An enhancement will be to add an HTTP endpoint to this function. H/T to scicoria.

<a id="_ftn7"></a>

[7](#_ftn7) Consider the formula _=sum(a1:cc1000000)_, a perfectly legitimate formula in CloudSheet. If the code were to reference each individual cell, it would actually instantiate it, even if only one cell in the entire range actually had a value.

<a id="_ftn8"></a>

[8](#_ftn8) [https://msdn.microsoft.com/en-us/library/dd460717(v=vs.110).aspx](https://msdn.microsoft.com/en-us/library/dd460717(v=vs.110).aspx)
