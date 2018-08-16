import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import parse from '../src/parser';

chai.use(cap);
const { expect } = chai;

describe('csvParser', () => {
  it('should be able to parse a csv', async () => {
    const json = await parse('./test/resources/test-exchangerates.csv');
    expect(json).to.deep.equal([
      {
        baseCurrency: 'EUR',
        date: '2018-02-09',
        exchangeRates: {
          AUD: '1.5721',
          BGN: '1.9558',
          BRL: '4.0244',
          CAD: '1.5475',
          CHF: '1.15',
          CNY: '7.7362',
          CYP: 'N/A',
          CZK: '25.335',
          DKK: '7.4437',
          EEK: 'N/A',
          GBP: '0.8874',
          HKD: '9.5985',
          HRK: '7.4435',
          HUF: '312.08',
          IDR: '16763.69',
          ILS: '4.3273',
          INR: '79.0045',
          ISK: '125.2',
          JPY: '133.59',
          KRW: '1336.19',
          LTL: 'N/A',
          LVL: 'N/A',
          MTL: 'N/A',
          MXN: '23.0932',
          MYR: '4.86',
          NOK: '9.7983',
          NZD: '1.6952',
          PHP: '63.324',
          PLN: '4.1903',
          ROL: 'N/A',
          RON: '4.6563',
          RUB: '71.5055',
          SEK: '9.9448',
          SGD: '1.6321',
          SIT: 'N/A',
          SKK: 'N/A',
          THB: '39.028',
          TRL: 'N/A',
          TRY: '4.697',
          USD: '1.2273',
          ZAR: '14.8761',
        }
      },
    ]);
  });

  it('should throw an exception if the file can not be parsed', () =>
    expect(parse('./test/resources/fail.csv')).to.eventually.be.rejected);
});
