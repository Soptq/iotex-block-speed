'use strict';

const express = require('express');
const path = require("path");

const Tester = require("./tester")
const Configs = require("./config");

let app = express();
const iotex = new Tester.IOTEXBlockSpeedTester(Configs)
iotex.print_info().then(r => {}).catch(r => {});
iotex.start();

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, '/index.html'));
})

app.get('/tx/records', function(req, res) {
    let records = iotex.getRecords();
    res.send(records);
});

app.listen(3000, () => {
    console.log(`listening at http://localhost:3000`)
})