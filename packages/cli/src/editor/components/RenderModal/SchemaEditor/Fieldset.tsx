import React, {useMemo} from 'react';

export const Fieldset: React.FC<{
	children: React.ReactNode;
	success: boolean;
	shouldPad: boolean;
}> = ({children, shouldPad}) => {
	const style: React.CSSProperties = useMemo(() => {
		if (shouldPad) {
			return {
				padding: 10,
			};
		}

		return {};
	}, [shouldPad]);

	return <div style={style}>{children}</div>;
};
