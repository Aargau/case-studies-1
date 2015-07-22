---
layout: post
title:  "Using camera stream for real time object tracking in Windows apps"
author: "Juhana Koski"
#author-link: "http://#"
#author-image: "{{ site.baseurl }}/images/JuhanaKoski/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Image processing, Windows
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Using camera stream for real time object tracking in Windows apps
---

# Using camera stream for real time object tracking in Windows apps

By Juhana Koski, Tomi Paananen, and Petro Soininen

June 15, 2015

# Audience:

External, technical audience, developers

# Tags

Windows; camera data; object tracking; chroma filtering; convex hull algorithm; computer vision

# Summary

The imaging and computing capabilities in commodity mobile devices provide exciting possibilities for computer vision based solutions. While some computer vision scenarios are purpose-built from the get-go with mobile device usage in mind, we have also witnessed several scenarios where existing legacy solutions could benefit from replacing the often expensive and immobile hardware (camera and computing) setup with modern smartphones and their imaging capabilities.

As an example of this, we ran a pilot with a leading sports brand to enable tracking and analyzing object movement – consider a ball leaving a bat or a club at arbitrary launch angles, high velocity and varying spin rates.

The partner wanted to explore how well modern smartphones would suit their needs and enable moving away from the usage patterns and restrictions caused by their existing imaging hardware and analytics pipeline.

As a byproduct of the pilot, we identified reusable patterns and ways to avoid common pitfalls when implementing object tracking in Windows apps. This case study, the referenced blog and sample code will introduce our key findings and help the reader identify the best approaches to object detection and tracking to use in their Windows apps. 

# Solution

The scenario we faced could be broken down to this pipeline.

1. Capture video data from a Windows phone

2. Understand the data format provided to us

3. Identify the object we’re interested in tracking from the video data

4. Lock and track the object while it blazes through the field of view

5. Analyze what actually happened to the object

6. Don’t mess up the performance during steps 1-5\. Easy.

## Capture video data from a Windows device

Capturing video frames in Windows apps has been well documented in Windows platform documentation. Use these MSDN resources to understand how to get the video data:

[Quickstart: Capturing video by using the MediaCapture API](https://msdn.microsoft.com/en-us/library/windows/apps/xaml/Dn642092(v=win.10))

[Media capture using capture device sample app](https://code.msdn.microsoft.com/windowsapps/Media-Capture-Sample-adf87622)

## Understand the data format

Before processing the data, we must first understand the data characteristics (format and frequency). Here is a sample of the image data that we are processing.

![]({{ site.url }}/case-studies/images/2015-07-21-Using-camera-stream-for-real-time-object-tracking in-Windows-apps_images/image001.png)

_A four pixel section in NV12 image data - location of the bytes in NV12 byte array A, where h is the height of the image and w is the width of the image (in bytes)._

In the first part of Tomi Paananen’s blog posts, he [introduces two common YUV color space formats](http://tomipaananen.azurewebsites.net/?p=361) and then dives into details on how to work with NV12 format, which is a conventional data type for smartphone cameras.

## Identify the object we’re interested in tracking from the video data

Now that we understand the type of data provided to us, it’s time to think about how to identify the objects we’re looking for from the video data.

![VaatturiConvexHullScaled]({{ site.url }}/case-studies/images/2015-07-21-Using-camera-stream-for-real-time-object-tracking in-Windows-apps_images/image002.png)

Red areas filtered out from a video frame using the problem solving pipeline described below.

The problem solving pipeline described below is broken down in detail in a blog post that explains approaches to [detecting areas of similar pixels using threshold values and applying versions of the convex hull algorithm to ease detection of objects](http://tomipaananen.azurewebsites.net/?p=481).

<table class=MsoNormalTable border=1 cellspacing=4 cellpadding=0 width=946
 style='width:354.75pt;border:solid windowtext 1.0pt'>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='border:none windowtext 1.0pt !msorm;padding:0in !msorm'><b><span
  style='color:#2B2B2B'>What is the result?</span></b></span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='border:none windowtext 1.0pt !msorm;padding:0in !msorm'><b><span
  style='color:#2B2B2B'>How do we get there?</span></b></span></p>
  </td>
 </tr>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>An object, with a specific shape,
  identified in the image (location, size, shape etc.)</span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Find the center of mass of the two
  dimensional object and its&nbsp;<span style='border:none windowtext 1.0pt !msorm;
  padding:0in !msorm'><b>boundary</b></span>.</span></p>
  </td>
 </tr>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Boundary of the detected object.</span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Apply&nbsp;<span style='border:none windowtext 1.0pt !msorm;
  padding:0in !msorm'><b>convex hull algorithm</b></span>&nbsp;to <span
  style='border:none windowtext 1.0pt !msorm;padding:0in !msorm'><b>object map</b></span>&nbsp;(extended
  binary image, where the background is removed).</span></p>
  </td>
 </tr>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Object map, where all significant
  (suspected) objects are separated and the background is removed.</span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='border:none windowtext 1.0pt !msorm;padding:0in !msorm'><b><span
  style='color:#2B2B2B'>Individualize objects</span></b></span><span
  style='color:#2B2B2B'>&nbsp;from a&nbsp;<span style='border:none windowtext 1.0pt !msorm;
  padding:0in !msorm'><b>binary image</b></span>.</span></p>
  </td>
 </tr>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Binary image in which objects have value
  1 and background value 0.</span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Apply algorithm to extract objects with
  some criteria from the background. E.g.&nbsp;<span style='border:none windowtext 1.0pt !msorm;
  padding:0in !msorm'><b>chroma filter</b></span>.</span></p>
  </td>
 </tr>
 <tr>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Chroma filter implementation to extract
  objects from image.</span></p>
  </td>
  <td width=468 valign=bottom style='width:175.5pt;border:solid windowtext 1.0pt;
  padding:6.0pt 6.0pt 6.0pt 6.0pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'><span style='color:#2B2B2B'>Start coding!</span></p>
  </td>
 </tr>
</table>

## Lock and track the object while it moves through the field of view

Since our object tracking solution is required to provide real-time analysis while running on (Windows) mobile devices, we need to be considerate on what algorithms are used and on which set of pixels from a frame to actually apply them.

Instead of applying all methods described in the previous section on each analyzed frame, our sample implementation provides a way to lock the object of interest and, in following frames, apply chroma filtering to only the small subset of frame pixels which contain the object we want to track.

![VaatturiLockedToObjectScaled]({{ site.url }}/case-studies/images/2015-07-21-Using-camera-stream-for-real-time-object-tracking in-Windows-apps_images/image003.png)

Target object locked, and tracking limited to the region marked by the green rectangle

This [blog post explains the object locking and partial pixel map tracking](http://tomipaananen.azurewebsites.net/?p=581) in more detail.

## Analyze what actually happened to the object

Unsurprisingly, our scenario eventually ends up in a scenario very common in technology and life: We have raw and interesting data – what should we actually do to analyze it?

![VaatturiObjectMotionCapturedScaled]({{ site.url }}/case-studies/images/2015-07-21-Using-camera-stream-for-real-time-object-tracking in-Windows-apps_images/image004.png)

Object (USB cannon projectile wrapped with pink sticker) motion captured

Tomi Paananen and Juhana Koski provide some concrete tips for the (nearly) real time analysis – explaining

a) How a [ring buffer approach to buffer video](http://juhana.cloudapp.net/?p=181) was used in our solution to enable a good compromise on consumed resources and provide ability to do a bit of post processing on the captured video frames

b) Iterating through the buffered video frames to [understand object displacement](http://tomipaananen.azurewebsites.net/?p=581) using the pipeline mentioned earlier in this post

In our scenario, further data analysis could contain for example real time speed, launch angle and rotation related calculations – and perhaps pushing that information to a secondary, non-real time, analytics pipeline that could utilize Azure Machine Learning or other approaches to get more insight or predictions.

# Next Steps

We still have ways to go in reaching our stretch goal of analyzing moving objects at a high frame rate (> 400 fps) using mobile devices. The next areas that we would focus on to continue to improve performance of the pipeline under challenging conditions such as variations in lighting, distortion of objects shape and color blending after a heavy impact causing high velocity.

# Reusable assets

Tracking objects from video feed – 3 part blog series

- Image data formats - [http://tomipaananen.azurewebsites.net/?p=361](http://tomipaananen.azurewebsites.net/?p=361)
- Identifying a stationary object - [http://tomipaananen.azurewebsites.net/?p=481](http://tomipaananen.azurewebsites.net/?p=481)
- Detecting object displacement - [http://tomipaananen.azurewebsites.net/?p=581](http://tomipaananen.azurewebsites.net/?p=581)
- Buffering video frames using a ring buffer - [http://juhana.cloudapp.net/?p=181](http://juhana.cloudapp.net/?p=181)
- Object tracking demo app source code (Windows) - [https://github.com/tompaana/object-tracking-demo](https://github.com/tompaana/object-tracking-demo)
