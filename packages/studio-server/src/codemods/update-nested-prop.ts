import type {AssignmentExpression, ExpressionStatement} from '@babel/types';
import {stringifyDefaultProps, type EnumPath} from '@remotion/studio-shared';
import type {namedTypes} from 'ast-types';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {parseAst} from './parse-ast';

const b = recast.types.builders;

export const parseValueExpression = (
	value: unknown,
	enumPaths: EnumPath[],
): ExpressionKind => {
	return (
		(
			parseAst(`a = ${stringifyDefaultProps({props: value, enumPaths})}`)
				.program.body[0] as unknown as ExpressionStatement
		).expression as AssignmentExpression
	).right as ExpressionKind;
};

const findJsxAttribute = (
	attributes: (namedTypes.JSXAttribute | namedTypes.JSXSpreadAttribute)[],
	name: string,
): {attrIndex: number; attr: namedTypes.JSXAttribute | undefined} => {
	const attrIndex = attributes.findIndex((a) => {
		if (a.type === 'JSXSpreadAttribute') {
			return false;
		}

		if (a.name.type === 'JSXNamespacedName') {
			return false;
		}

		return a.name.name === name;
	});

	const found = attrIndex !== -1 ? attributes[attrIndex] : undefined;

	return {
		attrIndex,
		attr:
			found && found.type === 'JSXAttribute'
				? (found as namedTypes.JSXAttribute)
				: undefined,
	};
};

const findObjectProperty = (
	objExpr: namedTypes.ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: namedTypes.ObjectProperty | undefined} => {
	const propIndex = objExpr.properties.findIndex(
		(p) =>
			p.type === 'ObjectProperty' &&
			(((p as namedTypes.ObjectProperty).key.type === 'Identifier' &&
				((p as namedTypes.ObjectProperty).key as namedTypes.Identifier).name ===
					propertyName) ||
				((p as namedTypes.ObjectProperty).key.type === 'StringLiteral' &&
					((p as namedTypes.ObjectProperty).key as namedTypes.StringLiteral)
						.value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex !== -1
				? (objExpr.properties[propIndex] as namedTypes.ObjectProperty)
				: undefined,
	};
};

const getObjectExpression = (
	attr: namedTypes.JSXAttribute,
): namedTypes.ObjectExpression | null => {
	const {value} = attr;
	if (!value || value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const container = value as namedTypes.JSXExpressionContainer;
	if (container.expression.type !== 'ObjectExpression') {
		return null;
	}

	return container.expression as namedTypes.ObjectExpression;
};

const getOldValueString = ({
	attr,
	childKey,
	defaultValue,
}: {
	attr: namedTypes.JSXAttribute | undefined;
	childKey: string;
	defaultValue: unknown | null;
}): string => {
	if (attr) {
		const objExpr = getObjectExpression(attr);
		if (objExpr) {
			const {prop} = findObjectProperty(objExpr, childKey);
			if (prop) {
				return recast.print(prop.value).code;
			}
		}
	}

	if (defaultValue !== null) {
		return JSON.stringify(defaultValue);
	}

	return '';
};

const removeNestedProp = ({
	attr,
	attrIndex,
	attributes,
	childKey,
}: {
	attr: namedTypes.JSXAttribute | undefined;
	attrIndex: number;
	attributes: (namedTypes.JSXAttribute | namedTypes.JSXSpreadAttribute)[];
	childKey: string;
}) => {
	if (!attr) {
		return;
	}

	const objExpr = getObjectExpression(attr);
	if (!objExpr) {
		return;
	}

	const {propIndex} = findObjectProperty(objExpr, childKey);
	if (propIndex !== -1) {
		objExpr.properties.splice(propIndex, 1);
	}

	if (objExpr.properties.length === 0 && attrIndex !== -1) {
		attributes.splice(attrIndex, 1);
	}
};

const setNestedProp = ({
	attr,
	attributes,
	parentKey,
	childKey,
	value,
	enumPaths,
}: {
	attr: namedTypes.JSXAttribute | undefined;
	attributes: (namedTypes.JSXAttribute | namedTypes.JSXSpreadAttribute)[];
	parentKey: string;
	childKey: string;
	value: unknown;
	enumPaths: EnumPath[];
}) => {
	const parsedValue = parseValueExpression(value, enumPaths);

	if (attr) {
		const objExpr = getObjectExpression(attr);
		if (objExpr) {
			const {prop} = findObjectProperty(objExpr, childKey);
			if (prop) {
				prop.value = parsedValue;
			} else {
				objExpr.properties.push(
					b.objectProperty(b.identifier(childKey), parsedValue),
				);
			}
		}
	} else {
		const objExpr = b.objectExpression([
			b.objectProperty(b.identifier(childKey), parsedValue),
		]);
		const newAttr = b.jsxAttribute(
			b.jsxIdentifier(parentKey),
			b.jsxExpressionContainer(objExpr),
		);

		attributes.push(newAttr);
	}
};

export const updateNestedProp = ({
	node,
	parentKey,
	childKey,
	value,
	enumPaths,
	defaultValue,
	isDefault,
}: {
	node: namedTypes.JSXOpeningElement;
	parentKey: string;
	childKey: string;
	value: unknown;
	enumPaths: EnumPath[];
	defaultValue: unknown | null;
	isDefault: boolean;
}): string => {
	if (!node.attributes) {
		node.attributes = [];
	}

	const {attributes} = node;
	const {attrIndex, attr} = findJsxAttribute(attributes, parentKey);

	const oldValueString = getOldValueString({attr, childKey, defaultValue});

	if (isDefault) {
		removeNestedProp({attr, attrIndex, attributes, childKey});
	} else {
		setNestedProp({attr, attributes, parentKey, childKey, value, enumPaths});
	}

	return oldValueString;
};
