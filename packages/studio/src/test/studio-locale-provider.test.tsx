import {expect, test} from 'bun:test';
import React from 'react';
import {renderToString} from 'react-dom/server';
import {
	StudioLocaleProvider,
	useStudioLocale,
} from '../localization/StudioLocaleProvider';

const TranslatedTitle: React.FC = () => {
	const {t} = useStudioLocale();
	return <span>{t('settings.title')}</span>;
};

test('provides translations to Studio UI descendants', () => {
	const japanese = renderToString(
		<StudioLocaleProvider initialLocale="ja">
			<TranslatedTitle />
		</StudioLocaleProvider>,
	);
	const english = renderToString(
		<StudioLocaleProvider initialLocale="en">
			<TranslatedTitle />
		</StudioLocaleProvider>,
	);

	expect(japanese).toContain('設定');
	expect(english).toContain('Settings');
});
