import React, {useState} from 'react';
import styles from './InfoTool.module.css';

interface InfoTooltipProps {
	text: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({text}) => {
	const [isVisible, setIsVisible] = useState(false);

	return (
		<span
			className={styles.infoIcon}
			onMouseEnter={() => setIsVisible(true)}
			onMouseLeave={() => setIsVisible(false)}
		>
			<span style={{fontSize: '1rem'}}>ⓘ</span>
			{isVisible && <span className={styles.tooltip}>{text}</span>}
		</span>
	);
};
