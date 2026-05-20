import {ComponentType} from '../index'
import {Roost} from './app'

type ModuleType = any[] | Record<any, any>

const component_module = new WeakMap<ComponentType, ModuleType>()

export function Module(module: any[]): ClassDecorator
export function Module(module: Record<any, any>): ClassDecorator
export function Module(module: ModuleType) {
    return (component: ComponentType) => {
        component_module.set(component, module)
    }
}

export async function implementModuleDecorator(app: Roost, component: ComponentType) {
    const module = component_module.get(component)
    if (module) {
        await app.utility.registerModule(module)
    }
}