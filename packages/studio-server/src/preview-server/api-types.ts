import type {LogLevel} from '@remotion/renderer';
import type {RenderJobWithCleanup} from '@remotion/studio-shared';
import type {IncomingMessage, ServerResponse} from 'node:http';

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
	publicDir: string;
	binariesDirectory: string | null;
}) => Promise<ResData>;
