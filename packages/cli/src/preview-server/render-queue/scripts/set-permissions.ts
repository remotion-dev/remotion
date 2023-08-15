'use strict';

const {exec} = require('child_process');
const {join} = require('path');

// ensure that osx-copy-image is executable
if (process.platform === 'darwin')
	exec(`chmod +x "${join(__dirname, 'osx-copy-image')}"`);
