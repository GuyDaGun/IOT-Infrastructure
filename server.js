const express = require('express');
const connectDB = require('./config/db');

const app = express();

// setup DB connections
connectDB();

app.use(express.json({extended: false}));
app.use(express.urlencoded({ extended: false }));

app.get('/', (req,res) => res.send('Index page'));

// all routes 
const userRouter = require('./routes/users');
const loginRouter = require('./routes/auth');
const companiesRouter = require('./routes/companies');
const ProductsRouter = require('./routes/products');
const IOTDevicesRouter = require('./routes/iotDevices');


// connect routes
app.use('/users', userRouter);
app.use('/login', loginRouter);
app.use('/companies',companiesRouter) ;
app.use('/companies/:comp_id/products',ProductsRouter);
app.use('/companies/:comp_id/products/:prod_id/iotDevices', IOTDevicesRouter);

app.listen(3000, () => console.log('Server started on port 3000'));

