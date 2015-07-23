---
layout: post
title:  "Deis: Running a Heroku-Style Platform on Azure"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
#author-image: "{{ site.baseurl }}/images/FelixRieseberg/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure Deis
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
---

[Deis](http://docs.deis.io/en/latest/) is a lightweight application platform that deploys and scales Twelve-Factor apps as Docker containers across a cluster of CoreOS machines. Practically speaking, it enables users to self-host a platform implementing the Heroku workflow without being dependent on Heroku.

Prior to the coding engagement, installing the Deis platform on Azure was both complicated and error-prone. Documentation for various cloud hosters existed, but the path to getting Deis installed on Azure was not documented. Documentation for the creation of a CoreOS cluster existed, but even the basic provisioning of a cluster required a host of shell commands, making the installation dramatically more difficult than on other cloud providers.

Required were four things: 1) We needed to agree on a recommended path for installation; 2) Fix remaining issues in CoreOS and Deis; 3) Automate the provisioning and installation process; 4) Document the solution.

![Deis on Azure]({{site.baseurl}}/images/2015-07-21-Deis-Running-a-Heroku-Style-Platform-on-Azure_images/image001.png)

## Overview of the Solution

A hackfest with Deis engineers and Microsoft DX engineers was organized to solve underlying issues, automate deployment, and agree on a path forward. First, we built upon prior work done with Tutum around [automated provisioning of CoreOS clusters on Azure](https://github.com/chanezon/azure-linux/tree/master/coreos/cluster) – adding features, optimizing performance and removing bugs.

Next, we fixed remaining issues in CoreOS and Deis, enabling us to document a featured path to provisioning a CoreOS cluster and installing Deis. The scripts created were integrated into the Deis codebase, allowing users to create their own cluster on Azure without downloading additional requirements.

Installing a full cluster basically requires four commands:

```
azre-coreos-cluster
```

Automatically creates a CoreOS cluster. The command accepts a number of parameters for full customization, but also provides useful defaults.

```
desctl config platform
```


Configures the local Deis client for communication with the newly-created cluster.

```
desctl install platform
```

Installs Deis on the cluster.

```
desctl start platform
```


Starts Deis – the cluster is now running!

## Implementation

Deis requires a CoreOS cluster as host; the first step is therefore provisioning a CoreOS cluster in Azure. The created script with the name azure-coreos-cluster is a mere 307 lines long.  It interacts with the Azure SDK for Python to create such a cluster in an automated fashion, doing what used to be hours of work in a few minutes. While it comes with a set of useful defaults, it also accepts a number of parameters enabling full customization:

- Cloud Service Name: The name of the cloud service that will host the CoreOS cluster
- SSH Certificate: The SSH certificate used to connect to the cluster
- SHH Thumbprint: The thumbprint of the used SSH certificate
- Subscription: The target subscription for the cluster
- Azure Certificate: The Azure certificate (*.pem) for the subscription
- Blob Container URL: The URL to the blob container used to store the VM images
- VM Size: The size of the cluster machines
- VM Name Prefix: If required, the machines can be created with a custom name prefix
- Availability Set: The name of the availability set hosting the cluster machines
- Location: The location of the cluster
- Affinity Group: The affinity group of the cluster, overriding the location if given
- SSH Port: The “starting” SSH port value (if port 22001 is given, machines can be reached at 22002, 22003, […], 2200n
- CoreOS Image: A custom CoreOS image can be used
- Number of Nodes: A custom number of nodes in the cluster can be used
- Virtual Network Name: The name of an existing virtual network to which the cluster machines should be added
- Subnet Name: The name of the subnet to which the cluster machines belong
- Custom Data: CoreOS is initialized with a cloud-init file; a custom one may be provided
- Discovery Service URL: URL to an existing cluster discover service, if a new one shouldn’t be created
- Public Instance IP Address: Assign public instance IP addresses to each cluster machine
- Deis: A custom parameter that automatically opens HTTP and Deis controller endpoints on the cluster
- Data Disk: A custom data disk may be attached to the cluster machines
- No HTTPS: Disables the creation of the HTTPS load-balanced endpoint


Clearly, the created script allows for a number of customizations. At the same time, the full flow is simple.

### Creating a Deis Cluster in Minutes

Note: the following steps assume the user is running Unix.

First, install the requirements (the Deis repo, Python 2.7 with pip and the Azure SDK for Python).

```
$ git clone https://github.com/deis/deis.git && cd ./deis/contrib/azure
$ brew install python
$ sudo pip install azure
```

The script will automate most of the cluster setup, but we do need to authorize it with a certificate. Enter the folder contrib/azure and run ./generate-mgmt-cert.sh - the command will use details in cert.conf to create a management certificate, so feel free to change it to your liking. To let Azure know that this is your certificate, [log in to the Azure portal's certificate management](https://manage.windowsazure.com/#Workspaces/AdminTasks/ListManagementCertificates). Select upload and select the just created azure-cert.cer file. While in the portal, also save the ids of the subscription and the name of the blob storage container you'd like to create the cluster in. If you don't have one yet, create one.

#### Cluster Creation

The script create-azure-user-data will use defaults in ../coreos/user-data.example to create a configuration for you. If you want to stick with the defaults, run ./create-azure-user-data $(curl -s https://discovery.etcd.io/new) to create a custom date file. You can now run the script:

```
./azure-coreos-cluster [cloud service name]
     --subscription [subscription id]
     --azure-cert azure-cert.pem
     --num-nodes 3
     --location "[location]"
     --vm-size Large
     --deis
     --blob-container-url https://[blob container].blob.core.windows.net/vhds/
     --data-disk
     --custom-data azure-user-data
```

By default, the script will provision a three-node cluster, but you can increase the number of nodes with the num-nodes parameter. Note that for scheduling to work properly, clusters must consist of at least three nodes and always have an odd number of members.

Once the script is done, you'll have a running CoreOS cluster with three machines and one Cloud Service (working as a load balancer). To get its public IP, [go back to the Azure Portal](https://manage.windowsazure.com/#Workspaces/CloudServicesExtension/CloudService) and check out your load balancer Cloud Service. We'll also need the public IP of one of its boxes (which you can find under Input Endpoints).  

#### Cluster Configuration

Deis has a command line tool that helps finish the installation of all required parts. Let's install it:

```
$ mkdir ~/bin
$ cd ~/bin && curl -sSL http://deis.io/deisctl/install.sh | sh -s
$ sudo ln -fs $PWD/deisctl /usr/local/bin/deisctl
```

With deisctl installed, go back to the deis/contrib/azure directory to inform the tool about our created cluster - by adding the domain and SSH private key.

A quick word about domains and DNS: Ideally, you want a domain with a wildcard DNS record (*.domain.com), being the home to all of your apps that are going to run on that cluster. For demo purposes, we'll just go with the Cloud Service's domain here, [but check out the Deis documentation](http://docs.deis.io/en/latest/managing_deis/configure-dns/) if you the cluster is supposed to run in production.

```
$ export DEISCTL_TUNNEL=104.40.93.17:22001 // One of the Input Endpoints  
 $ ssh-add ./ssh-cert.key  
 $ deisctl config platform set domain=mycluster.cloudapp.net  
 $ deisctl config platform set sshPrivateKey=ssh-cert.key
```

We're basically done at this point, but we can now run the heavy-lifting stuff - putting Deis in control of the cluster. Give these commands a bit of time.

```
$ deisctl install platform  
$ deisctl start platform
```

Once you see "Deis started", your Deis platform is running on your cluster and you're now ready to go! At this point, you can treat the whole cluster like your own version of DEIS. There's a ton of possibilities from here, so go and [check out the full manual for tutorials on the many things you can do](http://docs.deis.io/en/latest/using_deis/#using-deis).

If you're interested in a practical deployment example, check out the case study on DemocracyOS - which was deployed on a Deis cluster running on Azure.

## Challenges

The number of challenges was high – Deis was not entirely prepared for Azure, while Azure itself had some trouble running CoreOS. The main issue involved machines within a CoreOS cluster running into clock synchronization issues due to a non-running NTP process, meaning that the clocks keeping time on individual nodes inside a cluster would slowly drift apart over the course of weeks. Time is an important feature in the orchestration of a cluster, asynchronous nodes would therefore not be able to work together – leaving the cluster with lost quorum. Once quorum was lost, the whole cluster was lost. The issue was extremely difficult to debug, but with the help of Azure, CoreOS and Deis, many components involved are now hardened against clock desynchronization.

Other issues involved the virtual network name, support for Azure Affinity Groups, the load balancer timeout limits, and slow I/O. On CoreOS, issues with sshd, the kernel (earlyprintk), and the console as well as the WAAgent(Azure now uses ttyS0) had to be solved.

## Opportunities for Reuse

The open source Linux cluster provisioning tool created for Deis has been reused in several customer engagements – it provides a huge amount of convenience to anybody wishing to run their own Deis cluster. In addition, the CoreOS provisioning tool is a useful path for the creation of Linux clusters in Azure until the Azure Resource Management API goes out of private beta.

In addition, we learned a lot about provisioning CoreOS clusters and installing dev ops management software on such a cluster. Deis is not the only orchestration platform out there, we will be able to reuse a lot of the written code for other customers using other orchestration tools.
