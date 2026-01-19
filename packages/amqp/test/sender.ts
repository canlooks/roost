import {Inject, Roost} from '@canlooks/roost'
import {provider, TestController} from './controller'

class SenderComponent {
    @Inject(provider)
    remote!: ReturnType<typeof provider>

    async call() {
        const res = await this.remote.TestController.fn({
            msg: 'Canlooks'
        })
        console.log(12, res)
    }
}

Roost.create(SenderComponent, sender => {
    sender.call()
})