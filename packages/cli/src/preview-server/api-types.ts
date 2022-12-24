import type {IncomingMessage, ServerResponse} from 'http';
import type {AddRenderRequest} from './render-queue/job';

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
};
