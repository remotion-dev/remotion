import {parse} from '@babel/parser';
import {
	configMethodLifecycles as sharedConfigMethodLifecycles,
	type ConfigFileChangeType,
} from '@remotion/studio-shared';
import type {Config} from './config';

type ConfigMethodName = {
	[Key in keyof typeof Config]: (typeof Config)[Key] extends (
		...args: never[]
	) => unknown
		? Key
		: never;
}[keyof typeof Config] &
	string;

const validateConfigMethodLifecycles = <
	T extends Record<ConfigMethodName, ConfigFileChangeType>,
>(
	lifecycles: T & Record<Exclude<keyof T, ConfigMethodName>, never>,
) => lifecycles;

// Keep this exhaustive so every new Config method must declare its Studio lifecycle.
const configMethodLifecycles = validateConfigMethodLifecycles(
	sharedConfigMethodLifecycles,
);

const getConfigMethodsWithLifecycle = (lifecycle: ConfigFileChangeType) => {
	return new Set(
		Object.entries(configMethodLifecycles)
			.filter(([, value]) => value === lifecycle)
			.map(([methodName]) => methodName),
	);
};

const runtimeConfigMethods = getConfigMethodsWithLifecycle('runtime');
const reloadConfigMethods = getConfigMethodsWithLifecycle('reload');

const ignoredAstProperties = new Set([
	'comments',
	'end',
	'errors',
	'extra',
	'loc',
	'start',
]);

const getStaticPropertyName = (node: unknown): string | null => {
	if (!node || typeof node !== 'object') {
		return null;
	}

	const candidate = node as {type?: string; name?: string; value?: unknown};
	if (candidate.type === 'Identifier') {
		return candidate.name ?? null;
	}

	if (candidate.type === 'StringLiteral') {
		return typeof candidate.value === 'string' ? candidate.value : null;
	}

	return null;
};

const getConfigMethodName = (node: unknown): string | null => {
	if (!node || typeof node !== 'object') {
		return null;
	}

	const callExpression = node as {
		type?: string;
		callee?: unknown;
	};
	if (
		callExpression.type !== 'CallExpression' ||
		!callExpression.callee ||
		typeof callExpression.callee !== 'object'
	) {
		return null;
	}

	const callee = callExpression.callee as {
		type?: string;
		object?: unknown;
		property?: unknown;
	};
	if (callee.type !== 'MemberExpression') {
		return null;
	}

	const methodName = getStaticPropertyName(callee.property);
	if (!methodName || !callee.object || typeof callee.object !== 'object') {
		return null;
	}

	const configObject = callee.object as {
		type?: string;
		property?: unknown;
		name?: string;
	};
	if (
		(configObject.type === 'Identifier' && configObject.name === 'Config') ||
		(configObject.type === 'MemberExpression' &&
			getStaticPropertyName(configObject.property) === 'Config')
	) {
		return methodName;
	}

	return null;
};

const isConfigRequire = (node: unknown) => {
	if (!node || typeof node !== 'object') {
		return false;
	}

	const declarator = node as {type?: string; init?: unknown};
	if (
		declarator.type !== 'VariableDeclarator' ||
		!declarator.init ||
		typeof declarator.init !== 'object'
	) {
		return false;
	}

	const init = declarator.init as {
		type?: string;
		callee?: unknown;
		arguments?: unknown[];
	};
	if (
		init.type !== 'CallExpression' ||
		!init.callee ||
		typeof init.callee !== 'object' ||
		(init.callee as {type?: string; name?: string}).type !== 'Identifier' ||
		(init.callee as {type?: string; name?: string}).name !== 'require' ||
		init.arguments?.length !== 1
	) {
		return false;
	}

	const source = init.arguments[0] as {type?: string; value?: unknown};
	return (
		source?.type === 'StringLiteral' && source.value === '@remotion/cli/config'
	);
};

const makeConfigFingerprint = ({
	code,
	ignoredConfigMethods,
}: {
	code: string;
	ignoredConfigMethods: Set<string>;
}) => {
	const ast = parse(code, {sourceType: 'unambiguous'});
	const omit = Symbol('omit');

	const normalize = (value: unknown): unknown => {
		if (Array.isArray(value)) {
			return value
				.map(normalize)
				.filter((normalizedValue) => normalizedValue !== omit);
		}

		if (!value || typeof value !== 'object') {
			return value;
		}

		const node = value as {
			type?: string;
			declarations?: unknown[];
			expression?: unknown;
		};
		const expressionConfigMethodName = getConfigMethodName(node.expression);
		if (
			node.type === 'ExpressionStatement' &&
			expressionConfigMethodName &&
			ignoredConfigMethods.has(expressionConfigMethodName)
		) {
			return omit;
		}

		if (
			node.type === 'VariableDeclaration' &&
			node.declarations?.length &&
			node.declarations.every(isConfigRequire)
		) {
			return omit;
		}

		const configMethodName = getConfigMethodName(value);
		if (configMethodName && ignoredConfigMethods.has(configMethodName)) {
			return {type: 'IgnoredConfigCall'};
		}

		return Object.fromEntries(
			Object.entries(value)
				.filter(([key]) => !ignoredAstProperties.has(key))
				.map(([key, child]) => [key, normalize(child)]),
		);
	};

	return JSON.stringify(normalize(ast));
};

export type ConfigFileFingerprints = {
	reload: string;
	restart: string;
};

export const makeConfigFileFingerprints = (
	code: string,
): ConfigFileFingerprints => {
	return {
		reload: makeConfigFingerprint({
			code,
			ignoredConfigMethods: runtimeConfigMethods,
		}),
		restart: makeConfigFingerprint({
			code,
			ignoredConfigMethods: new Set([
				...runtimeConfigMethods,
				...reloadConfigMethods,
			]),
		}),
	};
};

export const classifyConfigFileChange = ({
	currentCode,
	startupFingerprints,
}: {
	currentCode: string;
	startupFingerprints: ConfigFileFingerprints;
}): ConfigFileChangeType => {
	const currentFingerprints = makeConfigFileFingerprints(currentCode);
	if (currentFingerprints.restart !== startupFingerprints.restart) {
		return 'restart';
	}

	if (currentFingerprints.reload !== startupFingerprints.reload) {
		return 'reload';
	}

	return 'runtime';
};
