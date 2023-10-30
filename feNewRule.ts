import fs from "fs";
import 'dotenv/config'
import makerList1 from './nowRules.json';
import newRules from './changeRule.json';
import chains from './chains.json';
import { cloneDeep } from 'lodash';
const rules: any = cloneDeep(makerList1);
const rulesArrs = [];
import makersAddrMap from './evmMapStarknet';
for (const chain of chains) {
    chain.tokens.push((chain.nativeCurrency || {}) as never)
}
for (const row of newRules) {
    const gas1 = +String(row.gasFee).replace('%', '');
    row.gasFee = gas1 * 10 as any;
    row.tradingFee = +row.tradingFee as any;
    const fromChain = chains.find(c => String(c.internalId) == String(row.from));
    if (!fromChain) {
        throw new Error('fromChain not found');
    }
    const fromToken = fromChain.tokens.find(t => t.symbol == row.symbol);
    if (!fromToken) {
        throw new Error('fromToken not found');
    }
    const toChain = chains.find(c => String(c.internalId) === String(row.to));
    if (!toChain) {
        throw new Error('toChain not found');
    }
    const toToken = toChain.tokens.find(t => t.symbol == row.symbol);
    if (!toToken) {
        throw new Error('toToken not found');
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
const evmMaker = process.env['evmMaker']?.toLocaleLowerCase() || "";
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

fs.writeFileSync(`./temp/feNewFule-${evmMaker}.json`, JSON.stringify(rules))