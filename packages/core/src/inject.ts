import {registerDecorator} from './utility'
import {Component} from '../index'
import {Container} from './container'

export function Inject(component: Component) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        registerDecorator(prototype.constructor as Component, instance => {
            instance[propertyKey] = Container.get(component)
        })
    }
}