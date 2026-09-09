import {useCallback, useContext, useEffect} from 'react';
import {Internals} from 'remotion';
import {
	areKeyboardShortcutsDisabled,
	useKeybinding,
} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {FullscreenIcon} from '../icons/fullscreen';
import {drawRef} from '../state/canvas-ref';
import {ActionTooltip} from './ActionTooltip';
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
	const ariaKeyShortcuts =
		useKeyboardShortcutAriaKeyShortcuts('enterFullscreen');
	const accessibilityLabel = 'Enter fullscreen preview';
	const shortcutsDisabled = areKeyboardShortcutsDisabled();

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
		<ActionTooltip
			label={accessibilityLabel}
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick
		>
			{(describedBy) => (
				<ControlButton
					id="fullscreen-toggle"
					title=""
					aria-label={accessibilityLabel}
					aria-describedby={describedBy}
					aria-keyshortcuts={
						shortcutsDisabled ? undefined : ariaKeyShortcuts || undefined
					}
					onClick={onClick}
				>
					{(color) => (
						<FullscreenIcon color={color} style={{width: 18, height: 18}} />
					)}
				</ControlButton>
			)}
		</ActionTooltip>
	);
};
