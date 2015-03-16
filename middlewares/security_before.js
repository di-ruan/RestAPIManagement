var express = require("express");
var mongoose = require('mongoose');

var app = express();
 
// // Basic usage 
// mongoose.connect(connectionOptions);
 
// app.use(session({
//     store: new MongoStore({ mongooseConnection: mongoose.connection })
// }));
 
// // Advanced usage 
// var connection = mongoose.createConnection(connectionOptions);
 
// app.use(session({
//     store: new MongoStore({ mongooseConnection: connection })
// }));


//security
module.exports = function security_before(request, response, next) {
  next();
}