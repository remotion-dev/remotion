import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {ReadableStream} from 'node:stream/web';

const {installWhisperCpp} = createRequire(import.meta.url)(process.argv[2]);
const zip = readFileSync(process.argv[3]);
const to = process.argv[4];

globalThis.fetch = () =>
	Promise.resolve({
		headers: new Map([['content-length', String(zip.length)]]),
		body: new ReadableStream({
			start(controller) {
				controller.enqueue(zip);
				controller.close();
			},
		}),
	});

assert.deepEqual(await installWhisperCpp({to, version: '1.5.5'}), {
	alreadyExisted: false,
});
assert.deepEqual(await installWhisperCpp({to, version: '1.5.5'}), {
	alreadyExisted: true,
});
