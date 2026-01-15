import amqp, {Channel, ChannelModel, Options} from 'amqplib'
import {generateId, resolveUrl} from './utility'
import {AmqpPluginOptions} from './plugin'
import {Action, ClassType, getControllerBoundPatterns, joinPath, Obj, registerDecorator} from '@canlooks/roost'

class Connection {
    static serviceName: string
    static connection: ChannelModel
    static listenerChannel: Channel
}

export async function createConnection(options: AmqpPluginOptions) {
    Connection.serviceName = options.name
    Connection.connection = await amqp.connect(resolveUrl(options))
    Connection.listenerChannel = await Connection.connection.createChannel()
}

export function Consume(queue?: string, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(pattern?: Obj, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(a?: string | Obj, assertOptions?: Options.AssertQueue) {
    return (prototype: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        if (typeof a === 'object' && a) {
            Action(a)(prototype, propertyKey, descriptor)
            // TODO 考虑如何支持obj格式pattern
        } else {
            const component = prototype.constructor as ClassType
            registerDecorator(component, instance => {
                const fn = async (controllerPattern?: string) => {
                    const queue = joinPath(joinPath(Connection.serviceName, controllerPattern), a || generateId())

                    await Connection.listenerChannel.assertQueue(queue, assertOptions)
                    await Connection.listenerChannel.consume(queue, message => {
                        if (message) {
                            // TODO 做到这里，需要统一的包裹函数实现rpc
                            instance[propertyKey].call(instance, message.content.toString())
                            // channel.ack(message)
                        }
                    })
                }

                const patterns = getControllerBoundPatterns(component)
                if (patterns) {
                    for (const pattern of patterns) {
                        typeof pattern !== 'object' && fn(pattern)
                    }
                } else {
                    fn()
                }
            }, 1)
        }
    }
}