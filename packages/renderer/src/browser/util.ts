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

import {assert} from './assert';
import type {HeadlessBrowser} from './Browser';
import {BrowserEmittedEvents} from './Browser';
import type {CDPSession} from './Connection';
import type {DevtoolsRemoteObject, ExceptionDetails} from './devtools-types';
import {TimeoutError} from './Errors';
import type {CommonEventEmitter} from './EventEmitter';

export function getExceptionMessage(
	exceptionDetails: ExceptionDetails
): string {
	if (exceptionDetails.exception) {
		return (
			exceptionDetails.exception.description || exceptionDetails.exception.value
		);
	}

	let message = exceptionDetails.text;
	if (exceptionDetails.stackTrace) {
		for (const callframe of exceptionDetails.stackTrace.callFrames) {
			const location =
				callframe.url +
				':' +
				callframe.lineNumber +
				':' +
				callframe.columnNumber;
			const functionName = callframe.functionName || '<anonymous>';
			message += `\n    at ${functionName} (${location})`;
		}
	}

	return message;
}

export function valueFromRemoteObject(remoteObject: DevtoolsRemoteObject) {
	assert(!remoteObject.objectId, 'Cannot extract value when objectId is given');
	if (remoteObject.unserializableValue) {
		if (remoteObject.type === 'bigint' && typeof BigInt !== 'undefined') {
			return BigInt(remoteObject.unserializableValue.replace('n', ''));
		}

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

export async function releaseObject(
	client: CDPSession,
	remoteObject: DevtoolsRemoteObject
): Promise<void> {
	if (!remoteObject.objectId) {
		return;
	}

	await client
		.send('Runtime.releaseObject', {objectId: remoteObject.objectId})
		.catch(() => {
			// Exceptions might happen in case of a page been navigated or closed.
			// Swallow these since they are harmless and we don't leak anything in this case.
		});
}

export interface PuppeteerEventListener {
	emitter: CommonEventEmitter;
	eventName: string | symbol;
	handler: (...args: any[]) => void;
}

export function addEventListener(
	emitter: CommonEventEmitter,
	eventName: string | symbol,
	handler: (...args: any[]) => void
): PuppeteerEventListener {
	emitter.on(eventName, handler);
	return {emitter, eventName, handler};
}

export function removeEventListeners(
	listeners: Array<{
		emitter: CommonEventEmitter;
		eventName: string | symbol;
		handler: (...args: any[]) => void;
	}>
): void {
	for (const listener of listeners) {
		listener.emitter.off(listener.eventName, listener.handler);
	}

	listeners.length = 0;
}

export const isString = (obj: unknown): obj is string => {
	return typeof obj === 'string' || obj instanceof String;
};

export function evaluationString(
	fun: Function | string,
	...args: unknown[]
): string {
	if (isString(fun)) {
		assert(args.length === 0, 'Cannot evaluate a string with arguments');
		return fun;
	}

	function serializeArgument(arg: unknown): string {
		if (Object.is(arg, undefined)) {
			return 'undefined';
		}

		return JSON.stringify(arg);
	}

	return `(${fun})(${args.map(serializeArgument).join(',')})`;
}

export function pageBindingDeliverResultString(
	name: string,
	seq: number,
	result: unknown
): string {
	function deliverResult(_name: string, _seq: number, _result: unknown): void {
		(window as any)[_name].callbacks.get(_seq).resolve(_result);
		(window as any)[_name].callbacks.delete(_seq);
	}

	return evaluationString(deliverResult, name, seq, result);
}

export function pageBindingDeliverErrorString(
	name: string,
	seq: number,
	message: string,
	stack?: string
): string {
	function deliverError(
		_name: string,
		_seq: number,
		_message: string,
		_stack?: string
	): void {
		const error = new Error(_message);
		error.stack = _stack;
		(window as any)[_name].callbacks.get(_seq).reject(error);
		(window as any)[_name].callbacks.delete(_seq);
	}

	return evaluationString(deliverError, name, seq, message, stack);
}

export function pageBindingDeliverErrorValueString(
	name: string,
	seq: number,
	value: unknown
): string {
	function deliverErrorValue(
		_name: string,
		_seq: number,
		_value: unknown
	): void {
		(window as any)[_name].callbacks.get(_seq).reject(_value);
		(window as any)[_name].callbacks.delete(_seq);
	}

	return evaluationString(deliverErrorValue, name, seq, value);
}

export async function waitWithTimeout<T>(
	promise: Promise<T>,
	taskName: string,
	timeout: number,
	browser: HeadlessBrowser
): Promise<T> {
	let reject: (reason?: Error) => void;
	const timeoutError = new TimeoutError(
		`waiting for ${taskName} failed: timeout ${timeout}ms exceeded`
	);
	const timeoutPromise = new Promise<T>((_res, rej) => {
		reject = rej;
	});
	let timeoutTimer = null;
	if (timeout) {
		timeoutTimer = setTimeout(() => {
			return reject(timeoutError);
		}, timeout);
	}

	try {
		return await Promise.race([
			new Promise<T>((_, rej) => {
				browser.once(BrowserEmittedEvents.Closed, () => {
					return rej();
				});
			}),
			promise,
			timeoutPromise,
		]);
	} finally {
		if (timeoutTimer) {
			clearTimeout(timeoutTimer);
		}
	}
}

interface ErrorLike extends Error {
	name: string;
	message: string;
}

export function isErrorLike(obj: unknown): obj is ErrorLike {
	return (
		typeof obj === 'object' && obj !== null && 'name' in obj && 'message' in obj
	);
}

export function isErrnoException(obj: unknown): obj is NodeJS.ErrnoException {
	return (
		isErrorLike(obj) &&
		('errno' in obj || 'code' in obj || 'path' in obj || 'syscall' in obj)
	);
}
