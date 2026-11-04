import {EventEmitter} from 'node:events';

if (
	/^AWS_Lambda_nodejs(?:18|20|24)[.]x$/.test(
		process.env.AWS_EXECUTION_ENV ?? '',
	) === true
) {
	process.env.FONTCONFIG_PATH = '/opt';
	process.env.FONTCONFIG_FILE = '/opt/fonts.conf';

	process.env.DISABLE_FROM_SURFACE = '1';
	process.env.NO_COLOR = '1';

	// @ts-expect-error
	globalThis._dumpUnreleasedBuffers = new EventEmitter();

	// @ts-expect-error
	(globalThis._dumpUnreleasedBuffers as EventEmitter).setMaxListeners(201);
}
