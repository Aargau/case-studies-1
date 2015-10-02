--
layout: post
title:  "Neural networks for Laundry fabric and color detection"
author: "Justin Bronder"
date:   2015-09-01 12:00:00
categories: Neural networks, deep neural networks, image classification, image processing
color: "blue"
excerpt: "Trying to use multi-classifier neural networks to do fine-scale image recogntion"
---
# Neural networks for Laundry fabric and color detection
Justin Bronder, August 27 2015 V0.1 Draft
# Audience:
External
# Tags:
Neural networks, deep neural networks, image classification, image processing
# Customer Problem:
A major appliance manufacturer came to us to explore a very common problem for anyone doing a load of laundry: based on what garments you put in, what settings should be used? People unfamiliar with washing have put red shirts in with white undergarments and gotten out pink everything. We wanted to explore if we could use machine learning to suggest settings based on identification of clothes via image capture.

The customer and Microsoft had meetings in the early part of 2015 to discuss possible collaboration opportunities in the space of smart appliances. A promising topic that came up was the recent advances in image recognition and artificial intelligence, using new models of deep convolutional neural networks. Two image classification problems were suggested and agreed upon: 1) attempting to identify clothing to determine the best load settings for a washing machine and 2) identification of refrigerator contents to suggest menus, inform of expiration dates, and allow for automatic reordering.

It was decided that the former idea would be attempted first. We proposed a full prototype of an end-to-end workflow, with customer image input via cross-platform mobile phone, a classifier and recommendation engine, a dashboard to do initial labeling and improve classification via a mechanical Turk process, and a dashboard to observe and collect statistics.

# Problem Domain Survey
The current state of the art in image recognition is driven by ongoing research, and measured by a challenge called ILSVRC (http://image-net.org/challenges/LSVRC/2015/index). Teams from Microsoft, Google, Stanford, and other places compete for accuracy in identifying images containing single semantic concepts from a 117,000 web of concepts defined at WordNet. (http://wordnet.princeton.edu/). As of 2015, accuracy is approaching 98% across the entire broad semantic domain. A full list of records can be found here: http://image-net.org/challenges/LSVRC/2014/results

To summarize, broad domain classifiers try and identify many different types of objects: haystack vs. surfing board vs. ice cream cone. (see http://www.cs.toronto.edu/~fritz/absps/imagenet.pdf ) So as such, most research in neural network image classifiers had been done on broad-semantic domains. 
There is very interesting work at Stanford and other places that involves constructing a sentence that effectively describes multiple entities in a single image (http://cs.stanford.edu/people/karpathy/deepimagesent/) 

However, clothing identification is a different problem to both of these. Most clothes have more similarities than differences, with the main differences relevant to washing being color and type of fabric. However, no relevant research was found to investigate this type of deep-domain classifiers, other than some studies showing the difficulties of fine-grained classification.

# Workflow:

The initial flow design was as follows:
1.	A set of labeled training images are provided.
2.	Those images are pre-processed and turned into an input format suitable for training a DNN (deep neural network).
3.	An untrained DNN is constructed, with outputs equal to all possible color and fabric combinations expected. Photos were labeled with a color-fabric combination, like blue-silk, white-cotton, blue-cotton, black-cotton.
4.	The CNN is then trained on the images and labels.
5.	The trained CNN is deployed as a service, such that new images can be submitted and labeled in near-real-time (tens of milliseconds response time).
6.	A higher-level service is built and deployed that can turn these individual labels into a composite "recommendation" (e.g. all white-cotton == high heat, bleach).
7.	An application is built that can capture a "load" of images and gather predictions and recommendation, presenting that to the end user, and receiving feedback on whether it was correct. Contested images can be re-labeled by the end user.
8.	A dashboard provides insight into the current trained model's images, train/test accuracy, and uploaded images. Uploaded images with correct labels can be "promoted" to labeled images for future training rounds.

# Architecture:

This case study focuses on the classifier architecture. Details on the overall architecture will be covered in a separate case study. However, a broad overview can be found below:
 
1.	Most client and server code is written in C# in Visual Studio 2015, targeting .Net 4.6. The Microsoft Entity-Framework model defines the interface between the code and the data. The cloud services and storage are hosted in Microsoft Azure.
2.	A mobile app was written using Xamarin, to allow for cross-platform code generation while using C#. The initial demo was coded for the Android phone.
3.	Initial clothing images were provided by the appliance manufacturer and uploaded using Azure Storage Explorer into Azure Blob storage. Other image uploads were done via a command line app written in C#.
4.	Image preprocessing was written as a C# library that took large clothing pictures and created subsampled smaller pictures to increase the neural network training size.
5.	The neural network classifier and recommendation engine is exposed via a REST interface hosted in Azure.
6.	The Dashboard is written with the Ember framework and hosted as an Azure Software service.


![Overall Architecture]({{site.baseurl}}/images/LaundryArchitecture.png)

![Data Schema]({{site.baseurl}}/images/LaundrySchema.png)

The data schema is specific to the laundry recommendation engine. Some refactoring work would need to be done for a different domain problem.

# Results:
The entire end-to-end framework was coded and first demo was in August, 2015. While the architecture was a successful model, unfortunately the accuracy of the classifier was insufficient to recommend using this approach moving forward. Work is continuing to identify possible areas of improvement and future work.

# Explanation of Core Issue:
The fundamental (currently intractable problem) is that recommendations for laundry loads need to be close to 100% accurate or they are probably not worth recommending, as the consequences for mis-recommendations are potentially ruined clothes. Neural network image classifiers are heuristic algorithms with a certain probability of correct classification. However, each item is identified separately, so the accuracy of a given load recommendation is actually the product of the accuracy of the individual recommendations. When the individual classifier accuracy is below 99.9%, the total success goes down dramatically.

![Classifier Accuracy]({{site.baseurl}}/images/ClassifierAccuracy.png)

This chart shows composite accuracies of 99%, 97%, 93%, 90%, 85%, 80% and 75% over load counts of 1 to 25 items of clothing. As we can see, even with an accuracy of 97%, if one has 17 items in a load, the overall accuracy is merely 59%.

Our accuracy with the existing image set and our deep neural network model was below 75% percent, and therefore not useable for overall recommendations.
# Issue Details:

1.	Categories cannot be added to a trained model and preserve existing work. What happens is there is an existing bias to older categories. Therefore any time a category gets added, the full computational load needs to be re-executed. Future customers must be made aware that data changes, not just schema changes, will result in a large computational and time dependency.

2.	Input photo color accuracy is dependent upon the white balance of the environment. The classical example is the internet controversy about the color of a dress:

![Is the dress white and gold? Or is it blue and black? (It is a blue and black dress) source: Wikipedia]({{site.baseurl}}/images/color.png)

  * Is the dress white and gold? Or is it blue and black? (It is a blue and black dress)

Even with very controlled lighting, the color of the fabrics would be mistaken, especially white/yellow/gray.

![This is an example of white cotton that is misidentified as gray]({{site.baseurl}}/images/color2.png)

  * This is an example of white cotton that is misidentified as gray.

3.	Fabric is not easily determined from anything but a closeup of the fabric, and even then there is a high degree of misidentification.  

![Is this cotton, silk, or polyester? It’s actually wool.]({{site.baseurl}}/images/fabric.png)

  * Is this cotton, silk, or polyester? It’s actually wool.


4.	Not enough samples.
a.	A Good neural network can use upwards of a million different sample images. We attempted to solve this problem by subsampling images, creating 100 separate training issues per original image. More images would increase accuracy.

5.	Neural networks are constrained to a linear input size of 100K for training
a.	Most pictures can have easily 4 megapixels of 24 bit color of input. It is an open question whether larger input sizes would improve accuracy, at the cost of compute time.

# Solutions to Explore:

1.	Control white balance
  *	Assuming there is an integrated camera in the appliance, lighting could be controlled, which could improve color identification
2.	Control location of clothing
  *	Again, if the appliance has its own camera, one could ask the end user to hold the clothing over the camera much like a scanner. This would allow for better identification of fibers.
3.	Use different neural network topologies. 
  *	One research area we did not explore was using hybrid neural networks. These could independently determine color and fabric, and combine their answers to determine the correct load recommendation.
4.	Use machine label identification. 
  *	Machine labels are a text identification problem, and potentially have a higher accuracy rate.
5.	Explore a smart appliance problem that has a higher tolerance for error and potentially higher accuracy in classification
  *	I believe the “What’s in my fridge problem is a better problem to tackle moving forward. Even with some degree of error, accuracy is not multiplicative, rather the inverse, the more things we identify, the more useful it is. The end user would still gain a huge benefit from a 97% accurate model of refrigerator contents determination.

