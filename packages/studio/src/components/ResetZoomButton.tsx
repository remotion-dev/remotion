import {Button} from './Button';

export const ResetZoomButton: React.FC<{
	onClick: () => void;
}> = ({onClick}) => {
	return <Button onClick={onClick}>Reset zoom</Button>;
};
