import mq from 'amqplib'

(async () => {
    const queue = 'test'

    const connection = await mq.connect('amqp://admin:admin@localhost')

    const channel = await connection.createChannel()

    await channel.assertQueue(queue)

    await channel.consume(queue, message => {
        if (message) {
            channel.ack(message)
            console.log('message', message.content.toString())
        }
    })

    console.log('RabbitMQ connection started')
})()