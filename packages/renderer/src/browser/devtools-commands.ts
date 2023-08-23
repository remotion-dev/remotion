import type {
	ActivateTargetRequest,
	AddScriptToEvaluateOnNewDocumentRequest,
	AddScriptToEvaluateOnNewDocumentResponse,
	CallFunctionOnRequest,
	CallFunctionOnResponse,
	CaptureScreenshotRequest,
	CaptureScreenshotResponse,
	CloseTargetRequest,
	CloseTargetResponse,
	CreateIsolatedWorldRequest,
	CreateIsolatedWorldResponse,
	DetachFromTargetRequest,
	DevtoolsRemoteObject,
	EnableRequest,
	ExceptionDetails,
	GetFrameTreeResponse,
	NavigateRequest,
	NavigateResponse,
	PrintPDFRequest,
	PrintPDFResponse,
	ReleaseObjectRequest,
	SetAutoAttachRequest,
	SetDefaultBackgroundColorOverrideRequest,
	SetDeviceMetricsOverrideRequest,
	SetLifecycleEventsEnabledRequest,
} from './devtools-types';

export interface Commands {
	/**
	 * Does nothing.
	 */
	'Console.clearMessages': {
		paramsType: [];
		returnType: void;
	};
	'Target.setDiscoverTargets': {
		paramsType: [
			{
				/**
				 * Whether to discover available targets.
				 */
				discover: boolean;
			},
		];
		returnType: void;
	};
	'Target.createTarget': {
		paramsType: [
			{
				/**
				 * The initial URL the page will be navigated to. An empty string indicates about:blank.
				 */
				url: string;
				/**
				 * Frame width in DIP (headless chrome only).
				 */
				width?: number;
				/**
				 * Frame height in DIP (headless chrome only).
				 */
				height?: number;
				/**
				 * The browser context to create the page in.
				 */
				browserContextId?: string;
				/**
				 * Whether BeginFrames for this target will be controlled via DevTools (headless chrome only,
				 * not supported on MacOS yet, false by default).
				 */
				enableBeginFrameControl?: boolean;
				/**
				 * Whether to create a new Window or Tab (chrome-only, false by default).
				 */
				newWindow?: boolean;
				/**
				 * Whether to create the target in background or foreground (chrome-only,
				 * false by default).
				 */
				background?: boolean;
			},
		];
		returnType: {
			targetId: string;
		};
	};
	'Browser.close': {
		paramsType: [];
		returnType: void;
	};
	'Target.attachToTarget': {
		paramsType: [
			{
				targetId: string;
				/**
				 * Enables "flat" access to the session via specifying sessionId attribute in the commands.
				 * We plan to make this the default, deprecate non-flattened mode,
				 * and eventually retire it. See crbug.com/991325.
				 */
				flatten?: boolean;
			},
		];
		returnType: {
			/**
			 * Id assigned to the session.
			 */
			sessionId: string;
		};
	};
	'Runtime.callFunctionOn': {
		paramsType: [CallFunctionOnRequest];
		returnType: CallFunctionOnResponse;
	};
	'Runtime.evaluate': {
		paramsType: [
			{
				/**
				 * Expression to evaluate.
				 */
				expression: string;
				/**
				 * Symbolic group name that can be used to release multiple objects.
				 */
				objectGroup?: string;
				/**
				 * Determines whether Command Line API should be available during the evaluation.
				 */
				includeCommandLineAPI?: boolean;
				/**
				 * In silent mode exceptions thrown during evaluation are not reported and do not pause
				 * execution. Overrides `setPauseOnException` state.
				 */
				silent?: boolean;
				/**
				 * Specifies in which execution context to perform evaluation. If the parameter is omitted the
				 * evaluation will be performed in the context of the inspected page.
				 * This is mutually exclusive with `uniqueContextId`, which offers an
				 * alternative way to identify the execution context that is more reliable
				 * in a multi-process environment.
				 */
				contextId?: number;
				/**
				 * Whether the result is expected to be a JSON object that should be sent by value.
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
				 * Whether to throw an exception if side effect cannot be ruled out during evaluation.
				 * This implies `disableBreaks` below.
				 */
				throwOnSideEffect?: boolean;
				/**
				 * Terminate execution after timing out (number of milliseconds).
				 */
				/**
				 * Disable breakpoints during execution.
				 */
				disableBreaks?: boolean;
				/**
				 * Setting this flag to true enables `let` re-declaration and top-level `await`.
				 * Note that `let` variables can only be re-declared if they originate from
				 * `replMode` themselves.
				 */
				replMode?: boolean;
				/**
				 * The Content Security Policy (CSP) for the target might block 'unsafe-eval'
				 * which includes eval(), Function(), setTimeout() and setInterval()
				 * when called with non-callable arguments. This flag bypasses CSP for this
				 * evaluation and allows unsafe-eval. Defaults to true.
				 */
				allowUnsafeEvalBlockedByCSP?: boolean;
				/**
				 * An alternative way to specify the execution context to evaluate in.
				 * Compared to contextId that may be reused across processes, this is guaranteed to be
				 * system-unique, so it can be used to prevent accidental evaluation of the expression
				 * in context different than intended (e.g. as a result of navigation across process
				 * boundaries).
				 * This is mutually exclusive with `contextId`.
				 */
				uniqueContextId?: string;
				/**
				 * Whether the result should be serialized according to https://w3c.github.io/webdriver-bidi.
				 */
				generateWebDriverValue?: boolean;
			},
		];
		returnType: {
			/**
			 * Evaluation result.
			 */
			result: DevtoolsRemoteObject;
			/**
			 * Exception details.
			 */
			exceptionDetails?: ExceptionDetails;
		};
	};
	'Page.enable': {
		paramsType: [];
		returnType: void;
	};
	'Page.getFrameTree': {
		paramsType: [];
		returnType: GetFrameTreeResponse;
	};
	'Target.setAutoAttach': {
		paramsType: [SetAutoAttachRequest];
		returnType: void;
	};
	'Page.setLifecycleEventsEnabled': {
		paramsType: [SetLifecycleEventsEnabledRequest];
		returnType: void;
	};
	'Runtime.enable': {
		paramsType: [];
		returnType: void;
	};
	'Page.navigate': {
		paramsType: [NavigateRequest];
		returnType: NavigateResponse;
	};
	'Page.addScriptToEvaluateOnNewDocument': {
		paramsType: [AddScriptToEvaluateOnNewDocumentRequest];
		returnType: AddScriptToEvaluateOnNewDocumentResponse;
	};
	'Page.createIsolatedWorld': {
		paramsType: [CreateIsolatedWorldRequest];
		returnType: CreateIsolatedWorldResponse;
	};
	'Page.captureScreenshot': {
		paramsType: [CaptureScreenshotRequest?];
		returnType: CaptureScreenshotResponse;
	};
	'Page.printToPDF': {
		paramsType: [PrintPDFRequest];
		returnType: PrintPDFResponse;
	};
	'Target.activateTarget': {
		paramsType: [ActivateTargetRequest];
		returnType: void;
	};
	'Emulation.setDefaultBackgroundColorOverride': {
		paramsType: [SetDefaultBackgroundColorOverrideRequest?];
		returnType: void;
	};
	'Network.enable': {
		paramsType: [EnableRequest?];
		returnType: void;
	};
	'Target.detachFromTarget': {
		paramsType: [DetachFromTargetRequest?];
		returnType: void;
	};
	/**
	 * Enable collecting and reporting metrics.
	 */
	'Performance.enable': {
		paramsType: [EnableRequest?];
		returnType: void;
	};
	'Log.enable': {
		paramsType: [];
		returnType: void;
	};
	'Page.setDeviceMetricsOverride': {
		paramsType: [SetDeviceMetricsOverrideRequest];
		returnType: void;
	};
	'Page.bringToFront': {
		paramsType: [];
		returnType: void;
	};
	'Emulation.setDeviceMetricsOverride': {
		paramsType: [SetDeviceMetricsOverrideRequest];
		returnType: void;
	};
	'Target.closeTarget': {
		paramsType: [CloseTargetRequest];
		returnType: CloseTargetResponse;
	};
	'Page.close': {
		paramsType: [];
		returnType: void;
	};
	'Runtime.releaseObject': {
		paramsType: [ReleaseObjectRequest];
		returnType: void;
	};
}
