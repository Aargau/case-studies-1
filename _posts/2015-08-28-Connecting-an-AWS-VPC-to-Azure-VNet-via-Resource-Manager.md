---
layout: post
title:  "Connecting an AWS VPC to Azure VNet via Resource Manager"
author: "Steven Edouard"
author-link: "http://www.stevenedouard.com"
date:   2015-08-30 10:00:00
tags: Azure DevOps AWS VPC Cloud
color: "blue"
excerpt: "A quick case study on connecting Azure to AWS"
---

## Why Connect Two Clouds?

While working with [Taplytics](https://taplytics.com), a mobile optimization startup, to bring some of their infrastructure onto Azure IaaS, a requirement was to have the AWS portion of their production deployment interact with their new Azure infrastructure. There are plenty of reasons for doing this including scale, high availability, as well as transitioning services from AWS over to Azure gradually rather than all at once.

In this post we'll talk about the solution we came up with, and how you can reuse some of the work done here for your own purposes.

## The Solution

Azure has long supported hybrid infrastructure for 'on-premises' workloads in what is now called 'Classic Compute' by using Virtual Network Gateways in conjunction with on-premises VPN hardware. This is designed for enterprise companies with large on-prem workloads to have hybrid connectivity with Azure, without having to run everything in Azure all at once.

It turns out, these Virtual Network (VNet) gateways can actually be connected to other clouds, in addition to on-premises VPNs. Today [Taplytics](https://taplytics.com) runs entirely on AWS and doesn't actually have an on-premises deployment. They would like to gradually bring some of their workload onto Azure as an extension of their existing AWS infrastructure.

Using Azure Resource Manager's Virtual Network Gateways, we can actually connect an Azure Virtual Network to an AWS [Virtual Private Cloud](https://aws.amazon.com/vpc/), allowing traffic to flow from machines within the Azure VNet to the machines on the AWS VPC, and vice versa. By leveraging open source VPN software such as [strongSwan](https://strongswan.org) we create an IPSec connection to the Azure gateway using a shared key. The strong swan instance within AWS not only can connect to Azure but can also be used to facilitate traffic to other nodes within the AWS VPC by [configuring forwarding](https://wiki.strongswan.org/projects/strongswan/wiki/ForwardingAndSplitTunneling) and using appropriate routing rules for the VPC.

This architecture looks sort of like this:

![Figure 1](http://az731655.vo.msecnd.net/content/awsazurediagram.png)

We ended up creating [a reusable template](https://github.com/Azure/azure-quickstart-templates/tree/master/201-site-to-site-vpn) to quickly create a Virtual Network gateway that can be deployed using the [azure cli](https://npmjs.org/azure-cli) from any kind of dev machine. For the AWS scenario, the term 'local' refers to the AWS VPC.

The great part is that although this works great for Taplytics' scenario, it also works well for anyone wanting to connect their existing cloud deployment to any Azure service that can be placed onto an Azure VNet. You can take the template, modify, change or reuse it to fit your specific needs.

## How to Connect AWS VPC to Azure Virtual Network

### Setting up your VPC Part I: Deploying

Using the AWS console, create a new VPC, you can give a big address space such as `10.0.0.0/16`: 

![Figure 2](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss1.png)

Create a new subnet and associate it with the given VPC. Any subnet size will do as long as its within a subset of the IP address space defined in the previous step. I'm going with `10.0.0.0/24`.

![Figure 3](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss2.png)

Then launch an EC2 Ubuntu instance with the VPC and subnet created in the step above:

![Figure 4](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss3.png)

Disable source/destination checking on the instance:

![Figure 5](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss4.png)

Now, in your VPC, allocate a new Elastic IP (public ip) address and associate it with the instance:


![Figure 6](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss5.png)
![Figure 7](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss6.png)


If you haven't already, its a good idea to change or at least add the hostname of your EC2 instance to it's `/etc/hosts` file (pointing to `127.0.0.1`) as strongSwan's IPsec command seems to look for your current instance's hostname on the network:

```
vim /etc/hostname
vim /etc/hosts
sudo service hostname restart
```

### Deploying the Azure VNet & Gateway

Deploying the Azure VNet and connection is made easy with the included resource manager template. This template includes a VirutalNetworkGateway, a LocalNetworkGateway and a VirtualNetworkGatewayConnection, as well as an instance to connect to an existing AWS VPC.

First, fill in the required parameters defined by [azuredeploy-parameters.json](https://github.com/sedouard/aws-vpc-to-azure-vnet/blob/master/azuredeploy-parameters.json). This includes:

- `vpcGatewayIpAddress` - The Gateway IP address of your AWS VPC 
- `vpcAddressPrefix` - The CIDR Block of your AWS VPC Subnet
- `sharedKey` - The shared key for the IPsec connection
- `adminPassword` - A password to login to the Azure Ubuntu VM

There's also lots of other parameters you can change which can be found within the [template file](https://github.com/sedouard/aws-vpc-to-azure-vnet/blob/master/azuredeploy.json). The most important parameters are `vpcGatewayIpAddress` which is the public IP of the EC2 instance created above and `vpcAddressPrefix` which is the CIDR block of the VPC subnet.

To deploy the parameters using the [azure cli](https://npmjs.com/azure-cli) create a new resource group then deploy the template to it.

```
azure group create aws2azure westus
azure group deployment create aws2azure --template-file azuredeploy.json --parameters-file azuredeploy-parameters.json
```

Afterwards you can verify within the Resource Explorer blade on [portal.azure.com](https://portal.azure.com) that the resource group you deployed to contains a VirtualNetworkGatewayConnection to the AWS VPC.


### Setting up your VPC Part II: Configuration

We need some details from the Azure deployment in order to complete configuring the VPC on the AWS side. First, we need to add a route to the VPC routing table and associate it with our subnet. 

Add a route to the route table associated with the VPC, with the Azure Subnet CIDR as the destination, and the EC2 instance as the target:

![Figure 8](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss7.png)

Be sure to associate the routing table with your VPC and your Amazon VPC Subnet.

Next, go to your security group associated with the EC2 instance and add 2 inbound custom UDP rules for ports 500 (for IKE) and 4500 (for NAT Traversal). The source for both should be a fixed single address CIDR block pointing your Azure VirtualNetworkGateway public IP formatted as: `[Azure VNet Public IP]/32`.

![Figure 9](http://az731655.vo.msecnd.net/content/azure-vnet-aws-vpc/ss8.png)

### Setting up strongSwan

Finally, we need to setup the EC2 instance as a strongSwan VPN server for the VPC. We can do this by `ssh`'ing into the instance and setting up strongSwan:

```
sudo apt-get update
sudo apt-get install strongswan
```

Now, modify the strongSwan configuration file `/etc/ipsec.conf` with a new connection called `azure`:

```
conn azure
  authby=secret
  type=tunnel
  leftsendcert=never
  left=10.0.0.28
  leftsubnet=10.0.0.0/24
  right=[AZURE GATEWAY PUBLIC IP]
  rightsubnet=10.3.0.0/24
  keyexchange=ikev2
  ikelifetime=10800s
  keylife=57m
  keyingtries=1
  rekeymargin=3m
  compress=no
  auto=start
```

Here are the keys you should change for your specific deployment:

- `left` - The local IP address of the strongSwan server
- `leftsubnet` - The local subnet of the VPC
- `right` - The public IP address of the Azure VNet Gateway
- `rightsubnet` - The local subnet of the Azure VNet (not to be confused with the gateway subnet)

Now we need to provide StrongSwan with the shared secret. To do this, modify the file `/etc/ipsec.secrets` and add the following line (do not include the brackets):

`[STRONGSWAN LOCAL IP] [AZURE VNET GATEWAY PUBLIC IP] : PSK "[YOUR SHARED KEY]"`

This should match the shared key used in the azure template parameters from the previous section.

For the strong swan instance to forward traffic between Azure VNet and AWS VPC, we'll have to enable forwarding. On the EC2 instance, uncomment or add the following line to the file, `/etc/sysctl.conf `:

```
net.ipv4.ip_forward=1
```

Now, just restart the ipsec service and you should see a connection:

```
ipsec restart
ipsec status
Security Associations (1 up, 0 connecting):
       azure[1]: ESTABLISHED 3 seconds ago, 10.0.0.28[10.0.0.28]...AZURE PUBLIC IP[AZURE PUBLIC IP]
       azure{1}:  INSTALLED, TUNNEL, ESP in UDP SPIs: c3e607f3_i 280cade0_o
       azure{1}:   10.0.0.0/24 === 10.3.0.0/24 
```

### Testing the Connection

A test Ubuntu VM has already been included in the Azure Resource Manager template we deployed in the previous step. So to test the connection, create another Ubuntu instance on AWS, associated with the same VPC, subnet and security group.

#### Enable Ping

In order to configure Ubuntu to respond to ping requests, run this command on both the AWS and Azure Ubuntu instances:

```
iptables -A INPUT -p icmp -j ACCEPT
```

From the AWS instance, attempt to ping the Azure instance:

```
ping [Azure Instance Local IP]
64 bytes from 10.0.0.232: icmp_seq=892 ttl=62 time=26.1 ms
64 bytes from 10.0.0.232: icmp_seq=893 ttl=62 time=26.2 ms
64 bytes from 10.0.0.232: icmp_seq=894 ttl=62 time=25.8 ms
...
64 bytes from 10.0.0.232: icmp_seq=929 ttl=62 time=25.4 ms
```

You should see something similar when you ping the the AWS instance from Azure:

```
ping [AWS Instance Local IP]
64 bytes from 10.3.0.123: icmp_seq=892 ttl=62 time=26.1 ms
64 bytes from 10.3.0.123: icmp_seq=893 ttl=62 time=26.2 ms
64 bytes from 10.3.0.123: icmp_seq=894 ttl=62 time=25.8 ms
...
64 bytes from 10.3.0.123: icmp_seq=896 ttl=62 time=26.1 ms
```

## Next Steps

You now have two subnets that are connected, one on AWS the other on Azure. You can use this connection for any type of communication that needs to be done between the two deployments, but be sure to modify your settings to allow traffic from other needed ports.

You can also find this template available for direct deployment from the [Azure Portal](https://portal.azure.com/signin/index/#create/Microsoft.Template/uri/https%3A%2F%2Fraw.githubusercontent.com%2FAzure%2Fazure-quickstart-templates%2Fmaster%2F201-site-to-site-vpn%2Fazuredeploy.json) 