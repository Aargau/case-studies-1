---
layout: post
title:  "Real-time Maps with Event Hubs and SignalR Using Leaflet"
author: "Mike Lanzetta"
author-link: "http://www.mikelanzetta.com"
#author-image: "{{ site.baseurl }}/images/Authors/MikeLanzetta.png" //should be square dimensions
date:   2015-08-26 16:23:28
tags: Azure EventHubs Leaflet SignalR Geo Maps Cloud
color: "blue"
#image: "{{ site.baseurl }}/images/2015-08-26-Real-Time-Maps-with-Event-Hubs-and-SignalR/route_animation.gif" #should be ~350px tall
excerpt: Real-time Maps with Event Hubs and SignalR Using Leaflet
---

### Problem

Here on the Partner Catalyst team at Microsoft, we work with partners from all over the world on everything from long-term projects to week-long hackfests. Recently, we spent a week in Hamburg, Germany, working with [Ströer](http://www.stroeer.com/) to help them tackle some thorny data visualization and data-handling problems. 

They had a large corpus of geographic data on the foot-traffic patterns of people within the city (entirely anonymized), and wanted to gain some insight as to where traffic might congregate and when, getting a rough sense of "page views" for their physical advertising emplacements (e.g. billboards). Naturally, as in any mature industry, they had groups and standards providing rough values for these numbers, but real data was harder to come by and until now had required large surveys and estimation.

If we could gather this data in real-time, we could not only more effectively target content to where it will be seen, but we could measure engagement. If we could measure engagement, we could work with the city of Hamburg to try and make the people happier, and measure results (this was my first inkling I wasn't working with a US company).

### Visualizing the Data

These were grandiose notions, to be sure, but the first step was to visualize the data. As with all geographic data, the only way to get a proper sense of what it looks like is to visualize it on a map, so we needed a way to get real-time data from mobile applications to our map visualization. The resulting website after all was said and done (remember, we had less than a week :) ) looked something like this:

![Screenshot of ASP.Net application]({{ site.baseurl }}/images/2015-08-26-Real-Time-Maps-with-Event-Hubs-and-SignalR/route_animation.gif)

### The Infrastructure

We built a [Cordova](http://cordova.apache.org/)-based mobile app driving geo data into [Event Hubs](http://azure.microsoft.com/en-us/services/event-hubs/) (for future data), and a C#-based CLI for driving their existing data into Event Hubs as a spoof "real-time" feed. Now that we had our geo data, we built an [EventProcessorHost](https://www.nuget.org/packages/Microsoft.Azure.ServiceBus.EventProcessorHost) to consume it from within our ASP.Net website, do any required pre-processing, and drive the resulting data through to listening clients via [SignalR](http://signalr.net/). Our main client was a single-page web application using [Leaflet.js](http://leafletjs.com/) to render the most recent paths, and per-person and aggregated heatmaps.

![Data Flow]({{ site.baseurl }}/images/2015-08-26-Real-Time-Maps-with-Event-Hubs-and-SignalR/geo_data_flow.png)

The ASP.Net application was [released on GitHub](https://github.com/noodlefrenzy/asp-mappy), and a more detailed walkthrough can be found [on my blog](http://www.mikelanzetta.com/2015/08/real-time-mapping-with-signalr-and-event-hubs/).

Future work involves integrating our more precise and stable Geodesy library for location binning and accurate heatmaps, and follow-on work involves driving a Spark pipeline from the EventHubs data to do additional aggregation and processing. These works in progress will result in future case studies, but the [Geodesy library](https://github.com/juergenpf/Geodesy) is [out now on Nuget](http://www.nuget.org/packages/Geodesy/).  

### Using the Website

To use this application yourself, you just need to set up an appropriate Event Hub and drive traffic through it. With the CLI I have checked in, it sends random point data through the pipeline and then renders it, so you don't even need a data source to get started.

I've created a utility method that allows you to pull configuration data from either the cloud config, `web/app.config` or environment variables of the same name:

```
    private static ConcurrentDictionary<string, string> _ConfigurationEntries = new ConcurrentDictionary<string, string>();

    public static string FromConfiguration(string name)
    {
        return _ConfigurationEntries.GetOrAdd(name, 
            x => CloudConfigurationManager.GetSetting(x) ?? Environment.GetEnvironmentVariable(name));
    }
```

This allows you to set environment variables with the configuration entries for your Event Hub, and then easily run the CLI and website without having to muck around in your app or web configs (or worry about checking in keys, in my case).

To run both, you can see from `EventHubRoutePointSource` that you just need to set the following variables:

```
    public class EventHubRoutePointSource
    {
        public async Task StartAsync()
        {
            var ehConnStr = AzureUtilities.ServiceBusConnectionString(
                AzureUtilities.FromConfiguration("MappyServiceBusNamespace"),
                AzureUtilities.FromConfiguration("MappyEventHubSASName"),
                AzureUtilities.FromConfiguration("MappyEventHubSASKey"));
            var storageConnStr = AzureUtilities.StorageConnectionString(
                AzureUtilities.FromConfiguration("MappyStorageName"),
                AzureUtilities.FromConfiguration("MappyStorageKey"));
            var eventHubName = AzureUtilities.FromConfiguration("MappyEventHubName");
            var consumerGroup = AzureUtilities.FromConfiguration("MappyConsumerGroupName") ?? "$Default";
    ...
```

Once those are set, build and run the CLI and then run the website, and you should see your little people start cruising around on the map. 
