import {afterEach, expect, test} from 'bun:test';
import {imageSequencePatternOption} from '../options/image-sequence-pattern';

afterEach(() => {
	imageSequencePatternOption.setConfig(null);
});

test('--image-sequence-pattern takes precedence over the config file', () => {
	imageSequencePatternOption.setConfig('config-[frame].[ext]');
	expect(
		imageSequencePatternOption.getValue({
			commandLine: {'image-sequence-pattern': 'cli-[frame].[ext]'},
		}),
	).toEqual({source: 'cli', value: 'cli-[frame].[ext]'});
});

test('the config file applies when the flag is not passed', () => {
	imageSequencePatternOption.setConfig('config-[frame].[ext]');
	expect(imageSequencePatternOption.getValue({commandLine: {}})).toEqual({
		source: 'config',
		value: 'config-[frame].[ext]',
	});
});

test('without the flag or the config, there is no pattern', () => {
	expect(imageSequencePatternOption.getValue({commandLine: {}})).toEqual({
		source: 'default',
		value: null,
	});
});
