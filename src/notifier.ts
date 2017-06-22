import * as builder from 'botbuilder';
import { Express } from 'express';
import { MongooseProvider } from './mongoose-provider';

// What is stored in a conversation. Agent only included if customer is talking to an agent
export interface Conversation {
    customer: builder.IAddress,
    agent?: builder.IAddress
};

export interface Message {
    text: String
};

// Used in getConversation in provider. Gives context to the search and changes behavior
export interface By {
    bestChoice?: true,
    agentConversationId?: string,
    customerConversationId?: string,
    customerName?: string
}

export interface Provider {
    init();

    // Get

    createConversation: (customerAddress?: builder.IAddress) => Promise<Conversation>;
    getCurrentConversations: () => Promise<Conversation[]>;
}

export class Notifier {
    // if customizing, pass in your own check for isAgent and your own versions of methods in defaultProvider
    constructor(
        public bot: builder.UniversalBot,
        public isAgent: (session: builder.Session) => boolean,
        private provider = new MongooseProvider()
    ) {
        this.provider.init();
    }

    public CreateConversationIfNotExists = async (customerAddress?: builder.IAddress): Promise<Conversation> => {
        return await this.provider.createConversation(customerAddress);
    }

    public getCurrentConversations = async (): Promise<Conversation[]> => {
        return await this.provider.getCurrentConversations();
    }

    public queueBroadcastMessage = async (message: builder.IMessage): Promise<boolean> => {
        return await this.provider.queueBroadcastMessage(message);
    }

    public getQueuedUpMessages = async (): Promise<Message[]> => {
        return await this.provider.getQueuedUpMessages();
    }
};
