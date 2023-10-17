import os from 'os';

let cache: null | boolean = null;

const calculate = (): boolean => {
	const interfaces = os.networkInterfaces();

	for (const iface in interfaces) {
		for (const configuration of interfaces[
			iface
		] as os.NetworkInterfaceInfo[]) {
			if (configuration.family === 'IPv6' && !configuration.internal) {
				return true;
			}
		}
	}

	return false;
};

export const isIpV6Supported = (): boolean => {
	if (cache === null) {
		cache = calculate();
	}

	return cache;
};
