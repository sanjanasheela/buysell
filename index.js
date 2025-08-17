const express = require ('express');
const app = express();
app.use(express.json());

app.post('/api/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  // Continue with user creation...
});

const cors = require('cors');

const bodyParser = require('body-parser');
const AuthRouter = require('./routes/AuthRouter');
const productRouter = require('./routes/productRouter');
const sellRouter = require('./routes/sellRouter');
const orderHisRouter = require('./routes/orderHisRouter');
const cartRouter = require('./routes/cartRouter')
const deliverRouter = require('./routes/deliverRouter');
const chatbotRouters = require('./routes/chatbot');
require('dotenv').config();
require('./models/db');
const PORT = process.env.PORT || 8000;

app.get('/ping',(req,res)=>{
    res.send('PONG');
})

app.use(bodyParser.json());
app.use(cors());
app.use('/auth',AuthRouter);
app.use('/products',productRouter);
app.use('/sell',sellRouter);
app.use('/orderhis',orderHisRouter);
app.use('/cart',cartRouter);
app.use('/deliver',deliverRouter);
app.use('/chatbot',chatbotRouters);
app.listen(PORT,()=>{
    console.log('server is running on', PORT);

})