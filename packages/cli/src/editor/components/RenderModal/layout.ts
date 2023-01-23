import {LIGHT_TEXT} from '../../helpers/colors';

export const optionRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'flex-start',
	minHeight: 40,
	paddingLeft: 16,
	paddingRight: 16,
	paddingTop: 8,
	paddingBottom: 8,
};

export const label: React.CSSProperties = {
	width: 150,
	fontSize: 15,
	lineHeight: '40px',
	color: LIGHT_TEXT,
};

export const rightRow: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	justifyContent: 'flex-end',
	alignSelf: 'center',
	flex: 1,
};

export const input: React.CSSProperties = {
	minWidth: 250,
	textAlign: 'right',
};
