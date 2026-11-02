import {afterEach, expect, spyOn, test} from 'bun:test';
import {mkdtempSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {getInputProps} from '../get-input-props';
import {parsedCli} from '../parsed-cli';

let temporaryDirectory: string | null = null;

afterEach(() => {
	Reflect.deleteProperty(parsedCli, 'props');
	if (temporaryDirectory) {
		rmSync(temporaryDirectory, {recursive: true, force: true});
		temporaryDirectory = null;
	}
});

test('--props reads a JSON file that starts with a UTF-8 BOM', () => {
	temporaryDirectory = mkdtempSync(path.join(tmpdir(), 'remotion-props-'));
	const propsFile = path.join(temporaryDirectory, 'props.json');
	writeFileSync(propsFile, '\uFEFF{"title": "Hello"}');
	parsedCli.props = propsFile;
	const exit = spyOn(process, 'exit').mockImplementation((code) => {
		throw new Error(`process.exit(${code})`);
	});

	try {
		expect(getInputProps(null, 'error')).toEqual({title: 'Hello'});
	} finally {
		exit.mockRestore();
	}
});
