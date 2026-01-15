import {registerDecorator} from './utility'
import {ClassType, Obj, ObjectRouteAction, StringRouteAction} from '../index'
import {component_objectRouteItem, component_stringRouteItem, implementController} from './controller'
import {methodWrapper} from './debugHelper'

export function Action(path: string): MethodDecorator
export function Action(pattern: Obj): MethodDecorator
export function Action(a: string | Obj) {
    return (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType

        registerDecorator(component, () => {
            if (typeof a === 'string') {
                let routeItem = component_stringRouteItem.get(component)
                if (!routeItem) {
                    implementController(component, '')
                    routeItem = component_stringRouteItem.get(component)!
                }
                const subRouteItem: StringRouteAction = {
                    path: a,
                    component,
                    propertyKey
                }
                routeItem.children ||= new Set()
                routeItem.children.add(subRouteItem)
            } else {
                let routeItem = component_objectRouteItem.get(component)
                if (!routeItem) {
                    implementController(component, {})
                    routeItem = component_objectRouteItem.get(component)!
                }
                const subRouteItem: ObjectRouteAction = {pattern: a, component, propertyKey}
                routeItem.children ||= new Set()
                routeItem.children.add(subRouteItem)
            }
        }, 1)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
}