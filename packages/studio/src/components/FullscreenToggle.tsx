import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {NoReactInternals} from 'remotion/no-react';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {useKeyboardShortcutLabel} from '../helpers/use-keyboard-shortcut-label';
import {FullscreenIcon} from '../icons/fullscreen';
import {drawRef} from '../state/canvas-ref';
import {ControlButton} from './ControlButton';

export const FullScreenToggle: React.FC<{
	readonly hidden: boolean;
}> = ({hidden}) => {
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
	const shortcut = useKeyboardShortcutLabel('enterFullscreen');
	const accessibilityLabel = [
		'Enter fullscreen preview',
		areKeyboardShortcutsDisabled() || shortcut === '' ? null : `(${shortcut})`,
	]
		.filter(NoReactInternals.truthy)
		.join(' ');

	useEffect(() => {
		const f = keybindings.registerKeybinding({
			event: 'keydown',
			action: 'enterFullscreen',
			callback: onClick,
			preventDefault: true,
			triggerIfInputFieldFocused: false,
			keepRegisteredWhenNotHighestContext: false,
		});
		return () => {
			f.unregister();
		};
	}, [keybindings, onClick]);

	return hidden ? (
		<button
			id="fullscreen-toggle"
			type="button"
			style={{display: 'none'}}
			onClick={onClick}
		/>
	) : (
		<ControlButton
			id="fullscreen-toggle"
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			{(color) => (
				<FullscreenIcon color={color} style={{width: 18, height: 18}} />
			)}
		</ControlButton>
	);
};
