import {registerDecorator} from './utility'
import {ClassType} from '../index'
import {methodWrapper} from './debugHelper'
import {pushPendingItem} from './async'

export function Initializer(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void
export function Initializer(): MethodDecorator
export function Initializer(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType

        registerDecorator(component, instance => {
            pushPendingItem(component, instance, instance[propertyKey]())
        }, 2)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
    return c ? fn(a, b, c) : fn
}

export const Init = Initializer