import {Component, Obj, ObjectRouteItem, StringRouteItem} from '../index'
import {registerDecorator} from './utility'
import {objectRoutes, stringRoutes} from './route'

export const component_stringRouteItem = new WeakMap<Component, StringRouteItem>()

export const component_objectRouteItem = new WeakMap<Component, ObjectRouteItem>()

export function Controller(path: string): ClassDecorator
export function Controller(pattern: Obj): ClassDecorator
export function Controller(pattern?: string | Obj) {
    return (component: Component) => {
        registerDecorator(component, () => {
            if (typeof pattern === 'string') {
                const routeItem: StringRouteItem = {}
                stringRoutes.set(pattern, routeItem)
                component_stringRouteItem.set(component, routeItem)
            } else {
                const routeItem: ObjectRouteItem = {pattern}
                objectRoutes.add(routeItem)
                component_objectRouteItem.set(component, routeItem)
            }
        })
    }
}