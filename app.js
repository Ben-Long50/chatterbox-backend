import createError from 'http-errors';
import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import mongoose from 'mongoose';
import authRouter from './routes/authentication.js';
import usersRouter from './routes/users.js';
import chatsRouter from './routes/chats.js';

const app = express();

const mongoDb =
  process.env.DATABASE_URL ||
  'mongodb+srv://benjlong50:KO8jSqCklgRvbftG@cluster0.figbmxw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

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

export default app;
