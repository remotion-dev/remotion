import React from 'react';
import {BLUE} from '../../../editor/helpers/colors';
import {didUnmountReactApp} from '../react-overlay';
import {DismissButton} from './DismissButton';
import {ErrorMessage} from './ErrorMessage';
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
	fontWeight: 'bold',
	maxWidth: '100%',
};

const errName: React.CSSProperties = {
	fontSize: 18,
	color: BLUE,
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
	canHaveDismissButton: boolean;
}> = ({name, message, symbolicating, canHaveDismissButton}) => {
	return (
		<div style={title} className="css-reset">
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
					<ErrorMessage message={message} />
				</div>
			</div>
			{didUnmountReactApp() ? null : canHaveDismissButton ? (
				<DismissButton />
			) : null}
		</div>
	);
};
