import React, {useCallback, useEffect, useState} from 'react';
import {AbsoluteFill, staticFile, watchStaticFile} from 'remotion';

export const WatchStaticDemo: React.FC = () => {
	const [content, setContent] = useState<string | null>(null);

	const fetchStaticFile = useCallback(async () => {
		const txt = await fetch(staticFile('example.txt'));
		const json = await txt.text();
		setContent(json);
	}, []);

	useEffect(() => {
		fetchStaticFile();
	}, [fetchStaticFile]);

	useEffect(() => {
		const {cancel} = watchStaticFile('example.txt', (newFile) => {
			console.log(newFile);
			fetchStaticFile();
		});

		return () => {
			cancel();
		};
	}, [fetchStaticFile]);

	return (
		<AbsoluteFill>
			<h1 style={{fontSize: 100, fontFamily: 'sans-serif'}}>{content}</h1>
		</AbsoluteFill>
	);
};
