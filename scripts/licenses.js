const checker = require('license-checker');
const fs = require('fs');

const OUT_FILE = './extraResources/licenses.md';

if (fs.existsSync(OUT_FILE)) {
    console.warn('Skipping license.md generation since the file exists which is good enough for development.');
    console.warn('If you see this message in your CI you have probably committed the licenses.md file.');
    process.exit(0);
}

checker.init({
    start: '.'
}, (err, packages) => {
    if (err) {
        process.exit(1);
    }

    let markdown = '# Third party licenses\n\n';

    for (const [key, value] of Object.entries(packages)) {
        markdown += `## ${key}\n`;
        markdown += `### License: ${value.licenses}\n`;
        markdown += `### Repository: ${value.repository}\n`;
        markdown += '### License file\n```\n';
        if (fs.existsSync(value.licenseFile)) {
            markdown += fs.readFileSync(value.licenseFile).toString().replaceAll(/```/g, '\\`\\`\\`');
        } else {
            console.warn('License file does not exist', value);
        }
        markdown += '\n```\n---\n\n';
    }

    fs.writeFileSync(OUT_FILE, markdown);
});
