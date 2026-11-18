import {
	identifier,
	objectProperty,
	stringLiteral,
	type ObjectExpression,
} from '@babel/types';
import * as recast from 'recast';
import {parseAst} from './parse-ast';

export const updateElementLibrary = ({
	configContents,
	previousUrl,
	url,
	displayName,
	existingUrls,
}: {
	configContents: string;
	previousUrl: string;
	url: string;
	displayName: string | null;
	existingUrls: readonly string[];
}): string => {
	const previous = new URL(previousUrl).href;
	const next = new URL(url).href;
	const ast = parseAst(configContents);
	let target: ObjectExpression | null = null;
	const urls = new Set(existingUrls.map((existing) => new URL(existing).href));
	for (const statement of ast.program.body) {
		if (
			statement.type !== 'ExpressionStatement' ||
			statement.expression.type !== 'CallExpression'
		)
			continue;
		const call = statement.expression;
		if (
			call.callee.type !== 'MemberExpression' ||
			call.callee.computed ||
			call.callee.object.type !== 'Identifier' ||
			call.callee.object.name !== 'Config' ||
			call.callee.property.type !== 'Identifier' ||
			call.callee.property.name !== 'addElementLibrary'
		)
			continue;
		const argument = call.arguments[0];
		if (argument?.type !== 'ObjectExpression') continue;
		const urlProperty = argument.properties.find(
			(property) =>
				property.type === 'ObjectProperty' &&
				!property.computed &&
				((property.key.type === 'Identifier' && property.key.name === 'url') ||
					(property.key.type === 'StringLiteral' &&
						property.key.value === 'url')),
		);
		if (
			urlProperty?.type !== 'ObjectProperty' ||
			urlProperty.value.type !== 'StringLiteral'
		)
			continue;
		const currentUrl = new URL(urlProperty.value.value).href;
		urls.add(currentUrl);
		if (currentUrl !== previous) continue;
		if (
			target !== null ||
			argument.properties.some(
				(property) => property.type !== 'ObjectProperty' || property.computed,
			)
		) {
			throw new Error(
				'The Element Library must be a single top-level config call without spread or computed properties.',
			);
		}

		target = argument;
	}

	if (target === null)
		throw new Error(
			'Could not find a matching literal Element Library URL in the config file.',
		);
	if (next !== previous && urls.has(next))
		throw new Error('This Element Library is already added.');
	let hasName = false;
	target.properties = target.properties.filter((property) => {
		if (property.type !== 'ObjectProperty') return true;
		const key =
			property.key.type === 'Identifier'
				? property.key.name
				: property.key.type === 'StringLiteral'
					? property.key.value
					: null;
		if (key === 'url') property.value = stringLiteral(next);
		if (key !== 'displayName') return true;
		hasName = true;
		if (displayName === null) return false;
		property.shorthand = false;
		property.value = stringLiteral(displayName.trim());
		return true;
	});
	if (!hasName && displayName !== null)
		target.properties.push(
			objectProperty(
				identifier('displayName'),
				stringLiteral(displayName.trim()),
			),
		);
	return recast.print(ast, {lineTerminator: '\n'}).code;
};
