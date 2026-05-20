import {ComponentType, Pattern} from '../index'

const component_path = new WeakMap<ComponentType, string>()
const component_pattern = new WeakMap<ComponentType, Pattern>()

export function Controller(path: string): ClassDecorator
export function Controller(pattern: Pattern): ClassDecorator
export function Controller(a: string | Pattern) {
    return (component: ComponentType) => {
        typeof a === 'string'
            ? component_path.set(component, a)
            : component_pattern.set(component, a)
    }
}

export function Action(path: string): MethodDecorator
export function Action(pattern: Pattern): MethodDecorator
export function Action(a: string | Pattern) {
    return (prototype: Object, property: string, descriptor: PropertyDescriptor) => {

    }
}