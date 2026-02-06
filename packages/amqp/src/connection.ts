import amqp, {Channel, ChannelModel, Options} from 'amqplib'
import {messageCallbackWrapper, replyHandler} from './utility'
import {AmqpPluginOptions} from './plugin'
import {AsyncMethodDecorator, ClassType, eachControllerPatterns, Fn, getMapValue, joinPath, methodWrapper, RecurseConstruct, registerComponents, registerDecorator, Roost} from '@canlooks/roost'

class Connection {
    static serviceName: string
    static connection: ChannelModel
    static listenChannel: Channel
    static sendChannel: Channel
    static readyResolver: Function
    static ready = new Promise(resolve => this.readyResolver = resolve)
}

export async function createConnection(roost: Roost, {name, ...options}: AmqpPluginOptions) {
    Connection.serviceName = name
    Connection.connection = await amqp.connect(options.url || options)

    const [listenChannel, sendChannel] = await Promise.all([
        Connection.connection.createChannel(),
        Connection.connection.createChannel()
    ])
    Connection.listenChannel = listenChannel
    Connection.sendChannel = sendChannel

    await globalQueue(roost)

    Connection.readyResolver()
}

const component_property_queue = new WeakMap<ClassType, Map<PropertyKey, string>>()

export function Rpc(prototype: Object, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<Fn<Promise<any>>>): void
export function Rpc(assertOptions?: Options.AssertQueue): AsyncMethodDecorator
export function Rpc(queue: string, assertOptions?: Options.AssertQueue): AsyncMethodDecorator
export function Rpc(a?: any, b?: any, c?: any): any {
    const fn = (queue?: string, assertOptions?: Options.AssertQueue) => (prototype: Object, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<Fn<Promise<any>>>) => {
        const component = prototype.constructor as ClassType
        queue ||= propertyKey.toString()

        registerDecorator(component, async instance => {
            await Connection.ready
            eachControllerPatterns(component, async (pattern = component.name) => {
                if (typeof pattern !== 'object') {
                    const joinedQueue = joinPath(joinPath(Connection.serviceName, pattern), queue)

                    const {listenChannel} = Connection
                    await listenChannel.assertQueue(joinedQueue, assertOptions)
                    await listenChannel.consume(joinedQueue, message => {
                        messageCallbackWrapper(listenChannel, message, content => {
                            if (!Array.isArray(content)) {
                                content = [content]
                            }
                            return instance[propertyKey].apply(instance, content)
                        })
                    })
                }
            })
        }, 1)

        getMapValue(component_property_queue, component, () => new Map()).set(propertyKey, queue)

        descriptor.value = methodWrapper(descriptor.value!, component, propertyKey)
    }
    c ? fn(void 0, void 0)(a, b, c)
        : a === 'string' ? fn(a, b)
            : fn(void 0, b || a)
}

export function defineProvider<T extends any[]>(controllers: [...T]): () => RecurseConstruct<T>
export function defineProvider<T>(controllers: T): () => RecurseConstruct<T>
export function defineProvider(controllers: any) {
    return () => {
        return registerComponents(controllers, component => {
            const instance = new component()
            const property_queue = component_property_queue.get(component)
            if (property_queue) {
                for (const [property, queue] of property_queue) {
                    instance[property] = (...args: any[]) => {
                        return new Promise((resolve, reject) => {
                            eachControllerPatterns(component, async (pattern = component.name) => {
                                if (typeof pattern !== 'object') {
                                    await Connection.ready
                                    const {queue: replyQueue, correlationId} = await replyHandler(Connection.listenChannel, resolve, reject)

                                    const joinedQueue = joinPath(joinPath(Connection.serviceName, pattern), queue)
                                    Connection.sendChannel.sendToQueue(joinedQueue, Buffer.from(JSON.stringify(args)), {
                                        replyTo: replyQueue,
                                        correlationId
                                    })
                                }
                            })
                        })
                    }
                }
            }
            return instance
        })
    }
}

/**
 * define global queue to handle action using object-pattern
 */
async function globalQueue(roost: Roost) {
    const {serviceName, listenChannel} = Connection

    roost.serviceName = serviceName

    await listenChannel.assertQueue(serviceName)
    await listenChannel.consume(serviceName, message => {
        messageCallbackWrapper(listenChannel, message, pattern => {
            if (Array.isArray(pattern)) {
                pattern = pattern[0]
            }
            if (typeof pattern !== 'string') {
                return roost.invoke(pattern)
            }
        })
    })
}

export type RemoteService = {
    invoke(...args: any[]): Promise<any>
}

export function Remote(serviceName: string) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        const component = prototype.constructor as ClassType
        registerDecorator(component, instance => {
            instance[propertyKey] = {
                invoke: (...args) => {
                    return new Promise(async (resolve, reject) => {
                        await Connection.ready
                        const {queue: replyQueue, correlationId} = await replyHandler(Connection.listenChannel, resolve, reject)
                        Connection.sendChannel.sendToQueue(serviceName, Buffer.from(JSON.stringify(args)), {
                            replyTo: replyQueue,
                            correlationId
                        })
                    })
                }
            } as RemoteService
        })
    }
}