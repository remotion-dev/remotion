import React from 'react';
import {RemoteUrlPlayerExample} from '../src/RemoteUrlPlayerExample';

const Page: React.FC = () => {
	return (
		<div
			style={{
				padding: 24,
				fontFamily: 'sans-serif',
			}}
		>
			<h1>Player loaded from URL (experimental)</h1>
			<RemoteUrlPlayerExample />
		</div>
	);
};

export default Page;
