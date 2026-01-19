import amqp, {Channel, ChannelModel, Options} from 'amqplib'
import {generateId, messageCallbackWrapper, replyHandler} from './utility'
import {AmqpPluginOptions} from './plugin'
import {AsyncMethodDecorator, ClassType, eachControllerPatterns, Fn, joinPath, methodWrapper, RecurseConstruct, registerComponents, registerDecorator, Roost} from '@canlooks/roost'
import {globalQueue} from './globalQueue'

class Connection {
    static serviceName: string
    static connection: ChannelModel
    static listenChannel: Channel
    static sendChannel: Channel
    static ready: Promise<void>
}

export function createConnection(roost: Roost, {name, ...options}: AmqpPluginOptions) {
    Connection.ready = new Promise(async resolve => {
        Connection.serviceName = name
        Connection.connection = await amqp.connect(options.url || options)

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

export function Rpc(prototype: Object, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<Fn<Promise<any>>>): void
export function Rpc(assertOptions?: Options.AssertQueue): AsyncMethodDecorator
export function Rpc(queue: string, assertOptions?: Options.AssertQueue): AsyncMethodDecorator
export function Rpc(a?: any, b?: any, c?: any): any {
    const fn = (queue?: string, assertOptions?: Options.AssertQueue) => (prototype: Object, propertyKey: PropertyKey, descriptor: TypedPropertyDescriptor<Fn<Promise<any>>>) => {
        const component = prototype.constructor as ClassType
        queue ||= generateId()

        registerDecorator(component, async instance => {
            await Connection.ready
            eachControllerPatterns(component, async pattern => {
                if (typeof pattern !== 'object') {
                    const joinedQueue = joinPath(joinPath(Connection.serviceName, pattern), queue)

                    const {listenChannel} = Connection
                    await listenChannel.assertQueue(joinedQueue, assertOptions)
                    await listenChannel.consume(joinedQueue, message => {
                        messageCallbackWrapper(listenChannel, message, content => {
                            return instance[propertyKey].call(instance, content)
                        })
                    })
                }
            })
        }, 1)

        // define invoker
        descriptor.value = function (...args) {
            if (!remoteInjected.has(this)) {
                return descriptor.value!.apply(this, args)
            }
            return new Promise((resolve, reject) => {
                eachControllerPatterns(component, async pattern => {
                    if (typeof pattern !== 'object') {
                        const {sendChannel} = Connection
                        const {queue: replyQueue, correlationId} = await replyHandler(sendChannel, resolve, reject)

                        const joinedQueue = joinPath(joinPath(Connection.serviceName, pattern), queue)
                        sendChannel.sendToQueue(joinedQueue, Buffer.from(JSON.stringify(args)), {
                            replyTo: replyQueue,
                            correlationId
                        })
                        return true
                    }
                })
            })
        }

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
    c ? fn(void 0, void 0)(a, b, c)
        : a === 'string' ? fn(a, b)
            : fn(void 0, b || a)
}

const remoteInjected = new WeakSet<object>()

export function defineProvider<T extends any[]>(controllers: [...T]): () => RecurseConstruct<T>
export function defineProvider<T>(controllers: T): () => RecurseConstruct<T>
export function defineProvider(controllers: any) {
    return () => {
        return registerComponents(controllers, Component => {
            const instance = new Component()
            remoteInjected.add(instance)
            return instance
        })
    }
}