---
layout: post
title:  "Enterprise Side Loading – Distributing Line of Business (LoB) Applications"
author: "Jason Poon"
#author-link: "http://#"
#author-image: "{{ site.baseurl }}/images/JasonPoon/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Windows Phone
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Enterprise Side Loading – Distributing Line of Business (LoB) Applications
---

# Enterprise Side Loading – Distributing Line of Business (LoB) Applications

Jason Poon, May 19, 2015, Version 1

# Audience

External

# Tags

Windows Universal Apps, Windows 8.1, Windows Phone 8.1, Enterprise Sideloading

# Customer Problem

In this case study, you’ll learn how one large enterprise determined the best deployment mechanism to be used for distributing their Windows line of business application.

Xerox executes signed service contracts with customers ensuring copiers, printers, and other devices continue operating with minimal downtime. As such, Xerox must execute well against a committed Service Level Agreement (SLA). A common service call for a Xerox customer service engineer (CSE) involves viewing the service call information on their BlackBerry. Given the context of the service call, the CSE will then preload their full-sized laptop with the device documentation that they predict will be needed for the service call. An initiative within Xerox provided an opportunity to re-imagine the entire end-to-end workflow executed in the day of the life for a CSE. This included viewing and navigating to their next service call and discovering, viewing, and sharing diagnostic information. This effort was realized by developing a Windows universal application. Once developed, the application was deployed to a fleet of Microsoft Surface Pro 3s. This case study will go in detail the solution that was undertaken to distribute the Windows application built in collaboration with Xerox.

# Overview of the Solution

The Windows and Windows Phone Stores offer a variety of mechanisms for distributing applications to customers. The criteria in choosing the ideal distribution mechanism includes the target platform, target audience, and other factors (see Figure 1).

![]({{ site.url }}/case-studies/images/2015-07-21-Enterprise-Sideloading-Publishing-Line-of-Business-Applications_images/image001.png)

Figure 1: Windows and Windows Phone Application Distribution Mechanisms

The following table outlines the differences in the various publishing mechanisms offered for Windows and Windows Phone applications:

<table class=MsoTable15Grid2Accent3 border=1 cellspacing=0 cellpadding=0
 style='border-collapse:collapse;border:none'>
 <tr>
  <td width=204 rowspan=2 valign=top style='width:76.5pt;border:none;
  border-bottom:solid #C9C9C9 1.0pt;background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><b>Publishing Mechanism</b></p>
  </td>
  <td width=288 colspan=2 valign=top style='width:1.5in;border:none;border-bottom:
  solid #C9C9C9 1.5pt;background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><b>Target Platform</b></p>
  </td>
  <td width=732 rowspan=2 valign=top style='width:274.5pt;border:none;
  border-bottom:solid #C9C9C9 1.0pt;background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><b>Explanation</b></p>
  </td>
 </tr>
 <tr>
  <td width=144 valign=top style='width:.75in;border:solid #C9C9C9 1.0pt;
  border-top:none;background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><b>Windows</b></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><b>Windows Phone</b></p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Developer Side load</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif;
  color:#545454;background:white'>&#10003;</span><a href="#_ftn1"
  name="_ftnref1" title=""><span class=MsoFootnoteReference><b><span
  class=MsoFootnoteReference><b><span style='font-size:11.0pt;line-height:107%;
  font-family:"Calibri",sans-serif'>[1]</span></b></span></b></span></a></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif;
  color:#545454;background:white'>&#10003;</span><a href="#_ftn2"
  name="_ftnref2" title=""><span class=MsoFootnoteReference><b><span
  class=MsoFootnoteReference><b><span style='font-size:11.0pt;line-height:107%;
  font-family:"Calibri",sans-serif'>[2]</span></b></span></b></span></a></p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Mechanism used within Visual Studio for development. Only use it for
  development and testing as it requires constant renewal of the developer
  license.</p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Deploy using MDM</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;</span></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;</span></p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Deploy application to managed devices using mobile device management
  (MDM) such as Windows InTune or System Center 2012.</p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Store within a Store (SWaS)</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif;
  color:#545454;background:white'>&#10003;</span></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif;
  color:#545454;background:white'>&#10003;</span></p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Limited to mobile operators (MOs) or original equipment manufacturers
  (OEMs). Publish hub/store within the Windows/Windows Phone store. </p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Deploy to Company App Hub</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'>&nbsp;</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;<a
  href="#_ftn3" name="_ftnref3" title=""><span class=MsoFootnoteReference><span
  class=MsoFootnoteReference><span style='font-size:11.0pt;line-height:107%;
  font-family:"Segoe UI Symbol",sans-serif'>[3]</span></span></span></a></span></p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  background:#EDEDED;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>The company hub app acts as a portal to discover and install company
  apps. Once the company hub is published to employees, line of business
  applications can be published to the hub app. </p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Enterprise Side load</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;<a
  href="#_ftn4" name="_ftnref4" title=""><span class=MsoFootnoteReference><span
  class=MsoFootnoteReference><span style='font-size:11.0pt;line-height:107%;
  font-family:"Segoe UI Symbol",sans-serif'>[4]</span></span></span></a></span></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'>&nbsp;</p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  background:white;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Side loaded apps do not need to be published to the Store. Requires
  an enterprise side loading key.</p>
  </td>
 </tr>
 <tr>
  <td width=204 valign=top style='width:76.5pt;border-top:none;border-left:
  none;border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>Publish to the Store</p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;</span></p>
  </td>
  <td width=144 valign=top style='width:.75in;border-top:none;border-left:none;
  border-bottom:solid #C9C9C9 1.0pt;border-right:solid #C9C9C9 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal align=center style='margin-bottom:0in;margin-bottom:.0001pt;
  text-align:center;line-height:normal'><span style='font-family:"Segoe UI Symbol",sans-serif'>&#10003;</span></p>
  </td>
  <td width=732 valign=top style='width:274.5pt;border:none;border-bottom:solid #C9C9C9 1.0pt;
  background:#F2F2F2;padding:0in 5.4pt 0in 5.4pt'>
  <p class=MsoNormal style='margin-bottom:0in;margin-bottom:.0001pt;line-height:
  normal'>The Windows Phone Store offers more granular control of targeted
  audience: </p>
  <p class=MsoListParagraphCxSpFirst style='margin-bottom:0in;margin-bottom:
  .0001pt;text-indent:-.25in;line-height:normal'><span style='font-family:Symbol'>·<span
  style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span>Publish
  Hidden – the app is not discoverable, only those with the deep link are able
  to install the application.</p>
  <p class=MsoListParagraphCxSpLast style='margin-bottom:0in;margin-bottom:
  .0001pt;text-indent:-.25in;line-height:normal'><span style='font-family:Symbol'>·<span
  style='font:7.0pt "Times New Roman"'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span>Beta
  – the developer maintains a list of registered clients. Only these clients
  are able to install the application. </p>
  </td>
 </tr>
</table>

Publishing through the Store has benefits which include technical and content certification being performed on the application and discoverability, telemetry, reporting, installation and version upgrades are all managed by the Store. With side loading, as the application is published outside the Stores, the dependencies on external testing, certification, and publishing are removed and developers have more control over the installation process.

In the case of the Xerox project, the application needed to be deployed to approximately 10 devices for field testing of the application. Although MDMs is the preferred approach for large-scale enterprises, it did not align with our goals as the turnaround time for provisioning and deploying the device with the software was too long. Given the requirements and the circumstances, enterprise side loading was chosen as distribution mechanism for the application.

# Implementation

The implementation involved building a ClickOnce[5](#_ftn5) installer that is distributed to the application users. The installer serves two functions: perform all the setup required for enterprise side loading and install updates of the application as they become available.

The following steps are required in order to enable side loading of an application to a Windows device:

- The AppX package to be installed must be digitally signed by a certificate trusted on the device.
- The device’s group policy must allow trusted app installation.
- Activate side loading product key on the device.

Once the above requirements are met, the application can then be side loading.

## Signing Package                 

Digitally signing the package can be done using Visual Studio. By default, Visual Studio generates and signs packages using a test certificate. You can generate your own using _makecert_:

``
makecert -n "CN=<YOUR-COMMON-NAME>" -pe -sv <CERTIFICATE-NAME>.pvk -r <CERTIFICATE-NAME>.cer -sky Exchange
``

Once generated, we can instruct Visual Studio to use the generated certificate for signing the Windows application through the manifest designer. The manifest designer can be accessed via:

- In Solution Explorer, expand the project node of the app.
- Double-click the Package.appxmanifest file.
- Under the Packaging tab, choose the certificate to be used for signing.


![]({{ site.url }}/case-studies/images/2015-07-21-Enterprise-Sideloading-Publishing-Line-of-Business-Applications_images/image002.jpg)

Figure 2. Manifest Designer

The certificate generated above is included in the ClickOnce installer such that it can be installed on the device as a trusted certificate.

``
     private void InstallCertificate()  
     {
         var certFile = Path.GetFullPath("<YOUR-CERTIFICATE>.cer");
         var arguments = String.Format(" /add {0} /s /r localMachine root", certFile);

         var startInfo = new ProcessStartInfo("certMgr.exe", arguments)
         {
             WindowStyle = ProcessWindowStyle.Hidden,
             Verb = "runas",
             UseShellExecute = true,
             CreateNoWindow = true, 
         };

         var process = Process.Start(startInfo);
         process.WaitForExit(15000);
     }
``

## Group Policy

During the setup phase, the ClickOnce installer updates the group policy of the device to enable installation of trusted apps.

``
    private void SetGroupPolicy()
    {
        var subKeyName = @"SOFTWARE\Policies\Microsoft\Windows\Appx";
        using (var key = Registry.LocalMachine.OpenSubKey(subKeyName, true))
        {
            if (key != null)
            {
                key.SetValue("AllowAllTrustedApps", unchecked(0x00000001), RegistryValueKind.DWord);
            }
        }
    }
``

## Side Loading Product Key

An enterprise side loading key is a 25-digit key that is used to enable side loading on the device. They can be obtained through the [Volume Licensing Program](http://download.microsoft.com/download/9/4/3/9439A928-A0D1-44C2-A099-26A59AE0543B/Windows_8_Licensing_Guide.pdf). The ClickOnce installer adds and activates the side loading product key using software licensing management tool (_slmgr_):

``
slmgr /ipk <side loading product key>
slmgr /ato ec67814b-30e6-4a50-bf7b-d55daf729d1e
``

Note that the activation GUID is different from the side loading product key, and the activation GUID will always be ec67814b-30e6-4a50-bf7b-d55daf729d1e.

## Package Installation

At this point, the device is now ready for side loading. The ClickOnce application installs the Windows application using PowerShell. The same code path is taken to install the application if an update is available.

``
   private void InstallApp()
   {
        var appxPath = Path.GetFullPath("<PATH-TO-APPX-BUNDLE");
        var dependPath = Path.GetFullPath("Microsoft.VCLibs.x86.12.00.appx");
        var arguments = String.Format("/c powershell add-appxpackage -Path {0} –DependencyPath {1}", appxPath,dependPath);

        var startInfo = new ProcessStartInfo("cmd.exe", arguments)
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            CreateNoWindow = true,
        };

        var process = Process.Start(startInfo);
        process.OutputDataReceived += ProcessDataReceived;
        process.ErrorDataReceived += ProcessDataReceived;

        process.BeginOutputReadLine();
        process.BeginErrorReadLine();
        process.WaitForExit(15000);
   }
``

# Code Artifacts

The code can be found [here](https://github.com/sreesharp/ClickOnceDemo) with accompanying blog posts [here](http://jasonpoon.ca/2015/01/28/sideloading-windows-apps/) and [here](http://sreesharp.com/clickonce-deployment-for-enterprise-windows-store-apps/). 

# Opportunities for Reuse                                                           

The architecture and code shown in this case study can be applied to all other application developers that are undergoing the same decision process when distributing their Windows or Windows Phone application. In particular, it may be useful for enterprises deploying their line of business application.

* * *

<div id="ftn1">

[1](#_ftnref1) https://msdn.microsoft.com/en-us/library/windows/apps/dn832613.aspx

</div>

<div id="ftn2">

[2](#_ftnref2) https://msdn.microsoft.com/en-us/library/windows/apps/ff769508%28v=vs.105%29.aspx

</div>

<div id="ftn3">

[3](#_ftnref3) https://msdn.microsoft.com/en-us/library/windows/apps/jj720571%28v=vs.105%29.aspx

</div>

<div id="ftn4">

[4](#_ftnref4) https://technet.microsoft.com/en-us/library/dn613831.aspx

</div>

<div id="ftn5">

[5](#_ftnref5) https://msdn.microsoft.com/en-us/library/142dbbz4%28v=vs.90%29.aspx

</div>

</div>