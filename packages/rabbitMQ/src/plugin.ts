import {PluginDefinition} from '@canlooks/roost'
import {createConnection} from './connection'

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
        onCreate(roost) {
            createConnection(roost, options)
        }
    }
}