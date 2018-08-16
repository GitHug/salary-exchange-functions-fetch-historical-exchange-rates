import * as nock from 'nock';
import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import * as  fs from 'fs';
import fetchAndUnzip from '../src/unzipperFetcher';

chai.use(cap);
const { expect } = chai;

const expectedPath = './data/eurofxref.csv';
describe('unzipperFetcher', () => {
  it('should be able to download and unzip a file', async () => {
    nock('http://www.example.com')
      .get('/')
      .replyWithFile(200, './test/resources/eurofxref.zip', {
        'Content-Type': 'application/zip',
      });

    const path = await fetchAndUnzip('http://www.example.com/', './data');

    expect(path).to.equal(expectedPath);
  });

  describe('error handling', () => {
    it('should fail as expected when the url is inaccessible', () => {
      nock('http://www.fail.com')
        .get('/')
        .reply(404);

      return expect(fetchAndUnzip('http://www.fail.com/', './data')).to.eventually.be.rejected;
    });
  });

  after(() => {
    if (fs.existsSync(expectedPath)) {
      fs.unlinkSync(expectedPath);
    }
  });
});
