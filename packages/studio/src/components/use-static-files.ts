import React, {createContext, useContext, useEffect, useState} from 'react';
import {useRemotionEnvironment} from 'remotion';
import {type StaticFile, getStaticFiles} from '../api/get-static-files';
import {watchPublicFolder} from '../api/watch-public-folder';

const StaticFilesContext = createContext<StaticFile[]>([]);

export const StaticFilesProvider: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const [files, setFiles] = useState(() => getStaticFiles());
	const env = useRemotionEnvironment();

	useEffect(() => {
		if (!env.isStudio) {
			return;
		}

		if (env.isReadOnlyStudio) {
			return;
		}

		const {cancel} = watchPublicFolder((newFiles) => {
			setFiles(newFiles);
		});

		return cancel;
	}, [env.isStudio, env.isReadOnlyStudio]);

	return React.createElement(
		StaticFilesContext.Provider,
		{value: files},
		children,
	);
};

export const useStaticFiles = (): StaticFile[] => {
	return useContext(StaticFilesContext);
};
