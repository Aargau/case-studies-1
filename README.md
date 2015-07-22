<a href="https://travis-ci.org/CatalystCode/case-studies"><img src="https://travis-ci.org/CatalystCode/case-studies.svg?branch=gh-pages" style="float: left" /></a> You've found the repository that houses the source of [Microsoft's Partner Catalyst's blog](http://catalystcode.github.io/case-studies). If you don't work for us, you might find the [actual website](http://catalystcode.github.io/case-studies) a lot more interesting than the source :sparkles:. If you're here to write some case studies, read on!

![](https://raw.githubusercontent.com/CatalystCode/case-studies/gh-pages/images/readme_banner.png)

This document provides an overview of the case study process and provides details about writing, reviewing, and publishing case studies. Any TED engineer who wants to write or review case studies will want to read this document to get started.

# Introduction
Writing case studies is one of the ways that we share what we've learned and leverage our work. Publishing case studies enables us to take the work that we do with one partner and share it with millions, extending our reach and impact.

PCT Case studies describe an interesting customer problem that we have solved with code. Most case studies are 3-5 pages long, include code snippets, and reference blog posts and other case studies for deeper dives into specific topics.

# Process Overview
PCT has a multi-step review process to ensure that our content is accurate, actionable, well-written, and represents our best advice. Our process is changing for FY16 and includes the following steps:

1. Pre-review
2. Authoring
3. Peer review
4. LT review
5. LCA/Product team/Customer approval
6. Publishing

The following sections describe each step of the process in detail.

## Pre-review
We are adding a pre-review step to help the author make sure that his/her idea for the whitepaper is on target. For this review, the author writes a short abstract (less than 10 mins), and solicits review from . Based on the feedback from , the author will move into the authoring phase.

## Authoring
Write the content in Markdown, using your favorite Markdown editor. If you're new to Markdown, please check out [the guide](https://help.github.com/articles/markdown-basics/).

To include images, add the base url like so:
```
![Figure 1]({{site.baseurl}}/images/2015-07-21-Azure-Encryption-Extensions_images/image001.jpg)
```

## Peer Review
When you have finished a draft of your case study that you feel is ready for peer review, create a pull request to this repository, where the actual peer review happens. If you've never done a pull request, [check out GitHub's tutorial](https://guides.github.com/activities/forking/).

It is probably a good idea to notify potential reviewers in your pull request. Be sure to @mention (at least) two reviewers: (1) a domain expert in the topic you cover, and (2) an engineer who is not familiar with the topic.

After you have received and integrated their feedback, your pull request will be merged into the master case study repo.
