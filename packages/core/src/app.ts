import {RecurseConstruct} from '../index'
import {Container} from './container'
import {makeRoutesFlat} from './route'
import {registerComponents} from './utility'
import {allReady} from './initialize'

export class Roost {
    static create<T extends any[]>(modules: [...T], onLoad?: (instances: RecurseConstruct<T>) => void): RecurseConstruct<T>
    static create<T>(modules: T, onLoad?: (instances: RecurseConstruct<T>) => void): RecurseConstruct<T>
    static create(modules: any, onLoad?: (instances: any) => void) {
        const instances = registerComponents(modules, comp => Container.get(comp))
        makeRoutesFlat()
        allReady().then(() => {
            onLoad?.(instances)
        })
        return instances
    }
}