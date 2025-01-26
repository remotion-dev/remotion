import {mediaParserController} from '@remotion/media-parser';

export type WebCodecsController = {
	signal: AbortSignal;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	abort: (reason?: any) => void;
};

export const webcodecsController = (): WebCodecsController => {
	const controller = mediaParserController();
	return {
		signal: controller.signal,
		abort: controller.abort,
	};
};
