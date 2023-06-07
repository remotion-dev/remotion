import {expect, test} from 'vitest';
import {
	parseBrowserLogMessage,
	parseChromeLogLocation,
} from '../browser/should-log-message';

test('parse console.log message', () => {
	const parsed = parseBrowserLogMessage(
		'[0607/114013.146404:INFO:CONSOLE(83116)] "hi thereyo!", source: http://localhost:3000/bundle.js (83116)'
	);
	expect(parsed).toEqual({
		day: 6,
		month: 7,
		hour: 11,
		minute: 40,
		seconds: 13,
		microseconds: 146404,
		level: 'INFO',
		location: 'CONSOLE',
		lineNumber: 83116,
		message: '"hi thereyo!", source: http://localhost:3000/bundle.js (83116)',
	});

	const location = parseChromeLogLocation(parsed?.message ?? '');
	expect(location).toEqual({
		lineNumber: 83116,
		location: 'http://localhost:3000/bundle.js',
	});
});

test('Parse warning from chrome', () => {
	const parsed = parseBrowserLogMessage(
		`[0607/113133.950095:ERROR:command_buffer_proxy_impl.cc(128)] ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.`
	);

	expect(parsed).toEqual({
		day: 6,
		month: 7,
		hour: 11,
		minute: 31,
		seconds: 33,
		microseconds: 950095,
		level: 'ERROR',
		lineNumber: 128,
		location: 'command_buffer_proxy_impl.cc',
		message:
			'ContextResult::kTransientFailure: Failed to send GpuControl.CreateCommandBuffer.',
	});
});
