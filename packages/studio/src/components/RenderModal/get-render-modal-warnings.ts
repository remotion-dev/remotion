import {NoReactInternals} from 'remotion/no-react';
import type {PropsEditType} from './DataEditor';

export type TypeCanSaveState =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
			determined: boolean;
	  };

export const defaultTypeCanSaveState: TypeCanSaveState = {
	canUpdate: false,
	reason: 'Loading...',
	determined: false,
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

const getCannotSaveDefaultProps = (canSaveDefaultProps: TypeCanSaveState) => {
	if (canSaveDefaultProps.canUpdate) {
		return null;
	}

	if (!canSaveDefaultProps.determined) {
		return null;
	}

	return `Can't save default props: ${canSaveDefaultProps.reason}.`;
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
}: {
	cliProps: unknown;
	canSaveDefaultProps: TypeCanSaveState;
	isCustomDateUsed: boolean;
	customFileUsed: boolean;
	jsMapUsed: boolean;
	jsSetUsed: boolean;
	inJSONEditor: boolean;
	propsEditType: PropsEditType;
}) => {
	return [
		getInputPropsWarning({cliProps, propsEditType}),
		getCannotSaveDefaultProps(canSaveDefaultProps),
		customDateUsed(isCustomDateUsed, inJSONEditor),
		staticFileUsed(customFileUsed, inJSONEditor),
		mapUsed(jsMapUsed, inJSONEditor),
		setUsed(jsSetUsed, inJSONEditor),
	].filter(NoReactInternals.truthy);
};
