import { useEffect, useRef } from "react";

export const LogViewer: React.FC<{ logs: string[] }> = ({ logs }) => {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (containerRef.current) {
			containerRef.current.scrollTop = containerRef.current.scrollHeight;
		}
	}, [logs]);

	if (logs.length === 0) return null;

	return (
		<div
			ref={containerRef}
			style={{
				backgroundColor: "#1a1a1a",
				borderRadius: 8,
				padding: 12,
				height: 200,
				overflowY: "auto",
				fontFamily: "monospace",
				fontSize: 12,
				lineHeight: 1.4,
				color: "#e0e0e0",
				whiteSpace: "pre-wrap",
				wordBreak: "break-all",
			}}
		>
			{logs.map((log, i) => (
				<span key={i}>{log}</span>
			))}
		</div>
	);
};
