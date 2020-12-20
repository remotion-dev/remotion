'use strict';
import fs from 'fs';

let isDocker: undefined | boolean;

function hasDockerEnv() {
	try {
		fs.statSync('/.dockerenv');
		return true;
	} catch (_) {
		return false;
	}
}

function hasDockerCGroup() {
	try {
		return fs.readFileSync('/proc/self/cgroup', 'utf8').includes('docker');
	} catch (_) {
		return false;
	}
}
function hasDockerCGroup2() {
	try {
		return fs.readFileSync('/proc/1/cgroup', 'utf8').includes('docker');
	} catch (_) {
		return false;
	}
}

export const isInsideDockerContainer = () => {
	if (isDocker === undefined) {
		isDocker = hasDockerEnv() || hasDockerCGroup() || hasDockerCGroup2();
	}

	return isDocker;
};
