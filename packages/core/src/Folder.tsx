import type {FC, ReactNode} from 'react';
import {createContext, useContext, useEffect, useMemo} from 'react';
import {
	CompositionCommitRegistrationContext,
	CompositionSetters,
} from './CompositionManagerContext.js';
import {FolderOrderMarker, getFolderOrderId} from './sequence-order-marker.js';
import {truthy} from './truthy.js';
import {useRemotionEnvironment} from './use-remotion-environment.js';
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
	const compManager = useContext(CompositionSetters);
	const {registerFolder, unregisterFolder} = compManager;
	const environment = useRemotionEnvironment();
	const commitRegistrationEnabled =
		useContext(CompositionCommitRegistrationContext) === compManager;
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
	const registration = useMemo<TFolder | null>(
		() =>
			commitRegistrationEnabled
				? {name, parent: parentName, order: null, stack}
				: null,
		[commitRegistrationEnabled, name, parentName, stack],
	);

	useEffect(() => {
		if (commitRegistrationEnabled) {
			return;
		}

		registerFolder(name, parentName, stack);

		return () => {
			unregisterFolder(name, parentName);
		};
	}, [
		commitRegistrationEnabled,
		name,
		parent.folderName,
		parentName,
		registerFolder,
		unregisterFolder,
		stack,
	]);

	const folder = (
		<FolderContext.Provider value={value}>{children}</FolderContext.Provider>
	);
	return environment.isStudio ? (
		<FolderOrderMarker
			folderId={getFolderOrderId({name, parent: parentName})}
			registration={registration}
		>
			{folder}
		</FolderOrderMarker>
	) : (
		folder
	);
};
