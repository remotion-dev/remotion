/* eslint-disable no-new */
import type {Page} from './browser/BrowserPage';
import type {
	CallArgument,
	CallFunctionOnResponse,
	DevtoolsRemoteObject,
} from './browser/devtools-types';
import {JSHandle} from './browser/JSHandle';
import {SymbolicateableError} from './error-handling/symbolicateable-error';
import {parseStack} from './parse-browser-error-stack';

const EVALUATION_SCRIPT_URL = '__puppeteer_evaluation_script__';
const SOURCE_URL_REGEX = /^[\040\t]*\/\/[@#] sourceURL=\s*(\S*?)\s*$/m;

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
						remoteObject.unserializableValue
				);
		}
	}

	return remoteObject.value;
}

function isString(obj: unknown): obj is string {
	return typeof obj === 'string' || obj instanceof String;
}

export async function puppeteerEvaluateWithCatch<ReturnType>({
	page,
	pageFunction,
	frame,
	args,
}: {
	page: Page;
	pageFunction: Function | string;
	frame: number | null;
	args: unknown[];
}): Promise<ReturnType> {
	const contextId = (await page.mainFrame().executionContext())._contextId;
	const client = page._client();

	const suffix = `//# sourceURL=${EVALUATION_SCRIPT_URL}`;

	if (isString(pageFunction)) {
		const expression = pageFunction;
		const expressionWithSourceUrl = SOURCE_URL_REGEX.test(expression)
			? expression
			: expression + '\n' + suffix;

		const {exceptionDetails: exceptDetails, result: remotObject} =
			(await client.send('Runtime.evaluate', {
				expression: expressionWithSourceUrl,
				contextId,
				returnByValue: true,
				awaitPromise: true,
				userGesture: true,
			})) as CallFunctionOnResponse;

		if (exceptDetails?.exception) {
			const err = new SymbolicateableError({
				stack: exceptDetails.exception.description as string,
				name: exceptDetails.exception.className as string,
				message: exceptDetails.exception.description?.split(
					'\n'
				)?.[0] as string,
				frame,
				stackFrame: parseStack(
					(exceptDetails.exception.description as string).split('\n')
				),
			});
			throw err;
		}

		return valueFromRemoteObject(remotObject);
	}

	if (typeof pageFunction !== 'function')
		throw new Error(
			`Expected to get |string| or |function| as the first argument, but got "${pageFunction}" instead.`
		);

	let functionText = pageFunction.toString();
	try {
		// eslint-disable-next-line no-new-func
		new Function('(' + functionText + ')');
	} catch (error) {
		// This means we might have a function shorthand. Try another
		// time prefixing 'function '.
		if (functionText.startsWith('async '))
			functionText =
				'async function ' + functionText.substring('async '.length);
		else functionText = 'function ' + functionText;
		try {
			// eslint-disable-next-line no-new-func
			new Function('(' + functionText + ')');
		} catch (err) {
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
		)
			error.message += ' Are you passing a nested JSHandle?';
		throw error;
	}

	try {
		const {exceptionDetails, result: remoteObject} =
			await callFunctionOnPromise;

		if (exceptionDetails) {
			const err = new SymbolicateableError({
				stack: exceptionDetails.exception?.description as string,
				name: exceptionDetails.exception?.className as string,
				message: exceptionDetails.exception?.description?.split(
					'\n'
				)[0] as string,
				frame,
				stackFrame: parseStack(
					(exceptionDetails.exception?.description as string).split('\n')
				),
			});
			throw err;
		}

		return valueFromRemoteObject(remoteObject);
	} catch (error) {
		if (
			(error as {originalMessage: string})?.originalMessage?.startsWith(
				"Object couldn't be returned by value"
			)
		) {
			throw new Error(
				'Could not serialize the return value of the function. Did you pass non-serializable values to defaultProps?'
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
		// eslint-disable-line valid-typeof
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
