import {expect, test} from 'bun:test';
import {convertTools, getActiveConvertTool} from '../app/lib/convert-tools';

test('lists every public Remotion Convert tool in the tool directory', () => {
	expect(convertTools.map((tool) => tool.href)).toEqual([
		'/convert',
		'/trim',
		'/crop',
		'/resize',
		'/rotate',
		'/mirror',
		'/probe',
		'/transcribe',
	]);
});

test('marks generic and format-specific tool routes as active', () => {
	expect(getActiveConvertTool({type: 'generic-convert'})).toBe('convert');
	expect(
		getActiveConvertTool({type: 'convert', input: 'mp4', output: 'webm'}),
	).toBe('convert');
	expect(getActiveConvertTool({type: 'generic-trim'})).toBe('trim');
	expect(getActiveConvertTool({type: 'trim-format', format: 'mp4'})).toBe(
		'trim',
	);
	expect(getActiveConvertTool({type: 'generic-crop'})).toBe('crop');
	expect(getActiveConvertTool({type: 'crop-format', format: 'mov'})).toBe(
		'crop',
	);
	expect(getActiveConvertTool({type: 'generic-resize'})).toBe('resize');
	expect(getActiveConvertTool({type: 'resize-format', format: 'mp3'})).toBe(
		'resize',
	);
	expect(getActiveConvertTool({type: 'generic-rotate'})).toBe('rotate');
	expect(getActiveConvertTool({type: 'rotate-format', format: 'webm'})).toBe(
		'rotate',
	);
	expect(getActiveConvertTool({type: 'generic-mirror'})).toBe('mirror');
	expect(getActiveConvertTool({type: 'mirror-format', format: 'mkv'})).toBe(
		'mirror',
	);
	expect(getActiveConvertTool({type: 'generic-probe'})).toBe('probe');
	expect(getActiveConvertTool({type: 'transcribe'})).toBe('transcribe');
});

test('does not mark utility routes as active tools', () => {
	expect(getActiveConvertTool({type: 'report'})).toBe(null);
	expect(getActiveConvertTool({type: 'timing-editor'})).toBe(null);
});
