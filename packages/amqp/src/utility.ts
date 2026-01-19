import {Channel, ConsumeMessage} from 'amqplib'
import {Obj} from '@canlooks/roost'

export function generateId() {
    return crypto.randomUUID()
}

export type Reply<T> = {
    type: 'success' | 'error'
    value: T
}

export async function messageCallbackWrapper(channel: Channel, message: ConsumeMessage | null, callback: (content: string | Obj) => any) {
    if (!message) {
        return
    }
    channel.ack(message)
    const content = getContentInMessage(message)
    if (!message.properties.replyTo) {
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

export async function replyHandler(channel: Channel, onSuccess: (value: any) => void, onError: (error: any) => void) {
    const correlationId = generateId()
    const {queue} = await channel.assertQueue('', {autoDelete: true})
    const {consumerTag} = await channel.consume(queue, message => {
        if (message && message.properties.correlationId === correlationId) {
            try {
                onSuccess(destructReply(message))
            } catch (e) {
                onError(e)
            }
            channel.ack(message)
            channel.cancel(consumerTag)
        }
    })
    return {correlationId, queue}
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