import {makerList} from './nowMakerList'
import 'dotenv/config'
const makerListNew:any[] = require('./temp/newMakerList.json')
  let notFound = 0;
for (const row of makerList) {
    let data;
    if (row.c1ID<row.c2ID) {
        data = makerListNew.find(nm=> nm.c1ID ==row.c1ID && nm.c2ID == row.c2ID && nm.tName == row.tName);
    } else {
        data = makerListNew.find(nm=> nm.c1ID ==row.c2ID && nm.c2ID == row.c1ID && nm.tName == row.tName);
    }
    if (!data) {
        notFound++;
        continue;
    }
    if (row.tName!='ETH') {
        continue;
    }
    if (row.c1ID == data.c1ID) {
        if (data.c2TradingFee ===0 && data.c2GasFee == 0) {
            continue;
        }
        if (row.c1GasFee !=data.c1GasFee) {
            throw new Error('Error1 c1GasFee not equals');
        }
         if (row.c2GasFee !=data.c2GasFee) {
            throw new Error('Error1 c2GasFee not equals');
        }
        if (row.c1TradingFee !=data.c1TradingFee) {
            throw new Error('Error1 c1TradingFee not equals');
        }
         if (row.c2TradingFee !=data.c2TradingFee) {
            throw new Error('Error1 c2TradingFee not equals');
        }
       
    } else {
        if (data.c1TradingFee ===0 && data.c1GasFee == 0) {
            continue;
        }
        if (row.c1GasFee !=data.c2GasFee) {
            console.log(data);
            console.error('Error1 c1GasFee not equals');
        }
         if (row.c2GasFee !=data.c1GasFee) {
            console.log(data);
            console.error('Error1 c2GasFee not equals');
        }
        if (row.c1TradingFee !=data.c2TradingFee) {
            console.log(data);
            console.error('Error1 c1TradingFee not equals');
        }
         if (row.c2TradingFee !=data.c1TradingFee) {
            console.log(data);
            console.error('Error1 c2TradingFee not equals');
        }
    }
}
console.log('不存在数量', notFound)

