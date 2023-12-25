import {memo, useCallback, useContext, useMemo} from 'react';
import {NoReactInternals} from 'remotion/no-react';
import {SELECTED_GUIDE, UNSELECTED_GUIDE} from '../../helpers/colors';
import type {Guide} from '../../state/editor-guides';
import {
	EditorShowGuidesContext,
	persistGuidesList,
} from '../../state/editor-guides';
import {RULER_WIDTH} from '../../state/editor-rulers';
import {ContextMenu} from '../ContextMenu';
import type {ComboboxValue} from '../NewComposition/ComboBox';

const PADDING_FOR_EASY_DRAG = 4;

const GuideComp: React.FC<{
	guide: Guide;
	canvasDimensions: {
		left: number;
		top: number;
		width: number;
		height: number;
	};
	scale: number;
}> = ({guide, canvasDimensions, scale}) => {
	const {
		shouldCreateGuideRef,
		setGuidesList,
		setSelectedGuideId,
		selectedGuideId,
		setHoveredGuideId,
		hoveredGuideId,
	} = useContext(EditorShowGuidesContext);

	const onPointerEnter = useCallback(() => {
		setHoveredGuideId(() => guide.id);
	}, [guide.id, setHoveredGuideId]);

	const onPointerLeave = useCallback(() => {
		setHoveredGuideId(() => null);
	}, [setHoveredGuideId]);

	const isVerticalGuide = guide.orientation === 'vertical';

	const guideStyle: React.CSSProperties = useMemo(() => {
		const canvasPosition = isVerticalGuide
			? canvasDimensions.left
			: canvasDimensions.top;
		const guidePosition = guide.position * scale + canvasPosition;
		return {
			position: 'absolute',
			width: `${isVerticalGuide ? '1px' : '100%'}`,
			height: `${isVerticalGuide ? '100%' : '1px'}`,
			left: `${isVerticalGuide ? guidePosition - PADDING_FOR_EASY_DRAG : 0}px`,
			top: `${isVerticalGuide ? 0 : guidePosition - PADDING_FOR_EASY_DRAG}px`,
			cursor: `${isVerticalGuide ? 'ew-resize' : 'ns-resize'}`,
			padding: isVerticalGuide
				? `0 ${PADDING_FOR_EASY_DRAG}px`
				: `${PADDING_FOR_EASY_DRAG}px 0`,
		};
	}, [guide, scale, canvasDimensions, isVerticalGuide]);

	const guideContentStyle: React.CSSProperties = useMemo(() => {
		return {
			position: 'relative',
			minWidth: `${isVerticalGuide ? '1px' : `calc(100% + ${RULER_WIDTH}px`}`,
			minHeight: `${isVerticalGuide ? `calc(100% + ${RULER_WIDTH}px` : '1px'}`,
			top: `${isVerticalGuide ? `-${RULER_WIDTH}px` : '0px'}`,
			left: `${isVerticalGuide ? '0px' : `-${RULER_WIDTH}px`}`,
			display: guide.show ? 'block' : 'none',
			backgroundColor:
				selectedGuideId === guide.id || hoveredGuideId === guide.id
					? SELECTED_GUIDE
					: UNSELECTED_GUIDE,
		};
	}, [isVerticalGuide, guide.show, guide.id, selectedGuideId, hoveredGuideId]);

	const onMouseDown = useCallback(
		(e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
			e.preventDefault();
			if (e.button !== 0) {
				return;
			}

			shouldCreateGuideRef.current = true;
			document.body.style.cursor = 'no-drop';
			setSelectedGuideId(() => guide.id);
		},
		[shouldCreateGuideRef, setSelectedGuideId, guide.id],
	);

	const values = useMemo((): ComboboxValue[] => {
		return [
			{
				id: '1',
				keyHint: null,
				label: 'Remove guide',
				leftItem: null,
				onClick: () => {
					setGuidesList((prevState) => {
						const newGuides = prevState.filter((selected) => {
							return selected.id !== guide.id;
						});
						persistGuidesList(newGuides);
						return newGuides;
					});
				},
				quickSwitcherLabel: null,
				subMenu: null,
				type: 'item',
				value: 'remove',
			},
		];
	}, [guide.id, setGuidesList]);

	return (
		<ContextMenu values={values}>
			<div
				style={guideStyle}
				onMouseDown={onMouseDown}
				className="__remotion_editor_guide"
				onPointerEnter={onPointerEnter}
				onPointerLeave={onPointerLeave}
			>
				<div
					style={guideContentStyle}
					className={[
						'__remotion_editor_guide_content',
						selectedGuideId === guide.id || hoveredGuideId === guide.id
							? '__remotion_editor_guide_selected'
							: null,
					]
						.filter(NoReactInternals.truthy)
						.join(' ')}
				/>
			</div>
		</ContextMenu>
	);
};

export default memo(GuideComp);
