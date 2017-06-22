import * as builder from 'botbuilder';
import { Conversation, Notifier } from './notifier';

export function commandsMiddleware(notifier: Notifier) {
    return {
        botbuilder: (session: builder.Session, next: Function) => {
            if (session.message.type === 'message') {
                command(session, next, notifier);
            }
        }
    }
}

async function command(session: builder.Session, next: Function, notifier: Notifier) {
    if (notifier.isAgent(session)) {
        adminCommand(session, next, notifier);
    } else {
        const conversation = await notifier.CreateConversationIfNotExists(session.message.address);
        return next();
    }
}

async function adminCommand(
    session: builder.Session,
    next: Function,
    notifier: Notifier
) {

    const message = session.message;
    const inputWords = message.text.split(' ');

    if (inputWords.length == 0)
        return;

    if (inputWords[0] === 'broadcast') {
        session.send(await broadcastToAllConversations(notifier, message.text));
        session.send('Broadcasted!');
        return;
    } else if (inputWords[0] === 'queue') {
        var actualMsg = message.text.substr(message.text.indexOf(" ") + 1)
        session.send(await queueBroadcastingMsg(notifier, actualMsg));
        return;
    } else {
        session.send("Possible options: 1) *queue [message]* 2) *broadcast [message]*");
        return;
    }
}

async function broadcastToAllConversations(notifier: Notifier, line: string): Promise<string> {
    const conversations = await notifier.getCurrentConversations();
    if (conversations.length === 0) {
        return "No customers are in conversation.";
    }

    let text = '### Broadcasting the message to ' + conversations.length + ' users: \n';
    text += 'partial list: {';
    conversations.forEach(async conversation => {
        const userName = '*' + conversation.customer.user.name + '*,';
        text += userName;

        var msgContent = '## BROADCAST MESSAGE ##\n'.concat(line.substr(line.indexOf(" ") + 1));
        var msg = new builder.Message().address(conversation.customer).text(msgContent).toMessage();
        await notifier.bot.send(msg);
    });

    text = text.substring(0, text.length - 1);
    text += '}';

    return text;
}

async function queueBroadcastingMsg(notifier: Notifier, line: string): Promise<string> {
    var msg = new builder.Message().text(line).toMessage();
    const conversations = await notifier.queueBroadcastMessage(msg);

    let text = '### Scheduled broadcast message';
    return text;
}
