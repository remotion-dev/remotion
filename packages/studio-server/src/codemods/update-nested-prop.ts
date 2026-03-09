import type {
	ArrayExpression,
	AssignmentExpression,
	ExpressionStatement,
	Identifier,
	JSXAttribute,
	JSXExpressionContainer,
	JSXOpeningElement,
	JSXSpreadAttribute,
	ObjectExpression,
	ObjectProperty,
	StringLiteral,
} from '@babel/types';
import {stringifyDefaultProps} from '@remotion/studio-shared';
import type {ExpressionKind} from 'ast-types/lib/gen/kinds';
import * as recast from 'recast';
import {parseAst} from './parse-ast';

const b = recast.types.builders;

export const parseValueExpression = (value: unknown): ExpressionKind => {
	return (
		(
			parseAst(`a = ${stringifyDefaultProps({props: value, enumPaths: []})}`)
				.program.body[0] as unknown as ExpressionStatement
		).expression as AssignmentExpression
	).right as ExpressionKind;
};

const findJsxAttribute = (
	attributes: (JSXAttribute | JSXSpreadAttribute)[],
	name: string,
): {attrIndex: number; attr: JSXAttribute | undefined} => {
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
				? (found as JSXAttribute)
				: undefined,
	};
};

const findObjectProperty = (
	objExpr: ObjectExpression,
	propertyName: string,
): {propIndex: number; prop: ObjectProperty | undefined} => {
	const propIndex = objExpr.properties.findIndex(
		(p) =>
			p.type === 'ObjectProperty' &&
			(((p as ObjectProperty).key.type === 'Identifier' &&
				((p as ObjectProperty).key as Identifier).name === propertyName) ||
				((p as ObjectProperty).key.type === 'StringLiteral' &&
					((p as ObjectProperty).key as StringLiteral).value === propertyName)),
	);

	return {
		propIndex,
		prop:
			propIndex !== -1
				? (objExpr.properties[propIndex] as ObjectProperty)
				: undefined,
	};
};

const getObjectExpression = (attr: JSXAttribute): ObjectExpression | null => {
	const {value} = attr;
	if (!value || value.type !== 'JSXExpressionContainer') {
		return null;
	}

	const container = value as JSXExpressionContainer;
	if (container.expression.type !== 'ObjectExpression') {
		return null;
	}

	return container.expression as ObjectExpression;
};

const getOldValueString = ({
	attr,
	childKey,
	defaultValue,
}: {
	attr: JSXAttribute | undefined;
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
	attr: JSXAttribute | undefined;
	attrIndex: number;
	attributes: (JSXAttribute | JSXSpreadAttribute)[];
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
}: {
	attr: JSXAttribute | undefined;
	attributes: (JSXAttribute | JSXSpreadAttribute)[];
	parentKey: string;
	childKey: string;
	value: unknown;
}) => {
	const parsedValue = parseValueExpression(value);

	if (attr) {
		const objExpr = getObjectExpression(attr);
		if (objExpr) {
			const {prop} = findObjectProperty(objExpr, childKey);
			if (prop) {
				prop.value = parsedValue as ObjectExpression | ArrayExpression;
			} else {
				objExpr.properties.push(
					b.objectProperty(
						b.identifier(childKey),
						parsedValue,
					) as ObjectProperty,
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

		attributes.push(newAttr as JSXAttribute | JSXSpreadAttribute);
	}
};

export const updateNestedProp = ({
	node,
	parentKey,
	childKey,
	value,
	defaultValue,
	isDefault,
}: {
	node: JSXOpeningElement;
	parentKey: string;
	childKey: string;
	value: unknown;
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
		setNestedProp({attr, attributes, parentKey, childKey, value});
	}

	return oldValueString;
};
