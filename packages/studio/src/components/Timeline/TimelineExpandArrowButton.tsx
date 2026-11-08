import React, {useMemo} from 'react';
import {LIGHT_GRAY, TRANSPARENT, WHITE} from '../../helpers/colors';
import {HOVERABLE_CLASS_NAME, hoverableStyle} from '../../helpers/hoverable';
import {CaretDown} from '../../icons/caret';
import {DisclosureChevron} from '../../icons/disclosure-chevron';

const arrowButton: React.CSSProperties = {
	background: 'none',
	border: 'none',
	padding: 0,
	display: 'flex',
	alignItems: 'center',
	justifyContent: 'center',
	width: 12,
	height: 12,
	flexShrink: 0,
	fontSize: 8,
	marginRight: 4,
	userSelect: 'none',
	WebkitUserSelect: 'none',
	outline: 'none',
	lineHeight: 1,
};

const arrowSpacer: React.CSSProperties = {
	...arrowButton,
};

const stopPropagation = (
	e:
		| React.MouseEvent<HTMLButtonElement>
		| React.PointerEvent<HTMLButtonElement>,
) => {
	e.stopPropagation();
};

export const TimelineExpandArrowButton: React.FC<{
	readonly isExpanded: boolean;
	readonly onClick: () => void;
	readonly label: string;
	readonly disabled: boolean;
	readonly iconVariant: 'inspector' | 'timeline';
}> = ({isExpanded, onClick, label, disabled = false, iconVariant}) => {
	const handleClick = React.useCallback(
		(e: React.MouseEvent<HTMLButtonElement>) => {
			e.stopPropagation();
			onClick();
		},
		[onClick],
	);

	const style: React.CSSProperties = useMemo(() => {
		return {
			...arrowButton,
			...hoverableStyle({
				idleBackground: TRANSPARENT,
				hoverBackground: TRANSPARENT,
				idleColor: LIGHT_GRAY,
				hoverColor: disabled ? LIGHT_GRAY : WHITE,
			}),
			transform:
				iconVariant === 'inspector'
					? undefined
					: isExpanded
						? 'rotate(0deg)'
						: 'rotate(-90deg)',
			opacity: disabled ? 0.5 : 1,
		};
	}, [isExpanded, disabled, iconVariant]);

	return (
		<button
			type="button"
			className={`${HOVERABLE_CLASS_NAME} __remotion-timeline-expand-arrow-button`}
			style={style}
			onClick={handleClick}
			onDoubleClick={stopPropagation}
			onPointerDown={stopPropagation}
			disabled={disabled}
			aria-expanded={isExpanded}
			aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
		>
			{iconVariant === 'inspector' ? (
				<DisclosureChevron expanded={isExpanded} />
			) : (
				<CaretDown />
			)}
		</button>
	);
};

export const TimelineExpandArrowSpacer: React.FC = () => {
	return <div style={arrowSpacer} />;
};
