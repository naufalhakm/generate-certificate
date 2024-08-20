import { connect } from "amqplib";
import { generateCertificate } from './generateCertificate';

const queue = 'certificateQueue';
interface Data {
    userID: number;
    courseID: number;
    type: string;
}

const amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://admin:pass@rabbitmq:5672';


async function startConsummer() {
    try {
        console.log(amqpUrl);
        const connection = await connect(amqpUrl);
        console.log('Connected to RabbitMQ successfully!');
        const channel = await connection.createChannel();
        
        await channel.assertQueue(queue, {durable: false});
        console.log(`Waiting for messages in ${queue}. To exit press CTRL+C`);

        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                const data: Data = JSON.parse(msg.content.toString());
                await generateCertificate(data.userID, data.courseID, data.type);
                channel.ack(msg);
            }
        });
    } catch (error) {
        console.error('Error in RabbitMQ consumer:', error);
    }
    
}

startConsummer();