import {ClassType} from '../index'
import {getMapValue, registerDecorator} from './utility'

export const component_pendingArr = new Map<ClassType, any[]>

export const instance_pendingArr = new WeakMap<object, any[]>

export function pushPendingItem<C extends ClassType>(component: C, instance: InstanceType<C>, value: any) {
    getMapValue(component_pendingArr, component, () => []).push(value)
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
    return a ? fn(a, b) : fn
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
    return c ? fn(a, b, c) : fn
}

export function allReady() {
    const promises = []
    for (const [, pendingArr] of component_pendingArr) {
        promises.push(...pendingArr)
    }
    component_pendingArr.clear()
    return Promise.all(promises)
}