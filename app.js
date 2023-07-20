const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDb = require('./src/configs/database');
const { notFound, errorHandler } = require('./src/middlewares/errorMiddlewares');
const cookieParser = require('cookie-parser');
const corsOptions = require('./src/configs/corsOption');
const credentials = require('./src/middlewares/credentials');
const verifyJWT = require('./src/middlewares/verifyJWT');
const register = require('./src/routes/register.routes');
const userAuth = require('./src/routes/auth.routes');
const userLogOut = require('./src/routes/logout.routes');
const resetPassword = require('./src/routes/resetPassword.routes');
const user = require('./src/routes/user.routes');

const app = express();
connectDb();

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.options('*', cors())
app.use('/register', register);
app.use('/auth', userAuth);
app.use('/logout', userLogOut);
app.use('/reset-password', resetPassword);
app.use('/user', user);

app.use(verifyJWT);
app.use(notFound);
app.use(errorHandler);

app.listen(process.env.PORT, console.log(`Server running on port ${process.env.PORT}`));