import * as cheerio from 'cheerio';
import * as rp from 'request-promise';

const selector = 'p:contains(Time series) + ul a.download';
const host = 'https://www.ecb.europa.eu';
const url = `${host}/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html`;

const options = {
  uri: url,
  transform: body => cheerio.load(body),
};

export default async ():Promise<string> => {
  console.log('Preparing to scrape');

  const fileURL = await rp(options)
    .then(($) => {
      const link = $(selector);
      if (!link.attr('href')) {
        throw new Error(`Href not found with selector ${selector}`);
      }

      return host + link.attr('href');
    })
    .catch((err) => {
      console.error(`Unable to find file URL due to: ${err.message}`);
      throw err;
    });

  console.log(`File URL is ${fileURL}`);
  console.log('Scrape completed');
  return fileURL;
};
