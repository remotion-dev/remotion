import type {JSXElement, ObjectProperty} from '@babel/types';
import * as recast from 'recast';
import {recastLocToOffset} from './recast-loc-to-offset';

const positionKeys = new Set([
	'position',
	'left',
	'top',
	'right',
	'bottom',
	'inset',
	'insetBlock',
	'insetBlockStart',
	'insetBlockEnd',
	'insetInline',
	'insetInlineStart',
	'insetInlineEnd',
]);

// Keep paint and transform styles inside the capture. Move the outer box's
// placement only when the inline object makes its effective properties explicit.
export const moveCanvasPosition = (input: string, element: JSXElement) => {
	const {attributes} = element.openingElement;
	const style = attributes.findLast(
		(attr) => attr.type === 'JSXSpreadAttribute' || attr.name.name === 'style',
	);
	if (
		style?.type !== 'JSXAttribute' ||
		!style.loc ||
		style.value?.type !== 'JSXExpressionContainer' ||
		style.value.expression.type !== 'ObjectExpression'
	) {
		return null;
	}

	const object = style.value.expression;
	const moved = new Set<ObjectProperty>();
	let hasPosition = false;
	for (const prop of object.properties) {
		if (
			prop.type !== 'ObjectProperty' ||
			prop.computed ||
			(prop.key.type !== 'Identifier' && prop.key.type !== 'StringLiteral')
		) {
			return null;
		}

		const key = prop.key.type === 'Identifier' ? prop.key.name : prop.key.value;
		if (positionKeys.has(key)) {
			moved.add(prop);
			hasPosition ||= key === 'position';
		}
	}

	const {name} = element.openingElement;
	if (
		moved.size === 0 ||
		(!hasPosition && name.type === 'JSXIdentifier' && /^[a-z]/.test(name.name))
	) {
		return null;
	}

	const b = recast.types.builders;
	const wrapperProperties = [...moved] as Parameters<
		typeof b.objectExpression
	>[0];
	if (!hasPosition) {
		wrapperProperties.unshift(
			b.objectProperty(b.identifier('position'), b.stringLiteral('absolute')),
		);
	}

	const wrapperStyle = b.jsxAttribute(
		b.jsxIdentifier('style'),
		b.jsxExpressionContainer(b.objectExpression(wrapperProperties)),
	);
	const omissions: {start: number; end: number}[] = [];
	const properties = object.properties as ObjectProperty[];
	if (
		moved.size === properties.length &&
		!attributes
			.slice(0, attributes.indexOf(style))
			.some(
				(attr) =>
					attr.type === 'JSXSpreadAttribute' || attr.name.name === 'style',
			)
	) {
		let start = recastLocToOffset(input, style.loc.start);
		while (/\s/.test(input[start - 1])) start--;
		omissions.push({start, end: recastLocToOffset(input, style.loc.end)});
		attributes.splice(attributes.indexOf(style), 1);
	} else {
		// Delete consecutive positioning props with one adjacent comma. Keep the
		// exact source of remaining values, including multiline string literals.
		for (let i = 0; i < properties.length; i++) {
			if (!moved.has(properties[i])) continue;
			const first = i;
			while (i + 1 < properties.length && moved.has(properties[i + 1])) i++;
			const next = properties[i + 1];
			const previous = properties[first - 1];
			const firstStart = recastLocToOffset(input, properties[first].loc!.start);
			const lastEnd = recastLocToOffset(input, properties[i].loc!.end);
			if (!previous && !next) {
				// Keep an explicit empty object so an earlier spread cannot supply style.
				omissions.push({
					start: recastLocToOffset(input, object.loc!.start) + 1,
					end: recastLocToOffset(input, object.loc!.end) - 1,
				});
				continue;
			}

			const gapStart = next
				? lastEnd
				: recastLocToOffset(input, previous.loc!.end);
			const gapEnd = next
				? recastLocToOffset(input, next.loc!.start)
				: firstStart;
			const gap = input.slice(gapStart, gapEnd);
			if (gap.includes('/')) {
				// Preserve comments between properties while removing their separator.
				const comma = [
					...gap.matchAll(/\/\*[\s\S]*?\*\/|\/\/[^\r\n]*|(,)/g),
				].find((match) => match[1]);
				if (!comma) return null;
				const separator = {
					start: gapStart + comma.index,
					end: gapStart + comma.index + 1,
				};
				const props = {start: firstStart, end: lastEnd};
				omissions.push(...(next ? [props, separator] : [separator, props]));
			} else {
				omissions.push({
					start: next ? firstStart : gapStart,
					end: next ? gapEnd : lastEnd,
				});
			}
		}

		object.properties = properties.filter((prop) => !moved.has(prop));
	}

	return {wrapperStyle, omissions};
};
