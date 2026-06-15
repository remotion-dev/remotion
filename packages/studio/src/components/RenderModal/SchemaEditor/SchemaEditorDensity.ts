import {createContext, useContext} from 'react';

export type SchemaEditorDensity = 'default' | 'compact';

export const SchemaEditorDensityContext =
	createContext<SchemaEditorDensity>('default');

export const useSchemaEditorDensity = () => {
	return useContext(SchemaEditorDensityContext);
};
