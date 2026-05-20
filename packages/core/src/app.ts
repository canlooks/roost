import {Container} from './container'
import {Utility} from './utility'
import {ComponentType} from '../index'

export class Roost {
    static async create(component: ComponentType): Promise<Roost>
    static async create(module: any[]): Promise<Roost>
    static async create(module: Record<any, any>): Promise<Roost>
    static async create(a: any) {
        const app = new Roost()
        await app.utility.registerModule(a)
        return app
    }

    container = new Container()
    utility = new Utility(this)
}