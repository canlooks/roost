import {ComponentType} from '../index'

export const prefix = '[@canlooks/roost] '

export function capture(message: string, component?: ComponentType, property?: string): Error {
    const error = new Error(prefix + message, {
        cause: {component, property}
    })
    if (component || property) {
        const componentName = component?.name || '[UNKNOWN]'
        const propertyName = property || '[UNKNOWN]'
        console.error(`${prefix}An error occurred in "${componentName}.${propertyName}"`)
    }

    return error
}