import {PlayerInternals} from '@remotion/player';
import React, {
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
} from 'react';
import {Internals, useCurrentFrame} from 'remotion';
import {LIGHT_TEXT} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {useKeybinding} from '../helpers/use-keybinding';
import {renderFrame} from '../state/render-frame';
import {InputDragger} from './NewComposition/InputDragger';
import {Flex, Spacing} from './layout';

const text: React.CSSProperties = {
	color: 'white',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	fontVariantNumeric: 'tabular-nums',
	lineHeight: 1,
	width: '100%',
	userSelect: 'none',
	WebkitUserSelect: 'none',
};

const time: React.CSSProperties = {
	display: 'inline-block',
	fontSize: 16,
	lineHeight: 1,
	fontFamily: 'monospace',
};

const frameStyle: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontWeight: 500,
	lineHeight: 1,
	fontSize: 16,
	fontFamily: 'monospace',
	paddingRight: 10,
};

export const TimeValue: React.FC = () => {
	const frame = useCurrentFrame();
	const config = Internals.useUnsafeVideoConfig();
	const isStill = useIsStill();
	const {seek} = PlayerInternals.usePlayer();
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

	useImperativeHandle(
		Internals.timeValueRef,
		() => ({
			goToFrame: () => {
				ref.current?.click();
			},
			seek,
		}),
		[seek],
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
			<div style={time}>{renderFrame(frame, config.fps)}</div>
			<Spacing x={2} />
			<Flex />
			<InputDragger
				ref={ref}
				value={frame}
				onTextChange={onTextChange}
				onValueChange={onValueChange}
				rightAlign
				status="ok"
				style={frameStyle}
			/>
		</div>
	);
};
