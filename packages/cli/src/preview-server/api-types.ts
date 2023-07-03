import type {IncomingMessage, ServerResponse} from 'node:http';
import type {
	AddRenderRequest,
	CancelRenderRequest,
	CancelRenderResponse,
	CanUpdateDefaultPropsRequest,
	CanUpdateDefaultPropsResponse,
	OpenInFileExplorerRequest,
	RemoveRenderRequest,
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse,
	UnsubscribeFromFileExistenceRequest,
	UpdateAvailableRequest,
	UpdateAvailableResponse,
	UpdateDefaultPropsRequest,
	UpdateDefaultPropsResponse,
} from './render-queue/job';

export type ApiHandler<ReqData, ResData> = (params: {
	input: ReqData;
	entryPoint: string;
	remotionRoot: string;
	request: IncomingMessage;
	response: ServerResponse;
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
