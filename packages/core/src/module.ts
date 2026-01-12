import {registerComponents} from './utility'
import {Container} from './container'

export function Module(modules: any) {
    return () => {
        registerComponents(modules, comp => Container.get(comp))
    }
}