import React, {useMemo} from 'react';

export const SCHEMA_EDITOR_FIELDSET_PADDING = 10;

export const Fieldset: React.FC<{
	children: React.ReactNode;
	success: boolean;
	shouldPad: boolean;
}> = ({children, shouldPad}) => {
	const style: React.CSSProperties = useMemo(() => {
		if (shouldPad) {
			return {
				padding: SCHEMA_EDITOR_FIELDSET_PADDING,
				paddingTop: SCHEMA_EDITOR_FIELDSET_PADDING / 2,
				paddingRight: 0,
			};
		}

		return {};
	}, [shouldPad]);

	return <div style={style}>{children}</div>;
};
