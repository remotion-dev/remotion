import React from 'react';
import {
	AbsoluteFill,
	Freeze,
	Sequence,
	Series,
	staticFile,
	useCurrentFrame,
	Video,
} from 'remotion';

const Premount: React.FC<{
	children: React.ReactNode;
	premountFor: number;
}> = ({children, premountFor}) => {
	const frame = useCurrentFrame();
	const active = frame < premountFor;

	return (
		<Freeze frame={0} active={active}>
			<Sequence
				layout="none"
				name={`<Premount premountFor={${premountFor}}>`}
				from={active ? 0 : premountFor}
			>
				{children}
			</Sequence>
		</Freeze>
	);
};

const ShouldNotUnmount: React.FC = () => {
	return <Video src={staticFile('framer.webm')} />;
};

export const PremountedExample: React.FC = () => {
	return (
		<AbsoluteFill>
			<Series.Sequence durationInFrames={20} offset={-10}>
				<Premount premountFor={10}>
					<ShouldNotUnmount />
				</Premount>
			</Series.Sequence>
		</AbsoluteFill>
	);
};
