import React, {useCallback, useMemo, useState} from 'react';
import {HOVERED_BACKGROUND} from '../../helpers/colors';

const container: React.CSSProperties = {
	paddingTop: 8,
	paddingBottom: 8,
	paddingLeft: 12,
	paddingRight: 8,
	fontSize: 13,
	cursor: 'default',
};

export const MenuSubItem: React.FC<{
	label: string;
}> = ({label}) => {
	const [hovered, setHovered] = useState(false);

	const style = useMemo((): React.CSSProperties => {
		return {
			...container,
			backgroundColor: hovered ? HOVERED_BACKGROUND : 'transparent',
		};
	}, [hovered]);

	const onPointerEnter = useCallback(() => {
		setHovered(true);
	}, []);

	const onPointerLeave = useCallback(() => {
		setHovered(false);
	}, []);

	return (
		<div
			onPointerEnter={onPointerEnter}
			onPointerLeave={onPointerLeave}
			style={style}
		>
			{label}
		</div>
	);
};
