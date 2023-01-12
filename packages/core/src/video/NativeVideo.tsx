import React, {useCallback} from 'react';
import {getRemotionEnvironment} from '../get-environment';
import {Sequence} from '../Sequence';
import {validateMediaProps} from '../validate-media-props';
import {validateStartFromProps} from '../validate-start-from-props';
import {NativeVideoForRendering} from './NativeVideoForRendering';
import type {RemotionMainVideoProps} from './props';
import {VideoForDevelopment} from './VideoForDevelopment';

export const NativeVideo: React.FC<
	{
		src: string;
	} & RemotionMainVideoProps
> = (props) => {
	const {startFrom, endAt, ...otherProps} = props;

	const onDuration = useCallback(() => undefined, []);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<NativeVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src
			)} instead.`
		);
	}

	if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
		validateStartFromProps(startFrom, endAt);

		const startFromFrameNo = startFrom ?? 0;
		const endAtFrameNo = endAt ?? Infinity;
		return (
			<Sequence
				layout="none"
				from={0 - startFromFrameNo}
				showInTimeline={false}
				durationInFrames={endAtFrameNo}
			>
				<NativeVideo {...otherProps} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (getRemotionEnvironment() === 'rendering') {
		throw new Error('Cannot render in the browser');
	}

	if (getRemotionEnvironment() === 'server-rendering') {
		return <NativeVideoForRendering {...otherProps} />;
	}

	return (
		<VideoForDevelopment
			onDuration={onDuration}
			onlyWarnForMediaSeekingError
			{...otherProps}
		/>
	);
};
