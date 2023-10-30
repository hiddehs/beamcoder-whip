const {execSync} = require('node:child_process');
const fs = require('fs');
const path = require('path');

const replacer = process.argv[2] ?? 'node_modules/beamcoder/build/Release/lib/ffmpeg/';

console.log(`Replacing lb path with ${replacer}`);

const compiledPath = 'build/Release/beamcoder.node';
const otool = execSync(`otool -L ${compiledPath}`);
const lines = otool.toString().split('\n\t');
const extractedLibraries = [];

for (const line of lines) {
  if (line.startsWith('macos-out')) {
    const libraryPath = line.split(' ')[0]; // Extract the library path
    extractedLibraries.push(libraryPath);
  }
}


for (const lib of extractedLibraries) {
  execSync(`install_name_tool -change ${lib} ${lib.replace('macos-out/usr/local/lib/', replacer)} ${compiledPath}`);
}
console.log("replace complete, new lb paths");
console.log(execSync(`otool -L ${compiledPath}`).toString());


// Define the source and destination directories
const sourceDirectory = 'ffmpeg/macos-out/usr/local/lib/'; // Replace with your source directory path
const destinationDirectory = 'build/Release/lib/ffmpeg/'; // Replace with your destination directory path

// Ensure the destination directory exists, or create it
if (!fs.existsSync(destinationDirectory)) {
  fs.mkdirSync(destinationDirectory, { recursive: true });
}
console.log(`copying libs to correct path ${destinationDirectory}`);

// Copy the contents of the source directory to the destination directory
const copyContents = (source, destination) => {
  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourceFile = path.join(source, file);
    const destinationFile = path.join(destination, file);
    if (fs.statSync(sourceFile).isDirectory()) {
      fs.mkdirSync(destinationFile, { recursive: true });
      copyContents(sourceFile, destinationFile);
    } else {
      fs.copyFileSync(sourceFile, destinationFile);
    }
  }
};

copyContents(sourceDirectory, destinationDirectory);
