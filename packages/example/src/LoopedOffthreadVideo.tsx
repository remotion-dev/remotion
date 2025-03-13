import {mediaParserController, parseMedia} from '@remotion/media-parser';
import React, {useEffect, useState} from 'react';
import {
	cancelRender,
	continueRender,
	delayRender,
	getRemotionEnvironment,
	Loop,
	OffthreadVideo,
	RemotionOffthreadVideoProps,
	useVideoConfig,
	Video,
} from 'remotion';

const LoopedOffthreadVideo: React.FC<RemotionOffthreadVideoProps> = (props) => {
	const [duration, setDuration] = useState<number | null>(null);
	const [handle] = useState(() => delayRender());
	const {fps} = useVideoConfig();

	useEffect(() => {
		const controller = mediaParserController();

		parseMedia({
			src: props.src,
			acknowledgeRemotionLicense: true,
			controller,
			fields: {
				slowDurationInSeconds: true,
			},
		})
			.then(({slowDurationInSeconds}) => {
				setDuration(slowDurationInSeconds);
				continueRender(handle);
			})
			.catch((err) => {
				cancelRender(err);
			});

		return () => {
			continueRender(handle);
			controller.abort();
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
	if (getRemotionEnvironment().isRendering) {
		if (loop) {
			return <LoopedOffthreadVideo {...props} />;
		}

		return <OffthreadVideo {...props} />;
	}

	return <Video loop={loop} {...props}></Video>;
};
