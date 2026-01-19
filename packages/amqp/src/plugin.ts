import {PluginDefinition} from '@canlooks/roost'
import {createConnection} from './connection'
import {Options} from 'amqplib'

export interface AmqpPluginOptions extends Options.Connect {
    name: string
    url?: string
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