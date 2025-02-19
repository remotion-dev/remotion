import React, {createContext, useContext, useMemo} from 'react';

const SCHEMA_EDITOR_FIELDSET_PADDING = 10;

type AlreadyPaddedContext = boolean;

const AlreadyPaddedRightContext = createContext<AlreadyPaddedContext>(false);

export const Fieldset: React.FC<{
	readonly children: React.ReactNode;
	readonly success: boolean;
	readonly shouldPad: boolean;
}> = ({children, shouldPad}) => {
	const alreadyPadded = useContext(AlreadyPaddedRightContext);

	const style: React.CSSProperties = useMemo(() => {
		if (shouldPad) {
			return {
				padding: SCHEMA_EDITOR_FIELDSET_PADDING,
				paddingTop: SCHEMA_EDITOR_FIELDSET_PADDING / 2,
				paddingRight: alreadyPadded ? 0 : SCHEMA_EDITOR_FIELDSET_PADDING,
			};
		}

		return {};
	}, [alreadyPadded, shouldPad]);

	const content = <div style={style}>{children}</div>;

	if (shouldPad) {
		return (
			<AlreadyPaddedRightContext.Provider value>
				{content}
			</AlreadyPaddedRightContext.Provider>
		);
	}

	return content;
};
