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
		propsEditType === 'defaultProps'
	) {
		return 'The data that was passed using --props takes priority over the data you enter here.';
	}

	return null;
};

const getCannotSaveDefaultProps = ({
	canSaveDefaultProps,
}: {
	canSaveDefaultProps: TypeCanSaveState;
}) => {
	if (canSaveDefaultProps.canUpdate) {
		return null;
	}

	if (!canSaveDefaultProps.determined) {
		return null;
	}

	return `Can't save default props: ${canSaveDefaultProps.reason}`;
};

export const getRenderModalWarnings = ({
	cliProps,
	canSaveDefaultProps,
	propsEditType,
}: {
	cliProps: unknown;
	canSaveDefaultProps: TypeCanSaveState;
	propsEditType: PropsEditType;
}) => {
	return [
		getInputPropsWarning({cliProps, propsEditType}),
		getCannotSaveDefaultProps({canSaveDefaultProps}),
	].filter(truthy);
};
