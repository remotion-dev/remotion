import React, {useCallback, useMemo} from 'react';
import {BLUE, CURRENT_COLOR, LIGHT_TEXT} from '../helpers/colors';
import {InspectorOpenInEditor} from './InspectorOpenInEditor';
import {InspectorQuickAction} from './InspectorPanel/common';
import {Spacing} from './layout';
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

const externalLinkIndicator: React.CSSProperties = {
	display: 'inline-block',
	height: 12,
	marginLeft: 4,
	verticalAlign: -2,
	width: 12,
};

export const SettingsModalFooter: React.FC<{
	readonly showLicenseFaq: boolean;
}> = ({showLicenseFaq}) => {
	const configFileLocation = useMemo(() => {
		return {
			source: 'remotion.config.ts',
			line: 1,
			column: 1,
		};
	}, []);
	const openLicenseFaq = useCallback(() => {
		window.open(
			'https://www.remotion.dev/docs/license/faq',
			'_blank',
			'noopener,noreferrer',
		);
	}, []);

	return (
		<ModalFooterContainer style={footer}>
			<div style={footerRow}>
				<div style={configFileHint}>
					Changes save to
					<Spacing x={0.5} />
					<InspectorOpenInEditor
						locationType={null}
						location={configFileLocation}
						label={<strong style={configFileName}>remotion.config.ts</strong>}
					/>
				</div>
				{showLicenseFaq ? (
					<InspectorQuickAction
						disabled={false}
						onClick={openLicenseFaq}
						style={{flex: 'none', width: 'fit-content'}}
						title="Open the Remotion License FAQ in a new tab"
					>
						License FAQ
						<svg
							aria-hidden="true"
							viewBox="0 0 16 16"
							style={externalLinkIndicator}
						>
							<path
								d="M4 12 12 4M6 4h6v6"
								fill="none"
								stroke={CURRENT_COLOR}
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="1.5"
							/>
						</svg>
					</InspectorQuickAction>
				) : null}
			</div>
		</ModalFooterContainer>
	);
};
