import {Channel} from 'amqplib'
import {getContentInMessage} from './utility'
import {Roost} from '@canlooks/roost'

export async function globalQueue(roost: Roost, {serviceName, listenChannel}: {
    serviceName: string
    listenChannel: Channel
}) {
    await listenChannel.assertQueue(serviceName)
    await listenChannel.consume(serviceName, message => {
        if (!message) {
            return
        }
        listenChannel.ack(message)
        const pattern = getContentInMessage(message)
        if (typeof pattern !== 'object') {
            throw TypeError()
        }
        roost.invoke(pattern)
    })
}