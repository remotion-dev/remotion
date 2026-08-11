import React, {createContext, useContext, useMemo} from 'react';

export const SCHEMA_EDITOR_FIELDSET_PADDING = 6;

export const getSchemaEditorFieldsetPadding = () => {
	return SCHEMA_EDITOR_FIELDSET_PADDING;
};

export const getSchemaEditorRootInset = (contentInset: number) => {
	const fieldsetPadding = getSchemaEditorFieldsetPadding();
	return Math.max(0, contentInset - fieldsetPadding);
};

type AlreadyPaddedContext = boolean;

const AlreadyPaddedRightContext = createContext<AlreadyPaddedContext>(false);

export const Fieldset: React.FC<{
	readonly children: React.ReactNode;
	readonly shouldPad: boolean;
}> = ({children, shouldPad}) => {
	const alreadyPadded = useContext(AlreadyPaddedRightContext);

	const style: React.CSSProperties = useMemo(() => {
		if (shouldPad) {
			const padding = getSchemaEditorFieldsetPadding();

			return {
				padding,
				paddingTop: padding / 2,
				paddingRight: alreadyPadded ? 0 : padding,
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
