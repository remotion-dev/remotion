function FormatStackTrace(error: Error, frames: NodeJS.CallSite[]) {
	const lines = [];
	try {
		lines.push(error.toString());
	} catch (e) {
		try {
			lines.push('<error: ' + e + '>');
		} catch {
			lines.push('<error>');
		}
	}

	for (let i = 0; i < frames.length; i++) {
		const frame = frames[i];
		let line;
		try {
			line = frame.toString();
		} catch (e) {
			try {
				line = '<error: ' + e + '>';
			} catch {
				// Any code that reaches this point is seriously nasty!
				line = '<error>';
			}
		}

		lines.push('    at ' + line);
	}

	return lines.join('\n');
}

export const stackback = (error: Error): NodeJS.CallSite[] => {
	// save original stacktrace
	const save = Error.prepareStackTrace;

	// replace capture with our function
	Error.prepareStackTrace = function (err, trace) {
		// cache stack frames so we don't have to get them again
		// use a non-enumerable property
		Object.defineProperty(err, '_sb_callsites', {
			value: trace,
		});

		return (save || FormatStackTrace)(err, trace);
	};

	// force capture of the stack frames
	// eslint-disable-next-line no-unused-expressions
	error.stack;

	// someone already asked for the stack so we can't do this trick
	if (!error._sb_callsites) {
		return [];
	}

	// return original capture function
	Error.prepareStackTrace = save;

	return error._sb_callsites as NodeJS.CallSite[];
};

declare global {
	interface Error {
		_sb_callsites: NodeJS.CallSite[];
	}
}
