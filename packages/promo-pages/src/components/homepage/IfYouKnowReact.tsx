import React from 'react';
import {BlueButton} from './layout/Button';

export const isWebkit = () => {
	if (typeof window === 'undefined') {
		return false;
	}

	const isSafariUserAgent = Boolean(
		navigator.userAgent.match(/Version\/[\d.]+.*Safari/),
	);

	const isChrome = Boolean(navigator.userAgent.match(/CriOS\//));
	return isSafariUserAgent || isChrome;
};

export const IfYouKnowReact: React.FC = () => {
	return (
		<div className="flex flex-col lg:flex-row text-left lg:text-right justify-start lg:justify-end items-start lg:mb-0">
			<video
				src={isWebkit() ? '/img/compose.mp4' : '/img/compose.webm'}
				muted
				autoPlay
				playsInline
				loop
				className="w-[600px] h-[600px] cursor-default! relative lg:-translate-x-8 -mb-50 -mt-10 lg:mt-0 lg:mb-0"
			/>
			<div className="h-10 lg:flex-1" />
			<div className="lg:text-right">
				<h2 className="text-4xl fontbrand pt-20">
					<span className="text-brand">Compose</span> your
					<br />
					video with code.
				</h2>
				<p className="leading-relaxed">
					Use React, a powerful frontend technology, to create sophisticated
					videos with code.
				</p>
				<div className="h-7" />
				<a className="no-underline inline-block" href="/docs/the-fundamentals">
					<BlueButton size="sm" loading={false}>
						Learn Remotion
					</BlueButton>
				</a>
			</div>
		</div>
	);
};
