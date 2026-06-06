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
const corsOrigin = (origin, callback) => {
  if (!origin || env.CORS_ORIGINS.includes('*') || env.CORS_ORIGINS.includes(origin)) {
    callback(null, true);
    return;
  }

  callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

const io = new Server(server, {
  cors: {
    origin: corsOrigin,
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
    origin: corsOrigin,
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
  console.log(`Database target: ${env.DATABASE_TARGET}`);
  console.log(`Allowed origins: ${env.CORS_ORIGINS.join(', ')}`);
});
