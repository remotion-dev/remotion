import {expect, test} from 'bun:test';
import {getPackageManagerSpawnOptions} from '../package-manager-spawn';

test('Windows npm/yarn/pnpm need shell so .cmd shims can launch', () => {
	expect(getPackageManagerSpawnOptions('npm', 'win32')).toEqual({
		shell: true,
		windowsHide: true,
	});
	expect(getPackageManagerSpawnOptions('yarn', 'win32')).toEqual({
		shell: true,
		windowsHide: true,
	});
	expect(getPackageManagerSpawnOptions('pnpm', 'win32')).toEqual({
		shell: true,
		windowsHide: true,
	});
});

test('Windows bun is an .exe and only needs windowsHide', () => {
	expect(getPackageManagerSpawnOptions('bun', 'win32')).toEqual({
		windowsHide: true,
	});
});

test('non-Windows package managers keep default spawn options', () => {
	expect(getPackageManagerSpawnOptions('npm', 'linux')).toEqual({});
	expect(getPackageManagerSpawnOptions('pnpm', 'darwin')).toEqual({});
	expect(getPackageManagerSpawnOptions('bun', 'linux')).toEqual({});
});
