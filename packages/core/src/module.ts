import {registerComponents, registerDecorator} from './utility'
import {ClassType} from '../index'

export function Module(modules: any) {
    return (component: ClassType) => {
        registerDecorator(component, (instance, app) => {
            registerComponents(modules, comp => app.container.get(comp))
        })
    }
}