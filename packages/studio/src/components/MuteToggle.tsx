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
			label={accessibilityLabel}
			shortcut={shortcutsDisabled ? null : shortcut}
			delay={800}
			dismissOnClick={false}
		>
			{(describedBy) => (
				<ControlButton
					title=""
					aria-label={accessibilityLabel}
					aria-describedby={describedBy}
					aria-keyshortcuts={
						shortcutsDisabled ? undefined : ariaShortcut || undefined
					}
					onClick={onClick}
				>
					{(color) =>
						muted ? (
							<VolumeOffIcon color={BLUE} />
						) : (
							<VolumeOnIcon color={color} />
						)
					}
				</ControlButton>
			)}
		</ActionTooltip>
	);
};
