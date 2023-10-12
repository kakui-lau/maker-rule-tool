import fs from "fs";
import 'dotenv/config'
const feMakerList = require('./temp/feNewFule.json')
import { orderBy, groupBy } from 'lodash';
const makerList: any[] = [];
import chains from './chains.json';
import { makerList as oldMakerList } from './nowMakerList';
for (const chain of chains) {
    chain.tokens.push((chain.nativeCurrency || {}) as never)
}
const evmMaker = process.env['evmMaker']?.toLocaleLowerCase();
import makersAddrMap from './evmMapStarknet';
for (const chainId in feMakerList) {
    const symbolResult = feMakerList[chainId];
    let arrs = chainId.split('-');
    const fromChainId = +arrs[0];
    const toChainId = +arrs[1];
    for (const symbolId in symbolResult) {
        if (evmMaker == '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8') {
            if (symbolId != 'ETH-ETH' && symbolId != 'BNB-BNB') {
                continue;
            }
        }
        const [fromTokenSymbol, toTokenSymbol] = symbolId.split('-');
        if (fromTokenSymbol != toTokenSymbol) {
            console.warn('不支持跨币种');
            continue;
        }
        const fromChain = chains.find(c => +c.internalId == +fromChainId);
        if (!fromChain) {
            throw new Error('fromChain not found');
        }
        const fromToken = fromChain.tokens.find(t => t.symbol == fromTokenSymbol);
        if (!fromToken) {
            throw new Error(`fromToken not found ${fromChain.name} ${fromTokenSymbol}`);
        }
        const toChain = chains.find(c => +c.internalId == +toChainId);
        if (!toChain) {
            throw new Error('toChain not found');
        }
        const toToken = toChain.tokens.find(t => t.symbol == toTokenSymbol);
        if (!toToken) {
            throw new Error('toToken not found');
        }
        let makerAddress = makersAddrMap[`${toTokenSymbol}`]
        if (+toChain.internalId == 4) {
            const toSNSender = makersAddrMap[`${toTokenSymbol}-4`];
            if (!toSNSender) {
                throw new Error('toSNSender not found');
            }
        }
        if (!makerAddress) {
            console.log(symbolResult[symbolId], '=symbolResult')
            throw new Error(`${chainId} ${symbolId} makerAddress not found`)
        }
        let ruleItem: any = {
            "id": "",
            "tName": toTokenSymbol,
            "makerAddress": makerAddress.toLocaleLowerCase(),
            "c1ID": "",
            "c2ID": "",
            "c1Name": "",
            "c2Name": "",
            "t1Address": "",
            "t2Address": "",
            "precision": toToken.decimals,
            "c1TradingFee": 0,
            "c2TradingFee": 0,
            "c1GasFee": 0,
            "c2GasFee": 0,
            "c1MinPrice": 0,
            "c1MaxPrice": 0,
            "c2MinPrice": 0,
            "c2MaxPrice": 0,
            "c1AvalibleDeposit": 1000,
            "c2AvalibleDeposit": 1000,
            "c1AvalibleTimes": [
                {
                    "startTime": 0,
                    "endTime": 99999999999999
                }
            ],
            "c2AvalibleTimes": [
                {
                    "startTime": 0,
                    "endTime": 99999999999999
                }
            ]
        }
        const isExist = makerList.find(m => m.c1ID == Math.min(fromChainId, toChainId) && m.c2ID == Math.max(fromChainId, toChainId) && m.tName == toTokenSymbol);
        if (isExist) {
            continue;
        }
        if (+fromChainId < +toChainId) {
            ruleItem.c1ID = +fromChainId;
            ruleItem.c2ID = +toChainId;
            ruleItem.c1Name = fromChain.name.toLocaleLowerCase();
            ruleItem.c2Name = toChain.name.toLocaleLowerCase();
            ruleItem.t1Address = fromToken.address;
            ruleItem.t2Address = toToken.address;

        } else {
            ruleItem.c1ID = +toChainId;
            ruleItem.c2ID = +fromChainId;
            ruleItem.c1Name = toChain.name.toLocaleLowerCase();
            ruleItem.c2Name = fromChain.name.toLocaleLowerCase();
            ruleItem.t1Address = toToken.address;
            ruleItem.t2Address = fromToken.address;
        }
        let pair1 = feMakerList[`${ruleItem.c1ID}-${ruleItem.c2ID}`];
        if (pair1 && pair1[symbolId]) {
            pair1 = pair1[symbolId];
        } else {
            pair1 = null;
        }
        let pair2 = feMakerList[`${ruleItem.c2ID}-${ruleItem.c1ID}`];
        if (pair2 && pair2[symbolId]) {
            pair2 = pair2[symbolId];
            // throw new Error(`pair2 not found ${pair2Id}`);
        } else {
            pair2 = null;
        }
        const item1 = oldMakerList.find(m => m.c1ID == ruleItem.c1ID || m.c2ID === ruleItem.c1ID);
        if (item1) {
            const c1Name = item1.c1ID == ruleItem.c1ID ? item1.c1Name : item1.c2Name;
            if (c1Name) {
                ruleItem.c1Name = c1Name;
            }
        }
        const item2 = oldMakerList.find(m => m.c1ID == ruleItem.c2ID || m.c2ID === ruleItem.c2ID);
        if (item2) {
            const c2Name = item2.c1ID == ruleItem.c2ID ? item2.c1Name : item2.c2Name;
            if (c2Name) {
                ruleItem.c2Name = c2Name;
            }
        }
        ruleItem.id = `${ruleItem.c1ID}-${ruleItem.c2ID}/${ruleItem.tName}`;
        if (pair1) {
            ruleItem.c1MinPrice = pair1.minPrice;
            ruleItem.c1MaxPrice = pair1.maxPrice;
            ruleItem.c1TradingFee = pair1.tradingFee;
            ruleItem.c1GasFee = pair1.gasFee;
        }
        if (pair2) {
            // console.log('双向')
            ruleItem.c2MinPrice = pair2.minPrice;
            ruleItem.c2MaxPrice = pair2.maxPrice;
            ruleItem.c2TradingFee = pair2.tradingFee;
            ruleItem.c2GasFee = pair2.gasFee;
        }
        if (!ruleItem.c1Name) {
            throw new Error('c1Name not found')
        }
        if (!ruleItem.c2Name) {
            throw new Error('c2Name not found')
        }

        if (pair1 && pair2) {
            console.debug('双向规则：', `链：${fromChain.name} - ${toChain.name}         符号： ${fromToken.symbol}/${toToken.symbol}`);
        } else {
            console.debug('单向规则：', `链：${fromChain.name} - ${toChain.name}         符号： ${fromToken.symbol}/${toToken.symbol}`);
        }
        makerList.push(ruleItem);
    }
}
const groupData = groupBy(makerList, 'tName');
console.log('总配置数:', makerList.length)
for (const symbol in groupData) {
    console.debug(`Maker ${evmMaker} 符号:${symbol}， 配置条数:${groupData[symbol].length}`);
}
fs.writeFileSync(`./temp/backendNewRule.json`, JSON.stringify(orderBy(makerList, ['c1ID', 'c2ID'], ['asc', 'asc'])))