import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {Internals, useCurrentFrame, useVideoConfig} from 'remotion';
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
	const sequenceContext = useContext(Internals.SequenceContext);
	const timelineContext = useContext(Internals.Timeline.TimelineContext);

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
	const sequenceContextRef = useMemo(() => {
		return ref(sequenceContext);
	}, []);
	const timelineContextRef = useMemo(() => {
		return ref(timelineContext);
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
		sequenceContextRef.value = sequenceContext;
	}, [sequenceContext]);
	useEffect(() => {
		timelineContextRef.value = timelineContext;
	}, [timelineContext]);

	useEffect(() => {
		const app = createApp(App, {
			fps: fpsRef,
			frame: frameRef,
			height: heightRef,
			width: widthRef,
			durationInFrames: durationInFramesRef,
			sequenceContext: sequenceContextRef,
			timelineContext: timelineContextRef,
		});

		app.mount(domRef.current as HTMLDivElement);
		return () => {
			app.unmount();
		};
	}, []);

	return <div ref={domRef}></div>;
};
