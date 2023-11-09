import fs from "fs";
import 'dotenv/config'
import changeRule from './config/changeRule.json';
import { orderBy, groupBy } from 'lodash';
import pathJson from "./config/path.json";
import path from 'path'
const newRules = JSON.parse(JSON.stringify(changeRule))

const chainMapping: { [internalId: number]: string[] } = {
  1: ['主网', 'mainnet'],
  2: ['arbi', 'arbitrum'],
  3: ['zk1', 'zksync'],
  4: ['sn', 'starknet'],
  6: ['poly', 'polygon'],
  7: ['op', 'optimism'],
  8: ['Immutable X', 'imx'],
  9: ['loopring'],
  10: ['metis'],
  11: ['dydx'],
  12: ['zkspace'],
  13: ['boba'],
  14: ['zksync era', 'zk2', 'era'],
  15: ['bsc', 'bnb'],
  16: ['arbitrum nova', 'nova', 'arbi nova'],
  17: ['polygon zkevm', 'polygon evm', 'polyzkevm', 'zkevm', 'polyevm'],
  19: ['scroll'],
  21: ['base'],
  23: ['linea'],
  24: ['mantle'],
  25: ['opbnb', 'opbsc'],
  30: ['zora'],
  31: ['manta']
};

const makersAddrMap: any = {
  'USDC': '0x41d3D33156aE7c62c094AAe2995003aE63f587B3',
  "USDC-4": "0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940",
  'USDT': "0xd7Aa9ba6cAAC7b0436c91396f22ca5a7F31664fC",
  'USDT-4': "0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940",
  'DAI': "0x095D2918B03b2e86D68551DCF11302121fb626c9",
  'DAI-4': '0x0411c2a2a4dc7b4d3a33424af3ede7e2e3b66691e22632803e37e2e0de450940'
};

const chains = JSON.parse(fs.readFileSync(path.join(pathJson.FE, 'chain.json')).toString());
for (const chain of chains) {
  chain.tokens.push((chain.nativeCurrency || {}) as never)
}

for (const evmMaker of ["0xe4edb277e41dc89ab076a1f049f4a3efa700bce8", "0x80c67432656d59144ceff962e8faf8926599bcf8"]) {
  let rules: any[] = [];
  let oldMakerList:any[] = [];
  if (evmMaker === '0x80c67432656d59144ceff962e8faf8926599bcf8') {
    rules = JSON.parse(fs.readFileSync(path.join(pathJson.FE, 'maker-1.json')).toString());
    oldMakerList = JSON.parse(fs.readFileSync(path.join(pathJson.backend, 'maker-80c.json')).toString());

    makersAddrMap['ETH'] = '0x80c67432656d59144ceff962e8faf8926599bcf8';
    makersAddrMap['ETH-4'] = '0x07b393627bd514d2aa4c83e9f0c468939df15ea3c29980cd8e7be3ec847795f0';
    makersAddrMap['BNB'] = '0x80c67432656d59144ceff962e8faf8926599bcf8';
    makersAddrMap['BNB-4'] = '0x07b393627bd514d2aa4c83e9f0c468939df15ea3c29980cd8e7be3ec847795f0';
  } else if (evmMaker == '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8') {
    rules = JSON.parse(fs.readFileSync(path.join(pathJson.FE, 'maker-2.json')).toString());
    oldMakerList = JSON.parse(fs.readFileSync(path.join(pathJson.backend, 'maker-e4e.json')).toString());

    makersAddrMap['ETH'] = '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8';
    makersAddrMap['ETH-4'] = '0x064A24243F2Aabae8D2148FA878276e6E6E452E3941b417f3c33b1649EA83e11';
    makersAddrMap['BNB'] = '0xe4edb277e41dc89ab076a1f049f4a3efa700bce8';
    makersAddrMap['BNB-4'] = '0x064A24243F2Aabae8D2148FA878276e6E6E452E3941b417f3c33b1649EA83e11';
  }
  // ------------------------ FE ------------------------
  for (const row of JSON.parse(JSON.stringify(newRules))) {
    const gas1 = +String(row.gasFee).replace('%', '');
    row.gasFee = gas1 * 10 as any;
    row.tradingFee = +row.tradingFee as any;
    const fromChain = chains.find(c =>
      String(c.internalId) == String(row.from) ||
      chainMapping[Number(c.internalId)].find(name => name.toLowerCase() === String(row.from).toLowerCase()));
    if (!fromChain) {
      console.error(`${row.from} fromChain not found`);
      throw new Error('fromChain not found');
    }
    const fromToken = fromChain.tokens.find(t => t.symbol == row.symbol);
    if (!fromToken) {
      console.error(`${row.from} ${row.symbol} fromToken not found`);
      continue;
      // throw new Error('fromToken not found');
    }
    const toChain = chains.find(c =>
      String(c.internalId) == String(row.to) ||
      chainMapping[Number(c.internalId)].find(name => name.toLowerCase() === String(row.to).toLowerCase()));
    if (!toChain) {
      console.error(`${row.to} toChain not found`);
      throw new Error('toChain not found');
    }
    const toToken = toChain.tokens.find(t => t.symbol == row.symbol);
    if (!toToken) {
      console.error(`${row.to} ${row.symbol} toToken not found`);
      continue;
      // throw new Error('toToken not found');
    }
    console.debug(`symbol ${row.symbol} from:${fromChain.name} to:${toChain.name} gas:${row.gasFee}, tradingFee:${row.tradingFee}`);
    let chainRule = rules[`${fromChain.internalId}-${toChain.internalId}`];
    if (!chainRule) {
      // console.debug('新增链规则：', `${fromChain.name} - ${toChain.name} `);
      rules[`${fromChain.internalId}-${toChain.internalId}`] = {}
      chainRule = rules[`${fromChain.internalId}-${toChain.internalId}`]
    }
    const symbolRule = chainRule[`${fromToken.symbol}-${toToken.symbol}`];
    if (!symbolRule) {
      console.debug('新增符号规则：', `${fromChain.name} - ${toChain.name} `, `${fromToken.symbol}/${toToken.symbol}`);
      const newRuleItem = {
        "gasFee": row.gasFee,
        "tradingFee": row.tradingFee,
        "makerAddress": makersAddrMap[row.symbol],
        "sender": makersAddrMap[row.symbol],
        "maxPrice": 5,
        "minPrice": 0.005,
        "startTime": 0,
        "endTime": 99999999999999
      }

      if (+fromChain.internalId == 4) {
        newRuleItem.makerAddress = makersAddrMap[`${row.symbol}-4`];
        newRuleItem.sender = makersAddrMap[`${row.symbol}`];
      }
      if (+toChain.internalId == 4) {
        newRuleItem.makerAddress = makersAddrMap[`${row.symbol}`];
        newRuleItem.sender = makersAddrMap[`${row.symbol}-4`];
      }
      if (!newRuleItem.makerAddress || !newRuleItem.sender) {
        throw new Error('缺少地址')
      }
      if (row.symbol === 'USDT' || row.symbol === 'USDC') {
        newRuleItem.maxPrice = 20000;
        newRuleItem.minPrice = 0.1;
      } else if (row.symbol === 'ETH') {
        newRuleItem.maxPrice = 5;
        newRuleItem.minPrice = 0.005;
      }
      const { maxPrice, minPrice } = row as any;
      if (maxPrice) {
        newRuleItem.maxPrice = +maxPrice;
      }
      if (minPrice) {
        newRuleItem.minPrice = +minPrice;
      }
      chainRule[`${fromToken.symbol}-${toToken.symbol}`] = newRuleItem;
    } else {
      symbolRule.gasFee = row.gasFee;
      symbolRule.tradingFee = row.tradingFee;
      chainRule[`${fromToken.symbol}-${toToken.symbol}`] = symbolRule;
      if (symbolRule.gasFee != row.gasFee || symbolRule.tradingFee != row.tradingFee) {
        console.debug('修改符号规则：', `${fromChain.name} - ${toChain.name} `, `${fromToken.symbol}/${toToken.symbol}`);
      } else {
        // console.debug('符号规则没变动：', `${fromChain.name} - ${toChain.name} `, `${fromToken.symbol}/${toToken.symbol}`);
      }
    }
    rules[`${fromChain.internalId}-${toChain.internalId}`] = chainRule;
  }
  for (const chainId in rules) {
    const [fromChain, toChain] = chainId.split('-');
    for (const symbolId in rules[chainId]) {
      const rule = rules[chainId][symbolId];
      if (!rule.makerAddress) {
        throw new Error(`${chainId} ${symbolId} makerAddress not found`);
      }
      if (!rule.sender) {
        throw new Error(`${chainId} ${symbolId} makerAddress not found`);
      }
      if (+fromChain === 4) {
        if (rule.makerAddress.length != 66) {
          throw new Error(`${chainId} ${symbolId} makerAddress address error`);
        }
        if (rule.sender.length != 42) {
          throw new Error(`${chainId} ${symbolId} sender address error`);
        }
      }
      if (+toChain === 4) {
        if (rule.makerAddress.length != 42) {
          throw new Error(`${chainId} ${symbolId} makerAddress address error`);
        }
        if (rule.sender.length != 66) {
          throw new Error(`${chainId} ${symbolId} sender address error`);
        }
      }
      if (rule.minPrice < rule.minPrice) {
        throw new Error(`${chainId} ${symbolId}  maxPrice < minPrice error`);
      }
    }
  }
  // ------------------------ FE ------------------------

  // ------------------------ backend ------------------------
  const makerList: any[] = [];
  for (const chainId in rules) {
    const symbolResult = rules[chainId];
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
        ruleItem.t1Address = fromToken.address.toLocaleLowerCase();
        ruleItem.t2Address = toToken.address.toLocaleLowerCase();
      } else {
        ruleItem.c1ID = +toChainId;
        ruleItem.c2ID = +fromChainId;
        ruleItem.c1Name = toChain.name.toLocaleLowerCase();
        ruleItem.c2Name = fromChain.name.toLocaleLowerCase();
        ruleItem.t1Address = toToken.address.toLocaleLowerCase();
        ruleItem.t2Address = fromToken.address.toLocaleLowerCase();
      }
      let pair1 = rules[`${ruleItem.c1ID}-${ruleItem.c2ID}`];
      if (pair1 && pair1[symbolId]) {
        pair1 = pair1[symbolId];
      } else {
        pair1 = null;
      }
      let pair2 = rules[`${ruleItem.c2ID}-${ruleItem.c1ID}`];
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
  // ------------------------ backend ------------------------

  if (evmMaker === "0x80c67432656d59144ceff962e8faf8926599bcf8") {
    fs.writeFileSync(path.join(pathJson.FE, 'maker-1.json'), JSON.stringify(rules));
    fs.writeFileSync(path.join(pathJson.backend, 'maker-80c.json'), JSON.stringify(orderBy(makerList, ['c1ID', 'c2ID'], ['asc', 'asc']), null,"\t"))
  } else if (evmMaker === "0xe4edb277e41dc89ab076a1f049f4a3efa700bce8") {
    fs.writeFileSync(path.join(pathJson.FE, 'maker-2.json'), JSON.stringify(rules));
    fs.writeFileSync(path.join(pathJson.backend, 'maker-e4e.json'), JSON.stringify(orderBy(makerList, ['c1ID', 'c2ID'], ['asc', 'asc']), null,"\t"))
  }
}
