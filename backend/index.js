import http from 'node:http';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js';
import { setRealtimeServer } from './services/realtimeService.js';
import routes from './routes/index.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_ORIGIN,
    credentials: true
  }
});

setRealtimeServer(io);

io.on('connection', (socket) => {
  socket.on('client.subscribe', (channel) => {
    if (typeof channel === 'string' && channel.length > 0) {
      socket.join(channel);
    }
  });
});

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN,
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.use('/api', routes);
app.use(notFoundHandler);
app.use(errorHandler);

server.listen(env.PORT, () => {
  console.log(`Dira News backend running on http://localhost:${env.PORT}`);
});
