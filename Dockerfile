FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 8000
ENV CLOUDAMQP_URL amqp://admin:pass@rabbitmq:5672
CMD ["npm", "start"]
