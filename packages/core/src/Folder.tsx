import type {FC, ReactNode} from 'react';
import {createContext, useContext, useMemo} from 'react';
import {
	getFolderOrderId,
	withCommittedMetadata,
	type CommittedMetadata,
} from './committed-metadata.js';
import {useCommittedCompositionEntry} from './composition-registry-fallback.js';
import {truthy} from './truthy.js';
import {validateFolderName} from './validation/validate-folder-name.js';

export type TFolder = {
	name: string;
	parent: string | null;
	order: number | null;
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
const FolderContextProvider = withCommittedMetadata(FolderContext.Provider);

/*
 * @description By wrapping a <Composition /> inside a <Folder />, you can visually categorize it in your sidebar, should you have many compositions.
 * @see [Documentation](https://remotion.dev/docs/folder)
 */
export const Folder: FC<{
	readonly name: string;
	readonly children?: ReactNode;
}> = (props) => {
	const {name, children} = props;
	const parent = useContext(FolderContext);
	const stack =
		(props as {readonly _remotionInternalStack?: string})
			._remotionInternalStack ?? null;

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
	const registration = useMemo<TFolder>(
		() => ({name, parent: parentName, order: null, stack}),
		[name, parentName, stack],
	);

	const metadata = useMemo<Extract<CommittedMetadata, {type: 'folder'}>>(
		() => ({
			type: 'folder',
			id: getFolderOrderId({name, parent: parentName}),
			value: registration,
		}),
		[name, parentName, registration],
	);
	useCommittedCompositionEntry(metadata);
	return (
		<FolderContextProvider value={value} _remotionCommitMetadata={metadata}>
			{children}
		</FolderContextProvider>
	);
};
