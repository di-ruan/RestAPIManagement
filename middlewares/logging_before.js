var sqs_driver = require("./sqs_driver");
var driver = new sqs_driver();

//logging middleware
module.exports = function logging_after(request, response, next) {
  driver.send("request");
  next();
}