import * as chai from 'chai';
import * as fs from 'fs';
import clean from '../src/cleanUp';

const { expect } = chai;

const mkdir = (path:string):void => !fs.existsSync(path) && fs.mkdirSync(path);
const rmdir = (path:string):void => fs.existsSync(path) && fs.rmdirSync(path);

const writeFile = (path:string):void =>
  !fs.existsSync(path) && fs.writeFileSync(path, 'test');
const unlink = (path:string):void =>
  fs.existsSync(path) && fs.unlinkSync(path);

describe('cleanUp', () => {
  before(() => {
    mkdir('./data');
    writeFile('./data/test.txt');

    mkdir('./data/emptydir');

    mkdir('./data/dir');
    writeFile('./data/dir/foo.txt');
  });

  it('should delete data', () => {
    expect(fs.existsSync('./data')).to.equal(true, 'The data folder should exist');

    expect(clean('./data')).to.deep.equal([
      "./data/dir/foo.txt",
      "./data/test.txt"
    ]);
  });

  after(() => {
    unlink('./data/dir/foo.txt');
    rmdir('./data/dir');

    rmdir('./data/emptydir');

    unlink('./data/test.txt');
    rmdir('./data');
  });
});
