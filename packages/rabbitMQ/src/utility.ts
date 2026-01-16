import {Channel, ConsumeMessage} from 'amqplib'

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
    let content = message.content.toString()
    try {
        content = JSON.parse(content)
    } catch (e) {
    }

    if (message.properties.replyTo) {
        let sendContent: Reply<any>
        try {
            sendContent = {
                type: 'success',
                value: await callback(content)
            }
        } catch (e) {
            sendContent = {
                type: 'error',
                value: e
            }
        }
        channel.sendToQueue(
            message.properties.replyTo,
            Buffer.from(JSON.stringify(sendContent)),
            {correlationId: message.properties.correlationId}
        )
    } else {
        try {
            callback(content)
        } catch (e) {
        }
    }
    channel.ack(message)
}

export function destructReply<T>(message: ConsumeMessage) {
    let content: string | Reply<T> = message.content.toString()
    try {
        content = JSON.parse(content)
    } catch (e) {
    }
    if (typeof content === 'string') {
        return content
    }

    if (content.type === 'error') {
        throw content.value
    }
    return content.value
}