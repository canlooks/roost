import {ClassType, Obj} from '../index'
import {getMapValue} from './utility'

export const component_patterns = new WeakMap<ClassType, Set<string | Obj | undefined>>()

export function eachControllerPatterns(controller: ClassType, callback: (pattern: string | Obj | undefined) => any) {
    const patterns = component_patterns.get(controller)
    if (!patterns) {
        callback(void 0)
        return
    }
    for (const pattern of patterns) {
        if (callback(pattern)) {
            break
        }
    }
}

export function Controller(path?: string): ClassDecorator
export function Controller(pattern?: Obj): ClassDecorator
export function Controller(a?: string | Obj) {
    return (component: ClassType) => {
        getMapValue(component_patterns, component, () => new Set()).add(a)
    }
}