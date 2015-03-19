var aws         = require("aws-sdk");
var winston     = require("winston");
var util        = require("util");
var awsCredentialsPath = '../sqs-config.json';
var sqsQueueUrl = 'https://sqs.us-west-2.amazonaws.com/359642914898/do-rest-logging';

aws.config.loadFromPath(awsCredentialsPath);

var SQS = winston.transports.SQS = exports.SQS =  function (options) {
  options         = options || {};
  this.name       = 'sqs';
  this.level      = options.level  || 'info';
  this.timestamp  = options.timestamp !== false;
  this.queueurl   = options.aws_queueurl;
  this.client     = new aws.SQS();
};

util.inherits(SQS, winston.Transport);

//
// ### function log (level, msg, [meta], callback)
// #### @level {string} Level at which to log the message.
// #### @msg {string} Message to log
// #### @meta {Object} **Optional** Additional metadata to attach
// #### @callback {function} Continuation to respond to when complete.
// Core logging method exposed to Winston.  Metadata is optional.
//
SQS.prototype.log = function(level, msg, meta, callback) {
  var params = {
    MessageBody: msg,
    QueueUrl: sqsQueueUrl,
    DelaySeconds: 0
  };

  this.client.sendMessage(params, function(err, response) {
    if (err)
      console.log(err);
    else
      console.log("SQS Message Sent");
    return callback(err, !!response);
  });
}

winston.add(SQS);
