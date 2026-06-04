import type {FC} from 'react';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {CompositionSetters} from './CompositionManagerContext.js';
import type {NonceHistory} from './nonce.js';
import {useNonce} from './nonce.js';
import {truthy} from './truthy.js';
import {validateFolderName} from './validation/validate-folder-name.js';

export type TFolder = {
	name: string;
	parent: string | null;
	nonce: NonceHistory;
	stack: string | null;
};

type FolderContextType = {
	folderName: string | null;
	parentName: string | null;
};

export const FolderContext = createContext<FolderContextType>({
	folderName: null,
	parentName: null,
});

/*
 * @description By wrapping a <Composition /> inside a <Folder />, you can visually categorize it in your sidebar, should you have many compositions.
 * @see [Documentation](https://remotion.dev/docs/folder)
 */
export const Folder: FC<{
	readonly name: string;
	readonly children: React.ReactNode;
}> = (props) => {
	const {name, children} = props;
	const parent = useContext(FolderContext);
	const {registerFolder, unregisterFolder} = useContext(CompositionSetters);
	const nonce = useNonce();
	const stack = (props as {stack?: string}).stack ?? null;

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
		registerFolder(name, parentName, nonce.get(), stack);

		return () => {
			unregisterFolder(name, parentName);
		};
	}, [
		name,
		parent.folderName,
		parentName,
		registerFolder,
		unregisterFolder,
		nonce,
		stack,
	]);

	return (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
};
