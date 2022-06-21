/**
 * Copyright 2019 Google Inc. All rights reserved.
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

import {Protocol} from 'devtools-protocol';
import {assert} from './assert';
import {CDPSession} from './Connection';
import {
	EvaluateFn,
	EvaluateFnReturnType,
	EvaluateHandleFn,
	SerializableOrJSHandle,
	UnwrapPromiseLike,
} from './EvalTypes';
import {ExecutionContext} from './ExecutionContext';
import {Frame, FrameManager} from './FrameManager';
import {
	debugError,
	isString,
	releaseObject,
	valueFromRemoteObject,
} from './util';

/**
 * @public
 */
interface BoxModel {
	content: Point[];
	padding: Point[];
	border: Point[];
	margin: Point[];
	width: number;
	height: number;
}

/**
 * @internal
 */
export function _createJSHandle(
	context: ExecutionContext,
	remoteObject: Protocol.Runtime.RemoteObject
): JSHandle {
	const frame = context.frame();
	if (remoteObject.subtype === 'node' && frame) {
		const frameManager = frame._frameManager;
		return new ElementHandle(
			context,
			context._client,
			remoteObject,
			frame,
			frameManager
		);
	}

	return new JSHandle(context, context._client, remoteObject);
}

const applyOffsetsToQuad = (
	quad: Point[],
	offsetX: number,
	offsetY: number
) => {
	return quad.map((part) => {
		return {x: part.x + offsetX, y: part.y + offsetY};
	});
};

/**
 * Represents an in-page JavaScript object. JSHandles can be created with the
 * {@link Page.evaluateHandle | page.evaluateHandle} method.
 *
 * @example
 * ```js
 * const windowHandle = await page.evaluateHandle(() => window);
 * ```
 *
 * JSHandle prevents the referenced JavaScript object from being garbage-collected
 * unless the handle is {@link JSHandle.dispose | disposed}. JSHandles are auto-
 * disposed when their origin frame gets navigated or the parent context gets destroyed.
 *
 * JSHandle instances can be used as arguments for {@link Page.$eval},
 * {@link Page.evaluate}, and {@link Page.evaluateHandle}.
 *
 * @public
 */
export class JSHandle<HandleObjectType = unknown> {
	#client: CDPSession;
	#disposed = false;
	#context: ExecutionContext;
	#remoteObject: Protocol.Runtime.RemoteObject;

	/**
	 * @internal
	 */
	get _client(): CDPSession {
		return this.#client;
	}

	/**
	 * @internal
	 */
	get _disposed(): boolean {
		return this.#disposed;
	}

	/**
	 * @internal
	 */
	get _remoteObject(): Protocol.Runtime.RemoteObject {
		return this.#remoteObject;
	}

	/**
	 * @internal
	 */
	get _context(): ExecutionContext {
		return this.#context;
	}

	/**
	 * @internal
	 */
	constructor(
		context: ExecutionContext,
		client: CDPSession,
		remoteObject: Protocol.Runtime.RemoteObject
	) {
		this.#context = context;
		this.#client = client;
		this.#remoteObject = remoteObject;
	}

	/** Returns the execution context the handle belongs to.
	 */
	executionContext(): ExecutionContext {
		return this.#context;
	}

	/**
	 * This method passes this handle as the first argument to `pageFunction`.
	 * If `pageFunction` returns a Promise, then `handle.evaluate` would wait
	 * for the promise to resolve and return its value.
	 *
	 * @example
	 * ```js
	 * const tweetHandle = await page.$('.tweet .retweets');
	 * expect(await tweetHandle.evaluate(node => node.innerText)).toBe('10');
	 * ```
	 */

	async evaluate<T extends EvaluateFn<HandleObjectType>>(
		pageFunction: T | string,
		...args: SerializableOrJSHandle[]
	): Promise<UnwrapPromiseLike<EvaluateFnReturnType<T>>> {
		return await this.executionContext().evaluate<
			UnwrapPromiseLike<EvaluateFnReturnType<T>>
		>(pageFunction, this, ...args);
	}

	/**
	 * This method passes this handle as the first argument to `pageFunction`.
	 *
	 * @remarks
	 *
	 * The only difference between `jsHandle.evaluate` and
	 * `jsHandle.evaluateHandle` is that `jsHandle.evaluateHandle`
	 * returns an in-page object (JSHandle).
	 *
	 * If the function passed to `jsHandle.evaluateHandle` returns a Promise,
	 * then `evaluateHandle.evaluateHandle` waits for the promise to resolve and
	 * returns its value.
	 *
	 * See {@link Page.evaluateHandle} for more details.
	 */
	async evaluateHandle<HandleType extends JSHandle = JSHandle>(
		pageFunction: EvaluateHandleFn,
		...args: SerializableOrJSHandle[]
	): Promise<HandleType> {
		return await this.executionContext().evaluateHandle(
			pageFunction,
			this,
			...args
		);
	}

	/** Fetches a single property from the referenced object.
	 */
	async getProperty(propertyName: string): Promise<JSHandle> {
		const objectHandle = await this.evaluateHandle(
			(object: Element, propertyName: keyof Element) => {
				const result: Record<string, unknown> = {__proto__: null};
				result[propertyName] = object[propertyName];
				return result;
			},
			propertyName
		);
		const properties = await objectHandle.getProperties();
		const result = properties.get(propertyName);
		assert(result instanceof JSHandle);
		await objectHandle.dispose();
		return result;
	}

	/**
	 * The method returns a map with property names as keys and JSHandle
	 * instances for the property values.
	 *
	 * @example
	 * ```js
	 * const listHandle = await page.evaluateHandle(() => document.body.children);
	 * const properties = await listHandle.getProperties();
	 * const children = [];
	 * for (const property of properties.values()) {
	 *   const element = property.asElement();
	 *   if (element)
	 *     children.push(element);
	 * }
	 * children; // holds elementHandles to all children of document.body
	 * ```
	 */
	async getProperties(): Promise<Map<string, JSHandle>> {
		assert(this.#remoteObject.objectId);
		const response = await this.#client.send('Runtime.getProperties', {
			objectId: this.#remoteObject.objectId,
			ownProperties: true,
		});
		const result = new Map<string, JSHandle>();
		for (const property of response.result) {
			if (!property.enumerable || !property.value) {
				continue;
			}

			result.set(property.name, _createJSHandle(this.#context, property.value));
		}

		return result;
	}

	/**
	 * @returns Returns a JSON representation of the object.If the object has a
	 * `toJSON` function, it will not be called.
	 * @remarks
	 *
	 * The JSON is generated by running {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify | JSON.stringify}
	 * on the object in page and consequent {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse | JSON.parse} in puppeteer.
	 * **NOTE** The method throws if the referenced object is not stringifiable.
	 */
	async jsonValue<T = unknown>(): Promise<T> {
		if (this.#remoteObject.objectId) {
			const response = await this.#client.send('Runtime.callFunctionOn', {
				functionDeclaration: 'function() { return this; }',
				objectId: this.#remoteObject.objectId,
				returnByValue: true,
				awaitPromise: true,
			});
			return valueFromRemoteObject(response.result) as T;
		}

		return valueFromRemoteObject(this.#remoteObject) as T;
	}

	/**
	 * @returns Either `null` or the object handle itself, if the object
	 * handle is an instance of {@link ElementHandle}.
	 */
	asElement(): ElementHandle | null {
		/*  This always returns null, but subclasses can override this and return an
          ElementHandle.
      */
		return null;
	}

	/**
	 * Stops referencing the element handle, and resolves when the object handle is
	 * successfully disposed of.
	 */
	async dispose(): Promise<void> {
		if (this.#disposed) {
			return;
		}

		this.#disposed = true;
		await releaseObject(this.#client, this.#remoteObject);
	}

	/**
	 * Returns a string representation of the JSHandle.
	 *
	 * @remarks Useful during debugging.
	 */
	toString(): string {
		if (this.#remoteObject.objectId) {
			const type = this.#remoteObject.subtype || this.#remoteObject.type;
			return 'JSHandle@' + type;
		}

		return 'JSHandle:' + valueFromRemoteObject(this.#remoteObject);
	}
}

/**
 * ElementHandle represents an in-page DOM element.
 *
 * @remarks
 *
 * ElementHandles can be created with the {@link Page.$} method.
 *
 * ```js
 * const puppeteer = require('puppeteer');
 *
 * (async () => {
 *  const browser = await puppeteer.launch();
 *  const page = await browser.newPage();
 *  await page.goto('https://example.com');
 *  const hrefElement = await page.$('a');
 *  await hrefElement.click();
 *  // ...
 * })();
 * ```
 *
 * ElementHandle prevents the DOM element from being garbage-collected unless the
 * handle is {@link JSHandle.dispose | disposed}. ElementHandles are auto-disposed
 * when their origin frame gets navigated.
 *
 * ElementHandle instances can be used as arguments in {@link Page.$eval} and
 * {@link Page.evaluate} methods.
 *
 * If you're using TypeScript, ElementHandle takes a generic argument that
 * denotes the type of element the handle is holding within. For example, if you
 * have a handle to a `<select>` element, you can type it as
 * `ElementHandle<HTMLSelectElement>` and you get some nicer type checks.
 *
 * @public
 */
export class ElementHandle<
	ElementType extends Element = Element
> extends JSHandle<ElementType> {
	#frame: Frame;
	#frameManager: FrameManager;

	/**
	 * @internal
	 */
	constructor(
		context: ExecutionContext,
		client: CDPSession,
		remoteObject: Protocol.Runtime.RemoteObject,
		frame: Frame,
		frameManager: FrameManager
	) {
		super(context, client, remoteObject);
		this.#frame = frame;
		this.#frameManager = frameManager;
	}

	override asElement(): ElementHandle<ElementType> | null {
		return this;
	}

	/**
	 * Resolves to the content frame for element handles referencing
	 * iframe nodes, or null otherwise
	 */
	async contentFrame(): Promise<Frame | null> {
		const nodeInfo = await this._client.send('DOM.describeNode', {
			objectId: this._remoteObject.objectId,
		});
		if (typeof nodeInfo.node.frameId !== 'string') {
			return null;
		}

		return this.#frameManager.frame(nodeInfo.node.frameId);
	}

	async #getOOPIFOffsets(
		frame: Frame
	): Promise<{offsetX: number; offsetY: number}> {
		let offsetX = 0;
		let offsetY = 0;
		let currentFrame: Frame | null = frame;
		while (currentFrame?.parentFrame()) {
			const parent = currentFrame.parentFrame();
			if (!currentFrame.isOOPFrame() || !parent) {
				currentFrame = parent;
				continue;
			}

			const {backendNodeId} = await parent._client().send('DOM.getFrameOwner', {
				frameId: currentFrame._id,
			});
			const result = await parent._client().send('DOM.getBoxModel', {
				backendNodeId,
			});
			if (!result) {
				break;
			}

			const contentBoxQuad = result.model.content;
			const topLeftCorner = this.#fromProtocolQuad(contentBoxQuad)[0];
			offsetX += topLeftCorner!.x;
			offsetY += topLeftCorner!.y;
			currentFrame = parent;
		}

		return {offsetX, offsetY};
	}

	#getBoxModel(): Promise<void | Protocol.DOM.GetBoxModelResponse> {
		const params: Protocol.DOM.GetBoxModelRequest = {
			objectId: this._remoteObject.objectId,
		};
		return this._client.send('DOM.getBoxModel', params).catch((error) => {
			return debugError(error);
		});
	}

	#fromProtocolQuad(quad: number[]): Point[] {
		return [
			{x: quad[0]!, y: quad[1]!},
			{x: quad[2]!, y: quad[3]!},
			{x: quad[4]!, y: quad[5]!},
			{x: quad[6]!, y: quad[7]!},
		];
	}

	/**
	 * Triggers a `change` and `input` event once all the provided options have been
	 * selected. If there's no `<select>` element matching `selector`, the method
	 * throws an error.
	 *
	 * @example
	 * ```js
	 * handle.select('blue'); // single selection
	 * handle.select('red', 'green', 'blue'); // multiple selections
	 * ```
	 * @param values - Values of options to select. If the `<select>` has the
	 *    `multiple` attribute, all values are considered, otherwise only the first
	 *    one is taken into account.
	 */
	async select(...values: string[]): Promise<string[]> {
		for (const value of values) {
			assert(
				isString(value),
				'Values must be strings. Found value "' +
					value +
					'" of type "' +
					typeof value +
					'"'
			);
		}

		return this.evaluate((element: Element, vals: string[]): string[] => {
			const _values = new Set(vals);
			if (!(element instanceof HTMLSelectElement)) {
				throw new Error('Element is not a <select> element.');
			}

			const selectedValues = new Set<string>();
			if (!element.multiple) {
				// @ts-expect-error vendored
				for (const option of element.options) {
					option.selected = false;
				}

				// @ts-expect-error vendored
				for (const option of element.options) {
					if (_values.has(option.value)) {
						option.selected = true;
						selectedValues.add(option.value);
						break;
					}
				}
			} else {
				// @ts-expect-error vendored
				for (const option of element.options) {
					option.selected = _values.has(option.value);
					if (option.selected) {
						selectedValues.add(option.value);
					}
				}
			}

			element.dispatchEvent(new Event('input', {bubbles: true}));
			element.dispatchEvent(new Event('change', {bubbles: true}));
			return [...selectedValues.values()];
		}, values);
	}

	/**
	 * This method expects `elementHandle` to point to an
	 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input | input element}.
	 *
	 * @param filePaths - Sets the value of the file input to these paths.
	 *    If a path is relative, then it is resolved against the
	 *    {@link https://nodejs.org/api/process.html#process_process_cwd | current working directory}.
	 *    Note for locals script connecting to remote chrome environments,
	 *    paths must be absolute.
	 */
	async uploadFile(...filePaths: string[]): Promise<void> {
		const isMultiple = await this.evaluate<(element: Element) => boolean>(
			(element) => {
				if (!(element instanceof HTMLInputElement)) {
					throw new Error('uploadFile can only be called on an input element.');
				}

				return element.multiple;
			}
		);
		assert(
			filePaths.length <= 1 || isMultiple,
			'Multiple file uploads only work with <input type=file multiple>'
		);

		// Locate all files and confirm that they exist.
		let path: typeof import('path');
		try {
			path = await import('path');
		} catch (error) {
			if (error instanceof TypeError) {
				throw new Error(
					`JSHandle#uploadFile can only be used in Node-like environments.`
				);
			}

			throw error;
		}

		const files = filePaths.map((filePath) => {
			if (path.win32.isAbsolute(filePath) || path.posix.isAbsolute(filePath)) {
				return filePath;
			}

			return path.resolve(filePath);
		});
		const {objectId} = this._remoteObject;
		const {node} = await this._client.send('DOM.describeNode', {objectId});
		const {backendNodeId} = node;

		/*  The zero-length array is a special case, it seems that
          DOM.setFileInputFiles does not actually update the files in that case,
          so the solution is to eval the element value to a new FileList directly.
      */
		if (files.length === 0) {
			await (this as ElementHandle<HTMLInputElement>).evaluate((element) => {
				element.files = new DataTransfer().files;

				// Dispatch events for this case because it should behave akin to a user action.
				element.dispatchEvent(new Event('input', {bubbles: true}));
				element.dispatchEvent(new Event('change', {bubbles: true}));
			});
		} else {
			await this._client.send('DOM.setFileInputFiles', {
				objectId,
				files,
				backendNodeId,
			});
		}
	}

	/**
	 * Calls {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus | focus} on the element.
	 */
	async focus(): Promise<void> {
		await (this as ElementHandle<HTMLElement>).evaluate((element) => {
			return element.focus();
		});
	}

	/**
	 * This method returns boxes of the element, or `null` if the element is not visible.
	 *
	 * @remarks
	 *
	 * Boxes are represented as an array of points;
	 * Each Point is an object `{x, y}`. Box points are sorted clock-wise.
	 */
	async boxModel(): Promise<BoxModel | null> {
		const result = await this.#getBoxModel();

		if (!result) {
			return null;
		}

		const {offsetX, offsetY} = await this.#getOOPIFOffsets(this.#frame);

		const {content, padding, border, margin, width, height} = result.model;
		return {
			content: applyOffsetsToQuad(
				this.#fromProtocolQuad(content),
				offsetX,
				offsetY
			),
			padding: applyOffsetsToQuad(
				this.#fromProtocolQuad(padding),
				offsetX,
				offsetY
			),
			border: applyOffsetsToQuad(
				this.#fromProtocolQuad(border),
				offsetX,
				offsetY
			),
			margin: applyOffsetsToQuad(
				this.#fromProtocolQuad(margin),
				offsetX,
				offsetY
			),
			width,
			height,
		};
	}

	/**
	 * The method evaluates the XPath expression relative to the elementHandle.
	 * If there are no such elements, the method will resolve to an empty array.
	 * @param expression - Expression to {@link https://developer.mozilla.org/en-US/docs/Web/API/Document/evaluate | evaluate}
	 */
	async $x(expression: string): Promise<ElementHandle[]> {
		const arrayHandle = await this.evaluateHandle(
			(element: Document, expression: string) => {
				const document = element.ownerDocument || element;
				const iterator = document.evaluate(
					expression,
					element,
					null,
					XPathResult.ORDERED_NODE_ITERATOR_TYPE
				);
				const array = [];
				let item;
				while ((item = iterator.iterateNext())) {
					array.push(item);
				}

				return array;
			},
			expression
		);
		const properties = await arrayHandle.getProperties();
		await arrayHandle.dispose();
		const result = [];
		for (const property of properties.values()) {
			const elementHandle = property.asElement();
			if (elementHandle) {
				result.push(elementHandle);
			}
		}

		return result;
	}

	/**
	 * Resolves to true if the element is visible in the current viewport.
	 */
	async isIntersectingViewport(options?: {
		threshold?: number;
	}): Promise<boolean> {
		const {threshold = 0} = options || {};
		return await this.evaluate(async (element: Element, threshold: number) => {
			const visibleRatio = await new Promise<number>((resolve) => {
				const observer = new IntersectionObserver((entries) => {
					resolve(entries[0]!.intersectionRatio);
					observer.disconnect();
				});
				observer.observe(element);
			});
			return threshold === 1 ? visibleRatio === 1 : visibleRatio > threshold;
		}, threshold);
	}
}

interface Point {
	x: number;
	y: number;
}
