# DRAFT

# Using Big Compute for subjective and cost efficient Alzheimer’s diagnosis – Taking Combinostics’ Volumetric (3D) brain image processing to the cloud - a TED Case Study

Petro Soininen / Suprasanna Sarkar

May 27th, 2015

# Audience:

External, customer approved.

# Tags

Azure Big Compute, Azure Batch Service, Azure Batch App management portal, Azure websites

# The Problem

Combinostics is an early phase startup with a goal to improve decision making for complex disease diagnostics. Support for clinical decision making in Combinostics’ offering is provided by contrasting the data from an individual patient with the corresponding data from previously diagnosed patients, where outcomes are known through longitudinal follow-up. Combinostics’ main focus is on tools for advanced medical image processing and analysis, but their offering also bundles support for analyzing other diagnostic data, such as quantified measurements. With years of research and battle-tested code for their core use cases already available, their image processing compute load and other pilot service components are currently running on on-premise servers at their partner hospitals. While this is fine to prove the technology, it is not optimal for their aspirations of offering a scalable, resilient and cost effective SaaS service, enabling expert level diagnostics to any patient at a very affordable price point.

Microsoft collaborated with Combinostics to help run their product in Azure while retaining the option for deploying the same app to other environments. This paper introduces how Combinostics’ image processing pipeline was set up in Azure.

# Overview of the Solution

Diving into the existing Combinostics architecture and code base revealed that the image processing pipeline combined several algorithmic tasks with complex dependencies; some were easily parallelizable, while others required sequential processing.

To tackle this scenario, we explored architectural options to run Combinostics’ 3D brain image processing pipeline on top of [Azure Batch Service](http://azure.microsoft.com/en-us/documentation/services/batch/) to leverage its auto-scale capability and efficiency in computing work.

![](Using%20Big%20Compute%20for%20subjective%20and%20cost%20efficient%20Alzheimer's%20diagnosis_files/image001.jpg)


[Azure Batch Apps API](https://msdn.microsoft.com/en-us/library/azure/dn820126.aspx) was eventually chosen as the baseline over [Azure Batch API](https://msdn.microsoft.com/en-us/library/azure/dn820158.aspx) for simplicity of development and maintenance and the ability to take advantage of Azure Batch App portal as an administrative & management tool. This approach enabled Combinostics to get started quickly to manage jobs, upload application & cloud assembly and download outputs without having to write too much client side code, since the Batch Apps framework handles the movement of input and output files, job execution, job management, and data persistence.

## Working with large temporary files in Azure Batch App management portal

Combinostics image processing algorithms include several large templates that increase the size of the application package significantly.  This was initially a big challenge because huge (>2GB) app packages cannot be uploaded to the Azure Batch App management portal. As a solution, we exploited the fact that an [Azure Storage](http://azure.microsoft.com/en-us/documentation/services/storage/) account is automatically created alongside a new Batch App Service. Using an Azure Storage account, you can orchestrate deployment using scripts rather than relying on manual uploading and management of the files.

Refer to this blog post to understand how to [hook up your storage account with Batch App service and use tools like AzCopy to upload larger files and make them available via the Batch App management portal](http://sarkar.azurewebsites.net/2015/03/16/uploading-large-executable-on-azure-batch-service-app-management-portal/)

## Managing complex dependencies between Azure Batch tasks

Algorithm tasks in Combinostics image processing pipeline have several interdependencies, where some tasks can be run in parallel but others must wait for the previous tasks to provide their output.  For sake of simplicity and minimizing the amount of new code outside of their core expertise, Combinostics looked at utilizing a single Batch Apps job for the image processing process.

One current limitation in Azure Batch App Service is that specifying intermediate task output as required files for dependent tasks is not supported. Although [Azure Data Factory](http://azure.microsoft.com/en-us/documentation/articles/data-factory-introduction/) could be a very viable option in this scenario, we decided to work around the aforementioned limitation by [utilizing Azure Storage library to feed required files to only the virtual machines running the dependent tasks](http://sarkar.azurewebsites.net/2015/03/11/batch-task-dependencies/). In addition to solving the limitation above, this approach reduces the movement of the data unnecessarily to all of the virtual machines used in the processing pipeline.

With their core image processing algorithm now running on Azure Batch App Service, Combinostics is looking to build their whole service on top of Azure. Keep an eye for further articles as we delve into e.g. optimizing a hybrid cloud architecture to support the requirements needed from a next generation complex disease diagnostics platform.

# Code Artifacts

Sample app demonstrating how to specify intermediate files to Azure Batch App Service dependent task within a single batch job. [https://github.com/spsarkar/AzureBatchDependenciesStorage](https://github.com/spsarkar/AzureBatchDependenciesStorage)

A corresponding [blog article](http://sarkar.azurewebsites.net/2015/05/18/deploy-azure-batch-apps-through-batch-apps-portal/) was posted to provide description of this sample source code and instructions to deploy & run jobs using the Microsoft Azure Batch Apps service.

# Opportunities for Reuse

Two blogs were posted describing the unsupported Azure Batch App customer scenario and how to resolve those. The techniques described here can be reused in a wide range of image processing pipeline applications.

[http://sarkar.azurewebsites.net/2015/03/11/batch-task-dependencies/](http://sarkar.azurewebsites.net/2015/03/11/batch-task-dependencies/)

[http://sarkar.azurewebsites.net/2015/03/16/uploading-large-executable-on-azure-batch-service-app-management-portal/](http://sarkar.azurewebsites.net/2015/03/16/uploading-large-executable-on-azure-batch-service-app-management-portal/)
