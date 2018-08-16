import * as proxyquire from 'proxyquire';
import * as sinon from 'sinon';
import * as admin from 'firebase-admin';

let repository;
let returnValue;
let stubExistingRates;
let stubBatchUpload;
let stubMetaUpload;

const timestamp = 123;
describe('repository', () => {
  beforeEach(() => {
    stubExistingRates = sinon.stub();
    stubBatchUpload = sinon.stub();
    stubMetaUpload = sinon.stub();

    returnValue = undefined; // reset
    repository = proxyquire('../src/repository', {
      './util': {
        getTimestamp: () => timestamp
      },
      './existenceChecker': {
        default: (d) => {
          stubExistingRates()

          return returnValue;
        }
      },
      './batchUploader': {
        default: () => stubBatchUpload()
      }
    });

    sinon.stub(admin, 'firestore')
      .get(function() {
        return function() {
          return {
            doc: () => ({
              set: (d) => stubMetaUpload(d)
            })
          }
        }
    });
  });

  it('should check existence of data, upload it on a batch job and update meta data', async () => {
    returnValue = [
      { date: '2018-06-21', exchangeRates: 'abc' },
      { date: '2018-06-22', exchangeRates: 'def' },
      { date: '2018-06-23', exchangeRates: 'ghi' },
    ]

    const data = [
      { date: '2018-06-20', exchangeRates: 'xyz' },
      { date: '2018-06-21', exchangeRates: 'abc' },
      { date: '2018-06-22', exchangeRates: 'def' },
      { date: '2018-06-23', exchangeRates: 'ghi' },
      { date: '2018-06-24', exchangeRates: 'jkl' },
    ]

    const db = admin.firestore();
    await repository.default(data, db);

    sinon.assert.calledOnce(stubExistingRates);
    sinon.assert.calledOnce(stubBatchUpload);
    sinon.assert.calledOnce(stubMetaUpload);
  });

  it('should not upload data if no new data exist', async () => {
    returnValue = [];

    const data = [
      { date: '2018-06-20', exchangeRates: 'xyz' },
      { date: '2018-06-21', exchangeRates: 'abc' },
      { date: '2018-06-22', exchangeRates: 'def' },
      { date: '2018-06-23', exchangeRates: 'ghi' },
      { date: '2018-06-24', exchangeRates: 'jkl' },
    ]

    const db = admin.firestore();
    await repository.default(data, db);

    sinon.assert.calledOnce(stubExistingRates);
    sinon.assert.callCount(stubBatchUpload, 0);
    sinon.assert.callCount(stubMetaUpload, 0);
  });

  describe('meta', () => {
    it('should add the current timestamp', async () => {
        const data = [
          { date: '2018-06-20', exchangeRates: 'xyz' },
        ]
        returnValue = data;

        const db = admin.firestore();
        await repository.default(data, db);

        sinon.assert.calledOnce(stubMetaUpload);
        sinon.assert.calledWith(stubMetaUpload, {
          lastUpdated: timestamp
        });
    });
  });
});