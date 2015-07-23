---
layout: post
title:  "Office Mail App for Rallyteam"
author: "Shawn Cicoria"
author-link: "http://blogs.msdn.com/b/scicoria/"
#author-image: "{{ site.baseurl }}/images/ShawnCicoria/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure Office365 Mail
color: "blue"
# image: "images/rallyteam.png" #should be ~350px tall
excerpt: Office Mail App for Rallyteam
---

The Microsoft Office Platform is focused on enhancing the collaboration experience. This case study introduces you to Mail apps for Outlook and the ease of building, integrating, and enhancing the collaboration experience for users. The example shown here gets you up and running quickly with all the parts necessary to build a Mail app for Outlook customized for your users.  Additionally, for IT Pros it illustrates the ease to which you can make your organization’s own mail applications or 3rd party applications available to your users.

Working with Rallyteam, a [MS Ventures](https://www.microsoftventures.com/) Accelerator participant, we created a simple but effective mail app to demonstrate an action-oriented add-in activated within the context of a mail item.

## Background

Rallyteam ([http://Rallyteam.com](http://Rallyteam.com)) provides a tool that facilitates project awareness and resource assignment within an organization. The platform is a matching service for projects and people for assignments that wouldn’t normally be visible within an organization. It attempts to achieve optimization of project assignments based upon numerous factors such as interests, kudos (which Rallyteam calls “props” for proper recognition), experience, and ratings of each person that participates. The goal is to facilitate self-forming teams and optimize resource assignment through matching of individuals.  Exposing this information also aids in identification of skill gaps and underutilized resources.

## Rallyteam Features

The features of Rallyteam are provided here: [http://rallyteam.com/#features](http://rallyteam.com/#features)

Generally, uses can:

1.	Create profile about themselves indicating interest, skills, career direction
2.	Collaboration allows teams to identify and assign users based upon skills and initiative
3.	Groups provide shared interests and expertise along with recognition
4.	Recognition provides peers with the ability to reward contributions to the community by earning points, props, and badges over time.


## Opportunity

Many organization are email-centric. Many users spend considerable time within an email client – either a desktop application like Outlook, a browser-based application (like Outlook Mail App – OWA), and/or their mobile devices.

During any email interaction there are triggers that require a user to switch context to other applications to complete a task.  This context switch is something we can optimize with Mail apps for Outlook by providing actionable visual elements within the application the user is currently accessing.

Mail apps for Outlook have the ability to activate an actionable link, then provide a User Interface (UI) that allows the user to interact with an application while never leaving the Outlook interface – reducing steps, decreasing context switching, and making things happen in a friction free manner.

## High Level Flow

The following illustrates the high level flow from email creation (outside of Rallyteam and Mail apps for Outlook) to the point where the Rallyteam Action is triggered by the recognition of the key words in any email, then to the creation of a Rallyteam opportunity.

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image001.png)

Figure 1 - High level flow

## Outlook User interface and mail apps

Here are some screenshots illustrating the user experience when the system recognizes project opportunities. In the first case, you see an email with no such opportunities, but a series of Outlook Mail applications installed (the yellow bar, called the “action bar”):

### Example of an email – NOT about a project or Opportunity

For a high level overview of the flow, see the diagram Figure 8 - High level deployment.

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image002.jpg)

Figure 2 - Mail app not about a project

In the email above (here we're using the Outlook desktop client) the normal action bar is showing the various Office Apps that have been installed, either by the administrator or the user.

In the following example, the system has recognized an opportunity and a new application, “Project Unite” appears in the action bar. In this case the email was “triggered”:

### Example of an Email – triggered

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image003.jpg)

Figure 3 -Mail app about a project

When the users open the email, they are presented with an opportunity to participate in a project, as shown below:

### Mail App – Opened

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image004.jpg)

Figure 4 - Mail App opened and ready for action

Of course, this also works in the browser-based version (Outlook Web Access, or OWA), as shown below:

### Also Working in Browser – Office Web App (OWA)

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image005.jpg)

Figure 5 - App activated in Browser OWA

### Running this in your Tenant

You can add this yourself to your own Outlook client by adding the app. The following steps will show you how:

1. Navigate to [https://rtmailapp.azurewebsites.net/](https://rtmailapp.azurewebsites.net/)

This is a demo site that provides the backing HTML based application utilized by the Office App. For the purposes of this demo the application does very little and simply shows the Outlook integration. No updates are performed; it only recognizes the words “project | opportunity” within the email item Subject or Body.

2. Copy the Link to Manifest

Once on that page, copy the shortcut shown on the page; it should be

[https://rtmailapp.azurewebsites.net/AppManifest/ProjectUniteMailAppManifest.xml](https://rtmailapp.azurewebsites.net/AppManifest/ProjectUniteMailAppManifest.xml)

If you deploy to your own Azure Web Site a different host name will be used. Note that this MUST be HTTPS. Using Azure Web Apps ensures that HTTPS is supported using the wildcard certificate “*.azurewebsites.net”.

3. Open “Manage Apps” from OWA

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image006.jpg)

Figure 6 - Mange Apps in OWA

4. Click on the ‘+’

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image007.jpg)

Figure 7 - Adding an App with a URL

5. Choose ‘Add from URL’

When Presented with the Entry form, paste in the URL from above; if using the sample here:

[https://rtmailapp.azurewebsites.net/AppManifest/ProjectUniteMailAppManifest.xml](https://rtmailapp.azurewebsites.net/AppManifest/ProjectUniteMailAppManifest.xml)

Then click "Next", then accept the “warning” regarding the app NOT being verified and NOT from the Office Store by clicking “Install”.  When it’s done, click OK.

List of Mail Apps

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image008.jpg)

Figure 8 - App shown in the Manage App list

Once you’re done adding the mail application, it shows in the list "Manage Apps" as above. Note the information on the right side regarding what is read from the XML manifest provided before.

## Overview of the Solution

### High Level Deployment

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image009.jpg)

Figure 9 - High level deployment

### Application Components

### Client

The client is a form of Outlook – either the Outlook Office Client, or the browser or mobile based client

### Azure Web App

The Azure Web App (can be any Web Site or technology such as ASP.NET, PHP, NodeJS) provides the static content and the interactive JavaScript that runs in the context of the client.

In addition, for any further interactivity, the web application could also provide update capabilities that any website generally can provide.

The web application utilized here uses ASP.NET 4.5 for the base site, although no MVC Controllers are utilized. Only static pages are used in this solution; however, you are not restricted.

The page interactivity is basic JavaScript and AngularJS, along with Bootstrap for the presentation tier.

## Deployment Approaches

### Development

During development, you simply press F5 – this will deploy the “manifest” to an Office 365 Exchange Tenant – the following dialog box will appear. You will require permissions to deploy this to your email account.  You can obtain a Trial Tenant from MSDN subscriptions if you wish to isolate (recommended) from your production email.

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image010.jpg)

Figure 10 - Visual Studio Office Tools Authentication

### Production

There are three ways to deploy; the first two below bypass the Office Store – which means it hasn’t been verified by Microsoft. Therefore only reference or use apps that you trust.

1. Via URL – which this sample uses (see warning below)

2. Via File – which is generally the same as URL, just using a local file

3. Via Office Store – this requires a publishing process and will make the application available for other Office 365 Tenants and Users to install.

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image011.jpg)

Figure 11 - Warning when using non-Office Store App

## Code Artifacts

The code is published here: [https://github.com/cicorias/ProjectUnite](https://github.com/cicorias/ProjectUnite)

### Required Tooling

The tools required to run the sample are:

1. Visual Studio 2013 or Visual Studio 2015

2. Microsoft Office Developer Tools for Visual Studio 2013 – April 2015 Update

a. Not needed if using **Visual Studio 2015 RC or better (do not use any of the Preview releases of VS2015)**

The following shows installation of the tools using Web Platform Installer which can be obtained from: [http://www.microsoft.com/web/downloads/platform.aspx](http://www.microsoft.com/web/downloads/platform.aspx)  (or [http://go.microsoft.com/fwlink/?LinkId=255386](http://go.microsoft.com/fwlink/?LinkId=255386) ).

![Screenshot]({{site.baseurl}}/images/2015-07-21-Office-Mail-App-for-Rallyteam_images/image012.jpg)

Figure 12 - Web Platform Installer

## Opportunities for Reuse

There has been significant interest from various customers related to collaboration tools and applications that surround the Office 365 ecosystem. The example presented here can be used to bootstrap an effort and initiate conversations around what is possible to facilitate collaboration experiences and productivity enhancements

## Follow up

Rallyteam is continuing to evaluate Office Mail Apps and looking at additionally providing contextual recognition beyond the simple regular expressions that are provided in this sample. For example, by increasing the permission levels of the application, it is possible to inspect a mail item deeper and use custom backend services, provided by the application and not Office 365, to enrich the experience. This capability requires greater trust level and permissions, but is possible through use of the Office 365 services that allow interaction within a user’s email item, their mailbox, or other O365 Services.

## Links and References

Rallyteam: [http://www.rallyteam.com](http://www.rallyteam.com)

Office Development Center: [http://dev.office.com/](http://dev.office.com/)

Apps for Office Overview: [https://msdn.microsoft.com/en-us/library/office/jj220060(v=office.15).aspx](https://msdn.microsoft.com/en-us/library/office/jj220060(v=office.15).aspx)

Creating a Mail App with Visual Studio: [https://msdn.microsoft.com/en-us/library/a1b11750-7476-477d-9243-56ff145a0e3c](https://msdn.microsoft.com/en-us/library/a1b11750-7476-477d-9243-56ff145a0e3c)

Creating a Mail App with Napa (Monaco – what “code.visualstudio.com” was built with): [https://msdn.microsoft.com/EN-US/library/office/jj220072.aspx](https://msdn.microsoft.com/EN-US/library/office/jj220072.aspx)
