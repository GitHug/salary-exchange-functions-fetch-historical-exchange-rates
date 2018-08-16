import * as unzipper from 'unzipper';
import * as rp from 'request';

export default async (url:string, dir:string):Promise<string> => {
  console.log(`Preparing to fetch url ${url} and unzip`);

  let fname:string;
  const promise:Promise<string> = new Promise((resolve, reject) => {
    rp({ url })
      .pipe(unzipper.Extract({ path: dir }))
      .on('entry', (file) => {
        fname = file.path;
      })
      .on('error', (e) => {
        console.error(e);
        reject(e);
      })
      .on('finish', () => {
        if (fname) {
          console.log('File completed successfully');
          resolve(`${dir}/${fname}`);
        }
      });
  });

  return promise;
};
