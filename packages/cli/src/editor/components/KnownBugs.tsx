import type {Bug} from './UpdateCheck';
import {OpenIssueButton} from './UpdateModal/OpenIssueButton';

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

export const KnownBugs: React.FC<{bugs: Bug[]}> = ({bugs}) => {
	const bugElements = bugs.map((bug) => {
		return (
			<div key={bug.description + bug.link} style={container}>
				<div>🪲 {bug.title}</div>
				<OpenIssueButton link={bug.link} />
			</div>
		);
	});
	return <div>{bugElements}</div>;
};
