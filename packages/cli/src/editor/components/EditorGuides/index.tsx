import {type Size} from '@remotion/player';
import {useContext} from 'react';
import type {AssetMetadata} from '../../helpers/get-asset-metadata';
import type {Dimensions} from '../../helpers/is-current-selected-still';
import {useStudioCanvasDimensions} from '../../helpers/use-studio-canvas-dimensions';
import {EditorShowGuidesContext} from '../../state/editor-guides';
import Guide from './Guide';

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
			{guidesList.map((guide, index) => {
				return (
					<Guide
						// eslint-disable-next-line react/no-array-index-key
						key={`${guide.position}${guide.orientation}${index}`}
						guideDetails={guide}
						index={index}
						canvasDimensions={canvasDimensions}
						scale={scale}
					/>
				);
			})}
		</>
	);
};

export default EditorGuides;
