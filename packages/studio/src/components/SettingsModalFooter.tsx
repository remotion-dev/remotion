import React, {useMemo} from 'react';
import {BLUE, LIGHT_TEXT} from '../helpers/colors';
import {InspectorOpenInEditor} from './InspectorOpenInEditor';
import {ModalFooterContainer} from './ModalFooter';

const footer: React.CSSProperties = {
	flex: 'none',
};

const footerRow: React.CSSProperties = {
	alignItems: 'center',
	display: 'flex',
	justifyContent: 'space-between',
};

const configFileHint: React.CSSProperties = {
	alignItems: 'center',
	color: LIGHT_TEXT,
	display: 'flex',
	fontFamily: 'sans-serif',
	fontSize: 13,
	lineHeight: '20px',
	whiteSpace: 'nowrap',
};

const configFileName: React.CSSProperties = {
	color: BLUE,
	fontFamily: 'inherit',
	fontSize: 13,
	fontWeight: 'bold',
	lineHeight: '20px',
};

export const SettingsModalFooter: React.FC<{
	readonly children: React.ReactNode;
}> = ({children}) => {
	const folderLocation = useMemo(() => {
		return {
			source: window.remotion_cwd,
			line: 1,
			column: 1,
		};
	}, []);

	return (
		<ModalFooterContainer style={footer} noBorder>
			<div style={footerRow}>
				<div style={configFileHint}>
					Changes save to&nbsp;
					<strong style={configFileName}>remotion.config.ts</strong>
					<InspectorOpenInEditor location={folderLocation} />
				</div>
				{children}
			</div>
		</ModalFooterContainer>
	);
};
