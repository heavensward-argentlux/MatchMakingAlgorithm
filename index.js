let express = require('express');
let bodyParser = express.urlencoded({ extended: true });
let dotenv = require('dotenv').config();
let https = require("https");
let path = require("path");

// modules
let rainbow = require("./handlers/rainbow");
let user = require("./handlers/user");
let admin = require("./handlers/admin");
let config = require("./config");
let df = require("./handlers/dialogflow");

// get rainbowSDK
let rainbowSDK = rainbow.rainbowSDK;

// instantiate express app
let app = new express();

// app settings
app.use(bodyParser);
app.use(express.static(path.join(__dirname, 'views')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json({ limit: '1mb' }));
app.set('view engine', 'ejs');

// routes and handlers
// user-related routes
app.get('/', async(req, res) => res.sendFile(path.join(__dirname + "/views/main.html")));
app.get('/fail', async(req, res) => res.sendFile(path.join(__dirname + "/views/fail.html")));
app.get('/chat', user.chat);
app.get('/call', user.call);
app.get('/call/request', user.requesting);
app.get('/chat/request', user.requesting);
app.post('/chat/disconnect', user.disconnect);
app.post('/call/disconnect', user.disconnect);
app.get('/polling', user.polling);

// admin-related routes
app.get('/home', (req, res) => res.sendFile(path.join(__dirname + "/views/login.html")));
app.post('/admin/login', admin.checkAuthentication);
app.get('/admin', admin.populateAgents);
app.post('/admin/addagent', admin.addAgent);
app.post('/admin/updateagent', admin.updateAgent);
app.get('/admin/deleteagent/:id', admin.deleteAgent);

// dialogflow fulfillment routes
app.post('/dialogflow', df.fulfill);

// starts rainbowsdk
// comment this for faster load during development
rainbowSDK.start();

let PORT = process.env.PORT || 8080

// for localhost deployment: use self-issued ssh found in config.js
// https.createServer({ key: config.key, cert: config.cert }, app).listen(PORT, () => {
//     console.log(`App listening on port ${PORT}! Go to https://localhost:${PORT}/`);
// });

// for heroku deployment: ssl certificate for https is managed by heroku's Auto Cert Management
app.listen(PORT, () => console.log(`Listening to port: ${PORT}...`));

