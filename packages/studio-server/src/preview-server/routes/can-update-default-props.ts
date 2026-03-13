import {readFileSync} from 'node:fs';
import type {Expression} from '@babel/types';
import type {CanUpdateDefaultPropsResponse} from '@remotion/studio-shared';
import * as recast from 'recast';
import {parseAst} from '../../codemods/parse-ast';
import {getProjectInfo} from '../project-info';
import {extractStaticValue, isStaticValue} from './can-update-sequence-props';

export const checkIfTypeScriptFile = (file: string) => {
	if (
		!file.endsWith('.tsx') &&
		!file.endsWith('.ts') &&
		!file.endsWith('.mtsx') &&
		!file.endsWith('.mts')
	) {
		throw new Error('Cannot update Root file if not using TypeScript');
	}
};

const extractDefaultPropsFromSource = (
	input: string,
	compositionId: string,
): Record<string, unknown> | null => {
	const ast = parseAst(input);
	let result: Record<string, unknown> | null = null;

	recast.types.visit(ast, {
		visitJSXElement(path) {
			const {openingElement} = path.node;
			const openingName = openingElement.name;
			if (
				openingName.type !== 'JSXIdentifier' &&
				openingName.type !== 'JSXNamespacedName'
			) {
				this.traverse(path);
				return;
			}

			if (openingName.name !== 'Composition' && openingName.name !== 'Still') {
				this.traverse(path);
				return;
			}

			if (
				!openingElement.attributes?.some((attr) => {
					if (attr.type === 'JSXSpreadAttribute') {
						return;
					}

					if (!attr.value) {
						return;
					}

					if (attr.value.type === 'JSXElement') {
						return;
					}

					if (attr.value.type === 'JSXExpressionContainer') {
						return;
					}

					if (attr.value.type === 'JSXFragment') {
						return;
					}

					return attr.name.name === 'id' && attr.value.value === compositionId;
				})
			) {
				this.traverse(path);
				return;
			}

			const defaultPropsAttr = openingElement.attributes.find((attr) => {
				if (attr.type === 'JSXSpreadAttribute') {
					return;
				}

				return attr.name.name === 'defaultProps';
			});

			if (!defaultPropsAttr || defaultPropsAttr.type === 'JSXSpreadAttribute') {
				this.traverse(path);
				return;
			}

			if (
				!defaultPropsAttr.value ||
				defaultPropsAttr.value.type !== 'JSXExpressionContainer'
			) {
				this.traverse(path);
				return;
			}

			const {expression} = defaultPropsAttr.value;
			if (expression.type === 'JSXEmptyExpression') {
				this.traverse(path);
				return;
			}

			if (isStaticValue(expression as unknown as Expression)) {
				const value = extractStaticValue(expression as unknown as Expression);
				if (
					value !== null &&
					typeof value === 'object' &&
					!Array.isArray(value)
				) {
					result = value as Record<string, unknown>;
				}
			}

			this.traverse(path);
		},
	});

	return result;
};

export const computeCanUpdateDefaultProps = async ({
	compositionId,
	remotionRoot,
	entryPoint,
}: {
	compositionId: string;
	remotionRoot: string;
	entryPoint: string;
}): Promise<{
	result: CanUpdateDefaultPropsResponse;
	rootFile: string | null;
}> => {
	try {
		const projectInfo = await getProjectInfo(remotionRoot, entryPoint);
		if (!projectInfo.rootFile) {
			throw new Error('Cannot find root file in project');
		}

		checkIfTypeScriptFile(projectInfo.rootFile);

		const input = readFileSync(projectInfo.rootFile, 'utf-8');
		const currentDefaultProps = extractDefaultPropsFromSource(
			input,
			compositionId,
		);

		if (currentDefaultProps === null) {
			throw new Error(
				`Could not find or extract defaultProps for composition "${compositionId}"`,
			);
		}

		return {
			result: {
				canUpdate: true,
				currentDefaultProps,
			},
			rootFile: projectInfo.rootFile,
		};
	} catch (err) {
		return {
			result: {
				canUpdate: false,
				reason: (err as Error).message,
			},
			rootFile: null,
		};
	}
};
