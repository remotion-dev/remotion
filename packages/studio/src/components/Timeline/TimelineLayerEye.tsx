import {useCallback} from 'react';
import {LIGHT_COLOR} from '../../helpers/colors';
import type {RenderInlineAction} from '../InlineAction';

const clearIcon: React.CSSProperties = {
	width: 12,
	color: 'currentColor',
};

const container: React.CSSProperties = {
	height: 16,
	width: 16,
	borderRadius: 2,
	backgroundColor: 'rgba(0, 0, 0, 0.4)',
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	marginRight: 6,
};

export const TimelineLayerEye: React.FC<{
	onClick: () => void;
	hidden: boolean;
}> = ({onClick, hidden}) => {
	const renderAction: RenderInlineAction = useCallback(
		(color) => {
			if (hidden) {
				return null;
			}

			return (
				<svg style={clearIcon} viewBox="0 0 24 16" fill="none">
					<path
						d="M24 7.551C24 7.551 19.748 16 12.015 16C4.835 16 0 7.551 0 7.551C0 7.551 4.446 0 12.015 0C19.709 0 24 7.551 24 7.551ZM17 8C17 5.243 14.757 3 12 3C9.243 3 7 5.243 7 8C7 10.757 9.243 13 12 13C14.757 13 17 10.757 17 8Z"
						fill={color}
					/>
				</svg>
			);
		},
		[hidden],
	);

	return (
		<div style={container} onPointerDown={onClick}>
			{renderAction(LIGHT_COLOR)}
		</div>
	);
};
