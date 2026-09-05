import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useContext,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {LIGHT_TEXT, TRANSPARENT, WHITE} from '../helpers/colors';
import {
	FOCUS_VISIBLE_ONLY_CLASS_NAME,
	HOVERABLE_CLASS_NAME,
	hoverableStyle,
} from '../helpers/hoverable';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {renderFrame} from '../state/render-frame';
import {Flex, Spacing} from './layout';
import {InputDragger} from './NewComposition/InputDragger';
import {TimelineTickFormatContext} from './Timeline/TimelineTickFormatProvider';
import {TimelineZoomControls} from './Timeline/TimelineZoomControls';

const text: React.CSSProperties = {
	color: WHITE,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1,
	width: '100%',
};

const currentTimeTypography: React.CSSProperties = {
	color: LIGHT_TEXT,
	display: 'inline-block',
	fontSize: 14,
	fontVariantNumeric: 'tabular-nums',
	fontWeight: 400,
	lineHeight: 1,
	fontFamily: 'monospace',
};

const currentTimeInputStyle: React.CSSProperties = {
	...currentTimeTypography,
	padding: 0,
};

const currentTimeStack: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'flex-start',
	lineHeight: 1,
	padding: '5px 7px 5px 1px',
	transform: 'translateY(-1px)',
};

const currentTimeButtonStyle = {
	display: 'block',
	padding: 0,
	border: 'none',
	lineHeight: '21px',
	'--remotion-cli-internals-blue-hovered': WHITE,
} as React.CSSProperties;

const currentTimeSubtitle: React.CSSProperties = {
	...hoverableStyle({
		idleBackground: TRANSPARENT,
		hoverBackground: TRANSPARENT,
		idleColor: LIGHT_TEXT,
		hoverColor: WHITE,
	}),
	background: TRANSPARENT,
	border: 'none',
	padding: 0,
	cursor: 'default',
	display: 'block',
	fontFamily: 'monospace',
	fontSize: 10,
	fontWeight: 400,
	lineHeight: 1,
	marginTop: -2,
	textAlign: 'left',
};

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const {showFrames, setShowFrames} = useContext(TimelineTickFormatContext);
	const toggleTickFormat = useCallback(() => {
		setShowFrames((previous) => !previous);
	}, [setShowFrames]);
	const config = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();
	const {seek, play, pause, toggle} = PlayerInternals.usePlayerMethods();
	const keybindings = useKeybinding();
	const ref = useRef<HTMLButtonElement>(null);

	const onTextChange = useCallback(
		(newVal: string) => {
			seek(parseInt(newVal, 10));
		},
		[seek],
	);
	const onValueChange = useCallback(
		(val: number) => {
			seek(val);
		},
		[seek],
	);
	const formatter = useCallback(
		(value: string | number) => {
			return config ? renderFrame(Number(value), config.fps) : String(value);
		},
		[config],
	);
	useImperativeHandle(
		Internals.timeValueRef,
		() => ({
			goToFrame: () => {
				ref.current?.click();
			},
			seek,
			play,
			pause,
			toggle,
		}),
		[seek, play, pause, toggle],
	);

	useEffect(() => {
		const gKey = keybindings.registerKeybinding({
			event: 'keypress',
			key: 'g',
			callback: () => {
				ref.current?.click();
			},
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});

		return () => {
			gKey.unregister();
		};
	}, [keybindings]);

	if (!config) {
		return null;
	}

	if (isStill) {
		return null;
	}

	return (
		<div style={text}>
			<div style={currentTimeStack}>
				<InputDragger
					ref={ref}
					aria-label={String(frame)}
					value={frame}
					onTextChange={onTextChange}
					onValueChange={onValueChange}
					formatter={formatter}
					formatterStyle={currentTimeTypography}
					buttonStyle={currentTimeButtonStyle}
					rightAlign={false}
					status="ok"
					style={currentTimeInputStyle}
				/>
				<button
					type="button"
					className={`${HOVERABLE_CLASS_NAME} ${FOCUS_VISIBLE_ONLY_CLASS_NAME}`}
					style={currentTimeSubtitle}
					onClick={toggleTickFormat}
					aria-label="Show timeline ticks as frames"
					aria-pressed={showFrames}
					title={
						showFrames
							? 'Show timeline ticks as timecode'
							: 'Show timeline ticks as frames'
					}
				>
					{frame}
				</button>
			</div>
			<Spacing x={2} />
			<Flex />
			<TimelineZoomControls sliderMaxWidth={80} />
			<Spacing x={0.5} />
		</div>
	);
};
