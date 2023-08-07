import {networkInterfaces} from 'node:os';

export const getNetworkAddress = (): string | undefined => {
	for (const interfaceDetails of Object.values(networkInterfaces())) {
		if (!interfaceDetails) continue;

		for (const details of interfaceDetails) {
			const {address, family, internal} = details;

			if (family === 'IPv4' && !internal) return address;
		}
	}
};
