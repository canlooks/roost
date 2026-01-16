import {Channel, ConsumeMessage} from 'amqplib'
import {Obj} from '@canlooks/roost'

export function resolveUrl(options: {
    username?: string
    password?: string
    url: string
}) {
    let url: URL | undefined
    let urlStr: string
    try {
        url = new URL(options.url)
    } catch (e) {
        urlStr = options.url
    }

    const {username, password} = options
    if (username && password) {
        if (url) {
            url.hostname = `${username}:${password}@${url.hostname}`
            urlStr = url.href
        } else {
            urlStr = `${username}:${password}@${urlStr!}`
        }
    }

    return urlStr!
}

export function generateId() {
    return crypto.randomUUID()
}


export type Reply<T> = {
    type: 'success' | 'error'
    value: T
}

export async function messageCallbackWrapper(channel: Channel, message: ConsumeMessage | null, callback: (content: any) => any) {
    if (!message) {
        return
    }
    channel.ack(message)
    const content = getContentInMessage(message)
    if (message.properties.replyTo) {
        callback(content)
        return
    }
    let replyContent: Reply<any>
    try {
        replyContent = {
            type: 'success',
            value: await callback(content)
        }
    } catch (e) {
        replyContent = {
            type: 'error',
            value: e
        }
    }
    channel.sendToQueue(
        message.properties.replyTo,
        Buffer.from(JSON.stringify(replyContent)),
        {correlationId: message.properties.correlationId}
    )
}

export function destructReply<T>(message: ConsumeMessage) {
    const content = getContentInMessage(message) as Reply<T>
    if (typeof content === 'string') {
        return content
    }

    if (content.type === 'error') {
        throw content.value
    }
    return content.value
}

export function getContentInMessage(message: ConsumeMessage) {
    let content: string | Obj = message.content.toString()
    try {
        content = JSON.parse(content)
    } catch (e) {
    }
    return content
}