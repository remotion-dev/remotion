import type {MediaParserController} from 'node_modules/@remotion/media-parser/src/controller';
import React, {useCallback, useEffect, useState} from 'react';
import {Button} from './ui/button';

export const PauseResumeAndCancel: React.FC<{
	readonly controller: MediaParserController;
}> = ({controller}) => {
	const [isPaused, setIsPaused] = useState(false);

	const onClickPause = useCallback(() => {
		controller.pause();
	}, [controller]);

	const onClickResume = useCallback(() => {
		controller.resume();
	}, [controller]);

	const onClickAbort = useCallback(() => {
		controller.abort();
	}, [controller]);

	useEffect(() => {
		const onPause = () => {
			setIsPaused(true);
		};

		const onResume = () => {
			setIsPaused(false);
		};

		controller.addEventListener('pause', onPause);
		controller.addEventListener('resume', onResume);

		return () => {
			controller.removeEventListener('pause', onPause);
			controller.removeEventListener('resume', onResume);
		};
	}, [controller]);

	if (isPaused) {
		return (
			<>
				<Button className="block w-full" type="button" onClick={onClickResume}>
					Resume
				</Button>
				<div className="h-2" />
				<Button className="block w-full" type="button" onClick={onClickAbort}>
					Cancel
				</Button>
			</>
		);
	}

	return (
		<Button className="block w-full" type="button" onClick={onClickPause}>
			Pause
		</Button>
	);
};
