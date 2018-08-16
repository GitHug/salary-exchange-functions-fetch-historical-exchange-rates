import { fetchHistoricalExchangeRates } from '../src/index';

describe('fetchHistoricalExchangeRates end-to-end test', () => {

  it('should work', () => {
    fetchHistoricalExchangeRates(null, () => {
      console.log('callback');
    });
  });
});
