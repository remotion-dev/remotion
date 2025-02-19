import {expect, test} from 'bun:test';
import type {NetworkInterfaceInfo} from 'os';
import {
	flattenNetworkInterfaces,
	getHostToBind,
	getHostsToTry,
} from '../port-config';

const dockerInterfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = {
	lo: [
		{
			address: '127.0.0.1',
			netmask: '255.0.0.0',
			family: 'IPv4',
			mac: '00:00:00:00:00:00',
			internal: true,
			cidr: '127.0.0.1/8',
		},
	],
	eno1: [
		{
			address: '192.168.1.9',
			netmask: '255.255.255.0',
			family: 'IPv4',
			mac: '00:d8:61:58:06:d5',
			internal: false,
			cidr: '192.168.1.9/24',
		},
		{
			address: '2405:4803:b492:5430:1518:f88c:90e8:6aa6',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:d8:61:58:06:d5',
			internal: false,
			cidr: '2405:4803:b492:5430:1518:f88c:90e8:6aa6/64',
			scopeid: 0,
		},
		{
			address: '2405:4803:b492:5430:d49b:a573:c741:fd19',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:d8:61:58:06:d5',
			internal: false,
			cidr: '2405:4803:b492:5430:d49b:a573:c741:fd19/64',
			scopeid: 0,
		},
		{
			address: 'fe80::b56c:f898:93f1:d529',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:d8:61:58:06:d5',
			internal: false,
			cidr: 'fe80::b56c:f898:93f1:d529/64',
			scopeid: 2,
		},
	],
};

const macOsM1Interfaces: NodeJS.Dict<NetworkInterfaceInfo[]> = {
	lo0: [
		{
			address: '127.0.0.1',
			netmask: '255.0.0.0',
			family: 'IPv4',
			mac: '00:00:00:00:00:00',
			internal: true,
			cidr: '127.0.0.1/8',
		},
		{
			address: '::1',
			netmask: 'ffff:ffff:ffff:ffff:ffff:ffff:ffff:ffff',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: true,
			cidr: '::1/128',
			scopeid: 0,
		},
		{
			address: 'fe80::1',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: true,
			cidr: 'fe80::1/64',
			scopeid: 1,
		},
	],
	anpi1: [
		{
			address: 'fe80::c865:f4ff:fe1d:5e45',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: 'ca:65:f4:1d:5e:45',
			internal: false,
			cidr: 'fe80::c865:f4ff:fe1d:5e45/64',
			scopeid: 4,
		},
	],
	anpi0: [
		{
			address: 'fe80::c865:f4ff:fe1d:5e44',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: 'ca:65:f4:1d:5e:44',
			internal: false,
			cidr: 'fe80::c865:f4ff:fe1d:5e44/64',
			scopeid: 5,
		},
	],
	ap1: [
		{
			address: 'fe80::3498:77ff:fe4e:59a9',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '36:98:77:4e:59:a9',
			internal: false,
			cidr: 'fe80::3498:77ff:fe4e:59a9/64',
			scopeid: 12,
		},
	],
	en1: [
		{
			address: 'fe80::101b:a1ad:96cc:4b60',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '14:98:77:4e:59:a9',
			internal: false,
			cidr: 'fe80::101b:a1ad:96cc:4b60/64',
			scopeid: 13,
		},
		{
			address: '192.168.1.74',
			netmask: '255.255.255.0',
			family: 'IPv4',
			mac: '14:98:77:4e:59:a9',
			internal: false,
			cidr: '192.168.1.74/24',
		},
	],
	awdl0: [
		{
			address: 'fe80::d820:13ff:fe78:47b3',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: 'da:20:13:78:47:b3',
			internal: false,
			cidr: 'fe80::d820:13ff:fe78:47b3/64',
			scopeid: 14,
		},
	],
	llw0: [
		{
			address: 'fe80::d820:13ff:fe78:47b3',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: 'da:20:13:78:47:b3',
			internal: false,
			cidr: 'fe80::d820:13ff:fe78:47b3/64',
			scopeid: 15,
		},
	],
	bridge100: [
		{
			address: '192.168.64.1',
			netmask: '255.255.255.0',
			family: 'IPv4',
			mac: '16:98:77:15:94:64',
			internal: false,
			cidr: '192.168.64.1/24',
		},
		{
			address: 'fe80::1498:77ff:fe15:9464',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '16:98:77:15:94:64',
			internal: false,
			cidr: 'fe80::1498:77ff:fe15:9464/64',
			scopeid: 22,
		},
		{
			address: 'fdd2:235a:bccb:777e:c50:13d2:d192:aa39',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '16:98:77:15:94:64',
			internal: false,
			cidr: 'fdd2:235a:bccb:777e:c50:13d2:d192:aa39/64',
			scopeid: 0,
		},
	],
	utun0: [
		{
			address: 'fe80::3ab9:d3dc:219a:150a',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::3ab9:d3dc:219a:150a/64',
			scopeid: 16,
		},
	],
	utun1: [
		{
			address: 'fe80::ce81:b1c:bd2c:69e',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::ce81:b1c:bd2c:69e/64',
			scopeid: 17,
		},
	],
	utun2: [
		{
			address: 'fe80::b6db:8405:b7e7:5763',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::b6db:8405:b7e7:5763/64',
			scopeid: 18,
		},
	],
	utun3: [
		{
			address: 'fe80::6ac5:9997:e6e0:87b5',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::6ac5:9997:e6e0:87b5/64',
			scopeid: 19,
		},
	],
	utun4: [
		{
			address: 'fe80::d94f:34bc:eb3e:978c',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::d94f:34bc:eb3e:978c/64',
			scopeid: 20,
		},
	],
	utun5: [
		{
			address: 'fe80::a0ca:c320:7562:2d4e',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::a0ca:c320:7562:2d4e/64',
			scopeid: 23,
		},
	],
	utun6: [
		{
			address: 'fe80::20ae:1de4:db23:d05d',
			netmask: 'ffff:ffff:ffff:ffff::',
			family: 'IPv6',
			mac: '00:00:00:00:00:00',
			internal: false,
			cidr: 'fe80::20ae:1de4:db23:d05d/64',
			scopeid: 24,
		},
	],
};

test('Port config on Docker with IPv6 support', () => {
	const hostToBind = getHostToBind(
		flattenNetworkInterfaces(dockerInterfaces),
		false,
	);
	expect(hostToBind).toBe('::');
});

test('Port config on Docker with no loopback address', () => {
	const hostToBind = getHostsToTry(flattenNetworkInterfaces(dockerInterfaces));
	expect(hostToBind).toEqual(['127.0.0.1', '::', '0.0.0.0']);
});

test('Port config on M1 Mac', () => {
	const hostToBind = getHostToBind(
		flattenNetworkInterfaces(macOsM1Interfaces),
		false,
	);
	expect(hostToBind).toBe('::');
});

test('Port config on M1 Mac', () => {
	const hostToBind = getHostsToTry(flattenNetworkInterfaces(macOsM1Interfaces));
	expect(hostToBind).toEqual(['::1', '127.0.0.1', '::', '0.0.0.0']);
});
