import { ExchangeRate } from './ExchangeRate';

interface ExistingExchangeRate {
  exists:boolean
  exchangeRate:ExchangeRate
}

/**
 * Create an array of promising that when executed will check if each exchange rate exists or not
 * @param data Exchange rates
 * @param db Firestore
 * @param basePath Base path for the collection
 */
const createCheckExistencePromiseArray =
  (data:ExchangeRate[], db:FirebaseFirestore.Firestore, collectionPath:string):Promise<ExistingExchangeRate>[] => {
    return data.map((exchangeRate:ExchangeRate) =>
      new Promise<ExistingExchangeRate>((resolve, reject) => {
        const ref = db.doc(`${collectionPath}/${exchangeRate.date}`);

        ref.get().then((snapshot) => {
          resolve({
            exists: snapshot.exists,
            exchangeRate
          })
        }).catch((e) => {
          console.error(`Failed to get exchange rate ${exchangeRate.date} due to ${e}`);
          reject();
        });
      }));
  }

export default async (data:ExchangeRate[], db:FirebaseFirestore.Firestore, collectionPath:string):Promise<ExchangeRate[]> => {
  console.log(`Check existence of ${data.length} exchange rates`);

  const promises = createCheckExistencePromiseArray(data, db, collectionPath);

  const ratesToUpload:ExchangeRate[] = [];
  await Promise.all(promises).then(function(values:any) {
    values.forEach((v) => {
      if (!v.exists) {
        ratesToUpload.push(v.exchangeRate);
      }
    });
  });

  console.log(`${data.length - ratesToUpload.length} exchange rates already uploaded`);
  return ratesToUpload;
}