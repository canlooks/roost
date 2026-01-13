import {registerDecorator} from './utility'
import {ClassType} from '../index'

export function Inject(component: ClassType) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        registerDecorator(prototype.constructor as ClassType, (instance, container) => {
            instance[propertyKey] = container.get(component)
        })
    }
}