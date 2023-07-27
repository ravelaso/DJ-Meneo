const fs = require('fs');
const path = require('path');

function copyDirectorySync(source, destination) {
  if (!fs.existsSync(destination)) {
    fs.mkdirSync(destination);
  }

  const files = fs.readdirSync(source);

  for (const file of files) {
    const sourcePath = path.join(source, file);
    const destinationPath = path.join(destination, file);

    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectorySync(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

// Specify the source and destination directories
const sourceDirectory = 'src/public';
const destinationDirectory = 'dist/public';

// Copy the sounds directory
copyDirectorySync(sourceDirectory, destinationDirectory);

console.log('Sounds copied successfully!');
