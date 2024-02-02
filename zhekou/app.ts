import fs from "fs";
const maker1 = require('./maker-1.json')
const maker1Before = require('./maker-1-before.json')
for (const chain in maker1) {
    for(const symbol in maker1[chain]) {
        const config = maker1[chain][symbol];
        if (config) {
            console.log(config,'===')
            const originConfig = maker1Before[chain][symbol];
            if (originConfig && originConfig.tradingFee>config.tradingFee) {
                config['originWithholdingFee'] = originConfig.tradingFee;
            }
        }
    }
}
fs.writeFileSync(`./temp/maker-2.json`, JSON.stringify(maker1, null,"\t"))