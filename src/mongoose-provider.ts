import * as builder from 'botbuilder';
import * as bluebird from 'bluebird';
import mongoose = require('mongoose');
mongoose.Promise = bluebird;

import { By, Conversation, Provider, Message } from './notifier';

const indexImport = require('./index');

// -------------------
// Bot Framework types
// -------------------
export const IIdentitySchema = new mongoose.Schema({
    id: { type: String, required: true },
    isGroup: { type: Boolean, required: false },
    name: { type: String, required: false },
}, {
        _id: false,
        strict: false,
    });

export const IAddressSchema = new mongoose.Schema({
    bot: { type: IIdentitySchema, required: true },
    channelId: { type: String, required: true },
    conversation: { type: IIdentitySchema, required: false },
    user: { type: IIdentitySchema, required: true },
    id: { type: String, required: false },
    serviceUrl: { type: String, required: false },
    useAuth: { type: Boolean, required: false }
}, {
        strict: false,
        id: false,
        _id: false
    });

// -------------
// Notifier types
// -------------

export const ConversationSchema = new mongoose.Schema({
    customer: { type: IAddressSchema, required: true },
});

export const QueuedMessagesSchema = new mongoose.Schema({
    text: String,
});

export interface ConversationDocument extends Conversation, mongoose.Document { }
export interface MessageDocument extends Message, mongoose.Document { }
export const ConversationModel = mongoose.model<ConversationDocument>('Conversation', ConversationSchema)
export const MessagesModel = mongoose.model<MessageDocument>('Message', QueuedMessagesSchema, 'QueuedbroadcastedMsgs')

export const BySchema = new mongoose.Schema({
    bestChoice: Boolean,
    agentConversationId: String,
    customerConversationId: String,
    customerName: String
});

export interface ByDocument extends By, mongoose.Document { }
export const ByModel = mongoose.model<ByDocument>('By', BySchema);
export { mongoose };
// -----------------
// Mongoose Provider
// -----------------
export class MongooseProvider implements Provider {
    public init(): void { }

    async getCurrentConversations(): Promise<Conversation[]> {
        let conversations;
        try {
            conversations = await ConversationModel.find();
        } catch (error) {
            console.log('Failed loading conversations');
            console.log(error);
        }
        return conversations;
    }

    async queueBroadcastMessage(messageToQueue?: builder.IMessage): Promise<boolean> {
        var res = await MessagesModel.create({ text: messageToQueue.text });
        return true;
    }

    async getQueuedUpMessages(): Promise<MessageDocument[]> {
        return await MessagesModel.find();
    }

    async createConversation(customerAddress: builder.IAddress): Promise<Conversation> {
        return await ConversationModel.create({
            customer: customerAddress
        });
    }
}