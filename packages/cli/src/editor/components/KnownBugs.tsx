import type {Bug} from './UpdateCheck';
import {OpenIssueButton} from './UpdateModal/OpenIssueButton';

const Title: React.CSSProperties = {
	fontSize: 14,
	fontWeight: 'bold',
};

const container: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	alignItems: 'center',
};

export const KnownBugs: React.FC<{bugs: Bug[]}> = ({bugs}) => {
	const bugElements = bugs.map((bug) => {
		return (
			<div key={bug.description} style={container}>
				<p style={Title}>- {bug.title}</p>
				<OpenIssueButton link={bug.link} />
			</div>
		);
	});
	return <div>{bugElements}</div>;
};
