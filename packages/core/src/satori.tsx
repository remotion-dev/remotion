import type {PropsWithChildren} from 'react';
import React, {useEffect} from 'react';
import nativeSatori from 'satori';
import {useVideoConfig} from './use-video-config';

export const Satori: React.FC<PropsWithChildren> = ({children}) => {
	const [markup, setMarkup] = React.useState<string | null>(null);
	const {width, height} = useVideoConfig();

	useEffect(() => {
		nativeSatori(children, {
			width,
			height,
			fonts: [],
		})
			.then((svg) => {
				setMarkup(svg);
				console.log({svg});
			})
			.catch((err) => {
				console.log(err);
			});
	}, [children, height, width]);

	if (!markup) {
		return null;
	}

	return (
		<div
			// eslint-disable-next-line react/no-danger
			dangerouslySetInnerHTML={{
				__html: markup,
			}}
		/>
	);
};
