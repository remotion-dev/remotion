import os from 'os';

export const isIpV6Supported = (): boolean => {
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
