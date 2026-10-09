import {ALL_FORMATS, Input, UrlSource} from 'mediabunny';
import React, {useEffect, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	Html5Video,
	Loop,
	OffthreadVideo,
	RemotionOffthreadVideoProps,
	useRemotionEnvironment,
	useVideoConfig,
} from 'remotion';

const LoopedOffthreadVideo: React.FC<RemotionOffthreadVideoProps> = (props) => {
	const [duration, setDuration] = useState<number | null>(null);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	useEffect(() => {
		const input = new Input({
			formats: ALL_FORMATS,
			source: new UrlSource(props.src),
		});
		let cancelled = false;

		input
			.computeDuration()
			.then((durationInSeconds) => {
				if (cancelled) {
					return;
				}
				setDuration(durationInSeconds);
				continueRender(handle);
			})
			.catch((err) => {
				if (!cancelled) {
					cancelRender(err);
				}
			})
			.finally(() => input.dispose());

		return () => {
			cancelled = true;
			continueRender(handle);
			input.dispose();
		};
	}, [handle, props.src]);

	if (duration === null) {
		return null;
	}

	return (
		<Loop durationInFrames={Math.floor(duration * fps)}>
			<OffthreadVideo {...props} />;
		</Loop>
	);
};

export const LoopableOffthreadVideo: React.FC<
	RemotionOffthreadVideoProps & {
		loop?: boolean;
	}
> = ({loop, ...props}) => {
	const env = useRemotionEnvironment();
	if (env.isRendering) {
		if (loop) {
			return <LoopedOffthreadVideo {...props} />;
		}

		return <OffthreadVideo {...props} />;
	}

	return <Html5Video loop={loop} {...props}></Html5Video>;
};
