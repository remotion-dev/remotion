import {Button} from './Button';

export const RetryButton: React.FC<{
	onClick: () => void;
}> = ({onClick}) => {
	return <Button onClick={onClick}>Retry calculateMetadata()</Button>;
};
