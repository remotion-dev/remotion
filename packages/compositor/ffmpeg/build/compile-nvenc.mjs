import {execSync} from 'child_process';
import {existsSync} from 'fs';
import path from 'path';
import {PREFIX} from './const.mjs';

const NV_CODEC_HEADERS_TAG = 'n12.2.72.0';

export const enableNvencHeaders = (shouldEnableNvenc) => {
	if (!shouldEnableNvenc) {
		return;
	}

	if (!existsSync('nv-codec-headers')) {
		execSync('git clone https://github.com/FFmpeg/nv-codec-headers.git', {
			stdio: 'inherit',
		});
	}

	execSync('git fetch --all --tags', {
		cwd: 'nv-codec-headers',
		stdio: 'inherit',
	});

	execSync(`git checkout ${NV_CODEC_HEADERS_TAG}`, {
		cwd: 'nv-codec-headers',
		stdio: 'inherit',
	});

	const installPrefix = path.join(process.cwd(), PREFIX);
	execSync(`make install PREFIX=${installPrefix}`, {
		cwd: 'nv-codec-headers',
		stdio: 'inherit',
	});
};
