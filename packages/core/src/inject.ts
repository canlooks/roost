import {ComponentType} from '../index'
import {Roost} from './app'
import {capture} from './debug'

type Injectable = Roost | ComponentType | string

const prototype_property_injectable = new WeakMap<Object, Map<string, Injectable>>()

export function Inject(app: Roost): PropertyDecorator
export function Inject(component: ComponentType): PropertyDecorator
export function Inject(name: string): PropertyDecorator
export function Inject(injectable: Injectable) {
    return (prototype: Object, property: string) => {
        const property_injectable = prototype_property_injectable.get(prototype) || new Map<string, Injectable>()
        property_injectable.set(property, injectable)
        prototype_property_injectable.set(prototype, property_injectable)
    }
}

export async function implementInjectDecorator(app: Roost, instance: any) {
    const prototype = Object.getPrototypeOf(instance)
    const property_injectable = prototype_property_injectable.get(prototype)
    if (!property_injectable) {
        return
    }
    for (const [property, injectable] of property_injectable) {
        let injectValue
        if (typeof injectable === 'string') {
            injectValue = app.container.get(injectable)
            if (!injectValue) {
                throw capture(`"${injectable}" was not registered.`, prototype.constructor, property)
            }
        } else if (typeof injectable === 'function') {
            injectValue = await app.utility.registerComponent(injectable)
        } else {
            // injectable === Roost
            injectValue = app
        }
        instance[property] = injectValue
    }
}