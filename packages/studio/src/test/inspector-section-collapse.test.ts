import {expect, test} from 'bun:test';
import type {InteractivitySchema} from 'remotion';
import {
	getInspectorSectionActivity,
	isInspectorSectionEffectivelyInactive,
} from '../components/InspectorPanel/inspector-section-collapse';

const staticStatuses = (values: Record<string, unknown>) => {
	return Object.fromEntries(
		Object.entries(values).map(([key, codeValue]) => [
			key,
			{status: 'static' as const, codeValue},
		]),
	);
};

test('only treats confidently inactive static background values as inactive', () => {
	expect(
		getInspectorSectionActivity({
			group: 'background',
			propStatuses: undefined,
		}),
	).toBe('unknown');
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'background',
			propStatuses: staticStatuses({
				'style.backgroundColor': 'rgba(12, 34, 56, 0)',
			}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'background',
			propStatuses: staticStatuses({'style.backgroundColor': '#ff0000'}),
		}),
	).toBe(false);
	expect(
		getInspectorSectionActivity({
			group: 'background',
			propStatuses: {'style.backgroundColor': {status: 'computed'}},
		}),
	).toBe('active');
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'background',
			propStatuses: {'style.backgroundColor': {status: 'keyframed'}},
		}),
	).toBe(false);
});

test('treats only static zero border radius and crop values as inactive', () => {
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: staticStatuses({'style.borderRadius': 0}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: staticStatuses({
				'style.borderRadius': undefined,
				'style.borderTopLeftRadius': 0,
				'style.borderTopRightRadius': 0,
				'style.borderBottomRightRadius': 0,
				'style.borderBottomLeftRadius': 0,
			}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: staticStatuses({'style.borderRadius': 12}),
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: staticStatuses({
				'style.borderRadius': undefined,
				'style.borderTopLeftRadius': 0,
				'style.borderTopRightRadius': 16,
				'style.borderBottomRightRadius': 0,
				'style.borderBottomLeftRadius': 0,
			}),
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: {'style.borderRadius': {status: 'keyframed'}},
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border-radius',
			propStatuses: {
				'style.borderRadius': {status: 'computed'},
				...staticStatuses({
					'style.borderTopLeftRadius': 0,
					'style.borderTopRightRadius': 0,
					'style.borderBottomRightRadius': 0,
					'style.borderBottomLeftRadius': 0,
				}),
			},
		}),
	).toBe(false);

	const emptyCrop = staticStatuses({
		cropLeft: 0,
		cropRight: undefined,
		cropTop: 0,
		cropBottom: 0,
	});
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'crop',
			propStatuses: emptyCrop,
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'crop',
			propStatuses: {...emptyCrop, cropLeft: {status: 'computed'}},
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'crop',
			propStatuses: staticStatuses({cropLeft: 0}),
		}),
	).toBe(false);
});

test('treats a static border as inactive only when it cannot be seen', () => {
	const border = (values: {
		readonly width: unknown;
		readonly style: unknown;
		readonly color: unknown;
	}) =>
		staticStatuses({
			'style.borderWidth': values.width,
			'style.borderStyle': values.style,
			'style.borderColor': values.color,
		});

	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({
				width: undefined,
				style: undefined,
				color: undefined,
			}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({width: 4, style: 'none', color: 'red'}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({width: 0, style: 'solid', color: 'red'}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({width: 4, style: 'solid', color: 'transparent'}),
		}),
	).toBe(true);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({width: 4, style: 'solid', color: undefined}),
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: border({width: undefined, style: 'solid', color: 'red'}),
		}),
	).toBe(false);
	expect(
		isInspectorSectionEffectivelyInactive({
			group: 'border',
			propStatuses: {
				...border({width: 4, style: 'solid', color: 'red'}),
				'style.borderWidth': {status: 'computed'},
			},
		}),
	).toBe(false);
});

test('uses the component schema defaults to determine layout activity', () => {
	const schema = ({
		layout,
		premountFor,
	}: {
		readonly layout: string;
		readonly premountFor: number;
	}): InteractivitySchema => ({
		layout: {
			type: 'enum',
			default: layout,
			variants: {
				'absolute-fill': {
					premountFor: {
						type: 'number',
						default: premountFor,
						hiddenFromList: false,
					},
				},
				none: {},
			},
		},
	});

	for (const defaults of [
		{layout: 'absolute-fill', premountFor: 0},
		{layout: 'none', premountFor: 30},
	]) {
		const componentSchema = schema(defaults);
		const defaultStatuses = staticStatuses({
			layout: undefined,
			premountFor: undefined,
		});

		expect(
			getInspectorSectionActivity({
				group: 'layout',
				propStatuses: defaultStatuses,
				schema: componentSchema,
			}),
		).toBe('inactive');
		expect(
			getInspectorSectionActivity({
				group: 'layout',
				propStatuses: staticStatuses(defaults),
				schema: componentSchema,
			}),
		).toBe('inactive');
		expect(
			getInspectorSectionActivity({
				group: 'layout',
				propStatuses: {
					...defaultStatuses,
					layout: {
						status: 'static',
						codeValue: defaults.layout === 'none' ? 'absolute-fill' : 'none',
					},
				},
				schema: componentSchema,
			}),
		).toBe('active');
		expect(
			getInspectorSectionActivity({
				group: 'layout',
				propStatuses: {
					...defaultStatuses,
					premountFor: {
						status: 'static',
						codeValue: defaults.premountFor + 1,
					},
				},
				schema: componentSchema,
			}),
		).toBe('active');
	}

	const premountOnlySchema = {
		premountFor: {
			type: 'number',
			default: 0,
			hiddenFromList: false,
		},
	} as const satisfies InteractivitySchema;
	expect(
		getInspectorSectionActivity({
			group: 'layout',
			propStatuses: staticStatuses({premountFor: undefined}),
			schema: premountOnlySchema,
		}),
	).toBe('inactive');
	expect(
		getInspectorSectionActivity({
			group: 'layout',
			propStatuses: staticStatuses({premountFor: 1}),
			schema: premountOnlySchema,
		}),
	).toBe('active');
});
