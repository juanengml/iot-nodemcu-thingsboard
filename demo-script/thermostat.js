var mqtt = require('mqtt');

var args = process.argv.slice(2);
var token = args[0];

var client = mqtt.connect('mqtt://demo.thingsboard.io', {
    username: token
});

var value = Math.random() * 100;

console.log(`Initialized with value: ${value}`);

client.on('connect', function () {
    console.log('connected');
    client.subscribe('v1/devices/me/rpc/request/+');
    client.publish('v1/devices/me/telemetry', JSON.stringify({temperature: value}));
});

client.on('message', function (topic, message) {
    console.log(`request.topic: ${topic}`);
    console.log(`request.body: ${message.toString()}`);

    var requestId = topic.slice('v1/devices/me/rpc/request/'.length);
    var messageData = JSON.parse(message.toString());
    if (messageData.method === 'getValue') {
        client.publish('v1/devices/me/rpc/response/' + requestId, JSON.stringify(value));
    } else if (messageData.method === 'setValue') {
        var newValue = messageData.params;
        console.log(`Going to set new value: ${newValue}`);
        value = newValue;
        client.publish('v1/devices/me/telemetry', JSON.stringify({temperature: value}));
    } else {
        client.publish('v1/devices/me/rpc/response/' + requestId, message);
    }


});
