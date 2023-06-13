import React, {useCallback} from 'react';
import {BLUE} from '../helpers/colors';
import {useIsStill} from '../helpers/is-current-selected-still';
import {persistLoopOption} from '../state/loop';
import {ControlButton} from './ControlButton';

const accessibilityLabel = 'Loop video';

export const LoopToggle: React.FC<{
	loop: boolean;
	setLoop: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({loop, setLoop}) => {
	const onClick = useCallback(() => {
		setLoop((c) => {
			persistLoopOption(!c);
			return !c;
		});
	}, [setLoop]);

	const isStill = useIsStill();

	if (isStill) {
		return null;
	}

	return (
		<ControlButton
			title={accessibilityLabel}
			aria-label={accessibilityLabel}
			onClick={onClick}
		>
			<svg viewBox="0 0 512 512" style={{width: 18, height: 18}}>
				<path
					fill={loop ? BLUE : 'white'}
					d="M493.544 181.463c11.956 22.605 18.655 48.4 18.452 75.75C511.339 345.365 438.56 416 350.404 416H192v47.495c0 22.475-26.177 32.268-40.971 17.475l-80-80c-9.372-9.373-9.372-24.569 0-33.941l80-80C166.138 271.92 192 282.686 192 304v48h158.875c52.812 0 96.575-42.182 97.12-94.992.155-15.045-3.17-29.312-9.218-42.046-4.362-9.185-2.421-20.124 4.8-27.284 4.745-4.706 8.641-8.555 11.876-11.786 11.368-11.352 30.579-8.631 38.091 5.571zM64.005 254.992c.545-52.81 44.308-94.992 97.12-94.992H320v47.505c0 22.374 26.121 32.312 40.971 17.465l80-80c9.372-9.373 9.372-24.569 0-33.941l-80-80C346.014 16.077 320 26.256 320 48.545V96H161.596C73.44 96 .661 166.635.005 254.788c-.204 27.35 6.495 53.145 18.452 75.75 7.512 14.202 26.723 16.923 38.091 5.57 3.235-3.231 7.13-7.08 11.876-11.786 7.22-7.16 9.162-18.098 4.8-27.284-6.049-12.735-9.374-27.001-9.219-42.046z"
				/>
			</svg>
		</ControlButton>
	);
};
