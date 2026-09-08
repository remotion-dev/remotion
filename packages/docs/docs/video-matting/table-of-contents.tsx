import React from 'react';
import {Grid} from '../../components/TableOfContents/Grid';
import {TOCItem} from '../../components/TableOfContents/TOCItem';

export const TableOfContents: React.FC = () => {
	return (
		<Grid>
			<TOCItem link="/docs/video-matting/can-use-video-matting">
				<strong>canUseVideoMatting()</strong>
				<div>Check whether a model is supported</div>
			</TOCItem>
			<TOCItem link="/docs/video-matting/get-available-models">
				<strong>getAvailableModels()</strong>
				<div>List models and their download sizes</div>
			</TOCItem>
			<TOCItem link="/docs/video-matting/is-video-matting-model-cached">
				<strong>isVideoMattingModelCached()</strong>
				<div>Check whether a model is downloaded</div>
			</TOCItem>
			<TOCItem link="/docs/video-matting/load-video-matting-model">
				<strong>loadVideoMattingModel()</strong>
				<div>Download and initialize a model</div>
			</TOCItem>
			<TOCItem link="/docs/video-matting/separate-video-layers">
				<strong>separateVideoLayers()</strong>
				<div>Create base and foreground WebM layers</div>
			</TOCItem>
			<TOCItem link="/docs/video-matting/dispose-video-matting-model">
				<strong>disposeVideoMattingModel()</strong>
				<div>Release model memory</div>
			</TOCItem>
		</Grid>
	);
};
