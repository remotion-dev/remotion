import type {NetworkInterfaceInfo} from 'os';
import os from 'os';
import {truthy} from './truthy';

type PortConfig = {
	host: string;
	hostsToTry: string[];
};

let cached: PortConfig | null = null;

export const getPortConfig = (preferIpv4: boolean): PortConfig => {
	if (cached) {
		return cached;
	}

	const networkInterfaces = os.networkInterfaces();
	const flattened = flattenNetworkInterfaces(networkInterfaces);
	const host = getHostToBind(flattened, preferIpv4);
	const hostsToTry = getHostsToTry(flattened);

	const response: PortConfig = {host, hostsToTry};
	cached = response;
	return response;
};

export const getHostToBind = (
	flattened: os.NetworkInterfaceInfo[],
	preferIpv4: boolean,
) => {
	if (preferIpv4 || !isIpV6Supported(flattened)) {
		return '0.0.0.0';
	}

	return '::';
};

export const getHostsToTry = (flattened: os.NetworkInterfaceInfo[]) => {
	return [
		hasIPv6LoopbackAddress(flattened) ? '::1' : null,
		hasIpv4LoopbackAddress(flattened) ? '127.0.0.1' : null,
		isIpV6Supported(flattened) ? '::' : null,
		'0.0.0.0',
	].filter(truthy);
};

export const flattenNetworkInterfaces = (
	networkInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]>,
): NetworkInterfaceInfo[] => {
	const result: NetworkInterfaceInfo[] = [];

	for (const iface in networkInterfaces) {
		for (const configuration of networkInterfaces[
			iface
		] as os.NetworkInterfaceInfo[]) {
			result.push(configuration);
		}
	}

	return result;
};

export const isIpV6Supported = (
	flattened: os.NetworkInterfaceInfo[],
): boolean => {
	for (const configuration of flattened) {
		if (configuration.family === 'IPv6' && !configuration.internal) {
			return true;
		}
	}

	return false;
};

export const hasIPv6LoopbackAddress = (
	flattened: os.NetworkInterfaceInfo[],
) => {
	for (const configuration of flattened) {
		if (
			configuration.family === 'IPv6' &&
			configuration.internal &&
			configuration.address === '::1'
		) {
			return true;
		}
	}

	return false;
};

export const hasIpv4LoopbackAddress = (
	flattened: os.NetworkInterfaceInfo[],
): boolean => {
	for (const configuration of flattened) {
		if (
			configuration.family === 'IPv4' &&
			configuration.internal &&
			configuration.address === '127.0.0.1'
		) {
			return true;
		}
	}

	return false;
};
