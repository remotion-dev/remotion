import {expect, test} from 'bun:test';
import {readFileSync} from 'fs';
import path from 'path';
import {SYSTEM_PROMPT} from '../helpers/system-prompt';

const normalizeLineEndings = (text: string) => {
	return text.replaceAll('\r\n', '\n').replaceAll('\r', '\n');
};

test('SYSTEM_PROMPT is generated from llms.txt', () => {
	const llms = readFileSync(
		path.join(__dirname, '..', '..', 'static', 'llms.txt'),
		'utf8',
	);

	expect(normalizeLineEndings(SYSTEM_PROMPT)).toBe(
		normalizeLineEndings(llms.trimStart()),
	);
});
