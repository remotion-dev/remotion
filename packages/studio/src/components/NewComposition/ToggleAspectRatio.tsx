import type {MouseEventHandler} from 'react';
import React, {useCallback} from 'react';
import {BACKGROUND} from '../../helpers/colors';
import {LockIcon, UnlockIcon} from '../../icons/lock';

const buttonStyle: React.CSSProperties = {
	backgroundColor: BACKGROUND,
	border: 'none',
	position: 'absolute',
	paddingLeft: 2,
	paddingRight: 2,
	marginLeft: 3,
};

const iconStyle: React.CSSProperties = {
	width: 10,
	color: 'white',
};

export const ToggleAspectRatio: React.FC<{
	aspectRatioLocked: boolean;
	setAspectRatioLocked: (option: boolean) => void;
}> = ({aspectRatioLocked, setAspectRatioLocked}) => {
	const onClick: MouseEventHandler = useCallback(() => {
		setAspectRatioLocked(!aspectRatioLocked);
	}, [aspectRatioLocked, setAspectRatioLocked]);

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
