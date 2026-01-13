import {ClassType, Obj, ObjectRouteItem, StringRouteItem} from '../index'
import {registerDecorator} from './utility'
import {objectRoutes, stringRoutes} from './route'

export const component_stringRouteItem = new WeakMap<ClassType, StringRouteItem>()

export const component_objectRouteItem = new WeakMap<ClassType, ObjectRouteItem>()

export function Controller(path?: string): ClassDecorator
export function Controller(pattern?: Obj): ClassDecorator
export function Controller(pattern?: string | Obj) {
    return (component: ClassType) => {
        registerDecorator(component, () => {
            const path = typeof pattern === 'string' ? pattern : ''
            const obj = typeof pattern === 'object' && pattern ? pattern : {}

            const stringRouteItem: StringRouteItem = {path}
            stringRoutes.add(stringRouteItem)
            component_stringRouteItem.set(component, stringRouteItem)

            const objectRouteItem: ObjectRouteItem = {pattern: obj}
            objectRoutes.add(objectRouteItem)
            component_objectRouteItem.set(component, objectRouteItem)
        })
    }
}