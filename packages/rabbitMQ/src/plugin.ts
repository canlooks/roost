import {PluginDefinition} from '@canlooks/roost'
import amqp from 'amqplib'
import {resolveUrl} from './utility'
import {registerConsumer} from './consume'

export type AmqpPluginOptions = {
    name: string
    url: string
    username?: string
    password?: string
}

const builtInName = Symbol('amqp')

export default function amqpPlugin(options: AmqpPluginOptions): PluginDefinition {
    return {
        name: builtInName,
        async onCreated(roost) {
            const connection = await amqp.connect(resolveUrl(options))

            const listenerChannel = await connection.createChannel()

            registerConsumer(options.name, listenerChannel)
        }
    }
}