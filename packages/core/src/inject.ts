import {isClass, isPromise, registerDecorator} from './utility'
import {ClassType} from '../index'
import {pushPendingItem} from './async'

export function Inject(component: ClassType): PropertyDecorator
export function Inject(component: () => any): PropertyDecorator
export function Inject(component: () => Promise<{ default: any }>): PropertyDecorator
export function Inject(a: ClassType | (() => any)) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        const component = prototype.constructor as ClassType
        registerDecorator(component, (instance, app) => {
            if (isClass(a)) {
                instance[propertyKey] = app.container.get(a)
            } else {
                const res = a()
                if (isPromise(res)) {
                    const pending = res.then(({default: target}: any) => {
                        instance[propertyKey] = isClass(target) ? app.container.get(target) : target
                    })
                    pushPendingItem(instance, pending)
                } else {
                    instance[propertyKey] = res
                }
            }
        })
    }
}