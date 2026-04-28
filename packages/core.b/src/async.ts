import {ClassType} from '../index'
import {getMapValue, registerDecorator} from './utility'

export const globalPendingArr: any = []

export const instance_pendingArr = new WeakMap<object, any[]>

export function pushPendingItem(instance: object, value: any) {
    globalPendingArr.push(value)
    getMapValue(instance_pendingArr, instance, () => []).push(value)
}

export function Pending(target: Object, propertyKey: PropertyKey): void
export function Pending(): PropertyDecorator
export function Pending(a?: any, b?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey) => {
        registerDecorator(prototype.constructor as ClassType, async instance => {
            const pendingArr = instance_pendingArr.get(instance)
            instance[propertyKey] = pendingArr
                ? Promise.all([...pendingArr])
                : Promise.resolve()
        }, 3)
    }
    a ? fn(a, b) : fn
}

export function Ready(target: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor): void
export function Ready(): MethodDecorator
export function Ready(a?: any, b?: any, c?: any): any {
    const fn = (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        registerDecorator(prototype.constructor as ClassType, async instance => {
            const pendingArr = instance_pendingArr.get(instance)
            if (!pendingArr) {
                instance[propertyKey]()
                return
            }
            const res = await Promise.all([...pendingArr])
            instance[propertyKey](res.length === 1 ? res[0] : res)
        }, 3)
    }
    c ? fn(a, b, c) : fn
}

export function allReady() {
    const promise = Promise.all(globalPendingArr)
    globalPendingArr.length = 0
    return promise
}