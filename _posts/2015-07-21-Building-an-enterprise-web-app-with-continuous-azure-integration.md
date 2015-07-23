---
layout: post
title:  "A framework to bootstrap enterprise single page applications with continuous Azure integration"
author: "Erik Schlegel"
author-link: "#"
#author-image: "{{ site.baseurl }}/images/FelixRieseberg/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure SailsJS Continuous-Integration
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: A framework to bootstrap enterprise single page applications with continuous Azure integration
---

When developers embark on a new web application project, they often seek technical guidance for where to start, which  technologies to use, how to work through platform integration issues, etc. New technologies are emerging at a record pace, so developers spend a lot of time and energy deciding which frameworks are the most trusted and well-established in the web community. As an example, many startups favor open source solutions, and follow some form of agile SDLC methodology to stand up a full stack local web environment on-demand. Developers need an environment that provides the flexibility to easily swap frameworks while still allowing them to develop rapidly.

Another problem developers often face is the lack or delay of a stable test environment after development is complete. This leaves the sustainability of an app at a vulnerable state; code often needs to be refactored to be testable in a production-ready environment.

## The Audience

Developers on small to large sized web development teams

## The Solution

The goal of this project was to provide developers with a framework to simplify the process of creating a modern web platform that includes the most common core requirements (listed below).  After extensive research, prototyping and performance benchmarking, the following technologies were selected for each of the core requirements:  

- **Task management:** _[Grunt](http://gruntjs.com/)_
- **A lightweight and robust front-end rendering toolset option:** _Bootstrap 3 + [ReactJS](https://facebook.github.io/react/)_
- **Web engine**: _[NodeJS](https://www.airpair.com/javascript/node-js-tutorial)_
- **Http Request / Socket Routing Management:** [Socket.io](http://socket.io/docs/) / [Express](http://expressjs.com/)
- **Easy and reliable integration with ECMA 6:** _[Babel](https://babeljs.io/)_
- **Web API Generation:** _[Sails Blueprints](https://github.com/balderdashy/sails-docs/blob/master/reference/blueprint-api/blueprint-api.md)_
- **Asset Minification / Unification:** _[Browserify](https://github.com/jmreidy/grunt-browserify)_
- **Package management:** _[NPM](https://docs.npmjs.com/getting-started/what-is-npm)_
- **Continuous integration:** _[Travis CI](http://docs.travis-ci.com/)_
- **Automated unit testing:** _[Mocha](http://mochajs.org/), [PhantomJS](http://phantomjs.org/), [Protractor](https://angular.github.io/protractor/#/)_
- **Code Coverage Reporting:** _[Istanbul](https://github.com/gotwarlost/istanbul)_
- **Code Quality Checks:** _[ESLint](http://eslint.org/docs/about/)_
- **One-Click Deployment**: _[Kudu/Azure](http://www.cptloadtest.com/2013/12/03/Git-And-Grunt-Deploy-To-Windows-Azure.aspx)_

An additional goal was to create a framework that is agnostic to any particular front-end strategy(s), and make it easy for developers to customize and plug in their open source platform(s) of choice.

## Tags

SailsJS, Mocha, Node, NPM, ReactJS, Istanbul, Protractor, ESLint, Browserify, Express, Grunt

## Github Code Repo

[https://github.com/erikschlegel/sails-generate-reactjs](https://github.com/erikschlegel/sails-generate-reactjs)

## Overview of the solution

Sails has a concept called generators that allow developers to extend and create a templated solution to fit their needs. This project’s custom generator uses ReactJS as the toolset to create front-end components, and plugged in other battle-tested open source products to cover testing, web asset management and continuous integration.

This project solves the need for developers having a consistent working environment. The framework offers a powerful starting point, that is easily extensible and enables developers to reconfigure the project generator to plug in the tech stack they choose. This repo also comes packaged with Bootstrap 3 and LESS for CSS pre-processing, so you have the option available for a responsive and user-friendly front-end layout template to start with.  Some noteworthy Bootstrap 3 sites are showcased in the [Bootstrap Expo](http://expo.getbootstrap.com/).

This repo supports test driven development practices, which encourages simple design and inspires confidence and reliability. The TDD cycle entails an iterative process of first writing unit tests that validate user features, then writing production code that’s continuously being validated (_against unit tests_) throughout development and providing real-time testing results. Test-driven development offers more than just simple validation, but can also drive the design of a service and/or program and makes refactoring a whole lot easier. By focusing on unit tests first, developers must think up front about how users will use their program. This also helps avoid conflicts where one developer’s local change(s) breaks another developer’s build. Mocha, Protractor, Istanbul and PhantomJS are bundled with this project as the test harness.  

Because the framework uses Travis CI for build management, all unit tests are executed for each GIT commit and the team can be notified of any failed builds via Slack or email. We will also took a look at Deis as an exploration exercise to identify opportunities to take continuous integration one step further.

Potential future extensions using Microsoft Kudu to synchronize an Azure web site with a successful Travis CI build.

The steps to use this framework on your local environment are listed below.

## Installation

- Update your .sailsrc file
- Create a file named .sailsrc
```
{
    "generators" : {
        "modules" : {
            "frontend" : "sails-generate-reactjs"
        }
    }
}
```

**Note**: for Linux or Ubuntu environments, you'll need to run all the commands below as sudo (_i.e. sudo npm install vs npm install_).

**On the command line**

2. Install the project from the published NPM module.

```
$ (Windows) npm install -g sails
$ (Windows) npm install -g sails-generate-reactjs
$ (Linux) sudo npm install -g sails
$ (Linux) sudo npm install -g sails-generate-reactjs
```

3.This command will create your Sails Site

```
$ (Windows) sails new <%-newAppName> --force
$ (Linux) sudo sails new <%-newAppName> --force
```
4. This command will install all packages and dependencies.

```
$ cd <%-newAppName>
$ (Windows) npm install
$ (Linux) sudo npm install
```

5. Fire up your web server

``$ sails lift``

![Figure 1]({{site.baseurl}}/images/2015-07-21-Building-an-enterprise-web-app-with-continuous-azure-integration_images/image001.jpg)

You should see this message coming back from Sails to confirm that you’re site is ready for use.

You can access your new site by accessing the site at `http://localhost:1337`.

## Implementation

Sails is delivered with a baseline site generator, and a standard set of GRUNT tasks for building and packaging the assets of your web site. This framework is an extension of that baseline, and provides a bower template and NPM package template file that can be overridden by the developer.

Asset Packages

Bower template file – **templates/bower.ejs**

```
{
  "name": "<%= appName %>",
  "version": "0.0.0",
  "authors": [
    "<%= author %>"
  ],
  "moduleType": [
    "globals"
  ],
  "license": "MIT",
  "dependencies": {
    "bootstrap": "~3.3.4",
    "fontawesome": "~4.3.0",
    "sails.io.js" : "*"
  }
}
```

The default provided bower file includes dependencies for fontawesome and bootstrap, which will be installed when you run Sails new.

Node Package Dependencies

Node Package.json template – **templates/package.json**

```
   "dependencies": {
    "sails": "~0.11.0",
    "sails-disk": "~0.10.0",
    "rc": "^0.5.5",
    "include-all": "~0.1.3",
    "ejs": "~0.8.4",
    "grunt": "^0.4.2",
    "grunt-sync": "0.0.8",
    "grunt-contrib-copy": "^0.5.0",
    "grunt-contrib-clean": "^0.5.0",
    "grunt-contrib-concat": "^0.3.0",
    "grunt-sails-linker": "^0.9.6",
    "grunt-contrib-jst": "*",
    "grunt-contrib-watch": "^0.5.3",
    "grunt-contrib-uglify": "^0.4.1",
    "lodash" : "*",
    "grunt-contrib-cssmin": "^0.9.0",
    "grunt-contrib-less": "^0.11.1",
    "react": "^0.13.3",
    "react-bootstrap": "^0.20.3",
    "grunt-babel": "^5.0.0",
    "grunt-browserify": "^3.8.0",
    "grunt-react": "^0.12.2",
    "grunt-shell": "^1.1.2",
    "grunt-contrib-coffee": "^0.10.1"
  },
  "scripts": {
    "start": "node app.js",
    "debug": "node debug app.js",
    "test": "mocha -b"
  },
```

These are the default node packages installed with your app, and can be overridden by the developer. The baseline comes included with grunt modules necessary for build management tasks, testing(_mocha_) and code quality checks_(ESLint_).

Continuous Integration

Travis configuration template - **.travis.yml**

```
language: node_js
node_js:
  - "0.12"
sudo: false

before_install:
  - "export DISPLAY=:99.0"
  - "npm install -g sails"
  - "npm install -g sails-generate-reactjs"
  - "sleep 10" # give server time to start
  - "npm install -g grunt"
  - "sails new travisSite --force"

install:
 - "cd travisSite"
 - "npm install"

script:
 - "sails lift"

branches:
  only:
    - master
matrix:
  fast_finish: true
```

- To enable continuous integration with Travis, your app will need two things, one a .travis.yml file and enabling your account on the [Travis portal](https://travis-ci.org/) (_this part cannot be automated_).  You’ll find a .travis.yml file in your working directory that a developer controls. By default, Travis will invoke npm test (_listed above_) on every code commit, build your app on their VM, and a development team is notified of the results based. Travis also supports .NET builds as well.

Front End Assets / Layout (_Bootstrap 3 + ReactJS Option is available_)

The site will come bundled with a starter default [bootstrap template](http://getbootstrap.com/examples/cover/), which is fully customizable. The template location can be found within ‘working directory/views/homepage.ejs’. You’re free to use any other templating library like Semantic UI in place of bootstrap.

**App.js** (_this is only an example to illustrate a sample react component_)

```
var React = require('react');
var LikeButton = React.createClass({
  getInitialState: function() {
    return {liked: false};
  },
  handleClick: function(event) {
    this.setState({liked: !this.state.liked});
  },
  render: function() {
    var text = this.state.liked ? 'like' : 'haven\'t liked';
    return (
<p onClick={this.handleClick}>
        You {text} this. Click to toggle.
</p>
);
  }
});

React.render(
  <LikeButton />,
  document.getElementById('example')
);
```

If a developer chooses to use ReactJS as its component framework, Browserify is setup to pull in React components referenced at ‘working directory/assets/app/app.js’ . A sample app.js file with a component defined is shown above. The browserify location can be configured within ‘working directory/tasks/pipeline.js’

Test Driven Development

All unit tests are re-invoked when any of your source files change, and the result of the test run will be available on the node console. Mocha is flexible with providing fine grain controls to developers with its reporting capabilities of test results.

**/test/components/LikeButton.js**

```
var assert = require("assert");
var React = require('react/addons');
var LikeButtonComponent = require('./components/LikeButton');
var TestUtils = React.addons.TestUtils;

describe('TestSet1', function(){
  describe('#React Like Button Feature Test Suite()', function(){
    it('Changes the text after click', function(){
       // Render a sample like button onto te dom
       var button = TestUtils.renderIntoDocument(
          <LikeButton />
       );

       var buttonComp = TestUtils.findRenderedDOMComponentWithTag(button);

       assert.equal(buttonComp.getDOMNode().textContent.indexOf('You havent''t liked')>-1, true);

       TestUtils.Simulate.click(button);

       buttonComp = TestUtils.findRenderedDOMComponentWithTag(button);

       assert.equal(buttonComp.getDOMNode().textContent.indexOf('You like this')>-1, true);
    })
  })
})
```

## Challenges

Sails is such a powerful framework that scaffolds a fully functional enterprise Node app that’s easily configurable. The main challenge I faced when working with Sails was the limited documentation. This forced me to crawl through the source code to answer questions and address issues I encountered. There were also only a couple examples where other engineers built custom Sails Generators. I tried to simplify some of the SailsJS issues that I ran into by abstraction and customizable hooks into Sails that can be leveraged in the sails-generate-reactjs project.

## Technologies used in this project

SailsJS, Socket.io, Express, Bower, NodeJS, NPM, Browserify, Handlerbars, ESLint, Babel, Kudu, Azure, Travis CI, Mocha, Protractor, Istanbul, ReactJS, Bootstrap

## Opportunities for Reuse

This project provides developers with a starting point to scaffold a Node JS Web application, and plugin additional packages and customize the base install so the development environment fit’s the needs of their project.
