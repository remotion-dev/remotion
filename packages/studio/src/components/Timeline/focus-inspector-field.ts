import type {SequencePropsSubscriptionKey} from 'remotion';

const serializeRegistryKey = ({
	fieldKey,
	nodePath,
}: {
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	return JSON.stringify({fieldKey, nodePath});
};

const registeredFields = new Map<string, HTMLTextAreaElement>();

export const registerFocusInspectorFieldElement = ({
	element,
	fieldKey,
	nodePath,
}: {
	readonly element: HTMLTextAreaElement | null;
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey | null;
}) => {
	if (nodePath === null) {
		return;
	}

	const key = serializeRegistryKey({fieldKey, nodePath});

	if (element === null) {
		registeredFields.delete(key);
		return;
	}

	registeredFields.set(key, element);
};

export const requestFocusInspectorField = ({
	fieldKey,
	nodePath,
}: {
	readonly fieldKey: string;
	readonly nodePath: SequencePropsSubscriptionKey;
}) => {
	const element = registeredFields.get(
		serializeRegistryKey({fieldKey, nodePath}),
	);

	requestAnimationFrame(() => {
		element?.scrollIntoView({block: 'center'});
		element?.focus();
		element?.select();
	});
};
