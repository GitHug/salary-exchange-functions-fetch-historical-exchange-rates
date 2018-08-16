import * as fs from 'fs';

const deleteFolderRecursive = (path:string, arr:string[]):string[] => {
  if (!fs.existsSync(path)) {
    return arr;
  }

  fs.readdirSync(path).forEach((file) => {
    const curPath:string = `${path}/${file}`;

    if (fs.lstatSync(curPath).isDirectory()) { // recurse
      arr.push(...deleteFolderRecursive(curPath, []));
    } else { // delete file
      arr.push(curPath);
      fs.unlink(curPath, (err) => {
        if (!err) {
          console.log(`${curPath} deleted`);
        }
      });
    }
  });

  return arr;
};

const deleteFiles = (path:string):string[] => {
  return deleteFolderRecursive(path, []);
};

export default (dir:string) => {
  let cleaned:string[] = [];
  try {
    console.log('Preparing to clean up...');
    cleaned = deleteFiles(dir);
    console.log('Clean up successful');
    console.log(`Removed: ${JSON.stringify(cleaned)}`);
  } catch (err) {
    console.error('Failed to clean up');
    console.error(err);
  }

  return cleaned;
};
