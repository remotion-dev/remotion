import {expect, test} from 'bun:test';
import {parseMacOSMemorySysctl} from '../memory/from-macos-sysctl';

// Output of `sysctl -n vm.page_free_count vm.page_pageable_external_count
// vm.page_purgeable_count vm.pagesize kern.memorystatus_vm_pressure_level`
// on a 36 GB Mac at warning pressure
const output = '6010\n261233\n26\n16384\n2\n';

test('counts free, file-backed and purgeable pages', () => {
	expect(parseMacOSMemorySysctl(output)).toBe((6010 + 261233 + 26) * 16384);
});

test('falls back to os.freemem() when memory pressure is critical', () => {
	expect(parseMacOSMemorySysctl('6010\n261233\n26\n16384\n4\n')).toBe(null);
});

test('falls back to os.freemem() on unexpected output', () => {
	expect(parseMacOSMemorySysctl('')).toBe(null);
	expect(parseMacOSMemorySysctl('6010\n261233\n26\n16384\n')).toBe(null);
	expect(parseMacOSMemorySysctl('6010\nabc\n26\n16384\n2\n')).toBe(null);
	expect(parseMacOSMemorySysctl('6010\n261233\n26\n0\n2\n')).toBe(null);
});
