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
	whiteSpace: 'pre',
	fontSize: '1.5em',
	fontWeight: 'bold',
	overflowX: 'auto',
};

const errName: React.CSSProperties = {
	fontSize: '0.8em',
	background: 'linear-gradient(90deg,#4290f5,#42e9f5)',
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
