import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import setupUserRouter from './api/router';
import connectDB from './mongoose/connect';
import { UserRepository } from './mongoose/repository';

import { errorHandler } from '../command-ingress/middlewares/error_handler';
import { createServer } from 'http';
import { UserService } from './api/service';


const app = express();

const createHttpServer = () => {
  const server = createServer(app);
  const userRoute = setupUserRouter(new UserService(new UserRepository()));

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/users', userRoute);

  app.use(errorHandler);

  return server;
};

function mustGetEnv(key: string): string {
  const val = process.env[key];

  if (!val) {
    throw new Error(`Environment ${key} must be set.`);
  }

  return val;
}


async function start() {
  await connectDB({
    url: mustGetEnv('MONGODB_URI'),
  });

  const server = createHttpServer();

  server.listen(4001, () => {
      console.log(`Server running on port ${4001}.`);
  });

  process.on('SIGINT', () => {
    console.log('Gracefully shutting down...');
    mongoose.connection.close();
    process.exit(0);
  });
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});