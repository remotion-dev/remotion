import React, {useEffect, useRef, useState} from 'react';
import {isWebkit} from './IfYouKnowReact';

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

export const ParameterizeAndEdit: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [vid, setVid] = useState('/img/editing-vp9-chrome.webm');

	useEffect(() => {
		if (isWebkit()) {
			setVid('/img/editing-safari.mp4');
		}
	}, []);

	return (
		<div
			ref={ref}
			className={
				'flex flex-col lg:flex-row justify-start lg:justify-end items-start gap-6 mt-20 lg:mt-0'
			}
		>
			<div>
				<video
					src={vid}
					autoPlay
					muted
					playsInline
					loop
					style={{
						width: 500,
						maxWidth: '100%',
						borderRadius: 7,
						overflow: 'hidden',
					}}
				/>
			</div>
			<div style={{flex: 1}} className="font-brand pt-4">
				<h2 className={'fontbrand text-4xl'}>
					Edit <span className="text-brand">dynamically</span>
				</h2>
				<p className="leading-relaxed">
					Parameterize your video by passing data.
					<br />
					Or embed it into your app and build an interface around it.
				</p>
				<div className="h-4" />
				<div className="leading-6">
					<a
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href="/docs/studio"
					>
						Remotion Studio{' '}
						<svg
							style={icon}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
						>
							<path
								fill="currentColor"
								d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
							/>
						</svg>
					</a>
					<br />
					<a
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href="/player"
					>
						Remotion Player{' '}
						<svg
							style={icon}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
						>
							<path
								fill="currentColor"
								d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
							/>
						</svg>
					</a>
					<br />
					<a
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href="/docs/editor-starter"
					>
						Remotion Editor Starter{' '}
						<svg
							style={icon}
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 448 512"
						>
							<path
								fill="currentColor"
								d="M438.6 278.6l-160 160C272.4 444.9 264.2 448 256 448s-16.38-3.125-22.62-9.375c-12.5-12.5-12.5-32.75 0-45.25L338.8 288H32C14.33 288 .0016 273.7 .0016 256S14.33 224 32 224h306.8l-105.4-105.4c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0l160 160C451.1 245.9 451.1 266.1 438.6 278.6z"
							/>
						</svg>
					</a>
				</div>
			</div>
		</div>
	);
};
