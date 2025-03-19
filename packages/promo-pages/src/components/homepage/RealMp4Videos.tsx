import React, {useEffect, useRef, useState} from 'react';
import {isWebkit} from './IfYouKnowReact';

export const RealMP4Videos: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);
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
		<div
			ref={ref}
			className={'flex flex-col lg:flex-row-reverse items-center mt-20 lg:mt-0'}
		>
			<div className="flex flex-1 justify-start lg:justify-end items-end">
				<video
					ref={videoRef}
					src={vid}
					muted
					autoPlay
					playsInline
					loop
					style={{}}
					className="w-[550px] h-[550px] cursor-default! relative lg:translate-x-8 -mt-20 -mb-20 lg:mt-0 lg:mb-0"
				/>
			</div>{' '}
			<div>
				<h2 className="text-4xl fontbrand">
					Real <span className={'text-brand'}>.mp4</span> videos
				</h2>
				<p className="leading-relaxed">
					Remotion renders all frames to images and <br /> encodes them to a
					real video - audio support included. <br /> WebM and other formats are
					also supported.
				</p>
			</div>
		</div>
	);
};
