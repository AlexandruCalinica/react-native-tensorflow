
export function createFileSystem(fs) {
  let requireFsError = '';

  if (!fs) {
    try {
      fs = require('react-native-fs')
    } catch (err) {
      requireFsError = err.toString()
    }
  }

  const readFile = fs
    ? function(filePath) {
      return new Promise((res, rej) => {
        fs.readFile(filePath, function(err, buffer) {
          return err ? rej(err) : res(buffer)
        })
      })
    }
    : function() {
      throw new Error(`readFile - failed to require react-native-fs in react-native environment with error: ${requireFsError}`)
    };

  return {
    readFile
  }
}
