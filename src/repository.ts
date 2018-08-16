import * as admin from 'firebase-admin';
import { ExchangeRate } from './ExchangeRate';
import checkExistence from './existenceChecker';
import batchUpload from './batchUploader';
import { getTimestamp } from './util';

const HISTORICAL = 'historical-rates';
const RATES = 'exchange-rates';
const META = 'meta';
const BASE_PATH = `${HISTORICAL}/${RATES}/${RATES}`

const addMetaData = async (db:FirebaseFirestore.Firestore) =>
  db.doc(`${HISTORICAL}/${META}`)
    .set({
      lastUpdated: getTimestamp(),
    });

const upload = async (data:ExchangeRate[], db:FirebaseFirestore.Firestore):Promise<any> => {
  console.log(`Preparing to upload ${data.length} exchange rates`);

  let exchangeRatesNotYetUploaded:ExchangeRate[];
  try {
    exchangeRatesNotYetUploaded = await checkExistence(data, db, BASE_PATH);
  } catch(e) {
    console.error(e);
    console.error('Failed to check which exchange rates has been uploaded. Uploading all');
    exchangeRatesNotYetUploaded = data;
  }

  if (exchangeRatesNotYetUploaded.length === 0) {
    console.log('No exchange rates to upload');
    return;
  }

  console.log(`Batch write ${exchangeRatesNotYetUploaded.length} exchange rates`);
  try {
    await batchUpload(exchangeRatesNotYetUploaded, db, BASE_PATH);
  } catch(e) {
    console.error('Failed to upload exchange rates');
    console.error(e);
    throw e;
  }

  console.log('Add metadata');
  await addMetaData(db);

  console.log('Upload complete');
}

export default upload;
