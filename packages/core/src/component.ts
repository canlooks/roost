import {Container} from './container'
import {InvokeFunction} from '../index'

export abstract class Component {
    declare container: Container
    declare invoke: InvokeFunction
}