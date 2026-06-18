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
		showCannotSaveDefaultPropsWarning: true,
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

test('Does not add the cannot save default props warning if the editor does not apply', () => {
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
		showCannotSaveDefaultPropsWarning: false,
	});

	expect(warnings).toStrictEqual([]);
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
		showCannotSaveDefaultPropsWarning: true,
	});

	expect(warnings).toStrictEqual([]);
});

test('Keeps other warnings as stable entries without Resolve links', () => {
	const warnings = getRenderModalWarnings({
		cliProps: {title: 'Hello'},
		canSaveDefaultProps: {
			canUpdate: true,
		},
		isCustomDateUsed: true,
		customFileUsed: true,
		jsMapUsed: true,
		jsSetUsed: true,
		inJSONEditor: true,
		propsEditType: 'default-props',
		showCannotSaveDefaultPropsWarning: true,
	});

	expect(warnings).toStrictEqual([
		{
			id: 'input-props-override',
			message:
				'The data that was passed using --props takes priority over the data you enter here.',
		},
		{
			id: 'custom-date-used',
			message:
				'There is a Date in the schema which was serialized. Note the custom syntax.',
		},
		{
			id: 'static-file-used',
			message:
				'There is a staticFile() in the schema which was serialized. Note the custom syntax.',
		},
		{
			id: 'map-used',
			message:
				'A `Map` was used in the schema which can not be serialized to JSON.',
		},
		{
			id: 'set-used',
			message:
				'A `Set` was used in the schema which can not be serialized to JSON.',
		},
	]);
});
