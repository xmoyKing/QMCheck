const qm = require('./qm');
const fs = require('fs');
const path = require('path');

const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));
qm.disple(['9104890'], config.cookie);