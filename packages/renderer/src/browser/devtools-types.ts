type RemoteObjectId = string;

interface WebDriverValue {
	/**
	 *  (WebDriverValueType enum)
	 */
	type:
		| 'undefined'
		| 'null'
		| 'string'
		| 'number'
		| 'boolean'
		| 'bigint'
		| 'regexp'
		| 'date'
		| 'symbol'
		| 'array'
		| 'object'
		| 'function'
		| 'map'
		| 'set'
		| 'weakmap'
		| 'weakset'
		| 'error'
		| 'proxy'
		| 'promise'
		| 'typedarray'
		| 'arraybuffer'
		| 'node'
		| 'window';
	value?: any;
	objectId?: string;
}

type UnserializableValue = string;

export interface DevtoolsRemoteObject {
	/**
	 * Object type. (RemoteObjectType enum)
	 */
	type:
		| 'object'
		| 'function'
		| 'undefined'
		| 'string'
		| 'number'
		| 'boolean'
		| 'symbol'
		| 'bigint';
	/**
	 * Object subtype hint. Specified for `object` type values only.
	 * NOTE: If you change anything here, make sure to also update
	 * `subtype` in `ObjectPreview` and `PropertyPreview` below. (RemoteObjectSubtype enum)
	 */
	subtype?:
		| 'array'
		| 'null'
		| 'node'
		| 'regexp'
		| 'date'
		| 'map'
		| 'set'
		| 'weakmap'
		| 'weakset'
		| 'iterator'
		| 'generator'
		| 'error'
		| 'proxy'
		| 'promise'
		| 'typedarray'
		| 'arraybuffer'
		| 'dataview'
		| 'webassemblymemory'
		| 'wasmvalue';
	/**
	 * Object class (constructor) name. Specified for `object` type values only.
	 */
	className?: string;
	/**
	 * Remote object value in case of primitive values or JSON values (if it was requested).
	 */
	value?: any;
	/**
	 * Primitive value which can not be JSON-stringified does not have `value`, but gets this
	 * property.
	 */
	unserializableValue?: UnserializableValue;
	/**
	 * String representation of the object.
	 */
	description?: string;
	/**
	 * WebDriver BiDi representation of the value.
	 */
	webDriverValue?: WebDriverValue;
	/**
	 * Unique object identifier (for non-primitive values).
	 */
	objectId?: RemoteObjectId;
	preview?: ObjectPreview;
}

export interface ObjectPreview {
	/**
	 * Object type. (ObjectPreviewType enum)
	 */
	type:
		| 'object'
		| 'function'
		| 'undefined'
		| 'string'
		| 'number'
		| 'boolean'
		| 'symbol'
		| 'bigint';
	/**
	 * Object subtype hint. Specified for `object` type values only. (ObjectPreviewSubtype enum)
	 */
	subtype?:
		| 'array'
		| 'null'
		| 'node'
		| 'regexp'
		| 'date'
		| 'map'
		| 'set'
		| 'weakmap'
		| 'weakset'
		| 'iterator'
		| 'generator'
		| 'error'
		| 'proxy'
		| 'promise'
		| 'typedarray'
		| 'arraybuffer'
		| 'dataview'
		| 'webassemblymemory'
		| 'wasmvalue';
	/**
	 * String representation of the object.
	 */
	description?: string;
	/**
	 * True iff some of the properties or entries of the original object did not fit.
	 */
	overflow: boolean;
	/**
	 * List of the properties.
	 */
	properties: PropertyPreview[];
	/**
	 * List of the entries. Specified for `map` and `set` subtype values only.
	 */
	entries?: EntryPreview[];
}

export interface EntryPreview {
	/**
	 * Preview of the key. Specified for map-like collection entries.
	 */
	key?: ObjectPreview;
	/**
	 * Preview of the value.
	 */
	value: ObjectPreview;
}

export interface PropertyPreview {
	/**
	 * Property name.
	 */
	name: string;
	/**
	 * Object type. Accessor means that the property itself is an accessor property. (PropertyPreviewType enum)
	 */
	type:
		| 'object'
		| 'function'
		| 'undefined'
		| 'string'
		| 'number'
		| 'boolean'
		| 'symbol'
		| 'accessor'
		| 'bigint';
	/**
	 * User-friendly property value string.
	 */
	value?: string;
	/**
	 * Nested value preview.
	 */
	valuePreview?: ObjectPreview;
	/**
	 * Object subtype hint. Specified for `object` type values only. (PropertyPreviewSubtype enum)
	 */
	subtype?:
		| 'array'
		| 'null'
		| 'node'
		| 'regexp'
		| 'date'
		| 'map'
		| 'set'
		| 'weakmap'
		| 'weakset'
		| 'iterator'
		| 'generator'
		| 'error'
		| 'proxy'
		| 'promise'
		| 'typedarray'
		| 'arraybuffer'
		| 'dataview'
		| 'webassemblymemory'
		| 'wasmvalue';
}

type TargetID = string;

export interface TargetInfo {
	targetId: TargetID;
	type: string;
	title: string;
	url: string;
	/**
	 * Whether the target has an attached client.
	 */
	attached: boolean;
	/**
	 * Opener target Id
	 */
	openerId?: TargetID;
	/**
	 * Whether the target has access to the originating window.
	 */
	canAccessOpener: boolean;
	browserContextId?: string;
}

export interface DevtoolsTargetCreatedEvent {
	targetInfo: TargetInfo;
}

export interface ExecutionContextDescription {
	/**
	 * Unique id of the execution context. It can be used to specify in which execution context
	 * script evaluation should be performed.
	 */
	id: number;
	/**
	 * Execution context origin.
	 */
	origin: string;
	/**
	 * Human readable name describing given context.
	 */
	name: string;
	/**
	 * A system-unique execution context identifier. Unlike the id, this is unique across
	 * multiple processes, so can be reliably used to identify specific context while backend
	 * performs a cross-process navigation.
	 */
	uniqueId: string;
	/**
	 * Embedder-specific auxiliary data.
	 */
	auxData?: any;
}

export interface ExceptionDetails {
	/**
	 * Exception id.
	 */
	exceptionId: number;
	/**
	 * Exception text, which should be used together with exception object when available.
	 */
	text: string;
	/**
	 * Line number of the exception location (0-based).
	 */
	lineNumber: number;
	/**
	 * Column number of the exception location (0-based).
	 */
	columnNumber: number;
	/**
	 * Script ID of the exception location.
	 */
	scriptId?: string;
	/**
	 * URL of the exception location, to be used when the script was not reported.
	 */
	url?: string;
	/**
	 * JavaScript stack trace if available.
	 */
	stackTrace?: StackTrace;
	/**
	 * Exception object if available.
	 */
	exception?: DevtoolsRemoteObject;
	/**
	 * Identifier of the context where exception happened.
	 */
	executionContextId?: number;
	/**
	 * Dictionary with entries of meta data that the client associated
	 * with this exception, such as information about associated network
	 * requests, etc.
	 */
	exceptionMetaData?: any;
}

export interface StackTrace {
	/**
	 * String label of this stack trace. For async traces this may be a name of the function that
	 * initiated the async call.
	 */
	description?: string;
	/**
	 * JavaScript function name.
	 */
	callFrames: CallFrame[];
	/**
	 * Asynchronous JavaScript stack trace that preceded this stack, if available.
	 */
	parent?: StackTrace;
	/**
	 * Asynchronous JavaScript stack trace that preceded this stack, if available.
	 */
	parentId?: StackTraceId;
}

export interface CallFrame {
	/**
	 * JavaScript function name.
	 */
	functionName: string;
	/**
	 * JavaScript script id.
	 */
	scriptId: number;
	/**
	 * JavaScript script name or url.
	 */
	url: string;
	/**
	 * JavaScript script line number (0-based).
	 */
	lineNumber: number;
	/**
	 * JavaScript script column number (0-based).
	 */
	columnNumber: number;
}

interface StackTraceId {
	id: string;
	debuggerId?: string;
}

export interface CallFunctionOnRequest {
	/**
	 * Declaration of the function to call.
	 */
	functionDeclaration: string;
	/**
	 * Identifier of the object to call function on. Either objectId or executionContextId should
	 * be specified.
	 */
	objectId?: RemoteObjectId;
	/**
	 * Call arguments. All call arguments must belong to the same JavaScript world as the target
	 * object.
	 */
	arguments?: CallArgument[];
	/**
	 * In silent mode exceptions thrown during evaluation are not reported and do not pause
	 * execution. Overrides `setPauseOnException` state.
	 */
	silent?: boolean;
	/**
	 * Whether the result is expected to be a JSON object which should be sent by value.
	 */
	returnByValue?: boolean;
	/**
	 * Whether preview should be generated for the result.
	 */
	generatePreview?: boolean;
	/**
	 * Whether execution should be treated as initiated by user in the UI.
	 */
	userGesture?: boolean;
	/**
	 * Whether execution should `await` for resulting value and return once awaited promise is
	 * resolved.
	 */
	awaitPromise?: boolean;
	/**
	 * Specifies execution context which global object will be used to call function on. Either
	 * executionContextId or objectId should be specified.
	 */
	executionContextId?: ExecutionContextId;
	/**
	 * Symbolic group name that can be used to release multiple objects. If objectGroup is not
	 * specified and objectId is, objectGroup will be inherited from object.
	 */
	objectGroup?: string;
	/**
	 * Whether to throw an exception if side effect cannot be ruled out during evaluation.
	 */
	throwOnSideEffect?: boolean;
	/**
	 * Whether the result should contain `webDriverValue`, serialized according to
	 * https://w3c.github.io/webdriver-bidi. This is mutually exclusive with `returnByValue`, but
	 * resulting `objectId` is still provided.
	 */
	generateWebDriverValue?: boolean;
}

export interface CallArgument {
	/**
	 * Primitive value or serializable javascript object.
	 */
	value?: any;
	/**
	 * Primitive value which can not be JSON-stringified.
	 */
	unserializableValue?: UnserializableValue;
	/**
	 * Remote object handle.
	 */
	objectId?: RemoteObjectId;
}

export interface CallFunctionOnResponse {
	/**
	 * Call result.
	 */
	result: DevtoolsRemoteObject;
	/**
	 * Exception details.
	 */
	exceptionDetails?: ExceptionDetails;
}

type ExecutionContextId = number;

export interface EvaluateResponse {
	/**
	 * Evaluation result.
	 */
	result: DevtoolsRemoteObject;
	/**
	 * Exception details.
	 */
	exceptionDetails?: ExceptionDetails;
}

export interface GetFrameTreeResponse {
	/**
	 * Present frame tree structure.
	 */
	frameTree: FrameTree;
}

export interface FrameTree {
	/**
	 * Frame information for this tree item.
	 */
	frame: Frame;
	/**
	 * Child frames.
	 */
	childFrames?: FrameTree[];
}

type FrameId = string;
type LoaderId = string;

export interface Frame {
	/**
	 * Frame unique identifier.
	 */
	id: FrameId;
	/**
	 * Parent frame identifier.
	 */
	parentId?: FrameId;
	/**
	 * Identifier of the loader associated with this frame.
	 */
	loaderId: LoaderId;
	/**
	 * Frame's name as specified in the tag.
	 */
	name?: string;
	/**
	 * Frame document's URL without fragment.
	 */
	url: string;
	/**
	 * Frame document's URL fragment including the '#'.
	 */
	urlFragment?: string;
	/**
	 * Frame document's registered domain, taking the public suffixes list into account.
	 * Extracted from the Frame's url.
	 * Example URLs: http://www.google.com/file.html -> "google.com"
	 *               http://a.b.co.uk/file.html      -> "b.co.uk"
	 */
	domainAndRegistry: string;
	/**
	 * Frame document's security origin.
	 */
	securityOrigin: string;
	/**
	 * Frame document's mimeType as determined by the browser.
	 */
	mimeType: string;
	/**
	 * If the frame failed to load, this contains the URL that could not be loaded. Note that unlike url above, this URL may contain a fragment.
	 */
	unreachableUrl?: string;
}

export interface SetAutoAttachRequest {
	/**
	 * Whether to auto-attach to related targets.
	 */
	autoAttach: boolean;
	/**
	 * Whether to pause new targets when attaching to them. Use `Runtime.runIfWaitingForDebugger`
	 * to run paused targets.
	 */
	waitForDebuggerOnStart: boolean;
	/**
	 * Enables "flat" access to the session via specifying sessionId attribute in the commands.
	 * We plan to make this the default, deprecate non-flattened mode,
	 * and eventually retire it. See crbug.com/991325.
	 */
	flatten?: boolean;
}

/**
 * Fired when frame has been detached from its parent.
 */
export interface FrameDetachedEvent {
	/**
	 * Id of the frame that has been detached.
	 */
	frameId: FrameId;
	/**
	 *  (FrameDetachedEventReason enum)
	 */
	reason: 'remove' | 'swap';
}

export interface SetLifecycleEventsEnabledRequest {
	/**
	 * If true, starts emitting lifecycle events.
	 */
	enabled: boolean;
}

export interface NavigateRequest {
	/**
	 * URL to navigate the page to.
	 */
	url: string;
	/**
	 * Referrer URL.
	 */
	referrer?: string;
	/**
	 * Frame id to navigate, if not specified navigates the top frame.
	 */
	frameId?: FrameId;
	/**
	 * Referrer-policy used for the navigation.
	 */
	referrerPolicy?: ReferrerPolicy;
}

export interface NavigateResponse {
	/**
	 * Frame id that has navigated (or failed to navigate)
	 */
	frameId: FrameId;
	/**
	 * Loader identifier. This is omitted in case of same-document navigation,
	 * as the previously committed loaderId would not change.
	 */
	loaderId?: LoaderId;
	/**
	 * User friendly error message, present if and only if navigation has failed.
	 */
	errorText?: string;
}

export const enum FrameDetachedEventReason {
	Remove = 'remove',
	Swap = 'swap',
}

export interface AttachedToTargetEvent {
	/**
	 * Identifier assigned to the session used to send/receive messages.
	 */
	sessionId: SessionID;
	targetInfo: TargetInfo;
	waitingForDebugger: boolean;
}

type SessionID = string;

export interface DetachedFromTargetEvent {
	/**
	 * Detached session identifier.
	 */
	sessionId: SessionID;
	/**
	 * Deprecated.
	 */
	targetId?: TargetID;
}

export interface LifecycleEventEvent {
	/**
	 * Id of the frame.
	 */
	frameId: FrameId;
	/**
	 * Loader identifier. Empty string if the request is fetched from worker.
	 */
	loaderId: LoaderId;
	name: string;
	timestamp: number;
}

export interface AddScriptToEvaluateOnNewDocumentRequest {
	source: string;
	/**
	 * If specified, creates an isolated world with the given name and evaluates given script in it.
	 * This world name will be used as the ExecutionContextDescription::name when the corresponding
	 * event is emitted.
	 */
	worldName?: string;
	/**
	 * Specifies whether command line API should be available to the script, defaults
	 * to false.
	 */
	includeCommandLineAPI?: boolean;
}

export interface AddScriptToEvaluateOnNewDocumentResponse {
	/**
	 * Identifier of the added script.
	 */
	identifier: ScriptIdentifier;
}

type ScriptIdentifier = string;

export interface CreateIsolatedWorldRequest {
	/**
	 * Id of the frame in which the isolated world should be created.
	 */
	frameId: FrameId;
	/**
	 * An optional name which is reported in the Execution Context.
	 */
	worldName?: string;
	/**
	 * Whether or not universal access should be granted to the isolated world. This is a powerful
	 * option, use with caution.
	 */
	grantUniveralAccess?: boolean;
}

export interface CreateIsolatedWorldResponse {
	/**
	 * Execution context of the isolated world.
	 */
	executionContextId: ExecutionContextId;
}

export interface CaptureScreenshotRequest {
	/**
	 * Image compression format (defaults to png). (CaptureScreenshotRequestFormat enum)
	 */
	format?: 'jpeg' | 'png' | 'webp';
	/**
	 * Compression quality from range [0..100] (jpeg only).
	 */
	quality?: number;
	/**
	 * Capture the screenshot of a given region only.
	 */
	clip?: {
		/**
		 * X offset in device independent pixels (dip).
		 */
		x: number;
		/**
		 * Y offset in device independent pixels (dip).
		 */
		y: number;
		/**
		 * Rectangle width in device independent pixels (dip).
		 */
		width: number;
		/**
		 * Rectangle height in device independent pixels (dip).
		 */
		height: number;
		/**
		 * Page scale factor.
		 */
		scale: number;
	};
	/**
	 * Capture the screenshot from the surface, rather than the view. Defaults to true.
	 */
	fromSurface?: boolean;
	/**
	 * Capture the screenshot beyond the viewport. Defaults to false.
	 */
	captureBeyondViewport?: boolean;
	/**
	 * Optimize image encoding for speed, not for resulting size (defaults to false) EXPERIMENTAL
	 */
	optimizeForSpeed?: boolean;
}

export interface CaptureScreenshotResponse {
	/**
	 * Base64-encoded image data. (Encoded as a base64 string when passed over JSON)
	 */
	data: string;
}

export interface PrintPDFRequest {
	/**
	 * Paper orientation. Defaults to false.
	 */
	landscape?: boolean;
	/**
	 * Display header and footer. Defaults to false.
	 */
	displayHeaderFooter?: boolean;
	/**
	 * Print background graphics. Defaults to false.
	 */
	printBackground?: boolean;
	/**
	 * Scale of the webpage rendering. Defaults to 1.
	 */
	scale?: number;
	/**
	 * Paper width in inches. Defaults to 8.5 inches.
	 */
	paperWidth?: number;
	/**
	 * Paper height in inches. Defaults to 11 inches.
	 */
	paperHeight?: number;
	/**
	 * Top margin in inches. Defaults to 1cm (~0.4 inches).
	 */
	marginTop?: number;
	/**
	 * Bottom margin in inches. Defaults to 1cm (~0.4 inches).
	 */
	marginBottom?: number;
	/**
	 * Left margin in inches. Defaults to 1cm (~0.4 inches).
	 */
	marginLeft?: number;
	/**
	 * Right margin in inches. Defaults to 1cm (~0.4 inches).
	 */
	marginRight?: number;
	/**
	 * Paper ranges to print, one based, e.g., '1-5, 8, 11-13'.
	 * Pages are printed in the document order, not in the order specified,
	 * and no more than once. Defaults to empty string,
	 * which implies the entire document is printed.
	 * The page numbers are quietly capped to actual page count of the document,
	 * and ranges beyond the end of the document are ignored.
	 * If this results in no pages to print, an error is reported.
	 * It is an error to specify a range with start greater than end.
	 */
	pageRanges?: string;
	/**
	 * HTML template for the print header.
	 * Should be valid HTML markup with following classes used to inject printing values into them:
	 * date: formatted print date
	 * title: document title
	 * url: document location
	 * pageNumber: current page number
	 * totalPages: total pages in the document
	 * For example, <span class=title></span> would generate span containing the title.
	 */
	headerTemplate?: string;
	/**
	 * HTML template for the print footer. Should use the same format as the headerTemplate.
	 */
	footerTemplate?: string;
	/**
	 * Whether or not to prefer page size as defined by css. Defaults to false, in which case the content will be scaled to fit the paper size.
	 */
	preferCSSPageSize?: boolean;
}

export interface PrintPDFResponse {
	/**
	 * Base64-encoded pdf data. Empty if |returnAsStream| is specified. (Encoded as a base64 string when passed over JSON)
	 */
	data: string;
}

export interface RequestWillBeSentEvent {
	/**
	 * Request identifier.
	 */
	requestId: RequestId;
	/**
	 * Loader identifier. Empty string if the request is fetched from worker.
	 */
	loaderId: LoaderId;
	/**
	 * URL of the document this request is loaded for.
	 */
	documentURL: string;
	/**
	 * Request data.
	 */
	request: Request;
	/**
	 * Timestamp.
	 */
	timestamp: number;
	/**
	 * Timestamp.
	 */
	wallTime: number;
	/**
	 * Request initiator.
	 */
	initiator: Initiator;
	/**
	 * In the case that redirectResponse is populated, this flag indicates whether
	 * requestWillBeSentExtraInfo and responseReceivedExtraInfo events will be or were emitted
	 * for the request which was just redirected.
	 */
	redirectHasExtraInfo: boolean;
	/**
	 * Redirect response data.
	 */
	redirectResponse?: Response;
	/**
	 * Type of this resource.
	 */
	type?: ResourceType;
	/**
	 * Frame identifier.
	 */
	frameId?: FrameId;
	/**
	 * Whether the request is initiated by a user gesture. Defaults to false.
	 */
	hasUserGesture?: boolean;
}

interface Initiator {
	/**
	 * Type of this initiator. (InitiatorType enum)
	 */
	type:
		| 'parser'
		| 'script'
		| 'preload'
		| 'SignedExchange'
		| 'preflight'
		| 'other';
	/**
	 * Initiator JavaScript stack trace, set for Script only.
	 */
	stack?: StackTrace;
	/**
	 * Initiator URL, set for Parser type or for Script type (when script is importing module) or for SignedExchange type.
	 */
	url?: string;
	/**
	 * Initiator line number, set for Parser type or for Script type (when script is importing
	 * module) (0-based).
	 */
	lineNumber?: number;
	/**
	 * Initiator column number, set for Parser type or for Script type (when script is importing
	 * module) (0-based).
	 */
	columnNumber?: number;
	/**
	 * Set if another request triggered this request (e.g. preflight).
	 */
	requestId?: RequestId;
}

type ResourceType =
	| 'Document'
	| 'Stylesheet'
	| 'Image'
	| 'Media'
	| 'Font'
	| 'Script'
	| 'TextTrack'
	| 'XHR'
	| 'Fetch'
	| 'EventSource'
	| 'WebSocket'
	| 'Manifest'
	| 'SignedExchange'
	| 'Ping'
	| 'CSPViolationReport'
	| 'Preflight'
	| 'Other';

type RequestId = string;

export interface ActivateTargetRequest {
	targetId: TargetID;
}
export interface SetDefaultBackgroundColorOverrideRequest {
	/**
	 * RGBA of the default background color. If not specified, any existing override will be
	 * cleared.
	 */
	color?: RGBA;
}

interface RGBA {
	/**
	 * The red component, in the [0-255] range.
	 */
	r: number;
	/**
	 * The green component, in the [0-255] range.
	 */
	g: number;
	/**
	 * The blue component, in the [0-255] range.
	 */
	b: number;
	/**
	 * The alpha component, in the [0-1] range (default: 1).
	 */
	a?: number;
}

export interface Response {
	/**
	 * Response URL. This URL can be different from CachedResource.url in case of redirect.
	 */
	url: string;
	/**
	 * HTTP response status code.
	 */
	status: number;
	/**
	 * HTTP response status text.
	 */
	statusText: string;
	/**
	 * HTTP response headers.
	 */
	headers: Headers;
	/**
	 * HTTP response headers text. This has been replaced by the headers in Network.responseReceivedExtraInfo.
	 */
	headersText?: string;
	/**
	 * Resource mimeType as determined by the browser.
	 */
	mimeType: string;
	/**
	 * Refined HTTP request headers that were actually transmitted over the network.
	 */
	requestHeaders?: Headers;
	/**
	 * HTTP request headers text. This has been replaced by the headers in Network.requestWillBeSentExtraInfo.
	 */
	requestHeadersText?: string;
	/**
	 * Specifies whether physical connection was actually reused for this request.
	 */
	connectionReused: boolean;
	/**
	 * Physical connection id that was actually used for this request.
	 */
	connectionId: number;
	/**
	 * Remote IP address.
	 */
	remoteIPAddress?: string;
	/**
	 * Remote port.
	 */
	remotePort?: number;
	/**
	 * Specifies that the request was served from the disk cache.
	 */
	fromDiskCache?: boolean;
	/**
	 * Specifies that the request was served from the ServiceWorker.
	 */
	fromServiceWorker?: boolean;
	/**
	 * Specifies that the request was served from the prefetch cache.
	 */
	fromPrefetchCache?: boolean;
	/**
	 * Total number of bytes received for this request so far.
	 */
	encodedDataLength: number;

	/**
	 * The time at which the returned response was generated.
	 */
	responseTime?: number;
	/**
	 * Cache Storage Cache Name.
	 */
	cacheStorageCacheName?: string;
	/**
	 * Protocol used to fetch this request.
	 */
	protocol?: string;
}

export interface ResponseReceivedExtraInfoEvent {
	/**
	 * Request identifier. Used to match this information to another responseReceived event.
	 */
	requestId: RequestId;

	/**
	 * Raw response headers as they were received over the wire.
	 */
	headers: Headers;

	/**
	 * The status code of the response. This is useful in cases the request failed and no responseReceived
	 * event is triggered, which is the case for, e.g., CORS errors. This is also the correct status code
	 * for cached requests, where the status in responseReceived is a 200 and this will be 304.
	 */
	statusCode: number;
	/**
	 * Raw response header text as it was received over the wire. The raw text may not always be
	 * available, such as in the case of HTTP/2 or QUIC.
	 */
	headersText?: string;
}

interface Request {
	/**
	 * Request URL (without fragment).
	 */
	url: string;
	/**
	 * Fragment of the requested URL starting with hash, if present.
	 */
	urlFragment?: string;
	/**
	 * HTTP request method.
	 */
	method: string;
	/**
	 * HTTP request headers.
	 */
	headers: Headers;
	/**
	 * HTTP POST request data.
	 */
	postData?: string;
	/**
	 * True when the request has POST data. Note that postData might still be omitted when this flag is true when the data is too long.
	 */
	hasPostData?: boolean;

	/**
	 * The referrer policy of the request, as defined in https://www.w3.org/TR/referrer-policy/ (RequestReferrerPolicy enum)
	 */
	referrerPolicy:
		| 'unsafe-url'
		| 'no-referrer-when-downgrade'
		| 'no-referrer'
		| 'origin'
		| 'origin-when-cross-origin'
		| 'same-origin'
		| 'strict-origin'
		| 'strict-origin-when-cross-origin';
	/**
	 * Whether is loaded via link preload.
	 */
	isLinkPreload?: boolean;

	/**
	 * True if this resource request is considered to be the 'same site' as the
	 * request correspondinfg to the main frame.
	 */
	isSameSite?: boolean;
}

export interface RequestPausedEvent {
	/**
	 * Each request the page makes will have a unique id.
	 */
	requestId: RequestId;
	/**
	 * The details of the request.
	 */
	request: Request;
	/**
	 * The id of the frame that initiated the request.
	 */
	frameId: FrameId;
	/**
	 * How the requested resource will be used.
	 */
	resourceType: ResourceType;
	/**
	 * Response status text if intercepted at response stage.
	 */
	responseStatusText?: string;

	/**
	 * If the intercepted request had a corresponding Network.requestWillBeSent event fired for it,
	 * then this networkId will be the same as the requestId present in the requestWillBeSent event.
	 */
	networkId?: RequestId;
}

export interface ResponseReceivedEvent {
	/**
	 * Request identifier.
	 */
	requestId: RequestId;
	/**
	 * Loader identifier. Empty string if the request is fetched from worker.
	 */
	loaderId: LoaderId;
	/**
	 * Timestamp.
	 */
	timestamp: number;
	/**
	 * Resource type.
	 */
	type: ResourceType;
	/**
	 * Response data.
	 */
	response: Response;
	/**
	 * Indicates whether requestWillBeSentExtraInfo and responseReceivedExtraInfo events will be
	 * or were emitted for this request.
	 */
	hasExtraInfo: boolean;
	/**
	 * Frame identifier.
	 */
	frameId?: FrameId;
}

export interface LoadingFinishedEvent {
	/**
	 * Request identifier.
	 */
	requestId: RequestId;
	/**
	 * Timestamp.
	 */
	timestamp: number;
	/**
	 * Total number of bytes received for this request.
	 */
	encodedDataLength: number;
	/**
	 * Set when 1) response was blocked by Cross-Origin Read Blocking and also
	 * 2) this needs to be reported to the DevTools console.
	 */
	shouldReportCorbBlocking?: boolean;
}

export interface LoadingFailedEvent {
	/**
	 * Request identifier.
	 */
	requestId: RequestId;
	/**
	 * Timestamp.
	 */
	timestamp: number;
	/**
	 * Resource type.
	 */
	type: ResourceType;
	/**
	 * User friendly error message.
	 */
	errorText: string;
	/**
	 * True if loading was canceled.
	 */
	canceled?: boolean;
}

export interface EnableRequest {
	/**
	 * Time domain to use for collecting and reporting duration metrics. (EnableRequestTimeDomain enum)
	 */
	timeDomain?: 'timeTicks' | 'threadTicks';
}

export interface RequestServedFromCacheEvent {
	/**
	 * Request identifier.
	 */
	requestId: RequestId;
}

export interface DetachFromTargetRequest {
	/**
	 * Session to detach.
	 */
	sessionId?: SessionID;
	/**
	 * Deprecated.
	 */
	targetId?: TargetID;
}

export interface SetDeviceMetricsOverrideRequest {
	/**
	 * Overriding width value in pixels (minimum 0, maximum 10000000). 0 disables the override.
	 */
	width: number;
	/**
	 * Overriding height value in pixels (minimum 0, maximum 10000000). 0 disables the override.
	 */
	height: number;
	/**
	 * Overriding device scale factor value. 0 disables the override.
	 */
	deviceScaleFactor: number;
	/**
	 * Whether to emulate mobile device. This includes viewport meta tag, overlay scrollbars, text
	 * autosizing and more.
	 */
	mobile: boolean;
	/**
	 * Scale to apply to resulting view image.
	 */
	scale?: number;
	/**
	 * Overriding screen width value in pixels (minimum 0, maximum 10000000).
	 */
	screenWidth?: number;
	/**
	 * Overriding screen height value in pixels (minimum 0, maximum 10000000).
	 */
	screenHeight?: number;
	/**
	 * Overriding view X position on screen in pixels (minimum 0, maximum 10000000).
	 */
	positionX?: number;
	/**
	 * Overriding view Y position on screen in pixels (minimum 0, maximum 10000000).
	 */
	positionY?: number;
	/**
	 * Do not set visible view size, rely upon explicit setVisibleSize call.
	 */
	dontSetVisibleSize?: boolean;
	/**
	 * Screen orientation override.
	 */
	screenOrientation?: ScreenOrientation;
	/**
	 * If set, the visible area of the page will be overridden to this viewport. This viewport
	 * change is not observed by the page, e.g. viewport-relative elements do not change positions.
	 */
	viewport?: {
		/**
		 * X offset in device independent pixels (dip).
		 */
		x: number;
		/**
		 * Y offset in device independent pixels (dip).
		 */
		y: number;
		/**
		 * Rectangle width in device independent pixels (dip).
		 */
		width: number;
		/**
		 * Rectangle height in device independent pixels (dip).
		 */
		height: number;
		/**
		 * Page scale factor.
		 */
		scale: number;
	};
	/**
	 * If set, the display feature of a multi-segment screen. If not set, multi-segment support
	 * is turned-off.
	 */
	displayFeature?: DisplayFeature;
}

interface DisplayFeature {
	/**
	 * Orientation of a display feature in relation to screen (DisplayFeatureOrientation enum)
	 */
	orientation: 'vertical' | 'horizontal';
	/**
	 * The offset from the screen origin in either the x (for vertical
	 * orientation) or y (for horizontal orientation) direction.
	 */
	offset: number;
	/**
	 * A display feature may mask content such that it is not physically
	 * displayed - this length along with the offset describes this area.
	 * A display feature that only splits content will have a 0 mask_length.
	 */
	maskLength: number;
}

export interface EntryAddedEvent {
	/**
	 * The entry.
	 */
	entry: LogEntry;
}

interface LogEntry {
	/**
	 * Log entry source. (LogEntrySource enum)
	 */
	source:
		| 'xml'
		| 'javascript'
		| 'network'
		| 'storage'
		| 'appcache'
		| 'rendering'
		| 'security'
		| 'deprecation'
		| 'worker'
		| 'violation'
		| 'intervention'
		| 'recommendation'
		| 'other';
	/**
	 * Log entry severity. (LogEntryLevel enum)
	 */
	level: 'verbose' | 'info' | 'warning' | 'error';
	/**
	 * Logged text.
	 */
	text: string;
	/**
	 *  (LogEntryCategory enum)
	 */
	category?: 'cors';
	/**
	 * Timestamp when this entry was added.
	 */
	timestamp: number;
	/**
	 * URL of the resource if known.
	 */
	url?: string;
	/**
	 * Line number in the resource.
	 */
	lineNumber?: number;
	/**
	 * JavaScript stack trace.
	 */
	stackTrace?: StackTrace;
	/**
	 * Identifier of the network request associated with this entry.
	 */
	networkRequestId?: RequestId;
	/**
	 * Identifier of the worker associated with this entry.
	 */
	workerId?: string;
	/**
	 * Call arguments.
	 */
	args?: DevtoolsRemoteObject[];
}

export interface ConsoleAPICalledEvent {
	/**
	 * Type of the call. (ConsoleAPICalledEventType enum)
	 */
	type:
		| 'log'
		| 'debug'
		| 'info'
		| 'error'
		| 'warning'
		| 'dir'
		| 'dirxml'
		| 'table'
		| 'trace'
		| 'clear'
		| 'startGroup'
		| 'startGroupCollapsed'
		| 'endGroup'
		| 'assert'
		| 'profile'
		| 'profileEnd'
		| 'count'
		| 'timeEnd';
	/**
	 * Call arguments.
	 */
	args: DevtoolsRemoteObject[];
	/**
	 * Identifier of the context where the call was made.
	 */
	executionContextId: ExecutionContextId;
	/**
	 * Call timestamp.
	 */
	timestamp: number;
	/**
	 * Stack trace captured when the call was made. The async stack chain is automatically reported for
	 * the following call types: `assert`, `error`, `trace`, `warning`. For other types the async call
	 * chain can be retrieved using `Debugger.getStackTrace` and `stackTrace.parentId` field.
	 */
	stackTrace?: StackTrace;
	/**
	 * Console context descriptor for calls on non-default console context (not console.*):
	 * 'anonymous#unique-logger-id' for call on unnamed context, 'name#unique-logger-id' for call
	 * on named context.
	 */
	context?: string;
}

export interface BindingCalledEvent {
	name: string;
	payload: string;
	/**
	 * Identifier of the context where the call was made.
	 */
	executionContextId: ExecutionContextId;
}

interface ScreenOrientation {
	/**
	 * Orientation type. (ScreenOrientationType enum)
	 */
	type:
		| 'portraitPrimary'
		| 'portraitSecondary'
		| 'landscapePrimary'
		| 'landscapeSecondary';
	/**
	 * Orientation angle.
	 */
	angle: number;
}

export interface CloseTargetRequest {
	targetId: TargetID;
}

export interface CloseTargetResponse {
	/**
	 * Always set to true. If an error occurs, the response indicates protocol error.
	 */
	success: boolean;
}

export interface ExceptionThrownEvent {
	/**
	 * Timestamp of the exception.
	 */
	timestamp: number;
	exceptionDetails: ExceptionDetails;
}

export interface ReleaseObjectRequest {
	/**
	 * Identifier of the object to release.
	 */
	objectId: RemoteObjectId;
}
