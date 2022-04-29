import React from 'react';
import {Composition, Folder, getInputProps} from 'remotion';

// Use it to test that UI does not regress on weird CSS
// import './weird-css.css';

export const Index: React.FC = () => {
	const inputProps = getInputProps();
	return (
		<>
			<Folder name="Visuals">
				<Composition
					id="CompInFolder"
					lazyComponent={() => import('./IframeTest')}
					width={1080}
					height={1080}
					fps={30}
					durationInFrames={10}
				/>
			</Folder>
			<Composition
				id="CompOutsideFolder"
				lazyComponent={() => import('./IframeTest')}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={10}
			/>
		</>
	);
};
