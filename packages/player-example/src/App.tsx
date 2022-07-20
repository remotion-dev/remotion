import {
	CallbackListener,
	ErrorFallback,
	Player,
	PlayerRef,
	RenderLoading,
} from '@remotion/player';
import {
	ComponentType,
	ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from 'react';
import {AbsoluteFill} from 'remotion';
import {playerExampleComp} from './CarSlideshow';
import {Loading} from './Loading';

const fps = 30;

type AnyComponent<T> = ComponentType<T> | ((props: T) => ReactNode);

type CompProps<T> =
	| {
			lazyComponent: () => Promise<{default: AnyComponent<T>}>;
	  }
	| {
			component: AnyComponent<T>;
	  };

export default ({
	durationInFrames,
	...props
}: {
	durationInFrames: number;
} & CompProps<any>) => {
	const [title, setTitle] = useState('Hello World');
	const [color, setColor] = useState('#ffffff');
	const [bgColor, setBgColor] = useState('#000000');
	const [loop, setLoop] = useState(false);
	const [doubleClickToFullscreen, setDoubleClickToFullscreen] = useState(true);
	const [clickToPlay, setClickToPlay] = useState(true);
	const [logs, setLogs] = useState<string[]>(() => []);
	const [spaceKeyToPlayOrPause, setspaceKeyToPlayOrPause] = useState(true);
	const [moveToBeginningWhenEnded, setMoveToBeginningWhenEnded] =
		useState(true);
	const [playbackRate, setPlaybackRate] = useState(1);

	const ref = useRef<PlayerRef>(null);

	useEffect(() => {
		const playCallbackListener: CallbackListener<'play'> = () => {
			setLogs((l) => [...l, 'playing ' + Date.now()]);
		};

		const pausedCallbackLitener: CallbackListener<'pause'> = () => {
			setLogs((l) => [...l, 'pausing ' + Date.now()]);
		};

		const seekedCallbackLitener: CallbackListener<'seeked'> = (e) => {
			setLogs((l) => [...l, 'seeked to ' + e.detail.frame + ' ' + Date.now()]);
		};

		const endedCallbackListener: CallbackListener<'ended'> = () => {
			setLogs((l) => [...l, 'ended ' + Date.now()]);
		};

		const errorCallbackListener: CallbackListener<'error'> = () => {
			setLogs((l) => [...l, 'error ' + Date.now()]);
		};

		const timeupdateCallbackLitener: CallbackListener<'timeupdate'> = (e) => {
			setLogs((l) => [...l, 'timeupdate ' + e.detail.frame]);
		};

		const ratechangeCallbackListener: CallbackListener<'ratechange'> = (e) => {
			setLogs((l) => [
				...l,
				'ratechange ' + e.detail.playbackRate + ' ' + Date.now(),
			]);
		};

		const {current} = ref;
		if (!current) {
			return;
		}

		current.addEventListener('play', playCallbackListener);
		current.addEventListener('pause', pausedCallbackLitener);
		current.addEventListener('seeked', seekedCallbackLitener);
		current.addEventListener('ended', endedCallbackListener);
		current.addEventListener('error', errorCallbackListener);
		current.addEventListener('timeupdate', timeupdateCallbackLitener);
		current.addEventListener('ratechange', ratechangeCallbackListener);

		return () => {
			current.removeEventListener('play', playCallbackListener);
			current.removeEventListener('pause', pausedCallbackLitener);
			current.removeEventListener('seeked', seekedCallbackLitener);
			current.removeEventListener('ended', endedCallbackListener);
			current.removeEventListener('error', errorCallbackListener);
			current.removeEventListener('timeupdate', timeupdateCallbackLitener);
			current.removeEventListener('ratechange', ratechangeCallbackListener);
		};
	}, []);

	const inputProps = useMemo(() => {
		return {
			title: String(title),
			bgColor: String(bgColor),
			color: String(color),
		};
	}, [bgColor, color, title]);

	const renderLoading: RenderLoading = useCallback(() => {
		return (
			<AbsoluteFill style={{backgroundColor: 'yellow'}}>
				<Loading size={200} />
				<div>Loading for 3 seconds...</div>
			</AbsoluteFill>
		);
	}, []);

	const errorFallback: ErrorFallback = useCallback(({error}) => {
		return (
			<AbsoluteFill
				style={{
					backgroundColor: 'yellow',
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				Sorry about this! An error occurred: {error.message}
			</AbsoluteFill>
		);
	}, []);

	return (
		<div style={{margin: '2rem'}}>
			<Player
				ref={ref}
				compositionWidth={500}
				compositionHeight={432}
				fps={fps}
				durationInFrames={durationInFrames}
				{...props}
				controls
				showVolumeControls
				doubleClickToFullscreen={doubleClickToFullscreen}
				loop={loop}
				clickToPlay={clickToPlay}
				inputProps={inputProps}
				renderLoading={renderLoading}
				errorFallback={errorFallback}
				playbackRate={playbackRate}
				spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
				moveToBeginningWhenEnded={moveToBeginningWhenEnded}
			/>
			<div style={{paddingTop: '0.5rem'}}>
				Enter Text{' '}
				<input
					value={title}
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>
			</div>

			<div style={{paddingTop: '0.5rem'}}>
				<div>
					Select Text Color{' '}
					<input
						type="color"
						value={color}
						onChange={(e) => setColor(e.target.value)}
					/>
				</div>
				<div>
					Select Background Color{' '}
					<input
						type="color"
						value={bgColor}
						onChange={(e) => setBgColor(e.target.value)}
					/>
				</div>
			</div>

			<br />
			<button type="button" onClick={(e) => ref.current?.play(e)}>
				▶️ Play
			</button>
			<button type="button" onClick={() => ref.current?.pause()}>
				⏸️ Pause
			</button>
			<button type="button" onClick={() => ref.current?.toggle()}>
				⏯️ Toggle
			</button>
			<button type="button" onClick={() => ref.current?.seekTo(10)}>
				seekTo 10
			</button>
			<button type="button" onClick={() => ref.current?.seekTo(50)}>
				seekTo 50
			</button>
			<button
				type="button"
				onClick={() => {
					ref.current?.seekTo(ref.current.getCurrentFrame() + fps * 5);
				}}
			>
				5 seconds forward
			</button>

			<br />
			<button
				type="button"
				onClick={() => {
					ref.current?.seekTo(10000);
				}}
			>
				seek outside
			</button>
			<button
				type="button"
				onClick={() => {
					ref.current?.seekTo(-10000);
				}}
			>
				seek outside negative
			</button>
			<button
				type="button"
				onClick={() => {
					ref.current?.pause();
					ref.current?.seekTo(50);
				}}
			>
				pause and seek
			</button>

			<br />
			<button
				type="button"
				onClick={() => {
					setPlaybackRate(0.5);
				}}
			>
				0.5x speed
			</button>
			<button
				type="button"
				onClick={() => {
					setPlaybackRate(1);
				}}
			>
				1x speed
			</button>
			<button
				type="button"
				onClick={() => {
					setPlaybackRate(2);
				}}
			>
				2x speed
			</button>
			<button
				type="button"
				onClick={() => {
					setPlaybackRate(-1);
				}}
			>
				-1x speed
			</button>

			<br />
			<button type="button" onClick={() => ref.current?.mute()}>
				🔇 Mute
			</button>
			<button type="button" onClick={() => ref.current?.unmute()}>
				🔉 Unmute
			</button>
			<button type="button" onClick={() => ref.current?.setVolume(0)}>
				set volume to 0
			</button>
			<button type="button" onClick={() => ref.current?.setVolume(0.5)}>
				set volume to 0.5
			</button>
			<button type="button" onClick={() => ref.current?.setVolume(1)}>
				set volume to 1
			</button>
			<br />

			<button type="button" onClick={() => setLoop((l) => !l)}>
				loop = {String(loop)}
			</button>
			<button type="button" onClick={() => setClickToPlay((l) => !l)}>
				clickToPlay = {String(clickToPlay)}
			</button>
			<button
				type="button"
				onClick={() => setDoubleClickToFullscreen((l) => !l)}
			>
				doubleClickToFullscreen = {String(doubleClickToFullscreen)}
			</button>
			<button type="button" onClick={() => setspaceKeyToPlayOrPause((l) => !l)}>
				spaceKeyToPlayOrPause = {String(spaceKeyToPlayOrPause)}
			</button>
			<br />

			<button
				type="button"
				onClick={() => setMoveToBeginningWhenEnded((l) => !l)}
			>
				moveToBeginningWhenEnded = {String(moveToBeginningWhenEnded)}
			</button>
			<button
				type="button"
				onClick={() =>
					setLogs((l) => [
						...l,
						`currentFrame = ${ref.current?.getCurrentFrame()}`,
					])
				}
			>
				log currentFrame
			</button>

			<button
				type="button"
				onClick={() =>
					setLogs((l) => [...l, `muted = ${ref.current?.isMuted()}`])
				}
			>
				log muted
			</button>
			<button
				type="button"
				onClick={() =>
					setLogs((l) => [...l, `volume = ${ref.current?.getVolume()}`])
				}
			>
				log volume
			</button>
			<button
				type="button"
				onClick={() => {
					playerExampleComp.current?.triggerError();
				}}
			>
				trigger error
			</button>

			<br />
			<br />
			{logs
				.slice(0)
				.reverse()
				.slice(0, 10)
				.reverse()
				.map((l) => {
					return <div key={l}>{l}</div>;
				})}
		</div>
	);
};
