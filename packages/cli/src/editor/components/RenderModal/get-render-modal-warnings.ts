import {truthy} from '../../../truthy';
import type {PropsEditType} from './RenderModalData';

export type TypeCanSaveState =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
			determined: boolean;
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
		return "There is a Date in the schema which can't be serialized. It has been converted into a string.";
	}

	return null;
};

export const getRenderModalWarnings = ({
	cliProps,
	canSaveDefaultProps,
	isCustomDateUsed,
	inJSONEditor,
	propsEditType,
}: {
	cliProps: unknown;
	canSaveDefaultProps: TypeCanSaveState;
	isCustomDateUsed: boolean | undefined;
	inJSONEditor: boolean;
	propsEditType: PropsEditType;
}) => {
	return [
		getInputPropsWarning({cliProps, propsEditType}),
		getCannotSaveDefaultProps(canSaveDefaultProps),
		customDateUsed(isCustomDateUsed, inJSONEditor),
	].filter(truthy);
};
