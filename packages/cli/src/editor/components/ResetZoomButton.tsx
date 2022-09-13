import {Button} from '../../preview-server/error-overlay/remotion-overlay/Button';

export const ResetZoomButton: React.FC<{
	onClick: () => void;
}> = ({onClick}) => {
	return <Button onClick={onClick}>Reset zoom</Button>;
};
