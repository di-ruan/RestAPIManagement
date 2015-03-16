var winston = require('winston');
//var sqs_driver = require("./sqs_driver");
var winston_sqs = require('./winston-sqs');

//logging middleware
module.exports = function logging_after(request, response, next) {
  winston.log('info', 'win-response');
  //var driver = new sqs_driver();
  //driver.send('response');
  next();
}

