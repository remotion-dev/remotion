import type {CSSProperties} from 'react';
import {useCallback} from 'react';
import {BLUE} from '../helpers/colors';
import {areKeyboardShortcutsDisabled} from '../helpers/use-keybinding';
import {
	useKeyboardShortcutAriaKeyShortcuts,
	useKeyboardShortcutLabel,
} from '../helpers/use-keyboard-shortcut-label';
import {VolumeOffIcon, VolumeOnIcon} from '../icons/media-volume';
import {persistMuteOption} from '../state/mute';
import {ActionTooltip} from './ActionTooltip';
import {ControlButton} from './ControlButton';

const buttonStyle: CSSProperties = {width: 30};

export const toggleMute = (
	setMuted: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	setMuted((muted) => {
		persistMuteOption(!muted);
		return !muted;
	});
};

export const MuteToggle: React.FC<{
	muted: boolean;
	setMuted: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({muted, setMuted}) => {
	const shortcut = useKeyboardShortcutLabel('toggleMute');
	const ariaShortcut = useKeyboardShortcutAriaKeyShortcuts('toggleMute');
	const shortcutsDisabled = areKeyboardShortcutsDisabled();
	const onClick = useCallback(() => {
		toggleMute(setMuted);
	}, [setMuted]);
	const accessibilityLabel = muted ? 'Unmute video' : 'Mute video';

	return (
		<ActionTooltip
			label="Mute"
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick={false}
		>
			<ControlButton
				aria-label={accessibilityLabel}
				aria-keyshortcuts={
					shortcutsDisabled ? undefined : ariaShortcut || undefined
				}
				onClick={onClick}
				style={buttonStyle}
			>
				{(color) =>
					muted ? (
						<VolumeOffIcon color={BLUE} />
					) : (
						<VolumeOnIcon color={color} />
					)
				}
			</ControlButton>
		</ActionTooltip>
	);
};
