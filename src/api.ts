import express, { Request, Response, NextFunction } from 'express';
import amqp from 'amqplib';

const app = express();
const amqpUrl = process.env.CLOUDAMQP_URL || 'amqp://admin:pass@rabbitmq:5672';
const queue = 'certificateQueue';

const CORS = () => {
    return (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE');
      res.header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept, Access-Control-Allow-Origin, Access-Control-Allow-Headers');
      
      if (req.method === 'OPTIONS') {
        return res.sendStatus(204); // No Content
      }
  
      next();
    };
  };

app.use(CORS());

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