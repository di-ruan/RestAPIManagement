var winston = require('winston');
//var sqs_driver = require("./sqs_driver");
var winston_sqs = require('./winston-sqs');

//logging middleware
module.exports = function logging_before(request, response, next) {
  winston.log('info', 'win-request');
  //var driver = new sqs_driver();
  //driver.send('request');
  next();
}

