import type {Template} from 'create-video';
import React from 'react';
import {Blank} from '../icons/blank';
import {CodeHike} from '../icons/code-hike';
import {Cubes} from '../icons/cubes';
import {JSIcon} from '../icons/js';
import {NextIcon} from '../icons/next';
import {OverlayIcon} from '../icons/overlay';
import {ReactRouterIcon} from '../icons/remix';
import {SkiaIcon} from '../icons/skia';
import {Stargazer} from '../icons/stargazer';
import {StillIcon} from '../icons/still';
import {TikTok} from '../icons/tiktok';
import {TypeScriptIcon} from '../icons/ts';
import {TTSIcon} from '../icons/tts';
import {Waveform} from '../icons/waveform';

export const IconForTemplate: React.FC<{
	readonly template: Template;
	readonly scale: number;
}> = ({template, scale = 1}) => {
	if (template.cliId === 'hello-world') {
		return (
			<TypeScriptIcon
				style={{
					height: scale * 48,
				}}
			/>
		);
	}

	if (template.cliId === 'blank') {
		return (
			<Blank
				style={{
					height: scale * 36,
					overflow: 'visible',
				}}
			/>
		);
	}

	if (template.cliId === 'javascript') {
		return (
			<JSIcon
				style={{
					height: scale * 40,
				}}
			/>
		);
	}

	if (template.cliId === 'three') {
		return (
			<Cubes
				style={{
					height: scale * 36,
				}}
			/>
		);
	}

	if (template.cliId === 'still') {
		return (
			<StillIcon
				style={{
					height: scale * 36,
				}}
			/>
		);
	}

	if (template.cliId === 'audiogram') {
		return (
			<Waveform
				style={{
					height: scale * 36,
				}}
			/>
		);
	}

	if (template.cliId === 'tts') {
		return (
			<TTSIcon
				style={{
					height: scale * 36,
				}}
			/>
		);
	}

	if (template.cliId === 'google-tts') {
		return (
			<TTSIcon
				style={{
					height: scale * 36,
				}}
			/>
		);
	}

	if (template.cliId === 'skia') {
		return (
			<SkiaIcon
				style={{
					height: scale * 32,
				}}
			/>
		);
	}

	if (template.cliId === 'react-router') {
		return (
			<ReactRouterIcon
				style={{
					height: scale * 32,
				}}
			/>
		);
	}

	if (template.cliId === 'overlay') {
		return <OverlayIcon style={{height: scale * 42}} />;
	}

	if (
		template.cliId === 'next' ||
		template.cliId === 'next-tailwind' ||
		template.cliId === 'next-pages-dir'
	) {
		return <NextIcon style={{height: scale * 36}} />;
	}

	if (template.cliId === 'stargazer') {
		return <Stargazer style={{height: scale * 36}} />;
	}

	if (template.cliId === 'tiktok') {
		return <TikTok style={{height: scale * 36}} />;
	}

	if (template.cliId === 'code-hike') {
		return <CodeHike style={{height: scale * 36}} />;
	}

	return (
		<Blank
			style={{
				height: scale * 40,
			}}
		/>
	);
};
