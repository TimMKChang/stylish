const express = require('express');
const app = express();
const port = 3000;
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
require('dotenv').config();

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// // post limit
// app.use(bodyParser.json({ limit: '20mb' }));

// prevent js injection middleware
app.use(require('./middleware/prevent_js_injection.js'));

// socket.io
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { socketCon } = require('./util/socketcon');
socketCon(io);

// CORS
app.use((req, res, next) => {
  const allowedOrigins = ['https://haboy.xyz', 'https://www.haboy.xyz'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Methods', 'POST, GET');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  }
  next();
})

app.get('/', (req, res) => {
  return res.redirect('/test/products');
});

// admin
app.use('/admin', require('./routes/admin'));
// user
app.use('/user', require('./routes/user'));
// order
app.use('/order', require('./routes/order'));
// API
app.use('/api/1.0/products', require('./routes/api_1.0_products'));
app.use('/api/1.0/marketing', require('./routes/api_1.0_marketing'));
app.use('/api/1.0/order', require('./routes/api_1.0_order'));
// test
app.use('/test', require('./routes/test'));
// raw SQL
app.use('/sql/marketing', require('./routes/SQL_marketing'));

// 404 page not found
app.use((req, res) => {
  return res.redirect('/404.html');
});

// error handler
app.use((err, req, res, next) => {
  res.send(err.message);
});

server.listen(port, () => {
  console.log(`App is now running on localhost:${port}`);
});
