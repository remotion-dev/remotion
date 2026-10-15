import React, {useContext, useEffect, useState} from 'react';
import {
	SequenceActivityContext,
	SequenceActivitySuspensionContext,
} from './sequence-activity-context.js';
import {SetTimelineContext} from './TimelineContext.js';

export const SequenceActivitySuspensionProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const enabled = useContext(SequenceActivityContext);
	const {isPlaying, subscribePlaying, seek} = useContext(SetTimelineContext);
	const [suspended, setSuspended] = useState(false);

	useEffect(() => {
		if (!enabled) {
			setSuspended(false);
			return;
		}

		let timeout: ReturnType<typeof setTimeout> | null = null;
		const update = () => {
			setSuspended(isPlaying() || timeout !== null);
		};

		const unsubscribePlaying = subscribePlaying(update);
		const unsubscribeSeek = seek?.subscribe(() => {
			setSuspended(true);
			if (timeout !== null) {
				clearTimeout(timeout);
			}

			// Repeated pointer, keyboard, and API seeks keep discovery suspended.
			// Resume only once navigation settles, using the latest scene props.
			timeout = setTimeout(() => {
				timeout = null;
				update();
			}, 150);
		});
		update();
		return () => {
			unsubscribePlaying();
			unsubscribeSeek?.();
			if (timeout !== null) {
				clearTimeout(timeout);
			}
		};
	}, [enabled, isPlaying, seek, subscribePlaying]);

	return (
		<SequenceActivitySuspensionContext.Provider value={suspended}>
			{children}
		</SequenceActivitySuspensionContext.Provider>
	);
};
