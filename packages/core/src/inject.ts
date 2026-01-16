import {isClass, registerDecorator} from './utility'
import {ClassType} from '../index'
import {pushPendingItem} from './async'

export function Inject(component: ClassType): PropertyDecorator
export function Inject(component: () => Promise<{ default: ClassType }>): PropertyDecorator
export function Inject(a: ClassType | (() => Promise<{ default: ClassType }>)) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        const component = prototype.constructor as ClassType
        registerDecorator(component, (instance, app) => {
            if (isClass(a)) {
                instance[propertyKey] = app.container.get(a)
            } else {
                const pending = a().then(({default: injectTarget}) => {
                    instance[propertyKey] = app.container.get(injectTarget)
                })
                pushPendingItem(component, instance, pending)
            }
        })
    }
}