import * as chai from 'chai';
import * as cap from 'chai-as-promised';
import * as sinon from 'sinon';
import * as admin from 'firebase-admin';
import * as proxyquire from 'proxyquire';

chai.use(cap);

const stubFirestore = (setStub, commitStub) => {
  sinon.stub(admin, 'firestore')
      .get(function() {
        return function() {
          return {
            batch: (path) => {
              return {
                set: (ref, data) => setStub(),
                commit: () => commitStub(),
              }
            },
            doc: () => sinon.stub()
          }
        }
    });
  }

let uploader;
describe('batchUploader', () => {

  beforeEach(() => {
    uploader = proxyquire('../src/batchUploader', {
      './util': {
        getTimestamp: sinon.stub().returns(123)
      }
    })
  });

  it('should upload data', async () => {
    const setStub = sinon.stub();
    const commitStub = sinon.stub();

    stubFirestore(setStub, commitStub);
    const db = admin.firestore();

    await uploader.default([
      {
        date: '2018-06-21',
        baseCurrency: 'EUR',
        exchangeRates: 'abc'
      }], db, '');

    sinon.assert.calledOnce(commitStub);
  });

  it('should break data into 500 entries big chunks. 13337 entries should create 27 batch commits', async () => {
    const setStub = sinon.stub();
    const commitStub = sinon.stub();

    stubFirestore(setStub, commitStub);
    const db = admin.firestore();

    let i = 0;
    const data = [];
    while (i < 13337) {
      data[i] = {
        date: '2018-06-21',
        baseCurrency: 'EUR',
        exchangeRates: `abc ${i}`
      }
      i++;
    }
    await uploader.default(data, db, '');

    sinon.assert.callCount(commitStub, 27);
    sinon.assert.callCount(setStub, 13337);
  });
});


