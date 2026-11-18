const {openBrowser} = require('../../../dist/index.js');

const [mode, signal] = process.argv.slice(2);

const main = async () => {
	let browser = null;
	const onSignal = async () => {
		await browser.close({silent: true});
		process.stdout.write('browser closed\n');
		process.exit(42);
	};

	if (mode === 'once') {
		process.once(signal, onSignal);
	}

	browser = await openBrowser('chrome', {logLevel: 'error'});

	if (mode === 'prepend-once') {
		process.prependOnceListener(signal, onSignal);
	}

	const {value} = await browser.runner.connection.send(
		'SystemInfo.getProcessInfo',
	);
	const chrome = value.processInfo.find((p) => p.type === 'browser');
	setInterval(() => undefined, 60_000);
	process.stdout.write(`ready ${chrome.id}\n`);
};

main();
