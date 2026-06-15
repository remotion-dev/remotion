import React, {createContext, useContext, useMemo} from 'react';
import {
	type SchemaEditorDensity,
	useSchemaEditorDensity,
} from './SchemaEditorDensity';

export const SCHEMA_EDITOR_FIELDSET_PADDING = 10;
const COMPACT_SCHEMA_EDITOR_FIELDSET_PADDING = 6;

export const getSchemaEditorFieldsetPadding = (
	density: SchemaEditorDensity,
) => {
	return density === 'compact'
		? COMPACT_SCHEMA_EDITOR_FIELDSET_PADDING
		: SCHEMA_EDITOR_FIELDSET_PADDING;
};

type AlreadyPaddedContext = boolean;

const AlreadyPaddedRightContext = createContext<AlreadyPaddedContext>(false);

export const Fieldset: React.FC<{
	readonly children: React.ReactNode;
	readonly shouldPad: boolean;
}> = ({children, shouldPad}) => {
	const alreadyPadded = useContext(AlreadyPaddedRightContext);
	const density = useSchemaEditorDensity();

	const style: React.CSSProperties = useMemo(() => {
		if (shouldPad) {
			const padding = getSchemaEditorFieldsetPadding(density);

			return {
				padding,
				paddingTop: padding / 2,
				paddingRight: alreadyPadded ? 0 : padding,
			};
		}

		return {};
	}, [alreadyPadded, density, shouldPad]);

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
