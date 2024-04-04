import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Freeze,
	Sequence,
	SequenceProps,
	staticFile,
	useCurrentFrame,
	Video,
} from 'remotion';

const Premount: React.FC<
	{
		children: React.ReactNode;
		premountFor: number;
	} & SequenceProps
> = ({premountFor, ...props}) => {
	const frame = useCurrentFrame();

	if (props.layout === 'none') {
		throw new Error('`<Premount>` does not support layout="none"');
	}

	const {style: passedStyle, from = 0, ...otherProps} = props;
	const active = frame < premountFor + from;

	const style = useMemo(() => {
		return {
			...passedStyle,
			opacity: active ? 0 : 1,
			pointerEvents: active ? 'none' : passedStyle?.pointerEvents ?? 'auto',
		};
	}, [active, passedStyle]);

	return (
		<Freeze frame={frame >= from ? from : -1} active={active}>
			<Sequence
				name={`<Premount premountFor={${premountFor}}>`}
				from={from + (active ? 0 : premountFor)}
				style={style}
				{...otherProps}
			/>
		</Freeze>
	);
};

const ShouldNotUnmount: React.FC = () => {
	return <Video src={staticFile('framer.webm')} />;
};

export const PremountedExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<Premount premountFor={10} from={30} durationInFrames={200}>
				<ShouldNotUnmount />
			</Premount>
		</AbsoluteFill>
	);
};
