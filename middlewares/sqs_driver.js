var AWS = require('aws-sdk');
var awsCredentialsPath = './sqs-config.json';
var sqsQueueUrl = 'https://sqs.us-west-2.amazonaws.com/359642914898/do-rest-logging';
AWS.config.loadFromPath(awsCredentialsPath);
var sqs = new AWS.SQS();
console.log("AWS on");

// Constructor
function sqs_driver() {
}

// send method
sqs_driver.prototype.send = function(message) {
  var params = {
    MessageBody: message,
    QueueUrl: sqsQueueUrl,
    DelaySeconds: 0
  };
  sqs.sendMessage(params, function(err, result){
    if (err)
      console.log(err);
    else
      console.log("Logging Message Sent");
  });
};

// export the class
module.exports = sqs_driver;