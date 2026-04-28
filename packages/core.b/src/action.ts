import {assignObject, joinPath, registerDecorator} from './utility'
import {ClassType, Obj} from '../index'
import {eachControllerPatterns} from './controller'
import {methodWrapper} from './debugHelper'
import {objectRoutes, stringRoutes} from './route'

export function Action(path: string): MethodDecorator
export function Action(pattern: Obj): MethodDecorator
export function Action(a: string | Obj) {
    return (prototype: Object, propertyKey: PropertyKey, descriptor: PropertyDescriptor) => {
        const component = prototype.constructor as ClassType

        registerDecorator(component, () => {
            if (typeof a === 'object') {
                eachControllerPatterns(component, pattern => {
                    if (typeof pattern !== 'string') {
                        const obj = assignObject(pattern, a)
                        objectRoutes.set(obj, {
                            pattern: obj,
                            component,
                            propertyKey
                        })
                    }
                })
            } else {
                eachControllerPatterns(component, pattern => {
                    if (typeof pattern !== 'object') {
                        const path = '/' + joinPath(pattern, a)
                        stringRoutes.set(path, {
                            path,
                            component,
                            propertyKey
                        })
                    }
                })
            }
        }, 1)

        descriptor.value = methodWrapper(descriptor.value, component, propertyKey)
    }
}