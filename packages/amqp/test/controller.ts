import {defineProvider, Rpc} from '../src/connection'
import {Action, Component, Inject} from '@canlooks/roost'
import type TestService from './service'


export class TestController extends Component {
    @Inject(() => import('./service'))
    testService!: TestService

    @Rpc
    // @Action({ctrl: 'test', act: 'fn'})
    async fn(params: {
        msg: string
    }) {
        this.testService.fn()
        console.log(8, params)
        return `hello ${params.msg}`
    }
}