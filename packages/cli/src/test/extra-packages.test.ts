import {expect, test} from 'bun:test';
import {extraPackages} from '@remotion/studio-shared';
import {EXTRA_PACKAGES, EXTRA_PACKAGES_DOCS} from '../extra-packages';

test('uses the shared recommended versions for auxiliary packages', () => {
	for (const {name, version, versionDocsUrl} of extraPackages) {
		expect(EXTRA_PACKAGES[name]).toBe(version);
		expect(EXTRA_PACKAGES_DOCS[name]).toBe(versionDocsUrl);
	}

	expect(EXTRA_PACKAGES['@huggingface/transformers']).toBe('4.2.0');
});
