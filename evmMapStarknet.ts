const evmMaker = process.env['evmMaker']?.toLocaleLowerCase();
if (!evmMaker) {
    throw new Error('evmMaker not found');
}
const makersAddrMap: any = {
    'USDC': '0x41d3D33156aE7c62c094AAe2995003aE63f587B3',
    "USDC-4": "0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940",
    'USDT': "0xd7Aa9ba6cAAC7b0436c91396f22ca5a7F31664fC",
    'USDT-4': "0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940",
    'DAI': "0x095D2918B03b2e86D68551DCF11302121fb626c9",
    'DAI-4': '0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940'
}
if (evmMaker === '0x80c67432656d59144ceff962e8faf8926599bcf8') {
    makersAddrMap['ETH'] = '0x80C67432656d59144cEFf962E8fAF8926599bCF8';
    makersAddrMap['ETH-4'] = '0x07b393627bd514d2aa4c83e9f0c468939df15ea3c29980cd8e7be3ec847795f0';
    makersAddrMap['BNB'] = '0x80C67432656d59144cEFf962E8fAF8926599bCF8';
    makersAddrMap['BNB-4'] = '0x07b393627bd514d2aa4c83e9f0c468939df15ea3c29980cd8e7be3ec847795f0';
} else if (evmMaker == '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8') {
    makersAddrMap['ETH'] = '0xE4eDb277e41dc89aB076a1F049f4a3EfA700bCE8';
    makersAddrMap['ETH-4'] = '0x064A24243F2Aabae8D2148FA878276e6E6E452E3941b417f3c33b1649EA83e11';
    makersAddrMap['BNB'] = '0xE4eDb277e41dc89aB076a1F049f4a3EfA700bCE8';
    makersAddrMap['BNB-4'] = '0x064A24243F2Aabae8D2148FA878276e6E6E452E3941b417f3c33b1649EA83e11';
}
export default makersAddrMap;