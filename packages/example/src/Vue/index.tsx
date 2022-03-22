import React, {useEffect, useRef} from 'react';
import {createApp} from 'vue';
import App from './App.vue';

const app = createApp(App);

export const VueApp: React.FC = () => {
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => {
		app.mount(ref.current as HTMLDivElement);
	}, []);

	return <div ref={ref}></div>;
};
