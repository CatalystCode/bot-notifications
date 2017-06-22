import { MongooseProvider, mongoose } from './mongoose-provider';
import { Notifier } from './notifier';
import { commandsMiddleware } from './commands';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import * as builder from 'botbuilder';

let setup = (bot, app, isAgent, options) => {

    let _directLineSecret = null;
    let _mongodbProvider = null;
    let mongooseProvider = null;

    options = options || {};

    if (!options.mongodbProvider && !process.env.MONGODB_PROVIDER) {
        throw new Error('Bot-Notifier: Mongo DB Connection String was not provided in setup options or the environment variable MONGODB_PROVIDER');
    } else {
        _mongodbProvider = options.mongodbProvider || process.env.MONGODB_PROVIDER;
        mongooseProvider = new MongooseProvider();
        mongoose.connect(_mongodbProvider);
    }

    if (!options.directlineSecret && !process.env.MICROSOFT_DIRECTLINE_SECRET) {
        throw new Error('Bot-Notifier: Microsoft Bot Builder Direct Line Secret was not provided in setup options or the environment variable MICROSOFT_DIRECTLINE_SECRET');
    } else {
        _directLineSecret = options.directlineSecret || process.env.MICROSOFT_DIRECTLINE_SECRET;
    }

    const notifier = new Notifier(bot, isAgent);

    if (bot) {
        bot.use(
            commandsMiddleware(notifier),
        );

        // Show queued messages whenever a new chat begins
        bot.on('conversationUpdate', async function (activity) {
            if (activity.membersAdded) {
                activity.membersAdded.forEach(async (identity) => {
                    if (identity.id === activity.address.bot.id) {
                        var msgs = await notifier.getQueuedUpMessages();
                        if (msgs.length > 0) {
                            var text = '';
                            if (msgs.length == 1) {
                                text = '## Hi, a messages has been sent from the admin:\n';
                            } else {
                                text = '## Hi, ' + msgs.length + ' messages have been sent from the admin:\n';
                            }
                            var msg = new builder.Message().address(activity.address).text(text).toMessage();
                            await bot.send(msg);
                        }

                        // (June 2017) https://docs.microsoft.com/en-us/bot-framework/troubleshoot-general-problems        
                        setTimeout(() => {
                            msgs.forEach(async (queuedMsg) => {
                                var text = queuedMsg.text.toString();
                                var msg = new builder.Message().address(activity.address).text(text).toMessage();
                                await bot.send(msg);
                            });
                        }, 1000);
                    }
                });
            }
        });
    }

    if (app && _directLineSecret != null) {
        app.use(cors({ origin: '*' }));
        app.use(bodyParser.json());

        // Create endpoint for agent / call center
        app.use('/webchat', express.static('public'));

        // Endpoint to get current conversations
        app.get('/api/conversations', async (req, res) => {
            const authHeader = req.headers['authorization'];
            console.log(authHeader);
            console.log(req.headers);
            if (authHeader) {
                if (authHeader === 'Bearer ' + _directLineSecret) {
                    let conversations = await mongooseProvider.getCurrentConversations()
                    res.status(200).send(conversations);
                }
            }
            res.status(401).send('Not Authorized');
        });
    } else {
        throw new Error('Microsoft Bot Builder Direct Line Secret was not provided in options or the environment variable MICROSOFT_DIRECTLINE_SECRET');
    }
}

module.exports = { setup }
