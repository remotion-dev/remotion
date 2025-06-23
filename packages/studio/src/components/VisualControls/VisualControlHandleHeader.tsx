import type {OriginalFileNameState} from './ClickableFileName';
import {ClickableFileName} from './ClickableFileName';

export const VisualControlHandleHeader: React.FC<{
	readonly originalFileName: OriginalFileNameState;
}> = ({originalFileName}) => {
	return <ClickableFileName originalFileName={originalFileName} />;
};
