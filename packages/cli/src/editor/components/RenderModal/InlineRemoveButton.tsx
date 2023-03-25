import {useCallback, useMemo, useState} from 'react';
import {LIGHT_TEXT} from '../../helpers/colors';

const clearIcon: React.CSSProperties = {
	height: 8,
	color: LIGHT_TEXT,
};

export const InlineRemoveButton: React.FC<{
	onClick: () => void;
}> = ({onClick}) => {
	const [hovered, setHovered] = useState(false);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	const handleClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		(e) => {
			e.preventDefault();
			onClick();
		},
		[onClick]
	);

	const color = hovered ? 'white' : LIGHT_TEXT;

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: `1px solid ${color}`,
			display: 'inline-flex',
			justifyContent: 'center',
			alignItems: 'center',
			appearance: 'none',
			width: 16,
			height: 16,
			borderRadius: 9,
			padding: 0,
			cursor: 'pointer',
		};
	}, [color]);

	return (
		<button
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={style}
			onClick={handleClick}
			type="button"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 320 512"
				style={clearIcon}
			>
				<path
					d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
					fill={color}
				/>
			</svg>
		</button>
	);
};
