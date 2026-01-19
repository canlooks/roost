import {defineProvider, Rpc} from '../src/connection'

export class TestController {
    @Rpc
    async fn(params: {
        msg: string
    }) {
        console.log(8, params)
        return `hello ${params.msg}`
    }
}

export const provider = defineProvider({TestController})