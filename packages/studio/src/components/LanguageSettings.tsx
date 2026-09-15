import React from 'react';
import {LIGHT_TEXT} from '../helpers/colors';
import {SUPPORTED_LOCALES, type Locale} from '../localization/messages';
import {useStudioLocale} from '../localization/StudioLocaleProvider';
import {label, optionRow, rightRow} from './RenderModal/layout';
import {SegmentedControl, type SegmentedControlItem} from './SegmentedControl';

const description: React.CSSProperties = {
	color: LIGHT_TEXT,
	fontSize: 12,
	lineHeight: 1.4,
	marginTop: 4,
	maxWidth: 320,
};

export const LanguageSettings: React.FC = () => {
	const {locale, setLocale, t} = useStudioLocale();
	const items: SegmentedControlItem[] = SUPPORTED_LOCALES.map(
		(candidate: Locale) => ({
			key: candidate,
			label:
				candidate === 'ja'
					? t('settings.language.japanese')
					: t('settings.language.english'),
			onClick: () => setLocale(candidate),
			selected: locale === candidate,
		}),
	);

	return (
		<div
			style={{alignSelf: 'flex-start', display: 'flex', flex: 1, minWidth: 0}}
		>
			<div style={optionRow}>
				<div style={label}>
					<div>
						<div>{t('settings.language')}</div>
						<div style={description}>{t('settings.language.description')}</div>
					</div>
				</div>
				<div style={rightRow}>
					<SegmentedControl items={items} needsWrapping={false} size="medium" />
				</div>
			</div>
		</div>
	);
};
