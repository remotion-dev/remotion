export const COMPONENT_DRAG_MIME_TYPE =
	'application/vnd.remotion.component+json';

export type ComponentProp = {
	name: string;
	value: string | number | boolean;
};

export type ComponentDragData = {
	type: 'remotion-component';
	version: 1;
	component: {
		componentName: string;
		importName: string;
		importPath: string;
		props: ComponentProp[];
	};
};

const isRecord = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
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
	if (!isRecord(value)) {
		return false;
	}

	if (!isComponentPropName(value.name)) {
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

export const makeComponentDragData = ({
	componentName,
	importName,
	importPath,
	props,
}: {
	componentName: string;
	importName: string;
	importPath: string;
	props: ComponentProp[];
}): ComponentDragData => {
	return {
		type: 'remotion-component',
		version: 1,
		component: {
			componentName,
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
		if (!isRecord(parsed)) {
			return null;
		}

		if (parsed.type !== 'remotion-component' || parsed.version !== 1) {
			return null;
		}

		if (!isRecord(parsed.component)) {
			return null;
		}

		const {componentName, importName, importPath, props} = parsed.component;
		if (
			!isComponentIdentifier(componentName) ||
			!isComponentIdentifier(importName) ||
			!isComponentImportPath(importPath) ||
			!areComponentProps(props)
		) {
			return null;
		}

		return {
			type: 'remotion-component',
			version: 1,
			component: {
				componentName,
				importName,
				importPath,
				props,
			},
		};
	} catch {
		return null;
	}
};
