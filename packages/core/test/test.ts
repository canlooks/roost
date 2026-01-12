import {Action, Controller, Init, invoke, Params, Pending, Query, Ready, Roost} from '../src'

@Controller({ctrl: 'root'})
class Root {
    @Ready
    onReady(res: string) {
        console.log('onReady', res)
    }

    @Init
    async init() {
        await new Promise(resolve => setTimeout(resolve, 1000))
        return 'ok'
    }

    @Pending pending!: Promise<string>

    msg = 'hello'

    @Action({act: 'test'})
    test(params: any) {
        console.log(15, this)
        console.log(16, params)
        return this.msg
    }

    @Action({act: 'fn'})
    async fn() {
        console.log(29, this.pending)
        await this.pending
        return 'ojbk'
    }
}

@Controller('sub')
class Sub {
    text = 'hi'

    @Action('hello/:id')
    async hello(@Params params: { id: string }, @Query query: URLSearchParams) {
        await new Promise(r => setTimeout(r, 1000))
        console.log(33, params, params.id)
        console.log(35, query, query.get('search'))
        return this.text
    }
}

console.log('start')

const m = Roost.create({
    controllers: [Root, Sub] as const
}, async ({controllers: [Root]}) => {
    console.log('Roost loaded')
    const res = await invoke({ctrl: 'root', act: 'fn'})
    console.log(res)
})
