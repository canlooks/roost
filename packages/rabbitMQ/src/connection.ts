import amqp, {Channel, ChannelModel, Options} from 'amqplib'
import {destructReply, generateId, messageCallbackWrapper, resolveUrl} from './utility'
import {AmqpPluginOptions} from './plugin'
import {Action, ClassType, eachControllerPatterns, Fn, getMapValue, joinPath, methodWrapper, Obj, registerDecorator} from '@canlooks/roost'

class Connection {
    static serviceName: string
    static connection: ChannelModel
    static listenChannel: Channel
    static sendChannel: Channel
    static replyQueue: string
}

export async function createConnection(options: AmqpPluginOptions) {
    Connection.serviceName = options.name
    Connection.connection = await amqp.connect(resolveUrl(options))
    Connection.listenChannel = await Connection.connection.createChannel()
    Connection.sendChannel = await Connection.connection.createChannel()
}

const component_property_invoker = new WeakMap<ClassType, Map<PropertyKey, Fn<Promise<any>>>>()

export function Consume(queue?: string, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(pattern?: Obj, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(a?: string | Obj, assertOptions?: Options.AssertQueue) {
    return (prototype: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType
        const currentQueue = typeof a === 'object' || !a ? generateId() : a

        // define string routes anyway
        registerDecorator(component, instance => {
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
            // TODO object pattern 应在全局挂载队列，使用roost的invoke分配方法，且无需考虑rpc
            // registerDecorator(component, (instance, roost) => {
            //     for (const [pattern, {component, propertyKey}] of roost.patternMap) {
            //
            //     }
            // }, 2)
        }

        // define invoker
        const invoker = (...args: any[]) => {
            return new Promise((resolve, reject) => {
                eachControllerPatterns(component, async pattern => {
                    if (typeof pattern !== 'object') {
                        const {sendChannel, replyQueue} = Connection
                        const correlationId = generateId()
                        const {consumerTag} = await sendChannel.consume(replyQueue, message => {
                            if (message && message.properties.correlationId === correlationId) {
                                try {
                                    resolve(destructReply(message))
                                } catch (e) {
                                    reject(e)
                                }
                                sendChannel.ack(message)
                                sendChannel.cancel(consumerTag)
                            }
                        })
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