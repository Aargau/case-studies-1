# Y Combinator Collaboration: Deploying SailsJS to Azure Web Apps

This case study describes the first open-source collaboration between TED SET and Y Combinator, enabling applications developed with SailsJS to be deployed directly to Azure.

Felix Rieseberg, April 9, 2015

Tags

Y Combinator, SailsJS, Azure, Azure Web Apps, Azure Websites, Node.js, Kudu, Kudu Deployment, DevOps

Customer Problem

SailsJS is an open-source real-time MVC framework for Node.js. It used widely by Node.js developers to develop enterprise-grade server solutions. In the Node world, SailsJS is to Node.js what Ruby on Rails is to Ruby. Its ensemble of small modules work together to provide simplicity, maintainability, and structural conventions to Node.js apps.

[Image: file:///C:/-/blob/bPFAAAQ5Q9N/nnrnWRDK8cEO--n-bdWEpw]
The company behind SailsJS, Treeline.io, was a part of Y Combinator’s Summer 2015 class.

During the first meetings between Treeline.io and TED SET, it became obvious that there’s great interest in SailsJS and equally great interest in Azure by companies using SailsJS, yet a reliable deployment path was not defined. The core of the issue was simple: How can Microsoft and Treeline.io best enable customers to deploy SailsJS apps as Azure Web Apps?

Overview of the Solution

We began our investigation into a solution by looking at other cloud providers – many offered tutorials, but most of them seemed cumbersome. SailsJS already comes with a command line interface and we decided that the best user experience would explain itself: If the command [sails run] starts SailsJS, wouldn’t the best deployment experience be a single command like [sails deploy azure]?

The solution provides exactly that: from within the SailsJS CLI, users can deploy any Sails app within a few seconds. The solution consists of three Node Modules – a Node Machine implementing Azure APIs, an npm module extending the SailsJS CLI with a [sails deploy] command, and an npm module enabling [sails deploy] to directly deploy to Azure.

Implementation

[Image: file:///C:/-/blob/bPFAAAQ5Q9N/mWMykgKwwGkaiccoXCUBPA]
SailsJS makes heavy use of Node Machines, an open standard for JavaScript functions. They are essentially meta-data wrappers for APIs, allowing other applications to consume the packages in a standardized way. We started by building [_a __Node Machine__ for Azure_](https://github.com/mikermcneil/machinepack-azure), which is capable of setting up the local Azure account, creating and updating websites and uploading files. In total, the machine pack implements 13 APIs:

* _Checking for an active __A__zure subscription_
* _Listing azure subscriptions_
* _Registering an azure subscrip__tion_
* _Setting a new active azure subscription_
* _Checking if a website already exists for a given account_
* _Creating a new website_
* _Setting deployment credentials for a website_
* _Uploading files to a website_
* _Uploading webjobs to a website_
* _Triggering webjobs_
* _Fetching __meta data information for a deployed webjob_
* _Fetching stdout and stderr for a webjob_
* _Listing available VM images for an account_

The machine pack is available on [_GitHub_](https://github.com/mikermcneil/machinepack-azure), [_node-machine.org_](http://node-machine.org/machinepack-azure) and [_NPM_](https://www.npmjs.com/package/machinepack-azure) independently of this solution, as it might be useful in other scenarios.

For the purpose of this solution, we consumed the Node Machine to implement a deployment strategy for SailsJS. Two Node modules had to be created to enable the scenario: The SailsJS CLI needed to be extended with a [sails deploy] command. This proved to be surprisingly easy and only took_ about 50 lines of code_. Then, the [sails deploy] command needed a descriptive strategy for deploying apps to Azure, which we encapsulated in the Node Module [_sails-deploy-azure_](https://github.com/mikermcneil/sails-deploy-azure).

The module sails-deploy-azure in detail implements the following flow.

*Note: The code is too long to include here, but each section is followed by links to relevant code locations.*

1. The command `sails deploy` accepts a website name and deployment username/password as optional parameters. If the command is run without parameters, a new website has to be created. We start by checking the local environment for an Azure account. Users who have the Node-powered Azure-CLI installed won't have to do anything, while users without it are asked to authenticate the local environment (they won't have to install the CLI though, since we wrap and abstract the CLI as a dependency).  If the command is run with parameters, we don’t have to create the Azure Website, and skip to step #3. [Code: [_L22-L51_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/index.js) in sails-deploy-azure/index.js, consuming machinepack-azure
2. Once we're authenticated, we check if a website for the current SailsJS app already exists in the current account by comparing namespaces. If so, we could just deploy to it - if not, we create one. [Code: [_L76-L152_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/index.js) in sails-deploy-azure/index.js, consuming machinepack-azure]
3. We're ready to ship things up, so we zip the local folder, excluding unnecessary files and folders. We could have used Git to deploy, but Treeline.io preferred to not take a Git dependency. We use a Node-native ZIP implementation to compress the whole app into a single file. Next, we upload it to a temporary folder on the web app’s virtual machine. [Code: [_L169-187_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/index.js) and [_L263-L340_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/index.js) in sails-deploy-azure/index.js, consuming machinepack-azure]
4. Now that the package is uploaded to Azure, we finish execution of local commands and commence remote execution. We upload a script containing commands to clean the site, unzip the package and run [npm install] to Azure, where it is automatically assigned a REST endpoint with API - allowing us to call the script, fetch its status and stderr/stdout output. Once the script is uploaded, we simply call its API, pipe through the output to the local machine and watch as Azure is setting up the SailsJS website. [Code: [_L188-246_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/index.js) in sails-deploy-azure/index.js, consuming machinepack-azure; [_sailsdeploy.ps1_](https://github.com/mikermcneil/sails-deploy-azure/blob/master/payload/sailsdeploy.ps1)]

Running the Code

To try this out, you'll need Node.js and NPM installed on your local machine. To try the actual deployment, you can either go the brave path of also setting up a SailsJS app or use a provided test app (http://1drv.ms/1A7r3hS). If you want to go with a provided test app, skip to step 5.

1) Install the latest version of Sails by running the following command. At the time of writing this tutorial, commit 8747a77273c949455a8a89d79abfd36383d10e73 was used.

`npm install -g ``balderdashy/sails`

2) Create a new folder for your brand new SailsJS app and open up PowerShell/Terminal in said folder. Run the following command to scaffold the app:

`sails new .`

3) Update the configuration to use the correct port by opening up config/env/production.js and updating it to look like this:

`module.exports = {`

`  port: process.env.port,`

`};`

4) It's a good idea to disable Grunt for your website - it's extremely useful while in development mode, but shouldn't be part of a deployment. This step is not specific to Azure, but a good asset management practice for SailsJS. Open up package.json and remove everything that begins with "grunt-" *except *for Grunt itself.

5) Log into the Azure Portal and create a new web app. Ideally, the website should have some power to run the Sails installation process without trouble. To ensure enough resources, create the website either in a "Basic" or a "Standard" plan. Make also sure to set deployment credentials for your website.


6) Go back to your Sails app and create a file called ".sailsrc" in its root folder. Fill it with the following JSON. Make sure to set the sitename, deployment username, and deployment password to the right setting.

`{`

`    "commands": {`

`        "deploy": {`

`            "module": "sails-deploy-azure"`

`        }`

`    },`

`    "azure": {`

`        "sitename": "YO``UR_SITENAME``"`

`        "username": "``YOUR_USER``",`

`        "password": "``YOUR_PASSWORD``"`

`    }`

`}`

7) You are ready for deployment! Run the following command from your app's root folder to let your local Sails app deploy to Azure:

`node ``.``/node_modules/sails/bin/sails.js deploy`

Challenges

Azure does not allow non-organizational accounts to set deployment credentials via command line and instead forces users to set those credentials via website. For users with organizational accounts, the user experience is therefore better, since we can automate the setting of credentials – whereas our only option for ‘pay as you go’ customers is to point to the Azure Management Portal.

Opportunities for Reuse

The same code can be reused in large portions to enable deployments of similar frameworks – it is obvious that the implemented flow is not specific to SailsJS. Practically speaking, the ZIP package being deployed to Azure could be filled with any framework or application. The script being uploaded to Azure to finish the installation is equally agnostic, but could also be extended to include more framework-specific commands. The Node Machine can be reused by any Node application implementing Node machines.

Since SailsJS itself as well as all three modules developed during this customer engagement are open source and licensed with the MIT license, other developers are free to reuse the created code.
