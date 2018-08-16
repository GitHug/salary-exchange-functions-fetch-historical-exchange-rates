import scrape from '../src/scraper';
import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import * as nock from 'nock';

chai.use(cap);
const { expect } = chai;

describe('scraper', () => {
  /**
   * This is running the actual function and is less of a unit test
   * and more like an end-to-end test
   */
  it('should be able to scrape ECB for historical exchange rates', async () => {
    const url = await scrape();
    expect(url).to.contain('https://www.ecb.europa.eu/stats/eurofxref/eurofxref-hist.zip');
  });

  describe('error handling', () => {
    it('should fail as expected when ECB site is down', () => {
      nock('https://www.ecb.europa.eu')
        .get('/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html')
        .reply(404);

      return expect(scrape()).to.eventually.be.rejected;
    });

    it('should fail as expected when the returned html element is not an href', () => {
      nock('https://www.ecb.europa.eu')
        .get('/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html')
        .reply(200);

      return expect(scrape()).to.eventually.be.rejected;
    });
  });
});
