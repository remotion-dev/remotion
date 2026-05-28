import React, {useEffect, useState} from 'react';

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

const icon: React.CSSProperties = {
	height: 16,
	marginLeft: 10,
};

export const IfYouKnowReact: React.FC = () => {
	const [vid, setVid] = useState('/img/compose.webm');

	useEffect(() => {
		if (isWebkit()) {
			setVid('/img/compose.mp4');
		}
	}, []);

	return (
		<div className="flex flex-col lg:flex-row text-left justify-start lg:justify-end items-start lg:mb-0 gap-6 mt-8">
			<video
				src={vid}
				muted
				autoPlay
				playsInline
				loop
				className="w-[500px] h-[500px] cursor-default! relative lg:-translate-x-8 -mb-40 lg:mt-0 lg:mb-0"
			/>
			<div>
				<h2 className="text-4xl fontbrand pt-20">
					<span className="text-brand">Compose</span> with code
				</h2>
				<p className="leading-relaxed font-brand">
					Use React, a powerful frontend technology, to create sophisticated
					videos with code.
				</p>
				<div className="h-4" />
				<a
					className="no-underline text-brand font-brand font-bold inline-flex flex-row items-center"
					href="/docs/the-fundamentals"
				>
					Learn Remotion{' '}
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
	);
};
