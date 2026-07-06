import React, {useCallback} from 'react';
import {
	BLACK_ALPHA_40,
	CURRENT_COLOR,
	LIGHT_COLOR,
	WHITE,
} from '../../helpers/colors';
import type {RenderInlineAction} from '../InlineAction';

const eyeIcon: React.CSSProperties = {
	width: 12,
	color: CURRENT_COLOR,
	pointerEvents: 'none',
};

const effectIcon: React.CSSProperties = {
	...eyeIcon,
	width: 15,
};

const speakerIcon: React.CSSProperties = {
	...eyeIcon,
	height: 10,
	marginLeft: -1,
};

export const timelineLayerIconContainer: React.CSSProperties = {
	height: 16,
	width: 16,
	borderRadius: 2,
	backgroundColor: BLACK_ALPHA_40,
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
	marginRight: 6,
	flexShrink: 0,
};

let layerPointedDown: null | 'enable' | 'disable' = null;

export const TimelineLayerEye: React.FC<{
	readonly onInvoked: (type: 'enable' | 'disable') => void;
	readonly hidden: boolean;
	readonly type: 'eye' | 'speaker' | 'effect';
}> = ({onInvoked, hidden, type}) => {
	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			if (hidden) {
				return null;
			}

			if (type === 'speaker') {
				return (
					<svg viewBox="0 0 10 14" fill="none" style={speakerIcon}>
						<path
							d="M9.40938 0.0869018C9.76875 0.249402 10 0.605652 10 0.999402V12.9994C10 13.3932 9.76875 13.7494 9.40938 13.9119C9.05 14.0744 8.62813 14.0088 8.33438 13.7463L4.11875 9.9994H2C0.896875 9.9994 0 9.10253 0 7.9994V5.9994C0 4.89628 0.896875 3.9994 2 3.9994H4.11875L8.33438 0.252527C8.62813 -0.0099732 9.05 -0.0724732 9.40938 0.0869018Z"
							fill={color}
						/>
					</svg>
				);
			}

			if (type === 'effect') {
				return (
					<svg viewBox="0 0 16 16" fill="none" style={effectIcon}>
						<path
							d="M4.405 4.48C4.575 3.82 4.865 3.325 5.275 2.995C5.695 2.665 6.25 2.5 6.94 2.5H9.235V4.06H7.045C6.555 4.06 6.235 4.3 6.085 4.78L5.83 5.68H7.975V7.255H5.395L3.805 13H2.02L3.625 7.255H1.96V5.68H4.075L4.405 4.48ZM8.57102 9.085L6.87602 5.68H8.79602L9.86102 7.99L11.991 5.68H14.331L10.686 9.415L12.426 13H10.491L9.35102 10.585L7.02602 13H4.68602L8.57102 9.085Z"
							fill={WHITE}
						/>
					</svg>
				);
			}

			return (
				<svg style={eyeIcon} viewBox="0 0 24 16" fill="none">
					<path
						d="M24 7.551C24 7.551 19.748 16 12.015 16C4.835 16 0 7.551 0 7.551C0 7.551 4.446 0 12.015 0C19.709 0 24 7.551 24 7.551ZM17 8C17 5.243 14.757 3 12 3C9.243 3 7 5.243 7 8C7 10.757 9.243 13 12 13C14.757 13 17 10.757 17 8Z"
						fill={color}
					/>
				</svg>
			);
		},
		[hidden, type],
	);

	const onPointerDown: React.PointerEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			if (e.button !== 0) {
				return;
			}

			e.preventDefault();
			e.stopPropagation();
			layerPointedDown = hidden ? 'enable' : 'disable';
			onInvoked(layerPointedDown);
			window.addEventListener(
				'pointerup',
				() => {
					layerPointedDown = null;
				},
				{once: true},
			);
		},
		[hidden, onInvoked],
	);

	const onDragStart: React.DragEventHandler<HTMLDivElement> = useCallback(
		(e) => {
			e.preventDefault();
			e.stopPropagation();
		},
		[],
	);

	const onPointerEnter = useCallback(() => {
		if (layerPointedDown) {
			onInvoked(layerPointedDown);
		}
	}, [onInvoked]);

	return (
		<div
			style={timelineLayerIconContainer}
			draggable={false}
			onDragStart={onDragStart}
			onPointerEnter={onPointerEnter}
			onPointerDown={onPointerDown}
		>
			{renderAction(LIGHT_COLOR)}
		</div>
	);
};

const spacerStyle: React.CSSProperties = {
	width: 16,
	height: 16,
	marginRight: 6,
	flexShrink: 0,
};

export const TimelineLayerEyeSpacer: React.FC = () => {
	return <div style={spacerStyle} />;
};
