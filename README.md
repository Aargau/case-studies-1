<a href="https://travis-ci.org/CatalystCode/case-studies"><img src="https://travis-ci.org/CatalystCode/case-studies.svg?branch=gh-pages" style="float: left" /></a> You've found the repository that houses the source of [Microsoft's Partner Catalyst's blog](http://catalystcode.github.io/case-studies). If you don't work for us, you might find the [actual website](http://catalystcode.github.io/case-studies) a lot more interesting than the source :sparkles:. If you're here to write some case studies, read on!

![](https://raw.githubusercontent.com/CatalystCode/case-studies/gh-pages/images/readme_banner.png)

This document provides an overview of the case study process and provides details about writing, reviewing, and publishing case studies. Any TED engineer who wants to write or review case studies will want to read this document to get started.

# Introduction
Writing case studies is one of the ways that we share what we've learned and leverage our work. Publishing case studies enables us to take the work that we do with one partner and share it with millions, extending our reach and impact.

PCT Case studies describe an interesting customer problem that we have solved with code. Most case studies are 3-5 pages long, include code snippets, and reference blog posts and other case studies for deeper dives into specific topics.

# Process Overview
PCT has a multi-step review process to ensure that our content is accurate, actionable, well-written, and represents our best advice. Our process is changing for FY16 and includes the following steps:

 * Pre-Review
 * Authoring
 * Peer review
 * LT review
 * LCA / Product Team / Customer approval
 * Publishing

The following sections describe each step of the process in detail.

## Pre-Review
We are adding a pre-review step to help the author make sure that his/her idea for the whitepaper is on target. For this review, the author writes a short abstract (less than 10 mins), and solicits review from peers (ideally via the `#case-studies` slack channel). Based on the feedback from peers, the author will move into the authoring phase.

## Authoring
Use `post-template.md` as a template, writing the content in Markdown using your favorite Markdown editor. Once done, place the case study in the _posts directory with a file name of the form {DATE}-{HYPHENATED-TITLE} (eg. 2015-07-21-Recursive-Descent-Formula-Parsing-in-NET.md).

#### GitHub Workflow
We're following basic GitHub Flow. If ever contributed to an open source project on GitHub, you probably know it already - if you have no idea what we're talking about, check out [GitHub's official guide](https://guides.github.com/introduction/flow/). Here's a quick summary:

 * Fork the repository and clone to your local machine
 * You should already be on the default branch `gh-pages` - if not, check it out (`git checkout gh-pages`)
 * Create a new branch of your case study `git checkout -b my-new-case-study`)
 * Write your case study
 * Stage the changed files for a commit (`git add .`)
 * Commit your files with a *useful* commit message ([example](https://github.com/felixrieseberg/case-studies/commit/bbd3a4574769e7547d98cfa12a9766d480b8c393)) (`git commit`)
 * Push your new branch to your GitHub Fork (`git push origin my-new-case-study`)
 * Visit this repository in [GitHub and create a Pull Request](#peer-review)

#### Markdown Tips
Check out [the guide](https://help.github.com/articles/markdown-basics/) if you're new to Markdown.

Preface your post with a table like outlined below. Jekyll (the static site generator) will use the information provided to turn your Markdown file into sparkling HTML.

```
---
layout: post
title:  "Title of the Post"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
date:   2015-08-30 10:00:00
categories: Azure DevOps Flynn
color: "blue"
excerpt: "A small desription"
---
```

To include images, add the base url like so:
```
![Figure 1]({{site.baseurl}}/images/2015-07-21-Azure-Encryption-Extensions_images/image001.jpg)
```

## Peer Review
When you have finished a draft of your case study that you feel is ready for peer review, create a pull request to this repository, where the actual peer review happens. If you've never done a pull request, [check out GitHub's tutorial](https://guides.github.com/activities/forking/).

It is probably a good idea to notify potential reviewers in your pull request. Be sure to @mention (at least) two reviewers: (1) a domain expert in the topic you cover, and (2) an engineer who is not familiar with the topic.

After you have received and integrated their feedback, your pull request will be merged into the master case study repo.
