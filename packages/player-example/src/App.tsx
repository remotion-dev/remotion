import {
	CallbackListener,
	ErrorFallback,
	Player,
	PlayerRef,
	RenderLoading,
	RenderPoster,
} from '@remotion/player';
import React, {
	ComponentType,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {playerExampleComp} from './CarSlideshow';
import {Loading} from './Loading';
import {TimeDisplay} from './TimeDisplay';
import {useCurrentPlayerFrame} from './use-current-player-frame';

const fps = 30;

type AnyComponent<T> = ComponentType<T> | ((props: T) => ReactNode);

type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: AnyComponent<T>}>;
	  }
	| {
			component: AnyComponent<T>;
	  };

const ControlsOnly: React.FC<{
	playerRef: React.RefObject<PlayerRef>;
}> = ({playerRef: ref}) => {
	const time = useCurrentPlayerFrame(ref);
	console.log('render child');
	return <div>Current time: {time}</div>;
};

const PlayerOnly: React.FC<
	{
		playerRef: React.RefObject<PlayerRef>;
		inputProps: object;
		durationInFrames: number;
	} & CompProps<any>
> = ({playerRef, inputProps, durationInFrames, ...props}) => {
	return (
		<Player
			ref={playerRef}
			controls
			compositionWidth={500}
			compositionHeight={432}
			fps={fps}
			{...props}
			durationInFrames={durationInFrames}
			inputProps={inputProps}
		/>
	);
};

export default ({
	durationInFrames,
	...props
}: {
	durationInFrames: number;
} & CompProps<any>) => {
	const ref = useRef<PlayerRef>(null);

	const inputProps = useMemo(() => {
		return {
			title: 'hi',
			bgColor: '#000',
			color: '#fff',
		};
	}, []);
	console.log('renderparent');

	return (
		<div style={{margin: '2rem'}}>
			<PlayerOnly
				{...props}
				playerRef={ref}
				durationInFrames={100}
				inputProps={inputProps}
			/>
			<ControlsOnly playerRef={ref} />
		</div>
	);
};
