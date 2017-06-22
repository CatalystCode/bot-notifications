# Bot-Notifications

A common request from companies and organizations considering bots is the ability to be able to notify users on news (e.g. new available features).

This project implements a framework called **notifications** which enables bot authors to implement a notifications capability, with minimal changes to the actual bot.

It also includes a very simple implementation that illustrates the core concepts with minimal configuration.

This project is written in TypeScript.

[Source Code](https://github.com/CatalystCode/bot-notifications)

See [example folder](https://github.com/CatalystCode/bot-notifications/example) for a full bot example.

This project was developed on top of the [Handoff](https://github.com/CatalystCode/bot-handoff) project.

## Preview
Administrator queueing a message:
[![Preview](/docs/queue-admin.jpg)](/docs/queue-admin.jpg)

User receives the message on login:
[![Preview](/docs/queue-user.jpg)](/docs/queue-user.jpg)

## Basic Usage

```javascript
// Imports
const express = require('express');
const builder = require('botbuilder');
const notifications = require('botbuilder-notifications');

// Setup Express Server (N.B: If you are already using restify for your bot, you will need replace it with an express server)
const app = express();
app.listen(process.env.port || process.env.PORT || 3978, '::', () => {
    console.log('Server Up');
});

// Replace this functions with custom login/verification for agents
const isAgent = (session) => session.message.user.name.startsWith("Admin");

/**
    bot: builder.UniversalBot
    app: express ( e.g. const app = express(); )
    isAgent: function to determine when agent is talking to the bot
    options: { }
        - mongodbProvider and directlineSecret are required (both can be left out of setup options if provided in environment variables.)
**/
notifications.setup(bot, app, isAgent, {
    mongodbProvider: process.env.MONGODB_PROVIDER,
    directlineSecret: process.env.MICROSOFT_DIRECTLINE_SECRET
});

```

If you want the sample `/webchat` endpoint to work (endpoint for the example admin), you will need to include this [`public` folder](https://github.com/CatalystCode/bot-broadcasting/example/public) in the root directory of your project, or replace with your own.

## This sample

This sample includes:

* A rudimentary echo bot
* A simple WebChat-based front end for use by both Customers and Admins
* rudimentary admin recognition via the userid entered by users
* middleware which allows Customers and Admins to enter commands through WebChat that are interpreted and turned into Notifier method calls

## How to use this code
1) Install the npm module 
2) Setup your bot as shown in the 'basic usage' part above

## How to build and run this sample project

0. Clone this repo
1. If you haven't already, [Register your bot](https://dev.botframework.com/bots/new) with the Bot Framework. Copy the App ID and App Password.
2. If you haven't already, add a Direct Line (not WebChat) channel and copy one of the secret keys (not the same as the app id/secret)
3. `npm install`
4. `npm run build` (or `npm run watch` if you wish to compiled on changes to the code)

### Run in the cloud

1. Deploy your bot to the cloud
2. Aim your bot registration at your bot's endpoint (probably `https://your_domain/api/messages`)
3. Aim at least two browser instances at `https://your_domain/webchat?s=direct_line_secret_key`

### ... or run locally

1. Create an ngrok public endpoint [see here for details](https://github.com/Microsoft-DXEIP/Tokyo-Hack-Docs#1-with-your-app-still-running-on-localhost-bind-the-localhost-deployment-with-ngrok-we-will-need-this-url-for-registering-our-bot)
2. Update your bot registration to reference that endpoint (probably `https://something.ngrok.io/api/messages`)
![Reference bot to ngrok endpoint](/docs/referenceBotToNgrok.png)
3. Run your bot on Mac (remember to restart if you change your code):  
    Set your environment variables and run your code:  
    `MICROSOFT_APP_ID=app_id MICROSOFT_APP_PASSWORD=app_password node dist/app.js`   
4. Run your bot on Windows with PowerShell (remember to restart if you change your code):   
    Set your environment variables  
          `$env:MICROSOFT_APP_ID = "app_id"`  
          `$env:MICROSOFT_APP_PASSWORD = "app_password"`  
        Run your code:  
          `node .\dist\app.js` or `npm run start` 

5. Aim at least two browser instances at `http://localhost:3978/webchat?s=direct_line_secret_key`

### Set up your customer(s) & admins(s), and go

1. Make one or more instances an agent by giving it a user id starting with the word `Admin`
2. Make one or more instances a customer by giving it a user id *not* starting with the word `Admin`
3. The customer bot is a simple echo bot.
4. As an admin, type you have two options, either write `queue MSG` to schedule `MSG` to be presented whenever a new chat is started, or `broadcast MSG` to force push this message into the current active chat

Good luck!

Required environment variables:
```
"MICROSOFT_APP_ID" : "",
"MICROSOFT_APP_PASSWORD" : "",
"MICROSOFT_DIRECTLINE_SECRET" : "",
"MONGODB_PROVIDER" : ""      
```

## License

MIT License
