import * as admin from 'firebase-admin';
import { expect } from 'chai';
import * as sinon from 'sinon';
import checkExistence from '../src/existenceChecker'
import { ExchangeRate } from '../src/ExchangeRate'

const stubGet = (existingPaths:string[]) => {
  sinon.stub(admin, 'firestore')
      .get(function() {
        return function() {
          return {
            doc: (path) => {
              return {
                get: () => Promise.resolve({
                  exists: existingPaths.indexOf(path) >= 0
                })
              }
          }
        }
      }
  });
}

describe('existenceChecker', () => {
  it('should not fail for empty array of exchange rates', async () => {
    stubGet([]);

    const notExisting = await checkExistence(
      [],
      admin.firestore(),
      ''
    );

    expect(notExisting).to.deep.equal([]);
  })

  it('should check which exchange rates has already been uploaded. 2018-06-26 is not uploaded',
  async () => {

    const _2018_06_27:ExchangeRate = {
      date: '2018-06-27',
      exchangeRates: [{'ABC': 123}]
    }

    const _2018_06_26:ExchangeRate = {
      date: '2018-06-26',
      exchangeRates: [{'DEF': 456}]
    }

    const _2018_06_25:ExchangeRate = {
      date: '2018-06-25',
      exchangeRates: [{'GHI': 789}]
    }

    stubGet(['/2018-06-27', '/2018-06-25']);

    const notExisting = await checkExistence(
      [_2018_06_27, _2018_06_26, _2018_06_25],
      admin.firestore(),
      ''
    );

    expect(notExisting.length, 'There should only be one exchange rate not existing').to.equal(1);
    expect(notExisting).to.deep.equal([_2018_06_26]);
  });

  it('should check which exchange rates has already been uploaded. None have been uploaded.',
  async () => {

    const _2018_06_27:ExchangeRate = {
      date: '2018-06-27',
      exchangeRates: [{'ABC': 123}]
    }

    const _2018_06_26:ExchangeRate = {
      date: '2018-06-26',
      exchangeRates: [{'DEF': 456}]
    }

    const _2018_06_25:ExchangeRate = {
      date: '2018-06-25',
      exchangeRates: [{'GHI': 789}]
    }

    stubGet([]);

    const notExisting = await checkExistence(
      [_2018_06_27, _2018_06_26, _2018_06_25],
      admin.firestore(),
      ''
    );

    expect(notExisting.length, 'All exchange rates is not existing').to.equal(3);
    expect(notExisting).to.deep.equal([_2018_06_27, _2018_06_26, _2018_06_25]);
  });

  it('should check which exchange rates has already been uploaded. All have been uploaded.',
  async () => {

    const _2018_06_27:ExchangeRate = {
      date: '2018-06-27',
      exchangeRates: [{'ABC': 123}]
    }

    const _2018_06_26:ExchangeRate = {
      date: '2018-06-26',
      exchangeRates: [{'DEF': 456}]
    }

    const _2018_06_25:ExchangeRate = {
      date: '2018-06-25',
      exchangeRates: [{'GHI': 789}]
    }

    stubGet(['/2018-06-27', '/2018-06-26', '/2018-06-25']);

    const notExisting = await checkExistence(
      [_2018_06_27, _2018_06_26, _2018_06_25],
      admin.firestore(),
      ''
    );

    expect(notExisting.length, 'There should no echange rate not existing').to.equal(0);
    expect(notExisting).to.deep.equal([]);
  });
});