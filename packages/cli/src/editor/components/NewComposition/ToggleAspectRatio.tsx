import React, {MouseEventHandler, useCallback} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import {LockIcon, UnlockIcon} from '../../icons/lock';

const buttonStyle: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	border: 'none',
	position: 'absolute',
};

const iconStyle: React.CSSProperties = {
	width: 14,
	color: 'white',
};

export const ToggleAspectRatio: React.FC<{
	aspectRatioLocked: boolean;
	setAspectRatioLocked: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({aspectRatioLocked, setAspectRatioLocked}) => {
	const onClick: MouseEventHandler = useCallback(() => {
		setAspectRatioLocked((a) => !a);
	}, [setAspectRatioLocked]);
	return (
		<button type="button" onClick={onClick} style={buttonStyle}>
			{aspectRatioLocked ? (
				<LockIcon style={iconStyle} />
			) : (
				<UnlockIcon style={iconStyle} />
			)}
		</button>
	);
};
