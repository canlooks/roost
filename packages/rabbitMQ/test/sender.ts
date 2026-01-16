import mq from 'amqplib'

(async () => {
    const connection = await mq.connect('amqp://admin:admin@localhost')

    const channel = await connection.createChannel()

    const {queue} = await channel.assertQueue('', {
        durable: false
    })

    await channel.consume(queue, message => {
        if (message && message.properties.correlationId === '123') {
            console.log('reply', message.content.toString())
            channel.ack(message)
            connection.close()
        }
    })

    channel.sendToQueue('test', Buffer.from('HAHA!'), {
        correlationId: '123',
        replyTo: queue
    })
})()