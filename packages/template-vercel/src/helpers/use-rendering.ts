import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../../types/constants";
import { SSEMessage } from "../../types/schema";

export type State =
	| {
			status: "init";
	  }
	| {
			status: "invoking";
			phase: string;
			progress: number;
			logs: string[];
	  }
	| {
			status: "error";
			error: Error;
			logs: string[];
	  }
	| {
			url: string;
			size: number;
			status: "done";
			logs: string[];
	  };

export const useRendering = (
	id: string,
	inputProps: z.infer<typeof CompositionProps>,
) => {
	const [state, setState] = useState<State>({
		status: "init",
	});

	const renderMedia = useCallback(async () => {
		setState({
			status: "invoking",
			phase: "Starting...",
			progress: 0,
			logs: [],
		});

		try {
			const response = await fetch("/api/render", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id, inputProps }),
			});

			if (!response.ok || !response.body) {
				throw new Error("Failed to start render");
			}

			const reader = response.body.getReader();
			const decoder = new TextDecoder();
			let buffer = "";

			while (true) {
				const { done, value } = await reader.read();
				if (done) break;

				buffer += decoder.decode(value, { stream: true });
				const lines = buffer.split("\n\n");
				buffer = lines.pop() || "";

				for (const line of lines) {
					if (!line.startsWith("data: ")) continue;

					const json = line.slice(6);
					const message = JSON.parse(json) as SSEMessage;

					if (message.type === "log") {
						setState((prev) => {
							if (prev.status === "init") return prev;
							return {
								...prev,
								logs: [...prev.logs, message.data],
							};
						});
					} else if (message.type === "progress") {
						setState((prev) => {
							if (prev.status !== "invoking") return prev;
							return {
								...prev,
								progress: message.progress,
							};
						});
					} else if (message.type === "phase") {
						setState((prev) => {
							if (prev.status !== "invoking") return prev;
							return {
								...prev,
								phase: message.phase,
							};
						});
					} else if (message.type === "done") {
						setState((prev) => ({
							status: "done",
							url: message.url,
							size: message.size,
							logs: prev.status !== "init" ? prev.logs : [],
						}));
					} else if (message.type === "error") {
						setState((prev) => ({
							status: "error",
							error: new Error(message.message),
							logs: prev.status !== "init" ? prev.logs : [],
						}));
					}
				}
			}
		} catch (err) {
			setState((prev) => ({
				status: "error",
				error: err as Error,
				logs: prev.status !== "init" ? prev.logs : [],
			}));
		}
	}, [id, inputProps]);

	const undo = useCallback(() => {
		setState({ status: "init" });
	}, []);

	return useMemo(() => {
		return {
			renderMedia,
			state,
			undo,
		};
	}, [renderMedia, state, undo]);
};
