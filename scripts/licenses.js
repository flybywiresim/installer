const checker = require('license-checker');
const fs = require('fs');

const OUT_FILE = './.github/LICENSES.yaml';

if (fs.existsSync(OUT_FILE)) {
  console.warn('Skipping license.md generation since the file exists which is good enough for development.');
  console.warn('If you see this message in your CI you have probably committed the licenses.md file.');
  process.exit(0);
}

checker.init(
  {
    start: '.',
  },
  (err, packages) => {
    if (err) {
      process.exit(1);
    }

    for (const [, value] of Object.entries(packages)) {
      if (fs.existsSync(value.licenseFile)) {
        value.text = fs.readFileSync(value.licenseFile).toString().replace(/```/g, '\\`\\`\\`');
      } else {
        console.warn('License file does not exist', value);
      }
      delete value.licenseFile;
    }

    fs.writeFileSync(OUT_FILE, JSON.stringify(packages, null, 4));
  },
);
