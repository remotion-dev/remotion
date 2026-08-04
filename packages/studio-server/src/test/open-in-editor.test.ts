import {expect, test} from 'bun:test';
import {findMacOsEditorsFromProcessOutput} from '../helpers/open-in-editor';
import {findSearchPosition} from '../preview-server/routes/find-in-file';

test('detects current VS Code macOS processes', () => {
	const process =
		'/Applications/Visual Studio Code.app/Contents/MacOS/Code --open-url';

	expect(findMacOsEditorsFromProcessOutput(process)).toContainEqual({
		command: 'code',
		process: '/Applications/Visual Studio Code.app/Contents/MacOS/Code',
	});
});

test('finds a property after the component location', () => {
	const contents = [
		'const MyComp = () => (',
		'\t<Sequence',
		'\t\tstyle={{',
		'\t\t\topacity: 0.5,',
		'\t\t}}',
		'\t/>',
		');',
	].join('\n');

	expect(
		findSearchPosition({
			contents,
			lineNumber: 2,
			columnNumber: 2,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 4, columnNumber: 4});
});

test('starts searching at the source column', () => {
	const contents = 'opacity: 1; <Sequence opacity={0.5} />';

	expect(
		findSearchPosition({
			contents,
			lineNumber: 1,
			columnNumber: 13,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 1, columnNumber: 23});
});

test('keeps the component location if the property is not found', () => {
	expect(
		findSearchPosition({
			contents: '<Sequence />',
			lineNumber: 1,
			columnNumber: 2,
			search: 'opacity',
		}),
	).toEqual({lineNumber: 1, columnNumber: 2});
});
