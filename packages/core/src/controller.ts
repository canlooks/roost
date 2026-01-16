import {ClassType, Obj, ObjectRouteItem, StringRouteItem} from '../index'
import {getMapValue} from './utility'
import {objectRoutes, stringRoutes} from './route'

export const component_patterns = new WeakMap<ClassType, Set<string | Obj | undefined>>()

export function eachControllerPatterns(controller: ClassType, callback: (pattern: string | Obj | undefined) => any) {
    const patterns = component_patterns.get(controller)
    if (patterns) {
        for (const pattern of patterns) {
            if (callback(pattern)) {
                break
            }
        }
    } else {
        callback(void 0)
    }
}

export function Controller(path?: string): ClassDecorator
export function Controller(pattern?: Obj): ClassDecorator
export function Controller(a?: string | Obj) {
    return (component: ClassType) => {
        getMapValue(component_patterns, component, () => new Set()).add(a)
    }
}

export const component_stringRouteItem = new WeakMap<ClassType, StringRouteItem>()

export const component_objectRouteItem = new WeakMap<ClassType, ObjectRouteItem>()

export function implementController(component: ClassType) {
    eachControllerPatterns(component, pattern => {
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