import React, {useCallback, useEffect, useRef, useState} from 'react';

export const RealMP4Videos: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);
	const [isIntersecting, setIsIntersecting] = useState(false);

	const callback: IntersectionObserverCallback = useCallback((data) => {
		setIsIntersecting(data[0].isIntersecting);
	}, []);

	useEffect(() => {
		const {current} = ref;
		if (!current) {
			return;
		}

		const observer = new IntersectionObserver(callback, {
			root: null,
			threshold: 0.5,
		});
		observer.observe(current);

		return () => observer.unobserve(current);
	}, [callback]);

	return (
		<div ref={ref} className={'flex flex-col lg:flex-row'}>
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
			<div className="flex flex-1 justify-start lg:justify-end items-end">
				<img
					src="/img/mp4.png"
					className="mb-[30px] lg:mb-0"
					style={{
						width: 110,
						animationPlayState: isIntersecting ? 'running' : 'paused',
					}}
				/>
			</div>
		</div>
	);
};
