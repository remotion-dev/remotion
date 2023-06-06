import React, {useMemo} from 'react';
import {FAIL_COLOR} from '../../../helpers/colors';

export const Fieldset: React.FC<{
	children: React.ReactNode;
	success: boolean;
}> = ({children, success}) => {
	const borderColor = success ? 'rgba(255, 255, 255, 0.1)' : FAIL_COLOR;

	const style: React.CSSProperties = useMemo(() => {
		return {
			border: `1px solid ${borderColor}`,
			borderRadius: 4,
			padding: 10,
		};
	}, [borderColor]);

	return <div style={style}>{children}</div>;
};
