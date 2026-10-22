import type {NewCompositionAsset} from './codemods';

export const assetCompositionComponent = ({
	asset,
	componentName,
}: {
	asset: NewCompositionAsset;
	componentName: string;
}) => {
	const tag =
		asset.type === 'image'
			? 'CanvasImage'
			: asset.type === 'video'
				? 'Video'
				: 'Audio';
	const imports =
		asset.type === 'image'
			? "import {CanvasImage, staticFile} from 'remotion';"
			: `import {${tag}} from '@remotion/media';\nimport {staticFile} from 'remotion';`;

	return `import React from 'react';
${imports}

export const ${componentName}: React.FC = () => {
	return (
		<${tag}
			src={staticFile(${JSON.stringify(asset.src)})}
			durationInFrames={${asset.durationInFrames}}
		/>
	);
};
`;
};
