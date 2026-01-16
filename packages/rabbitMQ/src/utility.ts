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

export type SuccessReply<T> = {
    type: 'success'
    data: T
}

export type ErrorReply = {
    type: 'error'
    error: any
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
        let sendContent: SuccessReply<any> | ErrorReply
        try {
            sendContent = {
                type: 'success',
                data: await callback(content)
            }
        } catch (error) {
            sendContent = {
                type: 'error',
                error
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