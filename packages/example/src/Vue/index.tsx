import React, {useEffect, useMemo, useRef} from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {createApp, ref} from 'vue';
import App from './RootApp.vue';

const fps = ref(30);

setInterval(() => {
	fps.value++;
}, 1000);

export const VueApp: React.FC = () => {
	const domRef = useRef<HTMLDivElement>(null);
	const {fps, height, width, durationInFrames} = useVideoConfig();
	const frame = useCurrentFrame();

	const fpsRef = useMemo(() => {
		return ref(fps);
	}, []);
	const frameRef = useMemo(() => {
		return ref(frame);
	}, []);
	const widthRef = useMemo(() => {
		return ref(width);
	}, []);
	const heightRef = useMemo(() => {
		return ref(height);
	}, []);
	const durationInFramesRef = useMemo(() => {
		return ref(durationInFrames);
	}, []);

	useEffect(() => {
		fpsRef.value = fps;
	}, [fps]);

	useEffect(() => {
		frameRef.value = frame;
	}, [frame]);

	useEffect(() => {
		durationInFramesRef.value = durationInFrames;
	}, [durationInFrames]);

	useEffect(() => {
		widthRef.value = width;
	}, [width]);

	useEffect(() => {
		heightRef.value = height;
	}, [height]);

	useEffect(() => {
		const app = createApp(App, {
			fps: fpsRef,
			frame: frameRef,
			height: heightRef,
			width: widthRef,
			durationInFrames: durationInFramesRef,
		});

		app.mount(domRef.current as HTMLDivElement);
		return () => {
			app.unmount();
		};
	}, []);

	return <div ref={domRef}></div>;
};
