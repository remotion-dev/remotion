const regexValidFrame_Chrome = /^\s*(at|in)\s.+(:\d+)/;
const regexValidFrame_FireFox =
	/(^|@)\S+:\d+|.+line\s+\d+\s+>\s+(eval|Function).+/;

export type UnsymbolicatedStackFrame = {
	functionName: string | null;
	fileName: string;
	lineNumber: number;
	columnNumber: number;
};

const regexExtractLocation = /\(?(.+?)(?::(\d+))?(?::(\d+))?\)?$/;

function extractLocation(token: string): [string, number, number] {
	const execed = regexExtractLocation.exec(token);
	if (!execed) {
		throw new Error('Could not match in extractLocation');
	}

	return execed.slice(1).map((v) => {
		const p = Number(v);
		if (!isNaN(p)) {
			return p;
		}

		return v;
	}) as [string, number, number];
}

const makeStackFrame = ({
	functionName,
	fileName,
	lineNumber,
	columnNumber,
}: {
	functionName: string | null;
	fileName: string;
	lineNumber: number;
	columnNumber: number;
}): UnsymbolicatedStackFrame => {
	if (functionName && functionName.indexOf('Object.') === 0) {
		functionName = functionName.slice('Object.'.length);
	}

	if (
		// Chrome has a bug with inferring function.name:
		// https://github.com/facebook/create-react-app/issues/2097
		// Let's ignore a meaningless name we get for top-level modules.
		functionName === 'friendlySyntaxErrorLabel' ||
		functionName === 'exports.__esModule' ||
		functionName === '<anonymous>' ||
		!functionName
	) {
		functionName = null;
	}

	return {
		columnNumber,
		fileName,
		functionName,
		lineNumber,
	};
};

export const parseStack = (stack: string[]): UnsymbolicatedStackFrame[] => {
	const frames = stack
		.filter(
			(e) => regexValidFrame_Chrome.test(e) || regexValidFrame_FireFox.test(e),
		)
		.map((e) => {
			if (regexValidFrame_FireFox.test(e)) {
				// Strip eval, we don't care about it
				let isEval = false;
				if (/ > (eval|Function)/.test(e)) {
					e = e.replace(
						/ line (\d+)(?: > eval line \d+)* > (eval|Function):\d+:\d+/g,
						':$1',
					);
					isEval = true;
				}

				const _data = e.split(/[@]/g);
				const _last = _data.pop();
				if (!_last) {
					throw new Error('could not get last');
				}

				const [_fileName, _lineNumber, _columnNumber] = extractLocation(_last);
				return makeStackFrame({
					functionName: _data.join('@') || (isEval ? 'eval' : null),
					fileName: _fileName,
					lineNumber: _lineNumber,
					columnNumber: _columnNumber,
				});
			}

			// Strip eval, we don't care about it
			if (e.indexOf('(eval ') !== -1) {
				e = e.replace(/(\(eval at [^()]*)|(\),.*$)/g, '');
			}

			if (e.indexOf('(at ') !== -1) {
				e = e.replace(/\(at /, '(');
			}

			const data = e.trim().split(/\s+/g).slice(1);
			const last = data.pop();
			if (!last) {
				throw new Error('could not get last');
			}

			const [fileName, lineNumber, columnNumber] = extractLocation(last);
			return makeStackFrame({
				functionName: data.join(' ') || null,
				fileName,
				lineNumber,
				columnNumber,
			});
		});
	return frames;
};
