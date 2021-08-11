const IOTEXUtils = require("iotex-antenna/lib/account/utils")

async function getIOTXBalance(instance, account_address) {
    const accountDetails = await instance.iotx.getAccount({
        address: account_address
    });
    return parseFloat(IOTEXUtils.fromRau(accountDetails.accountMeta.balance, "iotx"));
}

async function sendTransaction(instance, from_address, to_address) {
    const actionHash = await instance.iotx.sendTransfer({
        from: from_address,
        to: to_address,
        value: "0",
        gasLimit: "100000",
        gasPrice: IOTEXUtils.toRau("1", "Qev")
    });
    let txStartTimestamp = Date.now(), txEndTimestamp = Date.now();
    let isTxPending = true;
    // TODO: Currently getActions by actionHash seems to be broken, so we use getActions by Address alternatively.
    while (isTxPending) {
        let action = await instance.iotx.getActions({
            unconfirmedByAddr: {
                address: from_address,
                start: 0,
                count: 1, // Should be at most 1.
            }
        });
        if (parseInt(action.total) === 0) {
            isTxPending = false;
            txEndTimestamp = Date.now();
        }
    }
    let deltaTxTime = txEndTimestamp - txStartTimestamp;
    return {actionHash: actionHash, deltaTxTime: deltaTxTime}
}

module.exports = {
    getIOTXBalance,
    sendTransaction,
}
