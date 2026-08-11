import {isRecord} from './validation';

export type ComponentProp = {
	name: string;
	value: string | number | boolean;
};

export type ComponentDimensions = {
	height: number;
	width: number;
};

export type ComponentDragData = {
	type: 'remotion-component';
	version: 1;
	component: {
		componentName: string;
		dimensions?: ComponentDimensions;
		importName: string;
		importPath: string;
		props: ComponentProp[];
	};
};

export const isComponentIdentifier = (value: unknown): value is string => {
	return typeof value === 'string' && /^[A-Z_$][A-Za-z0-9_$]*$/.test(value);
};

export const isComponentImportPath = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value.length > 0 &&
		value.length < 200 &&
		!value.includes('\\') &&
		!value.includes('\0') &&
		!value.startsWith('/') &&
		/^[A-Za-z0-9@._/-]+$/.test(value)
	);
};

export const isComponentPropName = (value: unknown): value is string => {
	return (
		typeof value === 'string' &&
		value !== 'style' &&
		/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value)
	);
};

export const isComponentProp = (value: unknown): value is ComponentProp => {
	if (!isRecord(value) || !isComponentPropName(value.name)) {
		return false;
	}

	return (
		typeof value.value === 'string' ||
		typeof value.value === 'boolean' ||
		(typeof value.value === 'number' && Number.isFinite(value.value))
	);
};

export const areComponentProps = (value: unknown): value is ComponentProp[] => {
	if (!Array.isArray(value)) {
		return false;
	}

	const seen = new Set<string>();
	for (const prop of value) {
		if (!isComponentProp(prop) || seen.has(prop.name)) {
			return false;
		}

		seen.add(prop.name);
	}

	return true;
};

const isComponentDimensions = (
	value: unknown,
): value is ComponentDimensions => {
	if (!isRecord(value)) {
		return false;
	}

	return (
		typeof value.width === 'number' &&
		Number.isFinite(value.width) &&
		value.width >= 0 &&
		typeof value.height === 'number' &&
		Number.isFinite(value.height) &&
		value.height >= 0
	);
};

export const makeComponentDragData = ({
	componentName,
	dimensions,
	importName,
	importPath,
	props,
}: {
	componentName: string;
	dimensions?: ComponentDimensions | null;
	importName: string;
	importPath: string;
	props: ComponentProp[];
}): ComponentDragData => {
	return {
		type: 'remotion-component',
		version: 1,
		component: {
			componentName,
			...(dimensions ? {dimensions} : {}),
			importName,
			importPath,
			props,
		},
	};
};

export const parseComponentDragData = (
	value: string,
): ComponentDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-component' ||
			parsed.version !== 1 ||
			!isRecord(parsed.component)
		) {
			return null;
		}

		const {componentName, dimensions, importName, importPath, props} =
			parsed.component;
		if (
			!isComponentIdentifier(componentName) ||
			!isComponentIdentifier(importName) ||
			!isComponentImportPath(importPath) ||
			!areComponentProps(props) ||
			(typeof dimensions !== 'undefined' && !isComponentDimensions(dimensions))
		) {
			return null;
		}

		return makeComponentDragData({
			componentName,
			dimensions: dimensions ?? null,
			importName,
			importPath,
			props,
		});
	} catch {
		return null;
	}
};
