import {Roost} from '@canlooks/roost'
import amqpPlugin from '../src/plugin'
import {TestController} from './controller'

Roost
    .use(amqpPlugin({
        name: 'test',
        hostname: 'localhost',
        username: 'admin',
        password: 'admin',
        port: 5672
    }))
    .create(TestController)