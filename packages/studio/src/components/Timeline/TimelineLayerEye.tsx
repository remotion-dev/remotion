import {useCallback} from 'react';
import {LIGHT_COLOR} from '../../helpers/colors';
import type {RenderInlineAction} from '../InlineAction';

const eyeIcon: React.CSSProperties = {
	width: 12,
	color: 'currentColor',
	pointerEvents: 'none',
};

const speakerIcon: React.CSSProperties = {
	...eyeIcon,
	height: 10,
	marginLeft: -1,
};

const container: React.CSSProperties = {
	height: 16,
	width: 16,
	borderRadius: 2,
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	display: 'inline-flex',
	justifyContent: 'center',
	alignItems: 'center',
	marginRight: 6,
};

let layerPointedDown: null | 'enable' | 'disable' = null;

export const TimelineLayerEye: React.FC<{
	onInvoked: (type: 'enable' | 'disable') => void;
	hidden: boolean;
	type: 'eye' | 'speaker';
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

	const onPointerEnter = useCallback(() => {
		if (layerPointedDown) {
			onInvoked(layerPointedDown);
		}
	}, [onInvoked]);

	return (
		<div
			style={container}
			onPointerEnter={onPointerEnter}
			onPointerDown={onPointerDown}
		>
			{renderAction(LIGHT_COLOR)}
		</div>
	);
};
