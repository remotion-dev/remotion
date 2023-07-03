import type {FC} from 'react';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {CompositionManager} from './CompositionManagerContext.js';
import {truthy} from './truthy.js';
import {validateFolderName} from './validation/validate-folder-name.js';

export type TFolder = {
	name: string;
	parent: string | null;
};

type FolderContextType = {
	folderName: string | null;
	parentName: string | null;
};

export const FolderContext = createContext<FolderContextType>({
	folderName: null,
	parentName: null,
});

/**
 * @description By wrapping a <Composition /> inside a <Folder />, you can visually categorize it in your sidebar, should you have many compositions.
 * @see [Documentation](https://www.remotion.dev/docs/folder)
 */
export const Folder: FC<{name: string; children: React.ReactNode}> = ({
	name,
	children,
}) => {
	const parent = useContext(FolderContext);
	const {registerFolder, unregisterFolder} = useContext(CompositionManager);

	validateFolderName(name);

	const parentNameArr = [parent.parentName, parent.folderName].filter(truthy);

	const parentName =
		parentNameArr.length === 0 ? null : parentNameArr.join('/');

	const value = useMemo((): FolderContextType => {
		return {
			folderName: name,
			parentName,
		};
	}, [name, parentName]);

	useEffect(() => {
		registerFolder(name, parentName);

		return () => {
			unregisterFolder(name, parentName);
		};
	}, [name, parent.folderName, parentName, registerFolder, unregisterFolder]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};
