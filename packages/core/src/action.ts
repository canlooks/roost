import {registerDecorator} from './utility'
import {Component, Obj, ObjectRouteAction, StringRouteAction} from '../index'
import {component_objectRouteItem, component_stringRouteItem} from './controller'
import {methodWrapper} from './debugHelper'

export function Action(path: string): MethodDecorator
export function Action(pattern: Obj): MethodDecorator
export function Action(pattern: string | Obj) {
    return (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as Component

        registerDecorator(component, () => {
            if (typeof pattern === 'string') {
                const routeItem = component_stringRouteItem.get(component)
                if (!routeItem) {
                    throw Error('"@Controller()" must be used in conjunction, when using "@Action()"')
                }
                const subRouteItem: StringRouteAction = {component, propertyKey}
                routeItem.children ||= new Map()
                routeItem.children.set(pattern, subRouteItem)
            } else {
                const routeItem = component_objectRouteItem.get(component)
                if (!routeItem) {
                    throw Error('"@Controller()" must be used in conjunction, when using "@Action()"')
                }
                const subRouteItem: ObjectRouteAction = {pattern, component, propertyKey}
                routeItem.children ||= new Set()
                routeItem.children.add(subRouteItem)
            }
        }, 1)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
}