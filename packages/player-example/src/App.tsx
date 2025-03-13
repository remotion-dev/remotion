/* eslint-disable @typescript-eslint/no-explicit-any */
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
import {AbsoluteFill} from 'remotion';
import {playerExampleComp} from './CarSlideshow';
import {Loading} from './Loading';
import {TimeDisplay} from './TimeDisplay';

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
	readonly playerRef: React.RefObject<PlayerRef | null>;
	readonly color: string;
	readonly setColor: React.Dispatch<React.SetStateAction<string>>;
	readonly title: string;
	readonly setTitle: React.Dispatch<React.SetStateAction<string>>;
	readonly bgColor: string;
	readonly setBgColor: React.Dispatch<React.SetStateAction<string>>;
	readonly setPlaybackRate: React.Dispatch<React.SetStateAction<number>>;
	readonly loop: boolean;
	readonly setLoop: React.Dispatch<React.SetStateAction<boolean>>;
	readonly clickToPlay: boolean;
	readonly setClickToPlay: React.Dispatch<React.SetStateAction<boolean>>;
	readonly doubleClickToFullscreen: boolean;
	readonly setDoubleClickToFullscreen: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly spaceKeyToPlayOrPause: boolean;
	readonly setSpaceKeyToPlayOrPause: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly moveToBeginningWhenEnded: boolean;
	readonly setMoveToBeginningWhenEnded: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly showPosterWhenUnplayed: boolean;
	readonly setshowPosterWhenUnplayed: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly showPosterWhenEnded: boolean;
	readonly setShowPosterWhenEnded: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly showPosterWhenPaused: boolean;
	readonly setShowPosterWhenPaused: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly inFrame: number | null;
	readonly setInFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly outFrame: number | null;
	readonly setOutFrame: React.Dispatch<React.SetStateAction<number | null>>;
	readonly alwaysShowControls: boolean;
	readonly setAlwaysShowControls: React.Dispatch<React.SetStateAction<boolean>>;
	readonly showVolumeControls: boolean;
	readonly setShowVolumeControls: React.Dispatch<React.SetStateAction<boolean>>;
	readonly durationInFrames: number;
	readonly showPlaybackrateControl: boolean;
	readonly setShowPlaybackRateControl: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly showPosterWhenBuffering: boolean;
	readonly setShowPosterWhenBuffering: React.Dispatch<
		React.SetStateAction<boolean>
	>;
	readonly hideControlsWhenPointerDoesntMove: boolean;
	readonly setHideControlsWhenPointerDoesntMove: React.Dispatch<
		React.SetStateAction<boolean>
	>;
}> = ({
	playerRef: ref,
	color,
	title,
	setTitle,
	setColor,
	bgColor,
	setBgColor,
	setPlaybackRate,
	loop,
	setLoop,
	clickToPlay,
	setClickToPlay,
	doubleClickToFullscreen,
	setDoubleClickToFullscreen,
	setSpaceKeyToPlayOrPause,
	spaceKeyToPlayOrPause,
	moveToBeginningWhenEnded,
	setMoveToBeginningWhenEnded,
	setshowPosterWhenUnplayed,
	setShowPosterWhenEnded,
	setShowPosterWhenPaused,
	showPosterWhenUnplayed,
	showPosterWhenEnded,
	showPosterWhenPaused,
	setShowPosterWhenBuffering,
	showPosterWhenBuffering,
	inFrame,
	outFrame,
	setInFrame,
	setOutFrame,
	alwaysShowControls,
	setAlwaysShowControls,
	durationInFrames,
	setShowVolumeControls,
	showVolumeControls,
	showPlaybackrateControl: showPlaybackControl,
	setShowPlaybackRateControl: setShowPlaybackControl,
	hideControlsWhenPointerDoesntMove,
	setHideControlsWhenPointerDoesntMove,
}) => {
	const [logs, setLogs] = useState<string[]>(() => []);

	useEffect(() => {
		const playCallbackListener: CallbackListener<'play'> = () => {
			setLogs((l) => [...l, 'playing ' + Date.now()]);
		};

		const pausedCallbackLitener: CallbackListener<'pause'> = () => {
			setLogs((l) => [...l, 'pausing ' + Date.now()]);
		};

		const seekedCallbackListener: CallbackListener<'seeked'> = (e) => {
			setLogs((l) => [...l, 'seeked to ' + e.detail.frame + ' ' + Date.now()]);
		};

		const endedCallbackListener: CallbackListener<'ended'> = () => {
			setLogs((l) => [...l, 'ended ' + Date.now()]);
		};

		const errorCallbackListener: CallbackListener<'error'> = () => {
			setLogs((l) => [...l, 'error ' + Date.now()]);
		};

		const timeupdateCallbackListener: CallbackListener<'timeupdate'> = (e) => {
			setLogs((l) => [...l, 'timeupdate ' + e.detail.frame]);
		};
		const frameupdateCallbackListener: CallbackListener<'frameupdate'> = (
			e,
		) => {
			setLogs((l) => [...l, 'frameupdate ' + e.detail.frame]);
		};

		const ratechangeCallbackListener: CallbackListener<'ratechange'> = (e) => {
			setLogs((l) => [
				...l,
				'ratechange ' + e.detail.playbackRate + ' ' + Date.now(),
			]);
		};

		const scalechangeCallbackListener: CallbackListener<'scalechange'> = (
			e,
		) => {
			setLogs((l) => [...l, 'scalechange ' + e.detail.scale]);
		};

		const fullscreenChangeCallbackListener: CallbackListener<
			'fullscreenchange'
		> = (e) => {
			setLogs((l) => [
				...l,
				'fullscreenchange ' + e.detail.isFullscreen + ' ' + Date.now(),
			]);
		};

		const volumechangeCallbackListener: CallbackListener<'volumechange'> = (
			e,
		) => {
			setLogs((l) => [
				...l,
				'volumechange ' + e.detail.volume + ' ' + Date.now(),
			]);
		};

		const mutechangeCallbackListener: CallbackListener<'mutechange'> = (e) => {
			setLogs((l) => [
				...l,
				'mutechange ' + e.detail.isMuted + ' ' + Date.now(),
			]);
		};
		const waitingCallbackListener: CallbackListener<'waiting'> = () => {
			setLogs((l) => [...l, 'waiting ' + Date.now()]);
		};
		const resumeCallbackListener: CallbackListener<'resume'> = () => {
			setLogs((l) => [...l, 'resume ' + Date.now()]);
		};

		const {current} = ref;
		if (!current) {
			return;
		}

		current.addEventListener('play', playCallbackListener);
		current.addEventListener('pause', pausedCallbackLitener);
		current.addEventListener('seeked', seekedCallbackListener);
		current.addEventListener('ended', endedCallbackListener);
		current.addEventListener('error', errorCallbackListener);
		current.addEventListener('timeupdate', timeupdateCallbackListener);
		current.addEventListener('frameupdate', frameupdateCallbackListener);
		current.addEventListener('ratechange', ratechangeCallbackListener);
		current.addEventListener('scalechange', scalechangeCallbackListener);
		current.addEventListener('volumechange', volumechangeCallbackListener);
		current.addEventListener('mutechange', mutechangeCallbackListener);
		current.addEventListener(
			'fullscreenchange',
			fullscreenChangeCallbackListener,
		);
		current.addEventListener('waiting', waitingCallbackListener);
		current.addEventListener('resume', resumeCallbackListener);

		return () => {
			current.removeEventListener('play', playCallbackListener);
			current.removeEventListener('pause', pausedCallbackLitener);
			current.removeEventListener('seeked', seekedCallbackListener);
			current.removeEventListener('ended', endedCallbackListener);
			current.removeEventListener('error', errorCallbackListener);
			current.removeEventListener('timeupdate', timeupdateCallbackListener);
			current.removeEventListener('frameupdate', frameupdateCallbackListener);
			current.removeEventListener('ratechange', ratechangeCallbackListener);
			current.removeEventListener('scalechange', scalechangeCallbackListener);
			current.removeEventListener('volumechange', volumechangeCallbackListener);
			current.removeEventListener('mutechange', mutechangeCallbackListener);
			current.removeEventListener(
				'fullscreenchange',
				fullscreenChangeCallbackListener,
			);
			current.removeEventListener('waiting', waitingCallbackListener);
			current.removeEventListener('resume', resumeCallbackListener);
		};
	}, [ref]);

	return (
		<div>
			<div style={{paddingTop: '0.5rem'}}>
				Enter Text{' '}
				<input
					value={title}
					onChange={(e) => {
						setTitle(e.target.value);
					}}
				/>
			</div>
			<div>
				<TimeDisplay playerRef={ref} />
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
			<button
				type="button"
				onClick={() => {
					ref.current?.seekTo(10);
					ref.current?.pause();
				}}
			>
				seekTo 10 and pause
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
			<button
				type="button"
				onClick={() => {
					setShowPlaybackControl(!showPlaybackControl);
				}}
			>
				showPlaybackRateControl = {String(showPlaybackControl)}
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
			<button type="button" onClick={() => setSpaceKeyToPlayOrPause((l) => !l)}>
				spaceKeyToPlayOrPause = {String(spaceKeyToPlayOrPause)}
			</button>
			<br />
			<button
				type="button"
				onClick={() => setshowPosterWhenUnplayed((l) => !l)}
			>
				showPosterWhenUnplayed = {String(showPosterWhenUnplayed)}
			</button>
			<button type="button" onClick={() => setShowPosterWhenEnded((l) => !l)}>
				showPosterWhenEnded = {String(showPosterWhenEnded)}
			</button>
			<button type="button" onClick={() => setShowPosterWhenPaused((l) => !l)}>
				showPosterWhenPaused = {String(showPosterWhenPaused)}
			</button>
			<button
				type="button"
				onClick={() => setShowPosterWhenBuffering((l) => !l)}
			>
				showPosterWhenBuffering = {String(showPosterWhenBuffering)}
			</button>
			<br />
			<button
				type="button"
				onClick={() => setMoveToBeginningWhenEnded((l) => !l)}
			>
				moveToBeginningWhenEnded = {String(moveToBeginningWhenEnded)}
			</button>
			<button type="button" onClick={() => setShowVolumeControls((l) => !l)}>
				showVolumeControls = {String(showVolumeControls)}
			</button>
			<button type="button" onClick={() => setAlwaysShowControls((l) => !l)}>
				alwaysShowControls = {String(alwaysShowControls)}
			</button>
			<button
				type="button"
				onClick={() => setHideControlsWhenPointerDoesntMove((l) => !l)}
			>
				hideControlsWhenPointerDoesntMove ={' '}
				{String(hideControlsWhenPointerDoesntMove)}
			</button>
			<br />
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
			<label>
				<input
					type="checkbox"
					onChange={(e) => {
						setInFrame(e.target.checked ? 0 : null);
					}}
				/>
				Enable inFrame
			</label>{' '}
			{inFrame === null ? null : (
				<input
					type="range"
					min={0}
					max={durationInFrames}
					step={1}
					onChange={(e) => {
						setInFrame(Number(e.target.value));
					}}
				/>
			)}
			<br />
			<label>
				<input
					type="checkbox"
					onChange={(e) => {
						setOutFrame(e.target.checked ? 0 : null);
					}}
				/>
				Enable outFrame
			</label>{' '}
			{outFrame === null ? null : (
				<input
					type="range"
					min={0}
					max={durationInFrames}
					step={1}
					onChange={(e) => {
						setOutFrame(Number(e.target.value));
					}}
				/>
			)}
			<br />
			<br />
			{logs
				.slice(0)
				.reverse()
				.slice(0, 10)
				.reverse()
				.map((l, i) => {
					return <div key={`${l}-${i}`}>{l}</div>;
				})}
		</div>
	);
};

const PlayerOnly: React.FC<
	{
		readonly playerRef: React.RefObject<PlayerRef | null>;
		readonly inputProps: Record<string, unknown>;
		readonly clickToPlay: boolean;
		readonly loop: boolean;
		readonly durationInFrames: number;
		readonly doubleClickToFullscreen: boolean;
		readonly playbackRate: number;
		readonly spaceKeyToPlayOrPause: boolean;
		readonly moveToBeginningWhenEnded: boolean;
		readonly showPosterWhenPaused: boolean;
		readonly showPosterWhenEnded: boolean;
		readonly showPosterWhenUnplayed: boolean;
		readonly showPosterWhenBuffering: boolean;
		readonly inFrame: number | null;
		readonly outFrame: number | null;
		readonly alwaysShowControls: boolean;
		readonly showVolumeControls: boolean;
		readonly showPlaybackRateControl: boolean | number[];
		readonly hideControlsWhenPointerDoesntMove: boolean;
	} & CompProps<any>
> = ({
	playerRef,
	inputProps,
	clickToPlay,
	loop,
	durationInFrames,
	doubleClickToFullscreen,
	playbackRate,
	spaceKeyToPlayOrPause,
	moveToBeginningWhenEnded,
	showPosterWhenPaused,
	showPosterWhenEnded,
	showPosterWhenUnplayed,
	showPosterWhenBuffering,
	inFrame,
	outFrame,
	alwaysShowControls,
	showVolumeControls,
	showPlaybackRateControl,
	hideControlsWhenPointerDoesntMove,
	...props
}) => {
	const renderLoading: RenderLoading = useCallback(() => {
		return (
			<AbsoluteFill style={{backgroundColor: 'yellow'}}>
				<Loading size={200} />
				<div>Loading for 3 seconds...</div>
			</AbsoluteFill>
		);
	}, []);
	const renderPoster: RenderPoster = useCallback(({isBuffering}) => {
		if (isBuffering) {
			return (
				<AbsoluteFill
					style={{
						justifyContent: 'center',
						alignItems: 'center',
					}}
				>
					Buffering
				</AbsoluteFill>
			);
		}
		return (
			<AbsoluteFill style={{backgroundColor: 'yellow'}}>
				<div>Click to play</div>
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
		<Player
			ref={playerRef}
			controls
			acknowledgeRemotionLicense
			showVolumeControls={showVolumeControls}
			compositionWidth={1920}
			compositionHeight={1080}
			fps={fps}
			{...props}
			durationInFrames={durationInFrames}
			doubleClickToFullscreen={doubleClickToFullscreen}
			loop={loop}
			clickToPlay={clickToPlay}
			inputProps={inputProps}
			renderLoading={renderLoading}
			errorFallback={errorFallback}
			playbackRate={playbackRate}
			spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
			moveToBeginningWhenEnded={moveToBeginningWhenEnded}
			renderPoster={renderPoster}
			initialFrame={30}
			showPosterWhenUnplayed={showPosterWhenUnplayed}
			showPosterWhenEnded={showPosterWhenEnded}
			showPosterWhenPaused={showPosterWhenPaused}
			showPosterWhenBuffering={showPosterWhenBuffering}
			inFrame={inFrame}
			outFrame={outFrame}
			alwaysShowControls={alwaysShowControls}
			showPlaybackRateControl={showPlaybackRateControl}
			hideControlsWhenPointerDoesntMove={hideControlsWhenPointerDoesntMove}
			style={{
				height: '100%',
				width: '100%',
				resize: 'both',
				maxWidth: 550,
				maxHeight: 550,
				minWidth: 300,
				minHeight: 300,
				display: 'block',
			}}
		/>
	);
};

export default ({
	durationInFrames,
	...props
}: {
	readonly durationInFrames: number;
} & CompProps<any>) => {
	const [title, setTitle] = useState('Hello World');
	const [color, setColor] = useState('#ffffff');
	const [bgColor, setBgColor] = useState('#000000');
	const [loop, setLoop] = useState(false);
	const [doubleClickToFullscreen, setDoubleClickToFullscreen] = useState(true);
	const [clickToPlay, setClickToPlay] = useState(true);
	const [spaceKeyToPlayOrPause, setSpaceKeyToPlayOrPause] = useState(true);
	const [moveToBeginningWhenEnded, setMoveToBeginningWhenEnded] =
		useState(true);
	const [playbackRate, setPlaybackRate] = useState(1);
	const [showPosterWhenUnplayed, setshowPosterWhenUnplayed] = useState(true);
	const [showPosterWhenBuffering, setShowPosterWhenBuffering] = useState(true);
	const [showPosterWhenEnded, setShowPosterWhenEnded] = useState(true);
	const [showPosterWhenPaused, setShowPosterWhenPaused] = useState(true);
	const [inFrame, setInFrame] = useState<number | null>(null);
	const [outFrame, setOutFrame] = useState<number | null>(null);
	const [alwaysShowControls, setAlwaysShowControls] = useState(false);
	const [showVolumeControls, setShowVolumeControls] = useState(true);
	const [showPlaybackRateControl, setPlaybackRateControl] = useState(false);
	const [
		hideControlsWhenPointerDoesntMove,
		setHideControlsWhenPointerDoesntMove,
	] = useState(true);

	const ref = useRef<PlayerRef>(null);

	const inputProps = useMemo(() => {
		return {
			title: String(title),
			bgColor: String(bgColor),
			color: String(color),
		};
	}, [bgColor, color, title]);

	return (
		<div style={{margin: '2rem'}}>
			<PlayerOnly
				hideControlsWhenPointerDoesntMove={hideControlsWhenPointerDoesntMove}
				alwaysShowControls={alwaysShowControls}
				clickToPlay={clickToPlay}
				{...props}
				doubleClickToFullscreen={doubleClickToFullscreen}
				durationInFrames={durationInFrames}
				inputProps={inputProps}
				loop={loop}
				moveToBeginningWhenEnded={moveToBeginningWhenEnded}
				playbackRate={playbackRate}
				spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
				playerRef={ref}
				showPosterWhenEnded={showPosterWhenEnded}
				showPosterWhenPaused={showPosterWhenPaused}
				showPosterWhenUnplayed={showPosterWhenUnplayed}
				showPosterWhenBuffering={showPosterWhenBuffering}
				showVolumeControls={showVolumeControls}
				showPlaybackRateControl={showPlaybackRateControl}
				inFrame={inFrame}
				outFrame={outFrame}
			/>
			<ControlsOnly
				bgColor={bgColor}
				clickToPlay={clickToPlay}
				color={color}
				doubleClickToFullscreen={doubleClickToFullscreen}
				loop={loop}
				moveToBeginningWhenEnded={moveToBeginningWhenEnded}
				setBgColor={setBgColor}
				setClickToPlay={setClickToPlay}
				setColor={setColor}
				setDoubleClickToFullscreen={setDoubleClickToFullscreen}
				setLoop={setLoop}
				setMoveToBeginningWhenEnded={setMoveToBeginningWhenEnded}
				setPlaybackRate={setPlaybackRate}
				setSpaceKeyToPlayOrPause={setSpaceKeyToPlayOrPause}
				setTitle={setTitle}
				spaceKeyToPlayOrPause={spaceKeyToPlayOrPause}
				title={title}
				playerRef={ref}
				setshowPosterWhenUnplayed={setshowPosterWhenUnplayed}
				setShowPosterWhenEnded={setShowPosterWhenEnded}
				setShowPosterWhenPaused={setShowPosterWhenPaused}
				showPosterWhenBuffering={showPosterWhenBuffering}
				setShowPosterWhenBuffering={setShowPosterWhenBuffering}
				setAlwaysShowControls={setAlwaysShowControls}
				showPosterWhenUnplayed={showPosterWhenUnplayed}
				showPosterWhenEnded={showPosterWhenEnded}
				showPosterWhenPaused={showPosterWhenPaused}
				alwaysShowControls={alwaysShowControls}
				setShowVolumeControls={setShowVolumeControls}
				showVolumeControls={showVolumeControls}
				setInFrame={setInFrame}
				setOutFrame={setOutFrame}
				inFrame={inFrame}
				outFrame={outFrame}
				durationInFrames={durationInFrames}
				showPlaybackrateControl={showPlaybackRateControl}
				setShowPlaybackRateControl={setPlaybackRateControl}
				hideControlsWhenPointerDoesntMove={hideControlsWhenPointerDoesntMove}
				setHideControlsWhenPointerDoesntMove={
					setHideControlsWhenPointerDoesntMove
				}
			/>
		</div>
	);
};
