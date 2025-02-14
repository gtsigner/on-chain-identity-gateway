const { GatewayETH } = require('../dist/index.js');
const { getDefaultProvider, Wallet, providers } = require('ethers');
require("dotenv/config");

(async function() {
    const provider = getDefaultProvider('ropsten', {infura: process.env.INFURA_KEY});
    let wallet = new Wallet(`0x${process.env.PRIVATE_KEY}`);
    wallet = wallet.connect(provider);
    const network = await provider.getNetwork();
    const gtLib = new GatewayETH(wallet, network);
    const testUser = '0xD42Ef952F2EA1E77a8b771884f15Bf20e35cF85f';

    let tokenId = await gtLib.getDefaultTokenId(testUser);
    const timer = await gtLib.subscribeOnGatewayTokenChange(tokenId, (tokenState) => {
        console.log(tokenState);
    });

    const timerId = timer[Symbol.toPrimitive]();
    await setTimeout(() => {
        gtLib.unsubscribeOnGatewayTokenChange(timerId);
    }, 30000);
})();