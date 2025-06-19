const fs = require('fs');
const path = require('path');

/**
 * Recursively processes all files in a directory and replaces a target string with a replacement string.
 * @param {string} dir - The directory to process.
 * @param {string} target - The string to replace.
 * @param {string} replacement - The replacement string.
 */
function replaceInFiles(dir, target, replacement) {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${dir}:`, err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(dir, file.name);

      if (file.isDirectory()) {
        // Recursively process subdirectories
        replaceInFiles(filePath, target, replacement);
      } else if (file.isFile()) {
        // Process files
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error(`Error reading file ${filePath}:`, err);
            return;
          }

          if (data.includes(target)) {
            const updatedData = data.replace(new RegExp(target, 'g'), replacement);

            fs.writeFile(filePath, updatedData, 'utf8', err => {
              if (err) {
                console.error(`Error writing to file ${filePath}:`, err);
              } else {
                console.log(`Updated file: ${filePath}`);
              }
            });
          }
        });
      }
    });
  });
}

// Start the replacement process in the current directory
const currentDir = __dirname;
replaceInFiles(currentDir, '3005', '3005');