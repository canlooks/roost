import {Container} from './container'
import {InvokeFunction} from '../index'

export abstract class Component {
    protected constructor(public container: Container, public invoke: InvokeFunction) {
    }
}