import { createReadStream, ReadStream } from 'fs';
import * as csvParse from 'csv-parse';
import { ExchangeRate } from './ExchangeRate';

const options = {
  ltrim: true,
  rtrim: true,
  columns: true,
  skip_empty_lines: true,
  skip_lines_with_empty_value: true,
  delimiter: ',',
};

const removeEmptyLines = (record:{}):{}=> Object.keys(record)
  .filter(key => !!key)
  .reduce(
    (newRecord, key) =>
      Object.assign(newRecord, { [key]: record[key] }), // Copy value.
    {},
  );

export default (filePath:string):Promise<ExchangeRate[]> => new Promise((resolve, reject) => {
  const data:ExchangeRate[] = [];

  const input:ReadStream = createReadStream(filePath);
  input.on('error', () => reject(new Error('file not found')));

  const p:csvParse.Parser = csvParse(options);

  p.on('finish', () => {
    input.close();
    p.end();
    resolve(data);
  });
  p.on('readable', () => {
    let record:{} = p.read();
    while (record) {
      // Removes empty lines
      const modifiedRecord:any = removeEmptyLines(record);

      const date = modifiedRecord.Date;
      delete modifiedRecord.Date;

      const exchangeRate:ExchangeRate = {
        date: date,
        exchangeRates: modifiedRecord,
        baseCurrency: 'EUR'
      };
      data.push(exchangeRate);

      record = p.read();
    }
  });
  p.on('error', (err:Error) => reject(err.message));

  input.pipe(p);
});
