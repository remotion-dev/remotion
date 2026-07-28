import React, {createContext, useContext, useEffect, useState} from 'react';
import {useRemotionEnvironment} from 'remotion';
import {type StaticFile, getStaticFiles} from '../api/get-static-files';
import {watchPublicFolder} from '../api/watch-public-folder';
import {getBrowserStudioOperations} from '../helpers/browser-studio-operations';
import {StudioServerConnectionCtx} from '../helpers/client-id';

const StaticFilesContext = createContext<StaticFile[]>([]);

export const StaticFilesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [files, setFiles] = useState(() => getStaticFiles());
	const env = useRemotionEnvironment();
	const {previewServerState} = useContext(StudioServerConnectionCtx);
	const browserStudioCanWatch =
		previewServerState.type === 'connected' &&
		getBrowserStudioOperations() !== null;

	useEffect(() => {
		if (!env.isStudio) {
			return;
		}

		if (env.isReadOnlyStudio && !browserStudioCanWatch) {
			return;
		}

		const {cancel} = watchPublicFolder((newFiles) => {
			setFiles(newFiles);
		});

		return cancel;
	}, [browserStudioCanWatch, env.isStudio, env.isReadOnlyStudio]);

	return React.createElement(
		StaticFilesContext.Provider,
		{value: files},
		children,
	);
};

export const useStaticFiles = (): StaticFile[] => {
	return useContext(StaticFilesContext);
};
