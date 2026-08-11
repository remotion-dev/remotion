import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {LIGHT_TEXT, WHITE} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {renderFrame} from '../state/render-frame';
import {Flex, Spacing} from './layout';
import {InputDragger} from './NewComposition/InputDragger';
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
	color: WHITE,
	display: 'inline-block',
	fontSize: 14,
	fontVariantNumeric: 'tabular-nums',
	fontWeight: 400,
	lineHeight: 1,
	fontFamily: 'monospace',
};

const currentTimeInputStyle: React.CSSProperties = {
	...currentTimeTypography,
	padding: '4px 6px 4px 0',
};

const currentTimeButtonStyle: React.CSSProperties = {
	paddingLeft: 0,
	transform: 'translateY(-1px)',
};

const currentTimeSubtitle: React.CSSProperties = {
	color: LIGHT_TEXT,
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
	const formatterSubtitle = useCallback(
		(value: string | number) => String(value),
		[],
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
			<InputDragger
				ref={ref}
				aria-label={String(frame)}
				value={frame}
				onTextChange={onTextChange}
				onValueChange={onValueChange}
				formatter={formatter}
				formatterStyle={currentTimeTypography}
				formatterSubtitle={formatterSubtitle}
				formatterSubtitleStyle={currentTimeSubtitle}
				buttonStyle={currentTimeButtonStyle}
				rightAlign={false}
				status="ok"
				style={currentTimeInputStyle}
			/>
			<Spacing x={2} />
			<Flex />
			<TimelineZoomControls sliderMaxWidth={80} />
			<Spacing x={0.5} />
		</div>
	);
};
