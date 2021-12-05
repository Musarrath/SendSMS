const http = require('http');
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const errorHandlingMiddleware = require('./src/middleware/errorHandlingMiddleware');
const routes = require('./routes');
const mongoConnect = require('./src/db/mongo-connection');
const fileUpload = require('express-fileupload');


const app = express();
app.server = http.createServer(app);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Platform");
    next();
});
app.use(bodyParser.json({ limit: '5mb' }));
app.use(bodyParser.urlencoded({
    limit: '50mb',
    extended: true
}));
app.use(bodyParser.text());
app.use(fileUpload());
app.use(helmet());

app.use(routes.index);
app.use(routes.reminders);

app.use(errorHandlingMiddleware.errorHandlingMiddleware);

app.use(function (err, req, res, next) {
    const errorStr = JSON.stringify({
        message: err.message,
        stack: err.stack
    });
    console.log(errorStr);
    // res.status(500);
    return res.end(errorStr);
});

//staring mongo connection
mongoConnect(()=>{
	console.log('Mongo server connected');
  });
  
const defaultPort = 8606;
if(process.env.NODE_ENV !== 'test'){
    app.server.listen((process.env.PORT_NO || defaultPort), () => {
        console.log(`Server started on port ` + (process.env.PORT_NO || defaultPort) + ' Env:' + process.env.NODE_ENV);
    });
}

module.exports = app;
