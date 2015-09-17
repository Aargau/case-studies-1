---
layout: post
title:  "Using ManifoldJS to Get More Out of Web Sites"
author: "Ville Rantala"
author-link: "http://vjrantal.net"
date: 2015-09-15 13:33:00
tags: [Web sites, ManifoldJS, W3C Manifest, App Stores, Windows Store, Android, iOS]
color: "blue"
excerpt: "A case study about leveraging existing Web assets when creating a mobile app."
---

# Audience

Web site developers and owners who are interested in getting more reach for their Web assets via app stores.

# Customer Problem

Companies that have developed a Web app sometimes experience the limitations that pure Web sites have, but don't necessarily have the resources to implement platform-specific apps or maintain multiple codebases to get rid of those limitations. For example, a startup might decide to build their product first as a Web app to reach a wide audience, but later on, want to get further reach and extend the feature-set. At that point, the company might have cumulated Web development competence and codebase and would like to get most value out of their existing assets rather than starting off with new technologies.

Examples of cases where pure Web sites have limitations include:

* Ability to use APIs for use cases such as payment, push notifications or hardware access that is not at all or not widely available for pure Web sites
* Getting visibility in the app stores from which many users are used to get apps from
  * Visibility is important to get more end users and may also be valuable for marketing campaigns or investor relations
* Create more "sticky" experience by getting into users "app grid"
  * On many platforms, this can be achieved also by pure Web sites (for example, [Pin to Start](https://www.windowsphone.com/en-us/how-to/wp7/start/pin-things-to-start) on Windows Phones and [Add to Homescreen](https://developer.chrome.com/multidevice/android/installtohomescreen) in Chrome for Android), but this might not be as familiar model as installing apps from stores

We recently worked together with great startups participating to the [Microsoft Ventures Accelerator in Berlin](https://www.microsoftventures.com/locations/berlin) where there were cases where this kind of opportunity was seen interesting. For example, a company called [Tandemploy](https://www.tandemploy.com/en/home) was interested to enhance their existing Web app and to get more reach via app stores.

# Overview of the Solution

The solution we used is called [ManifoldJS](http://www.manifoldjs.com/), which is a tool to package a Web experience in a way that it can be distributed via app stores while maintaining the same workflow and update cycle that Web developers are used to. In essence, the developer only needs to create and maintain a [standards-based manifest](http://www.w3.org/TR/appmanifest/) that describes the app and the tool takes care of generating target-specific projects that can be packaged and submitted to stores. The package only contains certain static resources (like app metadata and images) and all the actual Web app is fetched from the server that hosts the app. This is similar to how a Web browser fetches a Web page when you open it and you always get the latest version of the app. Standard caching practices are available to avoid excessive network traffic.

# Implementation

ManifoldJS is an open source project and can be [found from GitHub](https://github.com/manifoldjs/ManifoldJS). To get started using the tool, the [documentation page](http://www.manifoldjs.com/documentation) has good instructions on how to get started.

Example commands to install and run the tool can be seen below:

```
$ npm install -g manifoldjs

$ manifoldjs http://meteorite.azurewebsites.net
```

On a high level, the process of getting an existing Web site onto an app store is depicted below:

![Steps required]({{site.baseurl}}/images/2015-09-15-Using-ManifoldJS-to-Get-More-Out-of-Web-Sites/steps-required.png)

The process above is automated by the ManifoldJS tool all the way to the testing and app store submission phase in which there are manual steps required depending on the target and store in question. Also, if you don't have the target-specific SDKs installed, there is a one-time effort to install and setup the SDKs. Instructions can be found from the [deployment documentation](http://www.manifoldjs.com/deploy). The deployment documentation also includes guidance for submitting to the stores.

Once the submission is finalized, the app stays up-to-date while you update the Web site. The app could be though to be yet-another user agent along with regular Web browser that accesses your site. Since some information gets packaged into the app, there are a few cases where re-submission is required. See below section "Requirement for Resubmission" for more details about those.

Some platforms have in-built support for the kind of [hosted Web apps](http://www.thishereweb.com/hosted-web-apps-explained/) ManifoldJS generates, but where necessary, ManifoldJS leverages [Cordova](http://cordova.apache.org/) to get the wanted behavior. Cordova is used on iOS, Android and Windows versions before Windows 10. In addition to Cordova, a [ManifoldJS-specific plugin](https://github.com/manifoldjs/ManifoldCordova) gets included in the apps that implements the additional logic needed. On build-time, the plugin maps values from the standard manifest to values understood by Cordova and on run-time, it provides functionality for things like splash screens and [offline behavior](https://github.com/manifoldjs/ManifoldCordova#offline-feature).

# Challenges

## Missing Browser Back Button

If the Web site UI is designed so that the experience relies on the browser back button, the experience might not be optimal on platforms that don't have a hardware back key. An example of such platform is iOS. Since the app runs on iOS without a browser chrome, there is no way for the user to navigate back unless the Web app UI implements controls for it.

Recommendation is to generate and install an app to an iOS device and use the app as an end user would to ensure that the required functionality is available.

## Status Bar Overlays Web Content

When running the app on iOS, the default behavior of the status bar is such that it overlays the Web content. See below of an example:

![Steps required]({{site.baseurl}}/images/2015-09-15-Using-ManifoldJS-to-Get-More-Out-of-Web-Sites/status-bar-before.png)

This behavior can be overridden with an external Cordova plugin with the following steps:

1. Generate the app projects with ManifoldJS
2. Go to the "cordova" sub-folder within the generated projects' folder
3. Run "cordova plugin add org.apache.cordova.statusbar"
4. Edit the "config.xml" file to have values that fit your branding
5. With values below, one gets a status bar with a white background


```
<preference name="StatusBarOverlaysWebView" value="false" />

<preference name="StatusBarBackgroundColor" value="#ffffff" />

<preference name="StatusBarStyle" value="#000000" />
```


The end result in the Tandemploy case looks like below:

![Steps required]({{site.baseurl}}/images/2015-09-15-Using-ManifoldJS-to-Get-More-Out-of-Web-Sites/status-bar-after.png)

## Cross-platform Testing

The generated apps are running on runtimes that are very close to the Web browser environment, but there might be small differences in the way the app behaves. That is why getting the confidence that the app works as it should, testing on the target platform is recommended.

Most reliable option is to test on real devices, but if that is not possible, the target-specific SDKs comes with emulators or simulators that can be used for this purpose. ManifoldJS has a command-line option that makes it easy to run the resulting app. For example, "manifoldjs run android" would run the app on the Android platform using a real device or an emulator if a device is not connected.

To reduce the Android permutations to test on, ManifoldJS can be run with parameter --crosswalk that takes the [Crosswalk project](https://crosswalk-project.org/) into use on Android. By doing that, a WebView component is embedded into the Android app package allowing a recent and consistent Web runtime instead of relying on the inconsistent and potentially outdated runtime found from in-market Android devices.

## Requiring SDKs and Developer Licenses

Doing Web development doesn't require anything else than a Web browser and a text editor, but getting the generated apps built to the target platforms requires installation of the respective SDKs. The SDKs are typically free to install and use, but publishing the app to the stores often requires a small payment. On the iOS platform, a payment to get a developer license is required to be able to test on real devices.

## Constructing the Whitelist Policy

It is very common that a Web site depends on resources that needs to be loaded from a different origin than where the site is hosted. An example of such scenario is referencing to a JavaScript or CSS file hosted in a CDN. The current default cross-origin resource access policy in the generated apps [prevents](https://github.com/manifoldjs/ManifoldCordova/issues/29) loading such external resources unless the domain they originate from [is whitelisted](https://github.com/manifoldjs/ManifoldCordova).

Knowing all the dependent domains requires good knowledge of the Web site and the dependencies it has, but one way to know which domains are accessed is to run the app without the proper whitelist and check the app runtime logs for the messages that inform which resources have been blocked. Those messages look something like this:

```
ERROR whitelist rejection: url='https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css'
```

## Requirement for Resubmission

Even though the promise of the solution is that the developer can maintain their existing update cycle, there are some situations when the app needs to be re-packaged and re-submitted. These are:

* The app branding needs to be updated
  * For example, the app name and icons gets deployed within the package and updates to them need to go via store submission
* A bug is found from the app wrapper
  * For example, a bug in the native parts of Cordova
* The Web app requires new permissions
  * For example, if app gets a feature that requires Bluetooth API access, a new permission is required
* A new dependency is introduced to the Web app that requires modifying the domain whitelist policy

# Opportunities for Reuse

Nowadays, many Web sites have mobile-optimized versions or have even been designed primarily for mobile usage. A popular way to create app experiences that feel like native apps is to use frameworks that help creating so called [single-page apps](https://en.wikipedia.org/wiki/Single-page_application). These are good candidates to be further enhanced with features currently only available to "native apps" and to get the maximum audience via app stores.

The ManifoldJS tool is easy to install and especially if a target-specific SDK is already available, one can try out any site within minutes. The team is happy to take feedback and hear about any issues people run into. Best way to get involved is trying the tool out and reporting potential issues in the project's [GitHub issues page](https://github.com/manifoldjs/ManifoldJS/issues).
