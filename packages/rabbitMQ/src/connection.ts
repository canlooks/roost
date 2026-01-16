import amqp, {Channel, ChannelModel, Options} from 'amqplib'
import {generateId, messageCallbackWrapper, replyHandler, resolveUrl} from './utility'
import {AmqpPluginOptions} from './plugin'
import {Action, ClassType, eachControllerPatterns, Fn, getMapValue, joinPath, methodWrapper, Obj, registerDecorator, Roost} from '@canlooks/roost'
import {globalQueue} from './globalQueue'

class Connection {
    static serviceName: string
    static connection: ChannelModel
    static listenChannel: Channel
    static sendChannel: Channel
    static ready: Promise<void>
}

export function createConnection(roost: Roost, options: AmqpPluginOptions) {
    Connection.ready = new Promise(async resolve => {
        Connection.serviceName = options.name
        Connection.connection = await amqp.connect(resolveUrl(options))

        const [listenChannel, sendChannel] = await Promise.all([
            Connection.connection.createChannel(),
            Connection.connection.createChannel()
        ])
        Connection.listenChannel = listenChannel
        Connection.sendChannel = sendChannel

        await globalQueue(roost, Connection)

        resolve()
    })

}

const component_property_invoker = new WeakMap<ClassType, Map<PropertyKey, Fn<Promise<any>>>>()

export function Consume(queue?: string, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(pattern?: Obj, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(a?: string | Obj, assertOptions?: Options.AssertQueue) {
    return (prototype: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType
        const currentQueue = typeof a === 'object' || !a ? generateId() : a

        // define string routes anyway
        registerDecorator(component, async instance => {
            await Connection.ready
            eachControllerPatterns(component, async pattern => {
                if (typeof pattern !== 'object') {
                    const queue = joinPath(joinPath(Connection.serviceName, pattern), currentQueue)

                    const {listenChannel} = Connection
                    await listenChannel.assertQueue(queue, assertOptions)
                    await listenChannel.consume(queue, message => {
                        messageCallbackWrapper(listenChannel, message, content => {
                            return instance[propertyKey].call(instance, content)
                        })
                    })
                }
            })
        }, 1)
        // define object routes only pattern is object
        if (typeof a === 'object') {
            Action(a)(prototype, propertyKey, descriptor)
        }

        // define invoker
        const invoker = (...args: any[]) => {
            return new Promise((resolve, reject) => {
                eachControllerPatterns(component, async pattern => {
                    if (typeof pattern !== 'object') {
                        const {sendChannel} = Connection
                        const {queue: replyQueue, correlationId} = await replyHandler(sendChannel, resolve, reject)

                        const queue = joinPath(joinPath(Connection.serviceName, pattern), currentQueue)
                        sendChannel.sendToQueue(queue, Buffer.from(JSON.stringify(args)), {
                            replyTo: replyQueue,
                            correlationId
                        })
                        return true
                    }
                })
            })
        }
        const property_invoker = getMapValue(component_property_invoker, component, () => new Map())
        getMapValue(property_invoker, propertyKey, () => invoker)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
}