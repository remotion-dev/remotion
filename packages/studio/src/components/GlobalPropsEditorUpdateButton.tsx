import React, {useCallback, useContext} from 'react';
import {Internals} from 'remotion';
import {saveDefaultProps} from '../api/save-default-props';
import {showNotification} from './Notifications/NotificationCenter';
import {SchemaResetButton} from './RenderModal/SchemaEditor/SchemaResetButton';
import {SchemaSaveButton} from './RenderModal/SchemaEditor/SchemaSaveButton';

const container: React.CSSProperties = {
	display: 'inline-block',
	flexDirection: 'row',
};

export const GlobalPropsEditorUpdateButton: React.FC<{
	readonly compositionId: string;
	readonly currentDefaultProps: Record<string, unknown>;
}> = ({compositionId, currentDefaultProps}) => {
	const {fastRefreshes} = useContext(Internals.NonceContext);

	const [disabled, setDisabled] = React.useState(false);

	const onClicked = useCallback(() => {
		setDisabled(true);
		window.remotion_ignoreFastRefreshUpdate = fastRefreshes + 1;

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
	}, [compositionId, currentDefaultProps, fastRefreshes]);

	const onReset = useCallback(() => {
		window.remotion_ignoreFastRefreshUpdate = null;
		window.dispatchEvent(new CustomEvent(Internals.PROPS_UPDATED_EXTERNALLY));
	}, []);

	return (
		<div style={container}>
			<SchemaResetButton onClick={onReset} />
			<SchemaSaveButton disabled={disabled} onClick={onClicked} />
		</div>
	);
};
