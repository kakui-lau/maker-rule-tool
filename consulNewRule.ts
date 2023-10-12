import fs from "fs";
import 'dotenv/config'
const makerList1 = require('./temp/feNewFule.json')
import { clone } from 'lodash';
const result: any = {
}
for (const chainId in makerList1) {
    const symbolResult = makerList1[chainId];
    for (const symbolId in symbolResult) {
        const senderAddr = symbolResult[symbolId]['makerAddress'].toLocaleLowerCase();
        if (!result[senderAddr]) {
            result[senderAddr] = {}
        }
        if (!result[senderAddr][chainId]) {
            result[senderAddr][chainId] = {}
        }
        if (!result[senderAddr][chainId][symbolId]) {
            result[senderAddr][chainId][symbolId] = {}
        }
        result[senderAddr][chainId][symbolId] = clone(symbolResult[symbolId]);
    }
}
for (const addr in result) {
    fs.writeFileSync(`./temp/${addr}.json`, JSON.stringify(result[addr]))
}
// fs.writeFileSync('newMakerSN.json', JSON.stringify(fromSN))