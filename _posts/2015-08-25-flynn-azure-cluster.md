---
layout: post
title:  "Deploying Flynn Clusters on Azure"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
#author-image: "{{ site.baseurl }}/images/FelixRieseberg/photo.jpg" //should be square dimensions
date:   2015-08-30 10:00:00
tags: Azure DevOps Flynn
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: "Deploying Flynn Clusters on Azure"
---

Flynn is a next-generation PaaS (Platform as a Service) solution that can deploy, run, and scale both twelve-factor apps as well as stateful services. The company behind Flynn (which is also named Flynn) recently joined Y Combinator and is moving fast with bold goals: “Flynn deploys apps, scales apps, and manages databases with best practices right out of the box. Automatically doing all the things that were too complicated, expensive, or time consuming to do manually. And because it's open source, modular, and built on a set of core APIs, it's easy to extend or customize to any environment or need. Flynn is simply the easiest, most powerful way to run and scale your applications”.

It's a pretty bold statement, but we can attest that the team behind Flynn cares about quality like few others - [over the course of a few weeks, we worked together to add Microsoft Azure as a target to Flynn's installation tool](https://github.com/flynn/flynn/pull/1567/files). More than 5,000 lines of Go code were written so that others are able to spin up intelligent infrastructure for their apps in a few clicks. Let's take it for a ride!

![Flynn's Dashboard]({{site.baseurl}}/images/2015-08-25-flynn-azure-cluster/flynn1.png)

### Running the Installer
Flynn comes with a fancy command line client, available for both Windows, OS X, and Linux. On Windows, make use of your PowerShell by installing the Windows CLI:

```
(New-Object Net.WebClient).DownloadString('https://dl.flynn.io/cli.ps1') | iex

```

On OS X or Linux, curl the CLI straight to your bin folder:

```
L=/usr/local/bin/flynn && curl -sSL -A "`uname -sp`" https://dl.flynn.io/cli | zcat >$L && chmod +x $L
```

Using your freshly installed command line client, run `flynn install` to start the installer. A browser window should pop up, pointing to `localhost`. 

#### Wait, Localhost?
This is a big thing: All your data is in your control. Flynn gives you the convenience of a web app without actually being one. The installer naturally has the power to mess with your Azure Account (to spin up machines and deploy the cluster), but your credentials actually never leave your machine. This might seem trivial, but it's a major security feature - one that was bought with a lot of elbow grease. 

We  had to come up with a somewhat tricky architecture where you, the user, will create your own Flynn Installer web application on Azure. It would have been easy to create a centralized web application able to create new clusters: Users would simply have to authenticate the app (much like you'd authenticate a Facebook, Twitter, or Google app), but it would have also involved asking for complete administrative access to every user's cluster. If you take a peek at [some of Flynn's underlying code](https://github.com/flynn/flynn/blob/0c6dbe812ad32475f12fc06d4e93103e51862171/installer/azure_cluster.go), you'll find a cool authentication flow. 

### Going Through the Installation Steps
In the Flynn Installer, select 'Microsoft Azure' in the upper right and click on 'Add Credentials'. A popup will open, asking you if you want the walkthrough. For the walkthrough, I created a series of GIFs showing you all the necessary steps individually. I heavily recommend that you follow the guide, but here's a quick summary:

* In the Azure Management Portal, select the default (or desired) Active Directory and add an application. Choose "an application my organization is developing" and "native client application", using the redirect URI given to you by the Flynn Installer.
* Once the app is created, click on the 'Configure' tab and copy the 'Client ID' to the Flynn Installer. Then, at the very bottom of the page, grant your app the rights to manage use the Azure Service Management API.
* Going back to the applications tab of your directory, select the app and click the 'view endpoints' button, copying the OAuth 2.0 Token Endpoint to the Flynn Installer.
* To finish things up, click the 'Authenticate' button in the Flynn Installer.

Now that you have your own web app created on Azure and the Flynn Installer authenticated, you can select the specifics for your cluster. Feel free to change the size of individual instances, the number of machines, or the datacenter location for your cluster. As soon as you confirm your selection, Flynn will use 'Azure Resource Management' templates to have Azure create your cluster.

![Flynn Installing a Cluster]({{site.baseurl}}/images/2015-08-25-flynn-azure-cluster/flynn2.png)

Depending on how big your cluster is, installation will take a while. You can either wait for it to complete or read on to learn about how apps are being deployed.

###### Issues
Flynn is still in active development, meaning that things can still very much break. In my case, I had to attempt installation a total of three times before my cluster spun up. If you happen to run into similar issues, just throw away your cluster and start again - once Flynn is up and running, it is a wonderful personal PaaS.

### Congrats, you're running Flynn!
Flynn can run virtually anything, but it's [especially good at running Go, Java, Node.js, PHP, Python, and Ruby](https://flynn.io/docs). If you're already familiar with the incredible convenience of Heroku buildpacks, you'll be happy to hear that Flynn just uses those. If you're not, think of buildpacks like packages that contain your application, describing the environment and dependencies for your app. They are automatically created as soon as you push a repository/app to Flynn.

Once installation has completed, the Flynn Installer will ask you install a SSL root certificate used to encrypt the connection between you and your Flynn cluster. It will also give a URL and a passkey to the Flynn dashboard for your cluster, which should look like https://dashboard.p326.flynnhub.com. From there, deploying applications is crazy easy: You can connect the dashboard with GitHub and deploy and scale any application.

![Flynn's Dashboard]({{site.baseurl}}/images/2015-08-25-flynn-azure-cluster/flynn3.png)

Fore more information, check out [Flynn's source code](https://github.com/flynn/flynn), the [official website](https://flynn.io), as well as [the documentation](https://flynn.io/docs).
