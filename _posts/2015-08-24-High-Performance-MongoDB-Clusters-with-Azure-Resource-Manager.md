---
layout: post
title:  "High Performance MongoDB Clusters with Azure Resource Manager"
author: "Tim Park & David Makogon"
author-link: "http://timpark.io"
#author-image: "{{ site.baseurl }}/images/TimPark/photo.jpg" //should be square dimensions
date:   2015-08-24 16:23:28
tags: ARM MongoDB Azure Cloud
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: High Performance MongoDB Clusters with Azure Resource Manager
---

Microsoft works every day with startups around the world to help them be successful with their new businesses or scale them to new heights. We recently had that pleasure of working with <a href="http://www.openhour.com/">Openhour</a> at our Microsoft Startup Accelerator in Seattle. Openhour, who has built their business on Azure, offers a service to enable creative professionals to track their time.

As a fast growing company, they had outgrown their current MongoDB deployment and wanted to build a much higher performance cluster. MongoDB is a fantastic do-it-all database that provides nearly unparalleled agility. Deploying it in production, however, can be a daunting task that includes instance type selection, attaching a set of drives to each of your VM instances to maximize I/O, and extensive cluster configuration. All and all, this is a pretty complicated and detail oriented endeavor that is easy to get wrong.

To help with complicated pieces of infrastructure like this, the Azure team recently released <a href="https://azure.microsoft.com/en-us/documentation/articles/resource-group-overview/">Azure Resource Manager</a> (or ARM for short) that aims to make all of this easier. With ARM, you specify a deployment template for pieces of infrastructure (like MongoDB) and quickly stamp out instances of it at deployment time.

Since they knew there are a number of platforms that could take advantage of this, the Azure team also <a href="https://github.com/Azure/azure-quickstart-templates">open sourced a large number of templates</a> on GitHub to start from. There are templates for MySQL, Wordpress, CoreOS, Kafka, ... and yes, MongoDB. In working with Openhour, we used the <a href="https://github.com/Azure/azure-quickstart-templates/tree/master/mongodb-high-availability">mongodb-high-availability template</a> in this open source project as our starting point.

Azure also <a href="http://azure.microsoft.com/blog/2015/04/16/azure-premium-storage-now-generally-available-2">recently released a premium storage option</a> for high performance scenarios like this for use in conjunction with our new DS series of virtual machines. This new premium storage option is SSD backed and offers roughly 10x the throughput and IOPS as a standard Azure account.

Openhour wanted to take advantage of all of these innovations for their new MongoDB cluster and we partnered with them on this problem as the ARM script in the repo did not support premium storage. Our team at Microsoft works with customers and partners on technical problems like this to prove out scenarios that we believe should be possible but haven't been attempted before.

Anyone could have added support for premium storage, but our team is also empowered to make contributions to open source to unblock customers and partners. So we cloned the existing repo, created a "new t-shirt size" (a preset for the instance types and count for the new cluster) as Openhour wanted to use very high end DS12 instances for its cluster, added dropdown options for the storage account type and VM instance type to the parameters section of the script, and then used the ability of ARM templates to express concatenation to build up the vm sizes. When completed, you can simply fill out a form in the Azure portal in order to build out a cluster.

![Figure 1: Azure MongoDB ARM parameters form]({{site.baseurl}}/images/2015-08-24-High-Performance-MongoDB-Clusters-with-Azure-Resource-Manager_images/parameters.png)

Naturally, we never keep these sorts of improvements to ourselves and contributed back to the <a href="https://github.com/Azure/azure-quickstart-templates">azure-quickstart-templates</a> project in a <a href="https://github.com/Azure/azure-quickstart-templates/pull/504">Github pull request</a>.

Finally, we spun up a large cluster together with Openhour. The great thing about ARM is that because all of the cluster specific information is abstracted into the template, you can build your own MongoDB cluster utilizing this same ARM script by simply clicking the Deploy to Azure button below:

<a href="https://portal.azure.com/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure%2Fazure-quickstart-templates%2Fmaster%2Fmongodb-high-availability%2Fazuredeploy.json" target="_blank">
    <img alt="deploy to azure" src="http://azuredeploy.net/deploybutton.png"/>
</a>

Many thanks to Openhour for partnering with us on this project. If you have a project like this one where you are attempting something with Azure that is taking you into uncharted territory, please get in touch with us!
