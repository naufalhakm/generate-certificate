import express from 'express';
import amqp from 'amqplib';
import { json } from 'stream/consumers';

const app = express();
const amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://admin:pass@rabbitmq:5672';
const queue = 'certificateQueue';

app.use(express.json());

app.get('/ping', async (req, res) => {
    res.status(200).send("API GENERATE CERTIFICATE");
});

app.post('/generate-certificate', async (req, res) => {
    try {
        const apiResponse = req.body;

        const connection = await amqp.connect(amqpUrl);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, { durable: false });
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(apiResponse)));

        console.log('Message sent to RabbitMQ');

        res.status(200).json({
            success: true,
            message: "Certificate generation requested.",
        });
    } catch (error) {
        console.error('Error in sending message to RabbitMQ:', error);
        res.status(500).json({
            success: false,
            message: "Failed certificate generation.",
        });
    }
});

const port = 8000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

export { app };