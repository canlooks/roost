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

        // invoker
        const property_invoker = getMapValue(component_property_invoker, component, () => new Map())
        getMapValue(property_invoker, propertyKey, () => (...args: any[]) => {
            return new Promise((resolve, reject) => {
                eachControllerPatterns(component, async pattern => {
                    if (typeof pattern === 'object') {

                    } else if (typeof a !== 'object') {
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
                        const sendQueue = joinPath(joinPath(Connection.serviceName, pattern), a || generateId())
                        sendChannel.sendToQueue(sendQueue, Buffer.from(JSON.stringify(args)), {
                            replyTo: replyQueue,
                            correlationId
                        })
                    }
                    return true
                })
            })
        })

        // listener
        if (typeof a === 'object') {
            Action(a)(prototype, propertyKey, descriptor)
            // TODO 考虑如何支持obj格式pattern
        } else {
            registerDecorator(component, instance => {
                eachControllerPatterns(component, async pattern => {
                    if (typeof pattern === 'object') {
                        return
                    }
                    const queue = joinPath(joinPath(Connection.serviceName, pattern), a || generateId())

                    const {listenChannel} = Connection
                    await listenChannel.assertQueue(queue, assertOptions)
                    await listenChannel.consume(queue, message => {
                        messageCallbackWrapper(listenChannel, message, content => {
                            return instance[propertyKey].call(instance, content)
                        })
                    })
                })
            }, 1)

            descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
        }
    }
}