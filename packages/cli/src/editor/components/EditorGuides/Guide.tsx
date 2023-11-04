import {memo, useContext} from 'react';
import {EditorShowGuidesContext} from '../../state/editor-guides';

const Guide: React.FC<{
	guideDetails: {
		position: number;
		orientation: 'horizontal' | 'vertical';
	};
	index: number;
	canvasDimensions: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	scale: number;
}> = ({guideDetails, index, canvasDimensions, scale}) => {
	const {shouldCreateGuideRef, setSelectedGuideIndex} = useContext(
		EditorShowGuidesContext,
	);

	return (
		<div
			style={{
				position: 'absolute',
				width: `${guideDetails.orientation === 'vertical' ? '1px' : '100%'}`,
				height: `${guideDetails.orientation === 'horizontal' ? '1px' : '100%'}`,
				left: `${
					guideDetails.orientation === 'vertical'
						? guideDetails.position * scale + canvasDimensions.left
						: 0
				}px`,
				top: `${
					guideDetails.orientation === 'horizontal'
						? guideDetails.position * scale + canvasDimensions.top
						: 0
				}px`,
				cursor: `${
					guideDetails.orientation === 'vertical' ? 'ew-resize' : 'ns-resize'
				}`,
				padding: guideDetails.orientation === 'horizontal' ? '2px 0' : '0 2px',
			}}
			onMouseDown={(e) => {
				e.preventDefault();
				shouldCreateGuideRef.current = true;
				document.body.style.cursor = 'no-drop';
				setSelectedGuideIndex(() => index);
			}}
		>
			<div
				style={{
					background: '#000000',
					width: `${guideDetails.orientation === 'vertical' ? '1px' : '100%'}`,
					height: `${
						guideDetails.orientation === 'horizontal' ? '1px' : '100%'
					}`,
				}}
			/>
		</div>
	);
};

export default memo(Guide);
