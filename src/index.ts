import * as os from 'os';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import scrape from './scraper';
import fetchAndUnzip from './unzipperFetcher';
import parser from './parser';
import cleanUp from './cleanUp';
import upload from './repository';
import { ExchangeRate } from './ExchangeRate';

admin.initializeApp(functions.config().firebase);
const db:FirebaseFirestore.Firestore = admin.firestore();

const tempDir = `${os.tmpdir()}/exchange_rates`;

export const fetchHistoricalExchangeRates = async (_:any, callback:Function) => {
  try {
    const url:string = await scrape();
    const filePath:string = await fetchAndUnzip(url, tempDir);
    const data:ExchangeRate[] = await parser(filePath);
    await upload(data, db);

  } catch(e) {
    console.error(`Function failed with error ${e.message}`);
    console.error(e);
  } finally {
    cleanUp(tempDir);
  }

  callback();
};



