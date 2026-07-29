import {afterEach, expect, test} from 'bun:test';
import {parseCommandLine} from '../parse-command-line';
import {parsedCli} from '../parsed-cli';

afterEach(() => {
	Reflect.deleteProperty(parsedCli, 'experimental-rspack');
});

test('the --experimental-rspack flag is rejected in favor of --rspack', () => {
	parsedCli['experimental-rspack'] = true;

	expect(() => parseCommandLine()).toThrow(
		'The --experimental-rspack flag has been removed. Use --rspack from now on.',
	);
});
