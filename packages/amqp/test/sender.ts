import {Inject, Roost} from '@canlooks/roost'
import amqpPlugin from '../src/plugin'
import {Remote, RemoteService} from '../src/connection'
import {provider} from './provider'

class SenderComponent {
    @Inject(provider)
    remote!: ReturnType<typeof provider>

    // @Remote('test')
    // testService!: RemoteService

    async call() {
        try {
            const res = await this.remote.TestController.fn({
                msg: 'Canlooks'
            })

            // const res = await this.testService.invoke({ctrl: 'test', act: 'fn', msg: 'Canlooks'})

            console.log('success', res)
        } catch (e) {
            console.log('error', e)
        }
    }
}

Roost
    .use(amqpPlugin({
        name: 'test',
        hostname: 'localhost',
        username: 'admin',
        password: 'admin',
        port: 5672
    }))
    .create(SenderComponent, sender => {
    sender.call()
})