import React, {useImperativeHandle, useState} from 'react';
import {flushSync} from 'react-dom';
import type {LogLevel} from 'remotion';
import {Internals} from 'remotion';

export type TimeUpdaterRef = {
	update: (frame: number) => void;
};

export const UpdateTime: React.FC<{
	readonly children: React.ReactNode;
	readonly audioEnabled: boolean;
	readonly videoEnabled: boolean;
	readonly logLevel: LogLevel;
	readonly compId: string;
	readonly initialFrame: number;
	readonly timeUpdater: React.RefObject<TimeUpdaterRef | null>;
}> = ({
	children,
	audioEnabled,
	videoEnabled,
	logLevel,
	compId,
	initialFrame,
	timeUpdater,
}) => {
	const [frame, setFrame] = useState(initialFrame);

	useImperativeHandle(timeUpdater, () => ({
		update: (f: number) => {
			flushSync(() => {
				setFrame(f);
			});
		},
	}));

	return (
		<Internals.RemotionRootContexts
			audioEnabled={audioEnabled}
			videoEnabled={videoEnabled}
			logLevel={logLevel}
			numberOfAudioTags={0}
			audioLatencyHint="interactive"
			frameState={{
				[compId]: frame,
			}}
		>
			{children}
		</Internals.RemotionRootContexts>
	);
};
