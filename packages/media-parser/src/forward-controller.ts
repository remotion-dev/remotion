import type {CallbackListener} from './emitter';
import type {MediaParserController} from './media-parser-controller';

export const forwardMediaParserController = ({
	parentController,
	childController,
}: {
	parentController: MediaParserController;
	childController: MediaParserController;
}) => {
	const onAbort: CallbackListener<'abort'> = ({detail}) => {
		childController.abort(detail.reason);
	};

	const onResume: CallbackListener<'resume'> = () => {
		childController.resume();
	};

	const onPause: CallbackListener<'pause'> = () => {
		childController.pause();
	};

	parentController.addEventListener('abort', onAbort);
	parentController.addEventListener('resume', onResume);
	parentController.addEventListener('pause', onPause);

	return {
		cleanup: () => {
			parentController.removeEventListener('abort', onAbort);
			parentController.removeEventListener('resume', onResume);
			parentController.removeEventListener('pause', onPause);
		},
	};
};
