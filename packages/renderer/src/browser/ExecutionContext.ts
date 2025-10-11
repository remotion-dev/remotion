/* eslint-disable no-new-func */
/* eslint-disable no-new */
/**
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type {CDPSession} from './Connection';
import type {
	CallArgument,
	EvaluateResponse,
	ExecutionContextDescription,
} from './devtools-types';
import type {DOMWorld} from './DOMWorld';
import type {EvaluateHandleFn, SerializableOrJSHandle} from './EvalTypes';
import type {Frame} from './FrameManager';
import type {ElementHandle} from './JSHandle';
import {_createJSHandle, JSHandle} from './JSHandle';
import {getExceptionMessage, isString, valueFromRemoteObject} from './util';

export const EVALUATION_SCRIPT_URL = 'pptr://__puppeteer_evaluation_script__';
const SOURCE_URL_REGEX = /^[\x20\t]*\/\/[@#] sourceURL=\s*(\S*?)\s*$/m;

export class ExecutionContext {
	_client: CDPSession;
	_world: DOMWorld;
	_contextId: number;
	_contextName: string;

	constructor(
		client: CDPSession,
		contextPayload: ExecutionContextDescription,
		world: DOMWorld,
	) {
		this._client = client;
		this._world = world;
		this._contextId = contextPayload.id;
		this._contextName = contextPayload.name;
	}

	frame(): Frame | null {
		return this._world ? this._world.frame() : null;
	}

	evaluate<ReturnType>(
		pageFunction: Function | string,
		...args: unknown[]
	): Promise<ReturnType> {
		return this.#evaluate<ReturnType>(true, pageFunction, ...args);
	}

	evaluateHandle<HandleType extends JSHandle | ElementHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandleType> {
		return this.#evaluate<HandleType>(false, pageFunction, ...args);
	}

	async #evaluate<ReturnType>(
		returnByValue: boolean,
		pageFunction: Function | string,
		...args: unknown[]
	): Promise<ReturnType> {
		const suffix = `//# sourceURL=${EVALUATION_SCRIPT_URL}`;

		if (isString(pageFunction)) {
			const contextId = this._contextId;
			const expression = pageFunction;
			const expressionWithSourceUrl = SOURCE_URL_REGEX.test(expression)
				? expression
				: expression + '\n' + suffix;

			const {
				value: {exceptionDetails: _details, result: _remoteObject},
			} = await this._client
				.send('Runtime.evaluate', {
					expression: expressionWithSourceUrl,
					contextId,
					returnByValue,
					awaitPromise: true,
					userGesture: true,
				})
				.catch(rewriteError);

			if (_details) {
				throw new Error('Evaluation failed: ' + getExceptionMessage(_details));
			}

			return returnByValue
				? valueFromRemoteObject(_remoteObject)
				: (_createJSHandle(this, _remoteObject) as ReturnType);
		}

		if (typeof pageFunction !== 'function') {
			throw new Error(
				`Expected to get |string| or |function| as the first argument, but got "${pageFunction}" instead.`,
			);
		}

		let functionText = pageFunction.toString();
		try {
			new Function('(' + functionText + ')');
		} catch (error) {
			// This means we might have a function shorthand. Try another
			// time prefixing 'function '.
			if (functionText.startsWith('async ')) {
				functionText =
					'async function ' + functionText.substring('async '.length);
			} else {
				functionText = 'function ' + functionText;
			}

			try {
				new Function('(' + functionText + ')');
			} catch (_error) {
				// We tried hard to serialize, but there's a weird beast here.
				throw new Error('Passed function is not well-serializable!');
			}
		}

		let callFunctionOnPromise;
		try {
			callFunctionOnPromise = this._client.send('Runtime.callFunctionOn', {
				functionDeclaration: functionText + '\n' + suffix + '\n',
				executionContextId: this._contextId,
				arguments: args.map(convertArgument.bind(this)),
				returnByValue,
				awaitPromise: true,
				userGesture: true,
			});
		} catch (error) {
			if (
				error instanceof TypeError &&
				error.message.startsWith('Converting circular structure to JSON')
			) {
				error.message += ' Recursive objects are not allowed.';
			}

			throw error;
		}

		const {
			value: {exceptionDetails, result: remoteObject},
		} = await callFunctionOnPromise.catch(rewriteError);
		if (exceptionDetails) {
			throw new Error(
				'Evaluation failed: ' + getExceptionMessage(exceptionDetails),
			);
		}

		return returnByValue
			? valueFromRemoteObject(remoteObject)
			: (_createJSHandle(this, remoteObject) as ReturnType);

		function convertArgument(
			this: ExecutionContext,
			arg: unknown,
		): CallArgument {
			if (typeof arg === 'bigint') {
				// eslint-disable-line valid-typeof
				return {unserializableValue: `${arg.toString()}n`};
			}

			if (Object.is(arg, -0)) {
				return {unserializableValue: '-0'};
			}

			if (Object.is(arg, Infinity)) {
				return {unserializableValue: 'Infinity'};
			}

			if (Object.is(arg, -Infinity)) {
				return {unserializableValue: '-Infinity'};
			}

			if (Object.is(arg, NaN)) {
				return {unserializableValue: 'NaN'};
			}

			const objectHandle = arg && arg instanceof JSHandle ? arg : null;
			if (objectHandle) {
				if (objectHandle._context !== this) {
					throw new Error(
						'JSHandles can be evaluated only in the context they were created!',
					);
				}

				if (objectHandle._disposed) {
					throw new Error('JSHandle is disposed!');
				}

				if (objectHandle._remoteObject.unserializableValue) {
					return {
						unserializableValue: objectHandle._remoteObject.unserializableValue,
					};
				}

				if (!objectHandle._remoteObject.objectId) {
					return {value: objectHandle._remoteObject.value};
				}

				return {objectId: objectHandle._remoteObject.objectId};
			}

			return {value: arg};
		}

		function rewriteError(error: Error): {value: EvaluateResponse; size: 1} {
			if (error.message.includes('Object reference chain is too long')) {
				return {value: {result: {type: 'undefined'}}, size: 1};
			}

			if (error.message.includes("Object couldn't be returned by value")) {
				return {value: {result: {type: 'undefined'}}, size: 1};
			}

			if (
				error.message.endsWith('Cannot find context with specified id') ||
				error.message.endsWith('Inspected target navigated or closed')
			) {
				throw new Error(
					'Execution context was destroyed, most likely because of a navigation.',
				);
			}

			throw error;
		}
	}
}
