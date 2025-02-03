import type {MediaParserController} from '@remotion/media-parser';
import React, {useCallback, useEffect, useState} from 'react';
import {useAddPausedToTitle} from '~/lib/title-context';
import {Button} from './ui/button';

export const PauseResumeAndCancel: React.FC<{
	readonly controller: MediaParserController;
}> = ({controller}) => {
	useAddPausedToTitle(controller);

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
			<div className="flex flex-row">
				<Button
					variant={'brand'}
					className="block w-full"
					type="button"
					onClick={onClickResume}
				>
					Resume
				</Button>
				<div className="w-4" />
				<Button
					variant={'brandsecondary'}
					className="block w-full text-red-600"
					type="button"
					onClick={onClickAbort}
				>
					Cancel
				</Button>
			</div>
		);
	}

	return (
		<Button
			variant={'brandsecondary'}
			className="block w-full"
			type="button"
			onClick={onClickPause}
		>
			Pause
		</Button>
	);
};
