import type {IncomingMessage, ServerResponse} from 'http';
import type {
	AddRenderRequest,
	RemoveRenderRequest,
	SubscribeToFileExistenceRequest,
	SubscribeToFileExistenceResponse,
	UnsubscribeFromFileExistenceRequest,
} from './render-queue/job';

export type ApiHandler<ReqData, ResData> = (params: {
	input: ReqData;
	entryPoint: string;
	remotionRoot: string;
	request: IncomingMessage;
	response: ServerResponse;
}) => Promise<ResData>;

export type ApiRoute<ReqData, ResData> = {
	handler: ApiHandler<ReqData, ResData>;
	endpoint: string;
};

type ReqAndRes<A, B> = {
	Request: A;
	Response: B;
};

export type ApiRoutes = {
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
};
