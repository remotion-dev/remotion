import type {LogLevel} from '@remotion/renderer';
import type {IncomingMessage, ServerResponse} from 'node:http';
import type {
	AddRenderRequest,
	CancelRenderRequest,
	CancelRenderResponse,
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse,
	CopyStillToClipboardRequest,
	OpenInFileExplorerRequest,
	RemoveRenderRequest,
	RenderJobWithCleanup,
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse,
	UnsubscribeFromFileExistenceRequest,
	UpdateAvailableRequest,
	UpdateAvailableResponse,
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from './job';

export type QueueMethods = {
	removeJob: (jobId: string) => void;
	cancelJob: (jobId: string) => void;
	addJob: ({
		job,
		entryPoint,
		remotionRoot,
		logLevel,
	}: {
		job: RenderJobWithCleanup;
		entryPoint: string;
		remotionRoot: string;
		logLevel: LogLevel;
	}) => void;
};

export type ApiHandler<ReqData, ResData> = (params: {
	input: ReqData;
	entryPoint: string;
	remotionRoot: string;
	request: IncomingMessage;
	response: ServerResponse;
	logLevel: LogLevel;
	methods: QueueMethods;
}) => Promise<ResData>;

type ReqAndRes<A, B> = {
	Request: A;
	Response: B;
};

export type ApiRoutes = {
	'/api/cancel': ReqAndRes<CancelRenderRequest, CancelRenderResponse>;
	'/api/render': ReqAndRes<AddRenderRequest, undefined>;
	'/api/unsubscribe-from-file-existence': ReqAndRes<
		UnsubscribeFromFileExistenceRequest,
		undefined
	>;
	'/api/subscribe-to-file-existence': ReqAndRes<
		SubscribeToFileExistenceRequest,
		SubscribeToFileExistenceResponse
	>;
	'/api/remove-render': ReqAndRes<RemoveRenderRequest, undefined>;
	'/api/open-in-file-explorer': ReqAndRes<OpenInFileExplorerRequest, void>;
	'/api/copy-still-to-clipboard': ReqAndRes<CopyStillToClipboardRequest, void>;
	'/api/update-default-props': ReqAndRes<
		UpdateDefaultPropsRequest,
		UpdateDefaultPropsResponse
	>;
	'/api/can-update-default-props': ReqAndRes<
		CanUpdateDefaultPropsRequest,
		CanUpdateDefaultPropsResponse
	>;
	'/api/update-available': ReqAndRes<
		UpdateAvailableRequest,
		UpdateAvailableResponse
	>;
};
