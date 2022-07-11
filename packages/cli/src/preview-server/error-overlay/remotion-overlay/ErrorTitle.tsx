import React from 'react';
import {didUnmountReactApp} from '../react-overlay';
import {DismissButton} from './DismissButton';
import {Symbolicating} from './Symbolicating';

const title: React.CSSProperties = {
	marginBottom: 8,
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'center',
};

const left: React.CSSProperties = {
	flex: 1,
	paddingRight: 14,
	lineHeight: 1.5,
	fontSize: '1.5em',
	fontWeight: 'bold',
	maxWidth: '100%',
};

const errName: React.CSSProperties = {
	fontSize: '0.8em',
	background: '#4290f5',
	WebkitBackgroundClip: 'text',
	WebkitTextFillColor: 'transparent',
	display: 'inline-block',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

const spacer: React.CSSProperties = {
	width: 5,
};

export const ErrorTitle: React.FC<{
	name: string;
	message: string;
	symbolicating: boolean;
}> = ({name, message, symbolicating}) => {
	return (
		<div style={title}>
			<div style={left}>
				<span style={errName}>{name}</span>
				<br />
				<div style={row}>
					{symbolicating ? (
						<>
							<Symbolicating />
							<div style={spacer} />
						</>
					) : null}
					<div>{message}</div>
				</div>
			</div>
			{didUnmountReactApp() ? null : <DismissButton />}
		</div>
	);
};
