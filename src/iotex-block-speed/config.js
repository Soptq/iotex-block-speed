module.exports = Object.freeze({
    PROVIDER: "http://api.testnet.iotex.one:80",
    /**
     * In order to send legit transactions, we need to prepare two testnet account, where at least one of them has
     * enough testnet IOTX token.
     */
    AMY_WALLET_PRIKEY: "",
    BOB_WALLET_PRIKEY: "",
    /**
     * Consider this is a live tool, here we configure how many seconds between two consecutive block speed tests.
     */
    TEST_INTERVAL: 300,
    /**
     * Configure how many test results (records) we want to store.
     */
    MAX_RECORD_CAP: 100,
    /**
     * Configure how many randomness we want to introduce to the test. (start time, see #39 in tester.js)
     */
    TIME_RANDOMNESS: 10,
});

