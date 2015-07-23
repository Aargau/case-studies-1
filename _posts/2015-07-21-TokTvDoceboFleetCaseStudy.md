---
layout: post
title:  "Microservice Orchestration with Fleet on Azure w/ Tok.tv and Docebo.com"
author: "Steven Edouard"
author-link: "http://stevenedouard.com/"
#author-image: "{{ site.baseurl }}/images/StevenEdouard/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Microservice Azure
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Microservice Orchestration with Fleet on Azure w/ Tok.tv and Docebo.com
---

Micro-service architecture, the concept of providing a large scale service as a collection of small, highly available services is becoming increasingly popular in today's modern cloud service deployments. However, with the rise of Docker and other containerization and orchestration technologies, it can be difficult to get started.

In this post, we'll explore how we collaborated with two Italian tech companies for a week to show how Fleet, a distributed init system and CoreOS, an operating system designed for clusters can be deployed on Microsoft Azure as a collection of high-availability 'Dockerized' microservices.

## The Problem

Docebo.com and TOK.tv are two Italian tech companies whose infrastructure currently runs on Amazon Web Services. Docebo.com is an E-Learning platform and hosts instances of its application for various organizations. TOK.tv is the voice social platform designed to help soccer teams offer their fans a unique engagement experience and powers the Real Madrid and Juventus apps, integrating its Social Button and allowing fans of the clubs to talk with voice, send stadium sounds and take social selfies.

Docebo.com already uses Docker containers for its customer deployments and has customized orchestration infrastructure for their instances. However they eventually want to run their infrastructure on CoreOS and will be looking at Fleet for controlling its deployments on Azure.

Tok.tv at the time did not have any containerized services and wanted an orchestration solution that was transparent and flexible enough to run their app services. In particular Tok.tv is primarily composed of a PHP web application API and a real-time voice service.

## Overview of the Solution

We worked face to face with the partners to create a prototype solution of deploying Dockerized microservices across a cluster of CoreOS machines using fleet. Fleet is a distributed init system which can deploy arbitrary processes across a cluster of machines. Often it's used to deploy Docker containers. It contains settings to ensure that a service runs on separate nodes within the cluster to ensure high availability. To provision CoreOS we used an Azure CoreOS [resource manager template](https://github.com/Azure/azure-quickstart-templates/tree/master/coreos-with-fleet-multivm) which allows easy creation of a CoreOS cluster with an external load balancer.

We used a private Docker registry to deploy the Docker images for service deployment. Private registries are useful when you don't want to expose the internals of your service infrastructure as open source images on the Docker Hub. Although Docker Hub hosts private registries for a monthly fee, it is also easy to host your own private registry on premesis or on other cloud platforms such as Microsoft Azure. These registries can hold images of all your deployment services, from support services like HTTP servers to application-level images for things like websites and background workers.

The private registry server is deployed from the Docker Hub and its image store is backed by Azure blob storage. This makes our Docker registry ‘portable’ allowing us to deploy services using Fleet by pushing images to our private repository from anywhere with access to Azure storage, including your local machine:

![Architecture]({{site.baseurl}}/images/2015-07-21-TokTvDoceboFleetCaseStudy_images/image001.png)

Figure 1\. Service Deployment via Azure Storage-backed Private Docker Registry

In the image above, we use our no-cost single Docker Hub repository to store the Docker image of our registry server. The server image is built with our Azure storage credentials and can be run from anywhere with an Internet connection.

This enables the architecture in **Figure 1**, which allows us to deploy our registry as a Fleet global service, which basically means one registry server runs on every server. This is because Docker requires images in private repositories be tagged with the name of their host. By hosting a light-weight registry server on each CoreOS instance we greatly simplify deploying images.

Once our registry service is deployed across the cluster with Fleet, we can deploy any image within that registry as a service on the cluster. The graphic above depicts the scenario of a developer, running a registry on their local machine and pushing an image to Azure storage via the server. The service is then restarted and the new image is deployed to the appropriate nodes.

Using an external image store allows us to run a private Docker image repository without having to worry about SSL and authenticating users to our repository. We also get the advantage of the redundancy and backup features of Azure Storage.

**Service Discovery**

CoreOS uses <u>etcd</u>, a demon service that is essentially a distributed key-value store that allows services to announce their presence by publishing keys with a Time-to-live (TTL). Each deployed application instance is deployed with an accompanying 'announcer' service which is simply a bash script that periodically writes its host ip address and port number for it's corresponding web server.

![Architecture]({{site.baseurl}}/images/2015-07-21-TokTvDoceboFleetCaseStudy_images/image002.png)

Figure 2\. Service Discovery with 'Sidekick' Services & Etcd

Fleet allows us to specifically define announcer or '[sidekick](https://coreos.com/docs/launching-containers/launching/launching-containers-fleet/#run-a-simple-sidekick)' services, which are guaranteed to run on the same machine as the service it monitors. When the accompanying application service goes down so does the sidekick service. Because etcd has time-to-live values for each key etcd keeps up-to-date in the case of application failures, updates and restarts since the sidekick will stop writing to etcd.

**Figure 2** shows each **router** instance subscribes to etcd and it uses published keys in etcd to build its routing and load balancing rules via [confd](https://github.com/kelseyhightower/confd) templating. For example, **App1** exists on the first two VMs and between the two instances their corresponding 'sidekick' services update the service directory key App1 with the key-value pairs @1: 192.168.1.1:3000 and @2 192.168.1.2:3000\. Routing and load-balancing within the cluster is done via [Nginx](http://nginx.org/en), a popular high performance web server. Because the **nginx** router is subscribed to etcd it automatically rebuilds its routing template. Requests going for **app1** will route to either of these two machines in a round-robin load-balancing manner. The same goes for App2 - this design allows for any number of applications to be deployed backed by any number of instances.

Here's what the App1 [service](file:///\\Users\steve\Documents\fleet-boostrapper\example-app\example-app@.service) [file](https://github.com/sedouard/fleet-bootstrapper/blob/master/example-app/example-app%40.service) looks like:

```
# example-app@.service
# the '@' in the file name denotes that this unit file is a model Description=Example High-Availabilty Web App After=router.service  

[Service]
EnvironmentFile=/etc/environment
ExecStartPre=/usr/bin/docker pull localhost:5000/example-app:latest
ExecStart=/usr/bin/docker run --name example -p 3000:3000 localhost:5000/example-app:latest ExecStop=/usr/bin/docker stop example
ExecStopPost=/usr/bin/docker kill example
ExecStopPost=/usr/bin/docker rm example

[X-Fleet]
Conflicts=example-app@*.service
```

This [Unit File](https://coreos.com/docs/launching-containers/launching/fleet-unit-files/) refers to the docker image example-app in our private azure docker registry. To start this unit we simply do:

```
# upload the service model to fleet
fleetctl submit example-app@.service
# start an instance of the service
fleetctl start example-app@1.service
```

The X-Fleet Conflicts tag in the unit file instructs fleet that we don't want more than one of this unit, an instance of the service, running on the same machine in order to have high availability.

**Routing & Load Balancing**

The entire cluster sits behind a load balancer and has one public virtual IP address. This public IP address points to an Azure load balancer, which serves requests to any of our nodes.

One advantage of using an external load balancer for the cluster is that you only need one public IP address, rather than a unique one for each instance. Cloud service providers such as Microsoft Azure have limits to public IP allocation per subscription. Also, as machines go up and down, the public IP address doesn't change and simplifies DNS zone file settings.

![Architecture]({{site.baseurl}}/images/2015-07-21-TokTvDoceboFleetCaseStudy_images/image003.png)

Figure 3\. Azure Load Balancer spreads loads to each internal NginX instance

When a user request comes in, because we have the **router** running and listening on port 80 and port 443 on each node, we can handle the request no matter what node it comes to. Further, because of **etcd** service discovery each router has knowledge about where all the services are located and can route the request the appropriate container.

![Architecture]({{site.baseurl}}/images/2015-07-21-TokTvDoceboFleetCaseStudy_images/image004.png)

Figure 4\. Internal NginX instance routes request and load balances between app containers

This means that the actual container, which provides the service, doesn't necessarily need to be on the machine that the Azure load balancer selects, as show in **Figure 5.**

![Architecture]({{site.baseurl}}/images/2015-07-21-TokTvDoceboFleetCaseStudy_images/image005.png)

Figure 5\. The Machines Selected by Azure Load Balancer doesn't need to actually run requested App

Furthermore, the Azure load balancer load balances requests amongst our router, but each **router** service unit load balances the containers for each service.

This prototype solution we built during the hackfest will be the basis of Tok.tv and Docebo’s microservice architecture.

## Code Artifacts

[How to Deploy High Availability Apps to Azure using CoreOS with Fleet & etcd  – A getting started guide & code sample for Docker Orchestration w/ Fleet](https://github.com/sedouard/fleet-bootstrapper)

[Azure Storage driver for Docker Registry Server](https://github.com/docker/distribution/blob/master/docs/storage-drivers/azure.md)

## Opportunities for Reuse

The [Fleet bootstrapper guide](https://github.com/sedouard/fleet-bootstrapper) can be reused for anyone who wants to use portable, private Docker registries along with Fleet to deploy high-availability apps across a CoreOS cluster.
