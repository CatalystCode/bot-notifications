"use strict";
var express = require("express");
var builder = require("botbuilder");
var notifications = require("botbuilder-notifications");
//=========================================================
// Normal Bot Setup
//=========================================================
var app = express();
// Setup Express Server
app.listen(process.env.port || process.env.PORT || 3979, '::', function () {
    console.log('Server Up');
});
// Create chat bot
var connector = new builder.ChatConnector({
    appId: process.env.appId,
    appPassword: process.env.appPassword
});
//   app.use('/webchat', express.static('public'));
app.post('/api/messages', connector.listen());
var bot = new builder.UniversalBot(connector, [
    function (session, args, next) {
        session.endConversation('Echo ' + session.message.text);
    }
]);
//=========================================================
// Notifications Setup
//=========================================================
// Replace this function with custom login/verification for agents
var isAgent = function (session) { return session.message.user.name.startsWith("Admin"); };
/**
    bot: builder.UniversalBot
    app: express ( e.g. const app = express(); )
    isAgent: function to determine when agent is talking to the bot
    options: { }
        - mongodbProvider and directlineSecret are required (both can be left out of setup options if provided in environment variables.)
        - textAnalyticsKey is optional. This is the Microsoft Cognitive Services Text Analytics key. Providing this value will result in running sentiment analysis on all user text, saving the sentiment score to the transcript in mongodb.
**/
notifications.setup(bot, app, isAgent, {
    mongodbProvider: process.env.MONGODB_PROVIDER,
    directlineSecret: process.env.MICROSOFT_DIRECTLINE_SECRET
});
