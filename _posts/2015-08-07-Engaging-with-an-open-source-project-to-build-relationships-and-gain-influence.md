---
layout: post
title:  "Engaging with Open Source Projects to Build Relationships and Gain Influence"
author: "Tim Park"
author-link: "http://timpark.io"
date:   2015-08-07 11:54:00
categories: GitHub OSS
color: "blue"
excerpt: How to engage with an open source project to build relationships, gain industry context, and improve Microsoft's standing in these communities.
---

One of our roles in DX is to keep our ear to the ground on what's happening in influential open source communities and make sure Microsoft is well positioned with our platforms and our developer tools.  I spent a lot of time reading Hacker News, showing up to meetups, and talking with attendees at conferences to understand which projects developers are putting into use by day at their companies.

One of these projects is React Native. React Native is a mobile framework built by Facebook for their own internal apps that aims to make it easier to "learn once, write many" by providing a hybrid JavaScript/native application model for building mobile applications.

I'd heard from a number of developers that they were evaluating React Native for their next mobile project. When a framework project like this is getting traction, I want to learn how it works end to end to understand its implications on our platforms and make sure they are well situated to take advantage of its rise. With an application framework like React Native I usually try to do three things:

1. Build an application using the framework to understand what problems it is trying to solve and how well it solves them.
2. Build a plug-in for the framework to understand how extensible it is.
3. Contribute something to the project to understand the quality of the underlying code and use this to interact with the maintainers of the project.

Steps 1 and 2 you can do pretty independently. Step 3 requires some expertise on how to work with an open source project. This post will dig in and walk through the life of a pull request I made on the React Native project.

The application I wrote to kick the tires of the platform utilized the Leaflet javascript mapping library inside of a WebView. In order to interact with this component from the application itself, I needed a mechanism to inject a JavaScript call into the WebView's context.

In an emerging framework like React Native, there are almost always a lot of functionality gaps, and in this case there was no equivalent of the iOS native function `stringByEvaluatingJavaScriptFromString` in the WebView component. Great! A perfect chance to engage with the project, learn more about its internals, solve a real problem for developers, and change the perception of Microsoft in this community in the process.

The first step in making a code contribution, though, is to make sure it is not covered by another portion of the platform. The best way to do this depends on the project. Projects will often have pages that describe the best way to get support for their project like the <a href="http://facebook.github.io/react-native/support.html">React Native support page</a>. In this case, I talked with the React native community in the #reactnative IRC channel and quickly confirmed that this was unimplemented functionality.

I knew that the pull request to add this functionality would amount to just a  couple of dozen lines of code (and so only risk a few hours of my productivity that they would not accept it) so I did not "preflight" the pull request with the maintainers, but for larger pull requests, you should definitely file an issue with the project and explain your strategy to make sure it will be accepted before jumping in and writing code.

You should also familiarize yourself with the coding style and engineering process of the project. Open Source projects are very rigorous about both and your pull request will likely be rejected if you use a different spacing width or don't write a test to cover the functionality in your pull request.

Once you have covered these prerequisites, it is easy to get started. Most modern projects are housed on GitHub, utilize git, and you can fork the project into your own repo to work on by simply pressing the fork button to the right of the project.

![Figure 1: Forking the React Native Project]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/fork.png)

After forking it, GitHub will take you to your fork of the project. I copy the url from the lower right hand side of the project then clone the project onto my machine from the command line:

![Figure 2: GitHub Clone URL]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/clone-url.png)

     > git clone https://github.com/timfpark/react-native.git react-native

From there I just edited away to make change to add the method to WebView and plumb it through to the iOS UIWebView underneath. One good practice around making pull requests on a project is to make them as small as possible while still adding useful functionality to the project. This makes it easier for the maintainers to review the pull request and also sequence when to pull in different functionality for releases of the project.

With the functionality added, I committed it to the git repo as normal:

    > git add Libraries/Components/WebView/WebView.ios.js
    > git add React/Views/RCTWebView.h
    > git add React/Views/RCTWebView.m
    > git add React/Views/RCTWebViewManager.m
    > git commit -m 'Add support for evaluateJavaScript to WebView'

And then pushed the changes up to my fork in Github:

    > git push origin master

Creating a pull request on the upstream project is a simple button press in GitHub. Click on Pull Requests on the home page of your forked repo and then create a pull request:

![Figure 3: Create Pull Request]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/new-pull-request.png)

This will pull your commit into a pull request and submit it to the upstream project for consideration. You should naturally add some commentary to the pull request to explain what problem you are addressing and your strategy. I typically assume nothing: even if I've talked with all of the maintainers about the change, there is no guarantee they remember that conversation or that they haven't added another maintainer in the meantime that will need that context.

Many projects have a continuous integration system in place like TravisCI to verify that incoming pull requests pass all project tests so they feel more comfortable in accepting the change into the project. Make sure to check at the bottom of the pull request to confirm that your change passes these integration tests.

![Figure 4: Continuous Integration Tests]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/ci.png)

Although it feels like you are at the end of the line with your change submitted as a pull request, often you are just getting started. The maintainer might, after having a look at the change, ask for a change of one type or another. This happened to me as part of this pull request, where Ben Alpert from Facebook requested that I match a webkit instead of the iOS signature.

![Figure 5: Conversation around Method Signatures]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/method-signature.png)

The way to handle this is to generally defer to the project maintainer. They have better overall context on how everything fits together in the project and its probable in this case that there are several hundred APIs that already match webkit.

The second thing you'll likely face is that project maintainers are horrendously overworked and it may take a long time to get around to reviewing your pull request or responding to feedback. This is normal. You are not being singled out. Be patient. Most maintainers have a real full time job in addition to the project they are working on and the most popular open source projects have hundreds of outstanding pull requests at any time.

If a couple of weeks pass without comment, its ok to ping one of the responders to alert them that you are awaiting feedback: your PR might have just scrolled off their radar. That said, DO NOT badger the maintainers to accept or comment on your pull request. If you don't get a response, just be patient and ask again in a week or two. This happened to me with the React Native pull request and a bit of gentle pinging eventually resulted in a second round of feedback a few weeks later.

![Figure 6: Delay in responding]({{site.baseurl}}/images/2015-08-07-Engaging-with-an-open-source-project-to-build-relationships-and-gain-influence_images/delay.png)
Figure 5: Wait

Often, there will be several rounds of feedback on a more complicated pull request or a pull request that changes the API surface of the framework. This results in multiple commits to the pull request, which, when accepted, can make the commit stream hard to follow for the project. Often, a maintainer will ask you to "squash" the commits in your pull request into one commit to alleviate this. This requires a tiny bit of more advanced git-fu to accomplish. Here is how I did that for my React native pull request:

    > git log

    commit 0e2032ab1e9f41cfa721ef1c07bd9dc6e3cfb77b
    Author: Tim Park <timfpark@gmail.com>
    Date:   Fri Aug 7 10:09:43 2015 -0700

    a small tweak

    commit d0d91cfdcb7ccef4ab68cc821b2153c9249fa337
    Author: Tim Park <timfpark@gmail.com>
    Date:   Fri Aug 7 10:09:31 2015 -0700

    small change

    commit 59f22418df454bbd6df24cf152d30cf27174a640
    Author: Tim Park <timfpark@gmail.com>
    Date:   Thu May 7 10:22:46 2015 -0700

    Add support for evaluateJavaScript to WebView

    commit 9f81d6726c507da0d647781d79e1c3415e844bc8
    Merge: 257bbb5 01deb0b
    Author: Nick Lockwood <nicklockwood@users.noreply.github.com>
    Date:   Tue Aug 4 22:16:26 2015 +0100

    Merge pull request #2227 from harrykiselev/patch-1

    Fix link to Apple Developer account registration.

I first do a `git log` to note how many commits of mine constitute the pull request.  In this case, I had one main commit and two follow on commits.  I want to squash those down into one single commit, so I next rebase these three commits:

    > git rebase -i HEAD~3

This will open an editor and git will ask you how you want to adjust the commit stream:

    pick 59f2241 Add support for evaluateJavaScript to WebView
    pick d0d91cf small change
    pick 0e2032a a small tweak
    ...

What you want to do is edit this to look like the following:

    pick 59f2241 Add support for evaluateJavaScript to WebView
    squash d0d91cf small change
    squash 0e2032a a small tweak
    ...

This will squash these last two commits into the first commit making it look like all of the work happened in that one commit, improving the readability of the commit stream.

Save and quit the editor. Git will then open up a second editor to let you edit the commit, which will include all of the comments from all three commits. Edit these down into a single coherent commit message and then save and exit and, violà, you should see just a single commit in your git log:

    > git log

    commit 27339bcb9dd0ec16929c2be5ac8dae77bd651332
    Author: Tim Park <timfpark@gmail.com>
    Date:   Thu May 7 10:22:46 2015 -0700

    Add support for evaluateJavaScript to WebView

    commit 9f81d6726c507da0d647781d79e1c3415e844bc8
    Merge: 257bbb5 01deb0b
    Author: Nick Lockwood <nicklockwood@users.noreply.github.com>
    Date:   Tue Aug 4 22:16:26 2015 +0100

    Merge pull request #2227 from harrykiselev/patch-1

    Fix link to Apple Developer account registration.

If you previously pushed the other commits to GitHub, you'll need to force push this up (since you are reworking the commit stream and not just appending to it).  You can do this with the -force option:

    > git push origin master -force

Beyond the obvious positive outcomes of making this pull request, I've found in my experience that you often get even more than you receive by making contributions like this. It is a natural icebreaker at any community conference to throw in that your interest in the project includes direct contributions and that automatically elevates you in the eyes of anyone that you talk to. You can use this to develop in person relationships with the maintainers by thanking them for their efforts in accepting your pull request when you bump into them in person. Finally, as icing on the cake, its common that contributors to open source projects receive free, discounted, or early access to tickets to the community's conferences.

I hope this post helped demystify some of the aspects of engaging with an open source community and contribute. In general, most open source projects are very happy to get contributions, and code is just one way to contribute. Documentation contributions around things that were confusing to you as you learned to use the platform are at least as appreciatively received as well.

If you have any questions or need advice, I'm happy to help. Reach out to me at <a href="mailto:tpark@microsoft.com">tpark@microsoft.com</a>