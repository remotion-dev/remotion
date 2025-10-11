import React, {useEffect, useRef, useState} from 'react';
import {isWebkit} from './IfYouKnowReact';

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

export const RealMP4Videos: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);
	const videoRef = useRef<HTMLVideoElement>(null);

	const [vid, setVid] = useState('/img/render-progress.webm');

	useEffect(() => {
		if (isWebkit()) {
			setVid('/img/render-progress.mp4');
		}
	}, []);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const callback = (data: IntersectionObserverEntry[]) => {
			if (data[0].isIntersecting) {
				videoRef.current?.play();
			}
		};

		const observer = new IntersectionObserver(callback, {
			root: null,
			threshold: 0.5,
		});
		observer.observe(current);

		return () => observer.unobserve(current);
	}, []);

	return (
		<div ref={ref} className={'flex flex-col lg:flex-row mt-40 lg:mt-30 gap-6'}>
			<div className="flex w-[500px] justify-start lg:justify-start items-end">
				<video
					ref={videoRef}
					src={vid}
					muted
					autoPlay
					playsInline
					loop
					style={{
						width: 400,
						maxWidth: '100%',
						borderRadius: 7,
						overflow: 'hidden',
					}}
					className="w-[550px] cursor-default! relative lg:translate-x-8 -mt-20 lg:mt-0"
				/>
			</div>{' '}
			<div className="font-brand">
				<h2 className="text-4xl fontbrand">
					<span className={'text-brand'}>Scalable</span> rendering
				</h2>
				<p className="leading-relaxed">
					Render the video .mp4 or other formats. <br />
					Locally, on the server or serverless.
				</p>{' '}
				<div className="h-4" />
				<div className="leading-6">
					<a
						className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
						href="/docs/render"
					>
						Render options{' '}
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
						href="/lambda"
					>
						Remotion Lambda{' '}
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
