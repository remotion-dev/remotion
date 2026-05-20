import {expect, test} from 'bun:test';
import {
	CANNOT_SAVE_DEFAULT_PROPS_DOCS,
	getRenderModalWarnings,
} from '../components/RenderModal/get-render-modal-warnings';

test('Adds a Resolve link to the cannot save default props warning', () => {
	const warnings = getRenderModalWarnings({
		cliProps: {},
		canSaveDefaultProps: {
			canUpdate: false,
			determined: true,
			reason: 'Could not find or extract defaultProps for composition "Demo"',
		},
		isCustomDateUsed: false,
		customFileUsed: false,
		jsMapUsed: false,
		jsSetUsed: false,
		inJSONEditor: false,
		propsEditType: 'default-props',
	});

	expect(warnings).toStrictEqual([
		{
			id: 'cannot-save-default-props',
			message:
				'Can\'t save default props: Could not find or extract defaultProps for composition "Demo".',
			resolveLink: CANNOT_SAVE_DEFAULT_PROPS_DOCS,
		},
	]);
});

test('Does not add warnings before default props saveability is determined', () => {
	const warnings = getRenderModalWarnings({
		cliProps: {},
		canSaveDefaultProps: {
			canUpdate: false,
			determined: false,
			reason: 'Pending',
		},
		isCustomDateUsed: false,
		customFileUsed: false,
		jsMapUsed: false,
		jsSetUsed: false,
		inJSONEditor: false,
		propsEditType: 'default-props',
	});

	expect(warnings).toStrictEqual([]);
});
