import React, {useCallback} from 'react';
import {BLUE} from '../helpers/colors';
import {persistLoopOption} from '../state/loop';
import {ControlButton} from './ControlButton';

const accessibilityLabel = 'Loop video';

export const toggleLoop = (
	setLoop: React.Dispatch<React.SetStateAction<boolean>>,
) => {
	setLoop((currentLoop) => {
		persistLoopOption(!currentLoop);
		return !currentLoop;
	});
};

export const LoopToggle: React.FC<{
	readonly loop: boolean;
	readonly setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({loop, setLoop}) => {
	const onClick = useCallback(() => {
		toggleLoop(setLoop);
	}, [setLoop]);

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			{(color) => (
				<svg viewBox="0 0 512 512" style={{width: 18, height: 18}}>
					<path
						fill={loop ? BLUE : color}
						d="M384 150.3V41.6l64 53.3v2l-64 53.3zM352 23.5V80H192C86 80 0 166 0 272c0 8.8 7.2 16 16 16s16-7.2 16-16c0-88.4 71.6-160 160-160h160v56.5c0 13 10.5 23.5 23.5 23.5 5.5 0 10.8-1.9 15-5.4l78-65c7.3-6.1 11.5-15.1 11.5-24.6v-2c0-9.5-4.2-18.5-11.5-24.6l-78-65c-4.2-3.5-9.5-5.4-15-5.4-13 0-23.5 10.5-23.5 23.5zM128 415.9v54.5l-64-53.3v-2l64-53.3v54.1zM160 400v-56.5c0-13-10.5-23.5-23.5-23.5-5.5 0-10.8 1.9-15 5.4l-78 65C36.2 396.5 32 405.5 32 415v2c0 9.5 4.2 18.5 11.5 24.6l78 65c4.2 3.5 9.5 5.4 15 5.4 13 0 23.5-10.5 23.5-23.5V432h160c106 0 192-86 192-192 0-8.8-7.2-16-16-16s-16 7.2-16 16c0 88.4-71.6 160-160 160H160z"
					/>
				</svg>
			)}
		</ControlButton>
	);
};
