import {Container} from './container'
import {InvokeFunction, Roost} from '../index'

export abstract class Component {
    declare app: Roost
    declare container: Container
    declare invoke: InvokeFunction
}