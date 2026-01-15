import {Channel, Options} from 'amqplib'
import {Action, ClassType, getControllerBoundPatterns, getMapValue, joinPath, Obj, registerDecorator} from '@canlooks/roost'

const component_property_consumer = new Map<ClassType, Map<string | symbol, {
    pattern: string | Obj
    descriptor: PropertyDescriptor
} & Options.AssertQueue>>()

export function Consume(queue: string, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(pattern: Obj, assertOptions?: Options.AssertQueue): MethodDecorator
export function Consume(pattern: string | Obj, assertOptions?: Options.AssertQueue) {
    return (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        getMapValue(component_property_consumer, prototype.constructor, () => new Map()).set(propertyKey, {
            pattern,
            descriptor,
            ...assertOptions
        })
    }
}

export function registerConsumer(serviceName: string, channel: Channel) {
    for (const [component, property_consumer] of component_property_consumer) {
        for (const [property, consumer] of property_consumer) {
            let {pattern, descriptor, ...assertOptions} = consumer
            if (typeof pattern === 'object' && pattern) {
                Action(pattern)(component, property, descriptor)
                // TODO 考虑如何支持obj格式pattern
            } else {
                registerDecorator(component, instance => {
                    const fn = async (controllerPattern?: string) => {
                        const queue = joinPath(joinPath(serviceName, controllerPattern), pattern)

                        await channel.assertQueue(queue, assertOptions)
                        await channel.consume(queue, message => {
                            if (message) {
                                // TODO 做到这里，需要统一的包裹函数实现rpc
                                // instance[property].apply(instance)
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
}