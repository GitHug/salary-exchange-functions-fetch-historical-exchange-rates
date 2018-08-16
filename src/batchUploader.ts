import { ExchangeRate } from './ExchangeRate';
import { getTimestamp } from './util';

const BATCH_MAX_SIZE = 500;

const percentage = (total:number, remainder:number) =>
  Math.round((((total - remainder) / total) + 0.00001) * 10000) / 100;

const prepareBatch = async (
  batch:FirebaseFirestore.WriteBatch,
  rates:ExchangeRate[],
  db:FirebaseFirestore.Firestore,
  collectionPath:string):Promise<FirebaseFirestore.WriteResult[]> => {

  rates.forEach((data) => {
    const ref = db.doc(`${collectionPath}/${data.date}`);
    data.lastUpdated = getTimestamp();

    batch.set(ref, data);
  });

  return batch.commit();
}


export default async (data:ExchangeRate[], db:FirebaseFirestore.Firestore, collectionPath:string):Promise<any> => {
  let remainder = data.slice();

  return new Promise(async (resolve, reject) => {
    while (remainder.length) {
      const batch = db.batch();
      const batchContent = remainder.slice(0, BATCH_MAX_SIZE);
      remainder = remainder.slice(BATCH_MAX_SIZE);

      try {
        await prepareBatch(batch, batchContent, db, collectionPath);
        console.log(`Progess...${percentage(data.length, remainder.length)}%`);
      } catch (e) {
        console.error('Failed to upload');
        reject(e);
        throw e;
      }
    }
    resolve();
  });
}
