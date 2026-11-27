import {expect, test} from 'bun:test';
import {join} from 'node:path';

for (const hasOwner of [false, true]) {
	test(`unsupported HtmlInCanvas throws during SSR and ${hasOwner ? 'notifies its owner' : 'records renderer cancellation'}`, () => {
		// Capability checks are cached across the existing supported-browser tests.
		// A fresh Bun process exercises real SSR without sharing that module cache.
		const result = Bun.spawnSync([
			process.execPath,
			join(__dirname, 'fixtures/html-in-canvas-unsupported-ssr.tsx'),
			hasOwner ? 'owner' : 'renderer',
		]);
		expect(result.exitCode).toBe(0);
		const facts = JSON.parse(new TextDecoder().decode(result.stdout));
		expect(facts.isError).toBe(true);
		expect(facts.message).toContain(
			'HTML in Canvas is unavailable because there is no browser document',
		);
		expect(facts.reportedMatches).toBe(true);
		expect(facts.scopeErrorMatches).toBe(true);
		expect(facts.scopeStackMatches).toBe(true);
		expect(facts.handles).toEqual([]);
	});
}
