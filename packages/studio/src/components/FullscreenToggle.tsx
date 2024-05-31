import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {drawRef} from '../state/canvas-ref';
import {ControlButton} from './ControlButton';

const accessibilityLabel = [
	'Enter fullscreen preview',
	areKeyboardShortcutsDisabled() ? null : '(F)',
]
	.filter(NoReactInternals.truthy)
	.join(' ');

export const FullScreenToggle: React.FC<{}> = () => {
	const keybindings = useKeybinding();
	const {setSize} = useContext(Internals.PreviewSizeContext);

	const onClick = useCallback(() => {
		drawRef.current?.requestFullscreen();

		if (document.fullscreenElement)
			setSize(() => ({
				size: 'auto',
				translation: {
					x: 0,
					y: 0,
				},
			}));
	}, [setSize]);

	useEffect(() => {
		const f = keybindings.registerKeybinding({
			event: 'keydown',
			key: 'f',
			callback: onClick,
			commandCtrlKey: false,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			f.unregister();
		};
	}, [keybindings, onClick]);

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			<svg style={{width: 18, height: 18}} viewBox="0 0 448 512" fill="#fff">
				<path d="M0 180V56c0-13.3 10.7-24 24-24h124c6.6 0 12 5.4 12 12v40c0 6.6-5.4 12-12 12H64v84c0 6.6-5.4 12-12 12H12c-6.6 0-12-5.4-12-12zM288 44v40c0 6.6 5.4 12 12 12h84v84c0 6.6 5.4 12 12 12h40c6.6 0 12-5.4 12-12V56c0-13.3-10.7-24-24-24H300c-6.6 0-12 5.4-12 12zm148 276h-40c-6.6 0-12 5.4-12 12v84h-84c-6.6 0-12 5.4-12 12v40c0 6.6 5.4 12 12 12h124c13.3 0 24-10.7 24-24V332c0-6.6-5.4-12-12-12zM160 468v-40c0-6.6-5.4-12-12-12H64v-84c0-6.6-5.4-12-12-12H12c-6.6 0-12 5.4-12 12v124c0 13.3 10.7 24 24 24h124c6.6 0 12-5.4 12-12z" />
			</svg>
		</ControlButton>
	);
};
