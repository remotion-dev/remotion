import {Video} from '@remotion/media';
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {CylinderText} from '../../elements/text/cylinder-text/cylinder-text';
import {useHtmlInCanvasDocsDemoBranch} from './useHtmlInCanvasDocsDemoBranch';

export const CylinderTextDemo: React.FC = () => {
	const branch = useHtmlInCanvasDocsDemoBranch('webgpu');
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#eef1f4',
			}}
		>
			{branch === 'live' ? (
				<CylinderText />
			) : branch === 'fallback' ? (
				<Video
					muted
					src="https://remotion.media/elements/text-cylinder-text-preview-97956be8-ce8a-4d79-a9aa-f631bbe6dba9.mp4"
					style={{width: '100%', height: '100%'}}
				/>
			) : null}
		</AbsoluteFill>
	);
};
