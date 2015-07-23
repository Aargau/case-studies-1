---
layout: post
title:  "Building Ember Apps on Azure Websites"
author: "Felix Rieseberg"
author-link: "http://www.felixrieseberg.com"
#author-image: "{{ site.baseurl }}/images/FelixRieseberg/photo.jpg" //should be square dimensions
date:   2015-07-21 23:34:28
categories: Azure Azure-Web-Apps Ember
color: "blue"
#image: "{{ site.baseurl }}/images/imagename.png" #should be ~350px tall
excerpt: Building Ember Apps on Azure Websites
---

Ember.js is one of the most popular frameworks for the development of ambitious web applications – developed initially as Sproutcore by Apple, it is used today in the Windows and Xbox One store, the Apple Music desktop app, at Netflix, Twitter/Vine, LinkedIn, and many other companies working at the bleeding edge of web app development.

An important part of Ember is the powerful tool chain: A command line interface makes the development, testing and compilation dramatically easier. Since the whole tool chain is driven by Node.js, Azure Web Apps can be used to automatically pull the latest version of a web app from a code repository, compile the app, and deploy to a website.

This case study describes how to deploy Ember Cli apps automatically to Azure Web Apps – and how we built the small automation tool, [ember-cli-azure-deploy](https://github.com/felixrieseberg/ember-cli-azure-deploy). A smaller tutorial [was also made available on the Ember Cli homepage](http://www.ember-cli.com/user-guide/#azure).

## Don’t Commit your Compilation

It is a golden rule that one does not commit the compiled output of source code into a code repository. The rational is more than just code sanity – committing compiled output dramatically increases the size of a repository, makes the commit history confusing, and requires developer-driven compilation before every commit.

In a perfect world, one would simply commit all the source code and instruct Azure Web Apps to automatically compile and deploy the output. While not impossible, this task does require some deeper understanding of the deployment mechanics in Azure Websites – a task that can be automated.

## Implementation: Just Run This Command

The engine behind Azure Websites, Kudu, is capable of running customized deployment commands. The flow is roughly this: When a new commit is made to the code repository (for instance on GitHub), Azure is notified by the repository via git hook and pulls the latest code. Once copied to the Web App’s machine, a custom set of instructions can be run – when done, the output is copied to the wwwroot folder of the website.

To successfully compile and run an Ember Web App, we simply need to customize the deployment. At the same time, we also have to ensure that Ember’s deployment command works on Azure Web Apps, which does currently not fully support native modules – a task that involves running the installation of npm modules in multiple steps, ensuring that the versions of individual modules are compatible with Azure Web Apps, and rerouting stdin/stdout/stderr of the actual compilation.

You may have noticed that this requires action in both the code repository as well as on Azure Web Apps – we have written a small tool named [ember-cli-azure-deploy](https://github.com/felixrieseberg/ember-cli-azure-deploy) that automates that task both on the developer’s machine as well as on Azure Web App’s servers.

### Orchestrating the Deployment

Let’s take a look at some code, starting with the customized deployment. The deployment is driven by two files: A .deployment file telling Kudu which command to execute and a deploy.sh bash script that contains the actual set of instructions.

**.deployment**

```
[config]  
 command = bash deploy.sh
```

The deployment bash script can be split up into four parts: First, we set up the environment – finding the right versions of Node.js and npm, making sure that Bower is installed, and ensuring that path variables are available.

**deploy.sh**

```
\# Setup  
 \# -----  
 echo Copy assets to $DEPLOYMENT_TEMP for build  
 tar cf - --exclude=node_modules --exclude=bower_components --exclude=dist --exclude=tmp --exclude=.git . | (cd $DEPLOYMENT_TEMP && tar xvf - )  
 exitWithMessageOnError "Failed to create and extract tarball"  

echo Switch to the temp directory  
 cd $DEPLOYMENT_TEMP  

if [[ -d node_modules ]]; then  
   echo Removing node_modules folder  
   rm -Rf node_modules  
   exitWithMessageOnError "node_modules removal failed"  
 fi  

SCRIPT_DIR="${BASH_SOURCE[0]%\\*}"  
 SCRIPT_DIR="${SCRIPT_DIR%/*}"  
 ARTIFACTS=$SCRIPT_DIR/../artifacts  
 KUDU_SYNC_CMD=${KUDU_SYNC_CMD//\"}  
 NODE_EXE="$PROGRAMFILES\\nodejs\\0.10.32\\node.exe"  
 NPM_CMD="\"$NODE_EXE\" \"$PROGRAMFILES\\npm\\1.4.28\\node_modules\\npm\\bin\\npm-cli.js\""  
 NODE_MODULES_DIR="$APPDATA\\npm\\node_modules"  

EMBER_PATH="$NODE_MODULES_DIR\\ember-cli\\bin\\ember"  
 BOWER_PATH="$NODE_MODULES_DIR\\bower\\bin\\bower"  
 AZUREDEPLOY_PATH="$NODE_MODULES_DIR\\ember-cli-azure-deploy\\bin\\azure-deploy"  

EMBER_CMD="\"$NODE_EXE\" \"$EMBER_PATH\""  
 BOWER_CMD="\"$NODE_EXE\" \"$BOWER_PATH\""  
 AZUREDEPLOY_CMD="\"$NODE_EXE\" \"$AZUREDEPLOY_PATH\""
```

Once that is done, we can move on to install the requirements for Ember Cli. To avoid issues with outdated and native packages, we install certain Socket.io-related packages directly from GitHub, where various issues are already fixed (as opposed to npm, which only has older versions available). We also instruct npm to avoid bin links and optional dependencies: Instead of optimizing for fast build speeds and performance, we want to make the build and installation process as failsafe as possible.

```
\# Installing dependencies to take load of ember-cli install
\# -----  

eval $NPM_CMD install --no-optional --no-bin-links Automattic/engine.io-client  
 eval $NPM_CMD install --no-optional --no-bin-links socket.io  
 eval $NPM_CMD install --no-optional --no-bin-links testem
```

We can then move on to actually install ember-cli itself, as well as bower and the compilation helper ember-cli-azure-deploy:

```
echo Installing ember-cli  
 eval $NPM_CMD install --no-optional --no-bin-links ember-cli  
 exitWithMessageOnError "ember-cli failed"  

echo Installing ember-cli-azure-deploy  
 eval $NPM_CMD install -g ember-cli-azure-deploy  
 exitWithMessageOnError "ember-cli-azure-deploy failed"  

if [[ ! -e "$BOWER_PATH" ]]; then  
   echo Installing bower  
   eval $NPM_CMD install --global --no-optional --no-bin-links bower  
   exitWithMessageOnError "bower failed"  
 else  
   echo bower already installed, nothing to do  
 fi
```

If that succeeds, we can move on to clean the package cache, install all the packages required by the web app, and kick off compilation:

```
echo Cleaning Cache  
 eval $NPM_CMD cache clean  
 exitWithMessageOnError "npm cache cleaning failed"  

echo Installing npm modules  
 eval $NPM_CMD install --no-optional --no-bin-links  
 exitWithMessageOnError "npm install failed"  

echo Installing bower dependencies  
 eval $BOWER_CMD install  
 exitWithMessageOnError "bower install failed"  

echo Build the dist folder  
 eval $AZUREDEPLOY_CMD build  
 exitWithMessageOnError "ember-cli-azure-deploy build failed"  

echo Copy web.config to the dist folder  
 cp web.config dist\
```

You might notice that we don’t call ember-cli directly, but instead have ember-cli-azure-deploy handle the actual build process. Azure Web Apps does not provide stdin, which is not actually required for a successful ember-cli build, but nevertheless throws an error. To avoid this issue, we simply call ember-cli with stdin explicitly disabled, which Node.js allows us to do:

```
cp = exec('node ' + execPath + '\\ember build -prod', {  
     cwd: currentFolder,  
     stdout: true,  
     stdin: false  
 }, function (err, stdout, stderr) {  
     if (err) {  
         return console.error(err);  
     }  
     console.log(stdout, stderr);  
 }.bind(this));
```

## Running the Code: Deploying an App to Azure Web Apps

Start by ensuring that you have Node.js, npm, Bower, and ember-cli installed on your machine. If you’re only missing the node modules, you can simply install them with the following commands:

```
npm install –g bower  
npm install -g ember-cli
```

Next, create a new application.

```
ember new my-new-app
```

Then, prepare your app for deployment to Azure by installing ember-cli-azure-deploy and letting it prepare your project:

```
npm install --save-dev -g ember-cli-azure-deploy
azure-deploy init
```

Well done! Now, [simply deploy your project to Azure Web Apps – either using GitHub, VSO, Dropbox, or another method available](https://azure.microsoft.com/en-us/documentation/articles/web-sites-deploy/). Once the code is deployed, Azure Web Apps will automatically build and deploy your web app!
