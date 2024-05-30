import React, {useCallback} from 'react';
import {saveDefaultProps} from '../api/save-default-props';
import {showNotification} from './Notifications/NotificationCenter';
import {SchemaSaveButton} from './RenderModal/SchemaEditor/SchemaSaveButton';

export const GlobalPropsEditorUpdateButton: React.FC<{
	readonly compositionId: string;
	readonly currentDefaultProps: Record<string, unknown>;
}> = ({compositionId, currentDefaultProps}) => {
	const [disabled, setDisabled] = React.useState(false);
	const onClicked = useCallback(() => {
		setDisabled(true);
		saveDefaultProps({
			compositionId,
			defaultProps: () => currentDefaultProps,
		})
			.catch((err) => {
				showNotification(`Cannot update default props: ${err.stack}`, 2000);
			})
			.finally(() => {
				setDisabled(true);
			});
	}, [compositionId, currentDefaultProps]);

	return <SchemaSaveButton disabled={disabled} onClick={onClicked} />;
};
