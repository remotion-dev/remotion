import type {PropsWithChildren} from 'react';
import React, {useContext, useEffect} from 'react';
import nativeSatori from 'satori';
import {Experimental} from '.';
import {getRemotionEnvironment} from './get-environment';
import {NativeLayersContext} from './NativeLayers';
import {useVideoConfig} from './use-video-config';

export const Satori: React.FC<PropsWithChildren> = ({children}) => {
	if (getRemotionEnvironment() === 'rendering') {
		return <SatoriForRendering>{children}</SatoriForRendering>;
	}

	return <SatoriForDevelopment>{children}</SatoriForDevelopment>;
};

export const SatoriForRendering: React.FC<PropsWithChildren> = ({children}) => {
	const {width, height} = useVideoConfig();
	const {setSatoriStack} = useContext(NativeLayersContext);

	useEffect(() => {
		nativeSatori(children, {
			width,
			height,
			fonts: [],
		})
			.then((svg) => {
				setSatoriStack(svg);
				console.log({svg});
			})
			.catch((err) => {
				console.log(err);
			});
	}, [children, height, setSatoriStack, width]);

	return <Experimental.Null />;
};

export const SatoriForDevelopment: React.FC<PropsWithChildren> = ({
	children,
}) => {
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
