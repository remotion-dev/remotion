import {Button} from '../../components/Button';

export const RetryButton: React.FC<{
	onClick: () => void;
	readonly label?: string;
}> = ({onClick, label = 'Retry'}) => {
	return <Button onClick={onClick}>{label}</Button>;
};
