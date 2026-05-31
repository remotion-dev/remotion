import {useWebContainerStudio} from './use-web-container-studio';

const styles = {
	container: {
		display: 'flex',
		flexDirection: 'column' as const,
		height: '100%',
		width: '100%',
	},
	header: {
		padding: '12px 20px',
		background: '#1a1a1a',
		borderBottom: '1px solid #333',
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	logo: {
		fontSize: '16px',
		fontWeight: 700,
		color: '#fff',
	},
	badge: {
		fontSize: '11px',
		background: '#0B84F3',
		color: '#fff',
		padding: '2px 8px',
		borderRadius: '12px',
	},
	main: {
		flex: 1,
		position: 'relative' as const,
		overflow: 'hidden',
	},
	iframe: {
		width: '100%',
		height: '100%',
		border: 'none',
	},
	overlay: {
		position: 'absolute' as const,
		inset: 0,
		display: 'flex',
		flexDirection: 'column' as const,
		alignItems: 'center',
		justifyContent: 'center',
		padding: '40px',
	},
	statusTitle: {
		fontSize: '20px',
		fontWeight: 600,
		marginBottom: '8px',
	},
	statusSub: {
		fontSize: '14px',
		color: '#888',
		marginBottom: '24px',
	},
	terminal: {
		background: '#111',
		border: '1px solid #333',
		borderRadius: '8px',
		padding: '16px',
		width: '100%',
		maxWidth: '640px',
		maxHeight: '300px',
		overflow: 'auto',
		fontFamily: 'monospace',
		fontSize: '12px',
		color: '#aaa',
		whiteSpace: 'pre-wrap' as const,
		wordBreak: 'break-all' as const,
	},
	spinner: {
		width: '40px',
		height: '40px',
		border: '3px solid #333',
		borderTop: '3px solid #0B84F3',
		borderRadius: '50%',
		animation: 'spin 1s linear infinite',
		marginBottom: '20px',
	},
	errorBox: {
		background: '#2a0a0a',
		border: '1px solid #6b2121',
		borderRadius: '8px',
		padding: '16px',
		maxWidth: '640px',
		fontFamily: 'monospace',
		fontSize: '13px',
		color: '#f87171',
	},
};

const phaseLabels: Record<string, string> = {
	booting: 'Booting WebContainer…',
	mounting: 'Mounting Remotion template…',
	installing: 'Running npm install…',
	starting: 'Starting Remotion Studio…',
};

export function App() {
	const {phase} = useWebContainerStudio();

	return (
		<div style={styles.container}>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
			<header style={styles.header}>
				<span style={styles.logo}>🎬 Remotion Studio</span>
				<span style={styles.badge}>WebContainer</span>
			</header>
			<main style={styles.main}>
				{phase.type === 'ready' ? (
					<iframe
						src={phase.url}
						style={styles.iframe}
						title="Remotion Studio"
					/>
				) : (
					<div style={styles.overlay}>
						{phase.type === 'error' ? (
							<>
								<div style={{...styles.statusTitle, color: '#f87171'}}>
									Something went wrong
								</div>
								<div style={styles.errorBox}>{phase.message}</div>
							</>
						) : (
							<>
								<div style={styles.spinner} />
								<div style={styles.statusTitle}>
									{phaseLabels[phase.type] ?? 'Loading…'}
								</div>
								{phase.type === 'installing' && phase.output ? (
									<pre style={styles.terminal}>{phase.output}</pre>
								) : (
									<div style={styles.statusSub}>
										Please wait, this may take a minute
									</div>
								)}
							</>
						)}
					</div>
				)}
			</main>
		</div>
	);
}
