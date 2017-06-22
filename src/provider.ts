import * as builder from 'botbuilder';
import { Provider, Conversation, By } from './notifier';

export let conversations: Conversation[];

export const init = async () => {
    conversations = [];
}

const convertToPromise = <T>(value: T): Promise<T> => {
    return new Promise<T>((resolve) => { return resolve(value) });
}

const getCurrentConversations = (): Promise<Conversation[]> =>
    convertToPromise(conversations);
