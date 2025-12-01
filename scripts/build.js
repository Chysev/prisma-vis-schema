const fs = require('fs');
const path = require('path');
const obfuscator = require('javascript-obfuscator');

const inputDir = path.resolve(__dirname, '../build');

const obfusc = (dir) => {
  fs.readdirSync(dir).forEach((file) => {
    const fullPath = path.join(dir, file);

    if (fs.statSync(fullPath).isDirectory()) {
      obfusc(fullPath);
    } else if (file.endsWith('.js')) {
      const code = fs.readFileSync(fullPath, 'utf8');
      const obfuscated = obfuscator
        .obfuscate(code, {
          compact: true,
          controlFlowFlattening: true,
          controlFlowFlatteningThreshold: 0.5,
          stringArray: true,
          sourceMap: false,
          stringArrayEncoding: ['base64'],
          stringArrayThreshold: 0.75,
          splitStrings: true,
          splitStringsChunkLength: 8,
          renameGlobals: true,
          identifierNamesGenerator: 'hexadecimal',
          unicodeEscapeSequence: true,
        })
        .getObfuscatedCode();

      fs.writeFileSync(fullPath, obfuscated);
      console.log(`Obfuscated: ${fullPath}`);
    }
  });
};

obfusc(inputDir);
