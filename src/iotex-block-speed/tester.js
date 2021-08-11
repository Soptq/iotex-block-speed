'use strict';

const Antenna = require("iotex-antenna").default;
const Utils = require("./utils");

class SimpleQueue {
    constructor(capcity) {
        this.q = [];
        this.capcity = capcity;
    }
    push(item) {
        this.q.push(item);
        if (this.q.length > this.capcity) {
            this.q.shift();
        }
    }
}

class IOTEXBlockSpeedTester {
    constructor(configs) {
        this.antenna = new Antenna(configs.PROVIDER);
        this.amyWallet = this.antenna.iotx.accounts.privateKeyToAccount(configs.AMY_WALLET_PRIKEY);
        this.bobWallet = this.antenna.iotx.accounts.privateKeyToAccount(configs.BOB_WALLET_PRIKEY);
        this.testInterval = configs.TEST_INTERVAL;
        this.timeRandomness = configs.TIME_RANDOMNESS;
        this.records = new SimpleQueue(configs.MAX_RECORD_CAP);
        this.testStarted = false;
    }

    start() {
        if (this.testStarted) {
            console.log("You had already started.");
            return;
        }
        console.log(`Start to test IOTEX block speed. Interval: ${this.testInterval} seconds`);
        this.test();
        this.interval = setInterval(() => {
            setTimeout(() => {
                this.test()
            }, Math.floor(Math.random() * this.timeRandomness) * 1000)  // Add a little randomness
        }, this.testInterval * 1000);
        this.testStarted = true;
    }

    stop () {
        if (!this.testStarted) {
            console.log("Nothing can be stopped");
            return;
        }
        clearInterval(this.interval);
        this.testStarted = false;
    }

    async print_info() {
        let amyBalance = await Utils.getIOTXBalance(this.antenna, this.amyWallet.address);
        let bobBalance = await Utils.getIOTXBalance(this.antenna, this.bobWallet.address);
        let sumBalance = amyBalance + bobBalance;

        console.log(`\n\nIOTEXBlockSpeedTester INFO:\n------------------------------\nWallet_1:\n\tBalance: ${amyBalance}\n\tAddress: ${this.amyWallet.address}\nWallet_2:\n\tBalance: ${bobBalance}\n\tAddress: ${this.bobWallet.address}\n\nWarning: Based on your setting, IOTX in both accounts will be ran out in approximately ${sumBalance / 0.01 * this.testInterval / 60} minutes.\n------------------------------\n\n`);
    }

    async test() {
        let record = {timestamp: Date.now(), deltaTxTime: 0}
        let amyBalance = await Utils.getIOTXBalance(this.antenna, this.amyWallet.address);
        let bobBalance = await Utils.getIOTXBalance(this.antenna, this.bobWallet.address);
        let deltaTxTime = -1;
        if (amyBalance > 0.01) {    // Gas fee is 0.01 IOTX
            deltaTxTime = (await Utils.sendTransaction(
                this.antenna, this.amyWallet.address, this.bobWallet.address)).deltaTxTime;
        } else if (bobBalance > 0.01) {
            deltaTxTime = (await Utils.sendTransaction(
                this.antenna, this.bobWallet.address, this.amyWallet.address)).deltaTxTime;
        } else {
            console.warn("All accounts have less than 0.01 IOTX, cannot initialize any transaction!");
        }
        record.deltaTxTime = deltaTxTime
        this.records.push(record);
        console.log(`Test Completed. Timestamp: ${record.timestamp}, Deltatime: ${record.deltaTxTime}`);
    }

    getRecords() {
        let FormattedRecord = {};
        for (let record of this.records.q) {
            FormattedRecord[record.timestamp] = record.deltaTxTime
        }
        return FormattedRecord
    }
}

module.exports = {
    IOTEXBlockSpeedTester
}