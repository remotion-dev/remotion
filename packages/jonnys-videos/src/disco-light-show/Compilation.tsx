import {Video} from '@remotion/media';
import React from 'react';
import {Interactive} from 'remotion';
import {asset} from './assets';

const CompilationInner: React.FC = () => {
	return (
		<>
			<Video
				src={asset('IMG_7933 (1).mov')}
				style={{
					position: 'absolute',
					translate: '146.3px 310.8px',
					width: 1156,
					height: 1080,
					scale: 1.98,
				}}
				durationInFrames={52}
				trimBefore={327}
			/>
		</>
	);
};

export const Compilation = Interactive.withSchema({
	Component: CompilationInner,
	componentName: 'Compilation',
	schema: {},
	wrapInSequence: true,
	layout: 'absolute-fill',
});
