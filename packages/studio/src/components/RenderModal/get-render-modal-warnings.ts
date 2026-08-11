import {NoReactInternals} from 'remotion/no-react';
import type {PropsEditType} from './DataEditor';

export const CANNOT_SAVE_DEFAULT_PROPS_DOCS =
	'https://www.remotion.dev/docs/troubleshooting/cannot-save-default-props';

export type RenderModalWarning = {
	readonly id: string;
	readonly message: string;
	readonly resolveLink?: string;
};

export type TypeCanSaveState =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
			determined: boolean;
	  };

const warningOrNull = (
	id: string,
	message: string | null,
): RenderModalWarning | null => {
	if (message === null) {
		return null;
	}

	return {
		id,
		message,
	};
};

const getInputPropsWarning = ({
	cliProps,
	propsEditType,
}: {
	cliProps: unknown;
	propsEditType: PropsEditType;
}) => {
	if (
		Object.keys(cliProps as object).length > 0 &&
		propsEditType === 'default-props'
	) {
		return 'The data that was passed using --props takes priority over the data you enter here.';
	}

	return null;
};

const getCannotSaveDefaultProps = (
	canSaveDefaultProps: TypeCanSaveState | null,
	showCannotSaveDefaultPropsWarning: boolean,
): RenderModalWarning | null => {
	if (!showCannotSaveDefaultPropsWarning) {
		return null;
	}

	if (canSaveDefaultProps === null) {
		return null;
	}

	if (canSaveDefaultProps.canUpdate) {
		return null;
	}

	if (!canSaveDefaultProps.determined) {
		return null;
	}

	return {
		id: 'cannot-save-default-props',
		message: `Can't save default props: ${canSaveDefaultProps.reason}.`,
		resolveLink: CANNOT_SAVE_DEFAULT_PROPS_DOCS,
	};
};

const customDateUsed = (used: boolean | undefined, inJSONEditor: boolean) => {
	if (used && inJSONEditor) {
		return 'There is a Date in the schema which was serialized. Note the custom syntax.';
	}

	return null;
};

const staticFileUsed = (used: boolean | undefined, inJSONEditor: boolean) => {
	if (used && inJSONEditor) {
		return 'There is a staticFile() in the schema which was serialized. Note the custom syntax.';
	}

	return null;
};

const mapUsed = (used: boolean | undefined, inJSONEditor: boolean) => {
	if (used && inJSONEditor) {
		return 'A `Map` was used in the schema which can not be serialized to JSON.';
	}

	return null;
};

const setUsed = (used: boolean | undefined, inJSONEditor: boolean) => {
	if (used && inJSONEditor) {
		return 'A `Set` was used in the schema which can not be serialized to JSON.';
	}

	return null;
};

export const getRenderModalWarnings = ({
	cliProps,
	canSaveDefaultProps,
	isCustomDateUsed,
	customFileUsed,
	jsMapUsed,
	jsSetUsed,
	inJSONEditor,
	propsEditType,
	showCannotSaveDefaultPropsWarning,
}: {
	cliProps: unknown;
	canSaveDefaultProps: TypeCanSaveState | null;
	isCustomDateUsed: boolean;
	customFileUsed: boolean;
	jsMapUsed: boolean;
	jsSetUsed: boolean;
	inJSONEditor: boolean;
	propsEditType: PropsEditType;
	showCannotSaveDefaultPropsWarning: boolean;
}): RenderModalWarning[] => {
	return [
		warningOrNull(
			'input-props-override',
			getInputPropsWarning({cliProps, propsEditType}),
		),
		getCannotSaveDefaultProps(
			canSaveDefaultProps,
			showCannotSaveDefaultPropsWarning,
		),
		warningOrNull(
			'custom-date-used',
			customDateUsed(isCustomDateUsed, inJSONEditor),
		),
		warningOrNull(
			'static-file-used',
			staticFileUsed(customFileUsed, inJSONEditor),
		),
		warningOrNull('map-used', mapUsed(jsMapUsed, inJSONEditor)),
		warningOrNull('set-used', setUsed(jsSetUsed, inJSONEditor)),
	].filter(NoReactInternals.truthy);
};
