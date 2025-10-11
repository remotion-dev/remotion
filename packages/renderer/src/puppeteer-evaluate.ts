/* eslint-disable no-new */
import type {Page} from './browser/BrowserPage';
import type {
	CallArgument,
	DevtoolsRemoteObject,
} from './browser/devtools-types';
import {JSHandle} from './browser/JSHandle';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {parseStack} from './parse-browser-error-stack';

const EVALUATION_SCRIPT_URL = '__puppeteer_evaluation_script__';

function valueFromRemoteObject(remoteObject: DevtoolsRemoteObject) {
	if (remoteObject.unserializableValue) {
		if (remoteObject.type === 'bigint' && typeof BigInt !== 'undefined')
			return BigInt(remoteObject.unserializableValue.replace('n', ''));
		switch (remoteObject.unserializableValue) {
			case '-0':
				return -0;
			case 'NaN':
				return NaN;
			case 'Infinity':
				return Infinity;
			case '-Infinity':
				return -Infinity;
			default:
				throw new Error(
					'Unsupported unserializable value: ' +
						remoteObject.unserializableValue,
				);
		}
	}

	return remoteObject.value;
}

type PuppeteerCatchOptions = {
	page: Page;
	pageFunction: Function;
	frame: number | null;
	args: unknown[];
	timeoutInMilliseconds: number;
};

export function puppeteerEvaluateWithCatchAndTimeout<ReturnType>({
	args,
	frame,
	page,
	pageFunction,
	timeoutInMilliseconds,
}: PuppeteerCatchOptions): Promise<{value: ReturnType; size: number}> {
	let timeout: Timer | null = null;
	return Promise.race([
		new Promise<{value: ReturnType; size: number}>((_, reject) => {
			timeout = setTimeout(() => {
				reject(
					new Error(
						// This means the page is not responding anymore
						// This error message is retryable - sync it with packages/lambda/src/shared/is-flaky-error.ts
						`Timed out evaluating page function "${pageFunction.toString()}"`,
					),
				);
			}, timeoutInMilliseconds);
		}),
		puppeteerEvaluateWithCatch<ReturnType>({
			args,
			frame,
			page,
			pageFunction,
			timeoutInMilliseconds,
		}),
	]).then((data) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		return data;
	});
}

export async function puppeteerEvaluateWithCatch<ReturnType>({
	page,
	pageFunction,
	frame,
	args,
}: PuppeteerCatchOptions): Promise<{value: ReturnType; size: number}> {
	const contextId = (await page.mainFrame().executionContext())._contextId;
	const client = page._client();

	const suffix = `//# sourceURL=${EVALUATION_SCRIPT_URL}`;

	if (typeof pageFunction !== 'function')
		throw new Error(
			`Expected to get |string| or |function| as the first argument, but got "${pageFunction}" instead.`,
		);

	let functionText = pageFunction.toString();
	try {
		// eslint-disable-next-line no-new-func
		new Function('(' + functionText + ')');
	} catch {
		// This means we might have a function shorthand. Try another
		// time prefixing 'function '.
		if (functionText.startsWith('async '))
			functionText =
				'async function ' + functionText.substring('async '.length);
		else functionText = 'function ' + functionText;
		try {
			// eslint-disable-next-line no-new-func
			new Function('(' + functionText + ')');
		} catch {
			// We tried hard to serialize, but there's a weird beast here.
			throw new Error('Passed function is not well-serializable!');
		}
	}

	let callFunctionOnPromise;
	try {
		callFunctionOnPromise = client.send('Runtime.callFunctionOn', {
			functionDeclaration: functionText + '\n' + suffix + '\n',
			executionContextId: contextId,
			arguments: args.map((a) => convertArgument(a) as CallArgument),
			returnByValue: true,
			awaitPromise: true,
			userGesture: true,
		});
	} catch (error) {
		if (
			error instanceof TypeError &&
			error.message.startsWith('Converting circular structure to JSON')
		) {
			error.message += ' Are you passing a nested JSHandle?';
		}

		throw error;
	}

	try {
		const {
			value: {exceptionDetails, result: remoteObject},
			size,
		} = await callFunctionOnPromise;

		if (exceptionDetails) {
			const err = new SymbolicateableError({
				stack: exceptionDetails.exception?.description as string,
				name: exceptionDetails.exception?.className as string,
				message: exceptionDetails.exception?.description?.split(
					'\n',
				)[0] as string,
				frame,
				stackFrame: parseStack(
					(exceptionDetails.exception?.description as string).split('\n'),
				),
				chunk: null,
			});
			page.close();
			throw err;
		}

		return {size, value: valueFromRemoteObject(remoteObject)};
	} catch (error) {
		if (
			(error as {originalMessage: string})?.originalMessage?.startsWith(
				"Object couldn't be returned by value",
			)
		) {
			throw new Error(
				'Could not serialize the return value of the function. Did you pass non-serializable values to defaultProps?',
			);
		}

		throw error;
	}
}

/**
 * @param {*} arg
 * @returns {*}
 * @this {ExecutionContext}
 */
function convertArgument(arg: unknown): unknown {
	if (typeof arg === 'number') {
		return {value: arg};
	}

	if (typeof arg === 'string') {
		return {value: arg};
	}

	if (typeof arg === 'boolean') {
		return {value: arg};
	}

	if (typeof arg === 'bigint')
		return {unserializableValue: `${arg.toString()}n`};
	if (Object.is(arg, -0)) return {unserializableValue: '-0'};
	if (Object.is(arg, Infinity)) return {unserializableValue: 'Infinity'};
	if (Object.is(arg, -Infinity)) return {unserializableValue: '-Infinity'};
	if (Object.is(arg, NaN)) return {unserializableValue: 'NaN'};
	const objectHandle = arg && arg instanceof JSHandle ? arg : null;
	if (objectHandle) {
		if (objectHandle._disposed) throw new Error('JSHandle is disposed!');
		if (objectHandle._remoteObject.unserializableValue)
			return {
				unserializableValue: objectHandle._remoteObject.unserializableValue,
			};
		if (!objectHandle._remoteObject.objectId)
			return {value: objectHandle._remoteObject.value};
		return {objectId: objectHandle._remoteObject.objectId};
	}

	return {value: arg};
}
