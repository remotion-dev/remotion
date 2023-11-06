import {type Size} from '@remotion/player';
import {useContext} from 'react';
import type {AssetMetadata} from '../../helpers/get-asset-metadata';
import type {Dimensions} from '../../helpers/is-current-selected-still';
import {useStudioCanvasDimensions} from '../../helpers/use-studio-canvas-dimensions';
import {EditorShowGuidesContext} from '../../state/editor-guides';
import GuideComp from './Guide';

const EditorGuides: React.FC<{
	canvasSize: Size | null;
	contentDimensions: Dimensions | 'none' | null;
	assetMetadata: AssetMetadata | null;
}> = ({canvasSize, contentDimensions, assetMetadata}) => {
	const {canvasDimensions, scale} = useStudioCanvasDimensions({
		canvasSize,
		contentDimensions,
		assetMetadata,
	});

	const {guidesList} = useContext(EditorShowGuidesContext);
	return (
		<>
			{guidesList.map((guide) => {
				return (
					<GuideComp
						key={guide.id}
						guide={guide}
						canvasDimensions={canvasDimensions}
						scale={scale}
					/>
				);
			})}
		</>
	);
};

export default EditorGuides;
