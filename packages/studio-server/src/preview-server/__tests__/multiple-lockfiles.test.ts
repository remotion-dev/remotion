import {afterEach, beforeEach, describe, expect, test} from 'bun:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {getPackageManager} from '../get-package-manager';

describe('getPackageManager multiple lockfiles', () => {
	let tempDir: string;

	beforeEach(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'remotion-test-'));
	});

	afterEach(() => {
		fs.rmSync(tempDir, {recursive: true, force: true});
	});

	test('should not throw error when multiple lockfiles are detected', () => {
		fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '{}');
		fs.writeFileSync(path.join(tempDir, 'bun.lock'), '');

		// Should not throw
		const manager = getPackageManager(tempDir, undefined, 0);

		// Should return one of them (usually the first one in the list, which is npm)
		expect(manager).not.toBe('unknown');
		if (typeof manager !== 'string') {
			expect(['npm', 'bun']).toContain(manager.manager);
		}
	});

	test('should return npm if only package-lock.json exists', () => {
		fs.writeFileSync(path.join(tempDir, 'package-lock.json'), '{}');
		const manager = getPackageManager(tempDir, undefined, 0);
		if (typeof manager !== 'string') {
			expect(manager.manager).toBe('npm');
		}
	});
});
