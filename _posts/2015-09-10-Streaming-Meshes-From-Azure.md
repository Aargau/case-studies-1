---
layout: post
title:  "Visualize Large 3D Captures using Pyrite3D"
author: "Stefan Gordon"
author-link: "http://www.stefangordon.com"
date:   2015-09-10 10:00:00
tags: Azure 3D Unity3D Streaming Pyrite3D
color: "blue"
excerpt: "Large scale 3D reconstructions created from aerial data captures are quickly becoming an important tool for many industries including commercial construction, agriculture and mining."
---

Large scale 3D reconstructions created from aerial data captures are quickly becoming an important tool for many industries including commercial construction, agriculture and mining.  Camera and reconstruction technology are continually improving, and as such the size of these data-sets continues to grow as well.  These large 3D meshes and textures are commonly several gigabytes in size and require high-end hardware to view.

In this case study we will present an option for viewing these large data-sets on any device by streaming them from cloud storage on-demand.  You will learn how the new Pyrite3D framework is able to process 3D mesh data and stream it from Azure to Unity3D clients.

### Data Sources
While developing [Pyrite3D](http://www.pyrite3d.org), Microsoft partnered with an industry leader in aerial image processing software, [Pix4D](http://www.pix4d.com).  The Pix4D Mapper application excels at reconstructing data from UAV and manned aircraft captures and provided us with industry proven scenarios for the development of the Pyrite3D framework.

Large mesh data-sets may come from many different sources.  Medical imaging and Augmented Reality systems are fast-growing fields that both generate and consume large 3D models.  The tools described here can be used with any mesh data.

### Introducing Pyrite3D
Pyrite3D attempts to resolve issues associated with processing and displaying very large mesh data by applying traditional two-dimensional tiling techniques to a three-dimensional space.  Models are provided at varying levels of detail, and sliced into small chunks which can be easily transmitted to a client viewer.  Additionally texture data associated with the model is partitioned in smaller pieces which correlate to the chunks to reduce GPU memory requirements.

These small chunks, available at varying levels of quality, can then be dynamically requested and assembled by the client in real-time based on the position of the camera or viewport - requiring the client to download only the visible data, and in only the quality appropriate for their screen.


![Varying Level Of Detail Example]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/cube_example.png)

The image above is a visualization of how different levels of detail may be assembled.  The user/camera is located in the center of this cube, and the area directly around the user is rendered in very high detail.  As the distance from the camera increases lower detail chunks are loaded to fill in the background.  As the camera moves through the scene these chunks are swapped out dynamically to accommodate the viewport.

Below is a rendering of a mesh captured by [WaldoAir](http://www.waldoair.com) Corp and processed by Pix4D.  The source data is over 1 gigabyte in size, but this view in Pyrite3D required less than 10mb to be transferred to the Unity3D client.

![Begard Example]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/begard.png)

### Challenges
There are a variety of challenges to this technique that Pyrite3D attempts to solve.

##### Face reconstruction during slicing
To ensure the ability to mix and match model chunks from varying levels of detail and size it is critical that each chunk have perfectly flat sides.  Because meshes are created from a series of triangular faces we must alter and redraw triangles along the edges of chunks while maintaining the correct mapping to the texture image.  There are a significant number of ways these faces can intersect chunks and each requires a different repair.  Pyrite3D attempts to repair the most common cases but further work is required to ensure perfect chunks.

##### Texture Partitioning
Texture images provided with mesh data are typically broken into millions of small images that correlate to various contiguous areas in the mesh.  Because GPU's have very limited memory available for textures we must partition the texture into smaller pieces which can be sent on-demand in varying qualities.  This requires reverse engineering the assembled image, correlating the parts to our model chunks, and efficiently reassembling new textures.  Pyrite3D does this very well for textures up to 268 megapixels (which is four times larger than most industry visualization tools support).  An upgraded texture processing system is in-progress to accommodate larger textures.

##### Bandwidth Requirements
Pyrite3D supports a variety of output formats during processing to ensure adequate streaming performance.  These include [Wavefront OBJ](http://www.martinreddy.net/gfx/3d/OBJ.spec) and [OpenCTM](http://openctm.sourceforge.net/).  In most cases the OpenCTM format is the ideal solution for Unity3D or Javascript/WebGL clients.  Currently, the only format supported for texture chunks is JPEG.  Texture formats optimized for GPU are not compressed for transfer over the web, and as such are not practical for streaming.

### Current State
Pyrite3D is currently available as a suite of tools under an open source license (MIT). 

This includes the pre-processing toolset, [PyriteCLI](https://github.com/PyriteServer/PyriteCli), a C#/.Net application.

[PyriteServer](https://github.com/PyriteServer/PyriteServer) is the RESTful API that streams data prepared by PyriteCLI.

[PyriteDemoClient](https://github.com/PyriteServer/PyriteDemoClient) is a Unity3D client demo for consuming Pyrite3D data.

[PyriteWebGL](https://github.com/PyriteServer/PyriteWebGL) is a javascript/WebGL implementation of our client.

For demos, videos and code, reference http://www.pyrite3d.org/

## Sample Walkthrough
Perhaps the best way to understand the platform is to try it yourself.  The following is a simple end-to-end walkthrough which will help you process data and serve it to a Unity3D application.  In production scenarios it is likely that mesh data will be stored and served from Azure - however for the purposes of our initial walkthrough everything will be on your local machine.

>**Required Tools**

>64-bit Windows PC (8.1 or later)

>Visual Studio 2015

>Unity 5.2 or later

>Git

### Slicing
>Slicing is the process of preparing our data for use in the Pyrite system.  We use the Pyrite command line interface to partition our mesh data and textures into smaller chunks for streaming.  A pre-requisite to slicing is having our mesh data available at various quality levels, which is easily done with the free Meshlab tool.  For this walkthrough however, we have provided license-free data for you to work with.

>Note: We will be using a sandbox folder located at d:\pyrite for all of these instructions.  Alter the commands as appropriate for your environment.

##### Get PyriteCLI binaries
Download the latest release build from https://github.com/PyriteServer/PyriteCli/releases and decompress.

##### Get the sample mesh data
Download and decompress the mesh data from our repository https://github.com/PyriteServer/PyriteCli/tree/master/SampleModel.

For this guide we are decompressing to d:\pyrite\sample

>The mesh data is provided as three quality levels of the same mesh file.  These files are all extremely small meshes by Pyrite standards, but their smaller sizes will dramatically reduce processing time, allowing you to test the process more quickly.



##### Process the meshes
Each of the three meshes must be processed into a different level of detail for the server.  Use the three provided processing commands as reasonable settings for the sample data.

>Tip: Each of the slicing commands specifies the number of divisions with -x (y and z are optional, since we specify cubical slicing with -c which forces equal slicing in all dimensions).  The texture is partitioned based on the -u and -v parameters, and all data is output into folders named L1, L2, and L3 respectively.  These represent three quality levels available to the server.  As the quality of input data increases, the density of our slicing increases accordingly.

>The -t parameter tells the slicer which texture to use, and the -p parameter specifies our output format, OpenCTM.

>For more details, try --help, or better yet, see the [wiki page on Usage](https://github.com/PyriteServer/PyriteCli/wiki/Usage).

```bat
cd d:\pyrite\PyriteCli

pyritecli -x 12 -u 6 -v 6 -p -c -t d:\pyrite\sample\model.jpg d:\pyrite\output\L1 d:\pyrite\sample\model_high.obj

pyritecli -x 6 -u 6 -v 3 -p -c -s 0.5 -t d:\pyrite\sample\model.jpg d:\pyrite\output\L2 d:\pyrite\sample\model_medium.obj

pyritecli -x 3 -u 3 -v 3 -p -c -s 0.25 -t d:\pyrite\sample\model.jpg d:\pyrite\output\L3 d:\pyrite\sample\model_low.obj
```
 On a modern desktop machine, this slicing may take 20 to 30 minutes.  The CLI is designed to use all available CPU resources.
 
### Server

##### Prepare the set configuration data
To serve this data in the Pyrite server, we must provide configuration about our specific data set, as well as a server configuration that specifies which sets should be loaded.

In the root of your output folder (d:\pyrite\output) create a file named index.json with the following contents:

```json
{
  "MinimumLod" : 1,
  "MaximumLod" : 3
}
```
This index.json tells the server how many levels of detail to expect.  We created levels 1, 2 and 3.

Next to your index.json, create another file named demosets.json with the following contents:

```json
[
    {
        "name": "sample",
        "versions": [
            {
                "name": "V1",
                "url": "file://D:/pyrite/output/index.json"
            }
        ]
    }
]

```
Be sure to update the URL appropriately to point to your index.json.  Note that this is an array of sets, which contain an array of versions.  A single server instance can serve any number of versions of any number of sets.

##### Clone the server

Clone the PyriteServer repo

```bat
mkdir d:\pyrite\PyriteServer
cd d:\pyrite\PyriteServer
git clone https://github.com/PyriteServer/PyriteServer.git
```

##### Configure the server
After cloning open PyriteServer.sln with Visual Studio 2015.

We'll need to enter the location of our demosets.json in the **web.config**.  Open the web.config and enter the correct path for the SetRootUrl.

```xml
    <add key="SetRootUrl" value="file://D:/pyrite/output/demosets.json" />
```
>Tip: This can point to a local file, as in the example, or to a blob in Azure.  If you provide an Azure URL we look at the "Storage" App Setting for an Azure Storage connection string and dynamically handle authentication for all URL's if we find it.

##### Run and test the server

Ensure PyriteServer is your default project, and **run the server** from Visual Studio.  It should launch your default browser to our basic server UI.

![discover sets]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/discover_sets.png)

>This server browser UI demonstrates some of the basic RESTful API calls and lets you navigate your dataset.  Press "Send Request" to enumerate loaded sets, and your Sample set should be returned.  You can then drill into the set's versions and metadata.

### Client

##### Stream your mesh to Unity

Clone the Unity demo application repo and open in Unity3D.

```bat
mkdir d:\pyrite\client
cd d:\pyrite\client
git clone https://github.com/PyriteServer/PyriteDemoClient.git
```

Configure the provided "Sample" scene

1. Double click Scenes->Sample in the Project explorer
2. Click "CubeContainer" in the scene hierarchy to expose the properties inspector for the Pyrite Loader script
3. Set Server Options->Pyrite Server to local url http://localhost:29567/
4. Set Set Options->Model Version - V1
5. Set Set Options->Set Name - Sample
6. Run!

Here it is in pictures -

![find scene]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/find_scene.png)

![find container]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/find_container.png)
![find props]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/set_props.png)
![streaming]({{site.baseurl}}/images/2015-09-10-Pyrite3D-Overview_images/what_you_get.png)
