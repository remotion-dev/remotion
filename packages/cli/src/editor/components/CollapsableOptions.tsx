import React, {useCallback, useState} from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {useZIndex} from '../state/z-index';
import {Spacing} from './layout';
import {TimelineCollapseToggle} from './Timeline/TimelineCollapseToggle';

const container: React.CSSProperties = {
	marginLeft: 16,
	height: 40,
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const buttonStyle: React.CSSProperties = {
	border: 'none',
	padding: 0,
	appearance: 'none',
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
	fontSize: 14,
	color: LIGHT_TEXT,
};

export const CollapsableOptions: React.FC<{
	children: React.ReactNode;
	showLabel: string;
	hideLabel: string;
}> = ({children, showLabel, hideLabel}) => {
	const [show, setShow] = useState(false);
	const {tabIndex} = useZIndex();

	const onClick = useCallback(() => {
		setShow((s) => !s);
	}, []);

	return (
		<>
			<div style={container}>
				<button
					style={buttonStyle}
					tabIndex={tabIndex}
					onClick={onClick}
					type="button"
				>
					<TimelineCollapseToggle color={LIGHT_TEXT} collapsed={!show} />
					<Spacing block x={1} />
					{show ? hideLabel : showLabel}
				</button>
			</div>
			{show ? children : null}
		</>
	);
};
