import {truthy} from '../../../truthy';

export type TypeCanSaveState =
	| {
			canUpdate: true;
	  }
	| {
			canUpdate: false;
			reason: string;
			determined: boolean;
	  };

const getInputPropsWarning = ({cliProps}: {cliProps: unknown}) => {
	if (Object.keys(cliProps as object).length > 0) {
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
}: {
	cliProps: unknown;
	canSaveDefaultProps: TypeCanSaveState;
}) => {
	return [
		getInputPropsWarning({cliProps}),
		getCannotSaveDefaultProps({canSaveDefaultProps}),
	].filter(truthy);
};
