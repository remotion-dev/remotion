import type {PlayerRef} from '@remotion/player';
import {renderMediaOnWeb} from '@remotion/web-renderer';
import React, {useCallback} from 'react';
import {z} from 'zod';
import {PALETTE} from '../layout/colors';
import {HomepageVideoComp} from './Comp';
import {DemoErrorIcon} from './DemoErrorIcon';
import {DoneCheckmark} from './DoneCheckmark';
import {Progress} from './Progress';
import {Spinner} from './Spinner';

const countryPath = z.object({
	d: z.string(),
	class: z.string(),
});

const remoteData = z.object({
	repos: z.array(z.string()),
	date: z.string().or(z.number()),
	temperatureInCelsius: z.number(),
	countryLabel: z.string(),
	countryPaths: z.array(countryPath),
});

const location = z.object({
	country: z.string(),
	city: z.string(),
	latitude: z.number().or(z.string()),
	longitude: z.number().or(z.string()),
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const data = z.object({
	trending: remoteData,
	location,
	emojiIndex: z.number(),
	theme: z.enum(['light', 'dark']),
	cardOrder: z.array(z.number()),
});

type State =
	| {
			type: 'idle';
	  }
	| {
			type: 'invoking';
	  }
	| {
			type: 'progress';
			progress: number;
	  }
	| {
			type: 'done';
	  }
	| {
			type: 'error';
	  };

const style: React.CSSProperties = {
	appearance: 'none',
	border: 'none',
	outline: 'none',
	backgroundColor: 'transparent',
	cursor: 'pointer',
	width: 55,
	height: 50,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
};

export const RenderButton: React.FC<{
	readonly renderData: z.infer<typeof data> | null;
	readonly onError: () => void;
	readonly playerRef: React.RefObject<PlayerRef | null>;
}> = ({renderData, onError, playerRef}) => {
	const [state, setState] = React.useState<State>({
		type: 'idle',
	});

	const triggerRender = useCallback(async () => {
		if (renderData === null) {
			return;
		}

		try {
			setState({type: 'invoking'});

			const durationInFrames = 120;
			const inputProps = {
				...renderData,
				onToggle: () => {},
				updateCardOrder: () => {},
				onClickLeft: () => {},
				onClickRight: () => {},
			};

			playerRef.current!.pause();

			const {getBlob} = await renderMediaOnWeb({
				composition: {
					component: HomepageVideoComp,
					durationInFrames,
					fps: 30,
					width: 640,
					height: 360,
					id: 'homepage-demo',
					defaultProps: inputProps,
				},
				muted: typeof AudioEncoder === 'undefined',
				scale: 1,
				inputProps,
				onProgress: ({renderedFrames}) => {
					setState({
						type: 'progress',
						progress: renderedFrames / durationInFrames,
					});
				},
			});

			const blob = await getBlob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'remotion.dev.mp4';
			a.click();
			URL.revokeObjectURL(url);
			setState({type: 'done'});
		} catch {
			setState({type: 'error'});
			onError();
		}
	}, [onError, renderData, playerRef]);

	return (
		<button
			type="button"
			onClick={triggerRender}
			style={style}
			disabled={!renderData || state.type !== 'idle'}
		>
			{state.type === 'error' ? (
				<DemoErrorIcon />
			) : state.type === 'done' ? (
				<DoneCheckmark />
			) : state.type === 'progress' ? (
				<Progress progress={state.progress} />
			) : state.type === 'invoking' ? (
				<Spinner size={20} duration={1} />
			) : (
				<svg
					style={{
						width: 18,
						opacity: renderData ? 1 : 0.5,
					}}
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 384 512"
				>
					<path
						fill={PALETTE.TEXT_COLOR}
						d="M214.6 342.6L192 365.3l-22.6-22.6-128-128L18.7 192 64 146.7l22.6 22.6L160 242.7 160 64l0-32 64 0 0 32 0 178.7 73.4-73.4L320 146.7 365.3 192l-22.6 22.6-128 128zM32 416l320 0 32 0 0 64-32 0L32 480 0 480l0-64 32 0z"
					/>
				</svg>
			)}
		</button>
	);
};
