import type {LogLevel} from '@remotion/renderer';
import {RenderInternals} from '@remotion/renderer';
import {BrowserSafeApis} from '@remotion/renderer/client';
import {describe, expect, test} from 'bun:test';

const {logLevelOption} = BrowserSafeApis.options;

describe('test loglevel getter and setter', () => {
	test('default log level', () => {
		expect(logLevelOption.getValue({commandLine: {}}).value).toEqual('info');
	});
	test.each<LogLevel>(['verbose', 'warn', 'error', 'info'])(
		'test for %s',
		(loglevel) => {
			logLevelOption.setConfig(loglevel);

			expect(logLevelOption.getValue({commandLine: {}}).value).toEqual(
				loglevel,
			);
		},
	);
});

describe('loglevel comparison', () => {
	test.each<[LogLevel, LogLevel]>([
		['verbose', 'verbose'],
		['verbose', 'info'],
		['verbose', 'warn'],
		['verbose', 'error'],
		['info', 'info'],
		['info', 'warn'],
		['info', 'error'],
		['warn', 'warn'],
		['warn', 'error'],
		['error', 'error'],
	])('%s is equal or below %s', (level1, level2) => {
		logLevelOption.setConfig(level1);
		expect(
			RenderInternals.isEqualOrBelowLogLevel(
				logLevelOption.getValue({commandLine: {}}).value,
				level2,
			),
		).toEqual(true);
	});

	test.each<[LogLevel, LogLevel]>([
		['info', 'verbose'],
		['warn', 'verbose'],
		['error', 'verbose'],
		['warn', 'info'],
		['error', 'info'],
		['error', 'warn'],
	])('%s is not equal or below %s', (level1, level2) => {
		logLevelOption.setConfig(level1);
		expect(
			RenderInternals.isEqualOrBelowLogLevel(
				logLevelOption.getValue({commandLine: {}}).value,
				level2,
			),
		).toEqual(false);
	});
});
