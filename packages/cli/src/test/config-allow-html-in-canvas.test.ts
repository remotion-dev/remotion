import {expect, spyOn, test} from 'bun:test';
import {Config} from '../config';
import {Log} from '../log';

test('setAllowHtmlInCanvasEnabled() is a deprecated no-op', () => {
	const warn = spyOn(Log, 'warn').mockImplementation(() => undefined);

	try {
		Config.setAllowHtmlInCanvasEnabled(false);

		expect(warn).toHaveBeenCalledTimes(1);
		expect(warn.mock.calls[0]?.[1]).toBe(
			'Config.setAllowHtmlInCanvasEnabled() is now a no-op because HTML-in-canvas is enabled by default when supported. You can remove this option from your config file.',
		);
	} finally {
		warn.mockRestore();
	}
});
