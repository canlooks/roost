import {ClassType, ContainerKey, LazyLoader, Roost} from '../index'
import {getMapValue} from './util'
import {InternalError} from './log'

const component_property_injectName = new WeakMap<object, Map<PropertyKey, ContainerKey>>()

export function Inject(name: string): PropertyDecorator
export function Inject(component: ClassType): PropertyDecorator
export function Inject(loader: LazyLoader): PropertyDecorator

export function Inject(injectName: any) {
    return (prototype: Object, propertyKey: PropertyKey) => {
        const property_injectName = getMapValue(component_property_injectName, () => new Map())!
        property_injectName.set(propertyKey, injectName)
    }
}

export async function implementInject<T>(component: ClassType<T>, instance: T, app: Roost) {
    const property_injectName = component_property_injectName.get(component)
    if (property_injectName) {
        const promises: Promise<void>[] = []
        for (const [property, injectName] of property_injectName) {
            const item = app.container.get<any>(injectName as any)
            if (!item) {
                if (typeof injectName === 'string') {
                    throw new InternalError(`Cannot find name "${injectName}" in runtime container.`, {component, property})
                }
                throw new InternalError(`Cannot find component "${injectName.name}" in runtime container.`, {component, property})
            }
            if (item.instance) {
                instance[property as keyof T] = item.instance
            } else {
                promises.push(
                    item.loader!().then(async ({default: component}) => {
                        const name = typeof injectName === 'string' ? injectName : item.loader!
                        instance[property as keyof T] =  await app.registerComponent<any>(name, component)
                    })
                )
            }
        }
        await Promise.all(promises)
    }
}