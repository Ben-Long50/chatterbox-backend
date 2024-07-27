import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import http from 'http';
import { Server } from 'socket.io';
import authRouter from './routes/authentication.js';
import usersRouter from './routes/users.js';
import chatsRouter from './routes/chats.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'DELETE', 'PUT'],
  },
  pingInterval: 10000,
  pingTimeout: 5000,
});

const mongoDb = process.env.DATABASE_URL;

mongoose.connect(mongoDb);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'mongo connection error'));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(import.meta.dirname, 'public')));

app.use(cors());
app.use('/', authRouter);
app.use('/', usersRouter);
app.use('/', chatsRouter);

// WebSocket event handlers
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinChat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room ${chatId}`);
  });

  socket.on('newMessage', (message) => {
    io.to(message.chatId).emit('newMessage', message);
    console.log(`Message sent to chat room ${message.chatId}`);
  });

  socket.on('deletedMessage', (data) => {
    io.to(data.chatId).emit('deletedMessage', data.messageId);
    console.log(`Message deleted from chat room ${data.chatId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export { server, io };
export default app;
