---
layout: post
title:  "A Peer Review Bot for GitHub"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
#author-image: "{{site.baseurl}}/images/authors/felix.jpg"
date:   2015-08-01 10:00:00
categories: GitHub Automation Node
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: We built a peer review bot for GitHub, automating review workflows for pull requests - so that humans can spend their time with more fun things.
---

We, in Microsoft's Open Source team, occasionally write case studies to explain our work with a bit more technical depth for both external engineers as well as our fellow internal Microsoft engineers. Naturally, we don't want to embarrass ourselves. So before any case study is released, we have to get some peer reviews.

Our blog is basically just a GitHub page, which means that every additional post is added to the site in the form of a pull request. Keeping track of which pull request is ready to be merged is quite tedious work, which is why we wrote a [Node.js-driven bot that automates the whole flow](http://github.com/felixrieseberg/peer-review-bot).

## Maintaining a Workflow is Hard
Managing the review workflow isn't fun. Depending on the size of your team, you probably have a bunch of pull requests in flight. If the engineering culture happens to be good, people are likely interested in collecting feedback early and often, meaning that your pull request list is a wild mix of various stages.

One would assume that self-management is a good solution - and it often is. Many teams just mark unfinished pull requests with a 'WIP' in the title or a 'wip' label, which is being updated by whomever opened the pull request. Without dwelling on the reasons, let's just say that our team is highly creative and very productive, but not exactly great at being a synchronized body, so the poor souls in charge of our website and case studies had to manually check and track the status of case studies, where they are in terms of reviews, and whether or not they're ready for release.

## Automation is Easy
Instead of paying someone to constantly check all pull requests, we decided to use automation. GitHub comes with web hooks for all repositories - whenever a certain action is performed on a repository, GitHub can automatically post a JSON representation of the action to a given URL.

We registered a small Node.js bot that would respond to those events with a simple checklist:

* Let's check if a new pull request was opened or a new comment was made on an existing pull request.
* If that's the case, the bot pulls the latest information about said pull request from GitHub.
* Once we got the info, we're checking if the pull request is already labeled. If it's labeled as 'no-review' or as 'peer-reviewed', we stop right away - there's nothing left to do.
* If we didn't already do so, we post a comment explaining the process.
* If other people have commented, we're checking if we received enough 'LGTM' or 'Looks good to me!' comments. If we have, we update the labels.
* If the bot is configured to automatically merge 'approved' pull requests, we go and ask GitHub to merge it. If the pull request isn't mergable, GitHub will naturally refuse. 

#### Let's Check Out Some Code
Under the hood, the bot is just a small Express-driven app with one endpoint: http://botaddress.com/pullrequests. A GET HTTP request will check the configured repo for open pull requests, while POST HTTP requests expects a GitHub-style JSON payload and handles only pull requests mentioned in it.

Using Mike de Boer's excellent GitHub Node module, we just had to [describe all the individual interactions with GitHub](https://github.com/felixrieseberg/peer-review-bot/blob/master/bot.js) as well as a [small router module describing the review flow mentioned above](https://github.com/felixrieseberg/peer-review-bot/blob/master/routes/pullrequest.js).

## Setup Your Own Bot!
If you too would like to require peer reviews of pull requests in your repo, you're in luck:  Before we get started, let's do some required housekeeping:

#### 1) Creating a GitHub User for the Bot
The bot will need a GitHub user to interact with GitHub. You can just use your own account, but no good bot was ever written without a good robot pun. Head over to GitHub and create a new user, choosing from the many robots out there - Terminator, Tinman, Bender - choose wisely.

While the bot works fine with a username/password combination, we recommend setting up an OAuth2 token. GitHub has API rate limits which are a little bit higher for OAuth-authenticated calls.

#### 2) Deploying the Bot
If you're using Azure, setting up a bot takes about a minute. Simply head over to the [Peer Review Bot's repository](http://github.com/felixrieseberg/peer-review-bot) and click the 'Deploy to Azure' button. The Azure deployment wizard will automatically create a website for you; but also setup environment variables configuring the bot itself.

If you're anywhere else, make sure you're running Node (at least on 0.10.x). Then, setup configuration by either directly editing `config.js` or by setting environment variables. Here are your options:

* `user` User/organization owning the repository
* `repo` Repository to watch (case-studies)
* `botUser` Bot's GitHub username
* `botPassword` Bot's Github password
* `labelReviewed` Name of the label indicating enough peer reviews
* `labelNeedsreview` Name of the label indicating missing peer reviews
* `reviewsNeeded` Number of reviews needed 
* `instructionsComment` Comment posted by the bot when a new PR is opened - if you use `{reviewsNeeded}` in your comment, it'll automatically be replaced with the number of reviews needed
* `mergeOnReview` (default: false) If set to true, the bot will automatically merge a PR as soon as it consideres it revieweed
* `pullRequestsStatus` (default: open) Status of the pull requests to consider. Options are: all|open|closed
* `oauth2token` If set, we'll use an [OAuth token](https://help.github.com/articles/creating-an-access-token-for-command-line-use/) instead of the username/password combination to authenticate the bot.
* `excludeLabels` If set, the bot will automatically ignore PRs with those labels (format: `no-review i-hate-reviews`)

If you add configuration directly to the `config.js`, please make sure to not check it into GitHub.

Once configured, start the bot with `npm start` or `node ./bin/www`. Now that a robot is taking care of your peer review workflow, the humans can do something more fun!