import {ComponentType, Pattern, PatternMap, PatternMapValue, RouteItem} from '../index'
import {Roost} from './app'
import {joinPath} from './pathHelper'

type OptionItem<T> = {
    key: T
    option: Record<any, any>
}

const component_paths = new WeakMap<ComponentType, Set<OptionItem<string>>>()
const component_patterns = new WeakMap<ComponentType, Set<OptionItem<Pattern>>>()

export function Controller(): ClassDecorator
export function Controller(target: Function): void

export function Controller(path: string, option?: Record<any, any>): ClassDecorator
export function Controller(pattern: Pattern, option?: Record<any, any>): ClassDecorator

export function Controller(a?: any, option?: Record<any, any>) {
    const fn = (key?: string | Pattern, option?: Record<any, any>) => {
        return (component: ComponentType) => {
            if (typeof key === 'undefined') {
                return
            }

            const map = typeof key === 'string' ? component_paths : component_patterns
            const set = map.get(component) || new Set<any>()

            set.add({key, option})
            map.set(component, set)
        }
    }
    return typeof a === 'function' ? fn()(a)
        : typeof a === 'undefined' ? fn()
            : fn(a, option)
}

const prototype_property_paths = new WeakMap<Object, Map<string, Set<OptionItem<string>>>>()
const prototype_property_regular = new WeakMap<Object, Map<string, Set<OptionItem<RegExp>>>>()
const prototype_property_patterns = new WeakMap<Object, Map<string, Set<OptionItem<Pattern>>>>()

export function Action(path: string, option?: Record<any, any>): MethodDecorator
export function Action(regular: RegExp, option?: Record<any, any>): MethodDecorator
export function Action(pattern: Pattern, option?: Record<any, any>): MethodDecorator

export function Action(key: string | RegExp | Pattern, option?: Record<any, any>) {
    return (prototype: Object, property: string, descriptor: PropertyDescriptor) => {
        const map = typeof key === 'string' ? prototype_property_paths
            : key instanceof RegExp ? prototype_property_regular
                : prototype_property_patterns
        const subMap = map.get(prototype) || new Map()
        const set = subMap.get(property) || new Set()

        set.add({key, option})
        subMap.set(property, set)
        map.set(prototype, subMap)
    }
}

export function implementControllerDecorator(app: Roost, instance: any) {
    const prototype = Object.getPrototypeOf(instance)

    // path mode -----------------------------------------------------------------------

    const pathOptionMap = prototype_property_paths.get(prototype)
    if (pathOptionMap) {
        const setPathItem = (controllerPath?: string, controllerOption?: Record<any, any>) => {
            for (const [property, options] of pathOptionMap) {
                for (let {key: path, option} of options) {
                    path = controllerPath
                        ? joinPath(controllerPath, path)
                        : joinPath(path)
                    if (path[0] !== '/') {
                        path = '/' + path
                    }
                    option = {
                        ...controllerOption,
                        ...option
                    }

                    const routeItems = app.pathMap.get(path) || new Set()
                    routeItems.add({option, instance, property})
                    app.pathMap.set(path, routeItems)
                }
            }
        }
        const controllerPaths = component_paths.get(prototype.constructor)
        if (controllerPaths) {
            for (const {key, option} of controllerPaths) {
                setPathItem(key, option)
            }
        } else {
            setPathItem()
        }
    }

    // pattern mode -----------------------------------------------------------------------

    const patternOptionMap = prototype_property_patterns.get(prototype)
    if (patternOptionMap) {
        const setPatternItem = (controllerPattern?: Pattern, controllerOption?: Record<any, any>) => {
            for (const [property, options] of patternOptionMap) {
                for (let {key: pattern, option} of options) {
                    pattern = {
                        ...controllerPattern,
                        ...pattern
                    }
                    option = {
                        ...controllerOption,
                        ...option
                    }
                    setPatternMap(app.patternMap, pattern, {option, instance, property})
                }
            }
        }
        const controllerPatterns = component_patterns.get(prototype.constructor)
        if (controllerPatterns) {
            for (const {key, option} of controllerPatterns) {
                setPatternItem(key, option)
            }
        } else {
            setPatternItem()
        }
    }
}

function setPatternMap(map: PatternMap, pattern: Pattern, routeItem: RouteItem) {
    const keys = Object.keys(map).sort((a, b) => a === b ? 0 : a < b ? -1 : 1)

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const isLast = i === keys.length - 1
        let item = map.get(key)

        if (!item) {
            item = isLast
                ? routeItem
                : {
                    value: pattern[key],
                    children: new Map()
                }
        }
        map.set(key, item)
        map = (item as PatternMapValue).children
    }
}