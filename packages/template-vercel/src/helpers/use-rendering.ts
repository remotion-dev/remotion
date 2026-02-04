import { z } from "zod";
import { useCallback, useMemo, useState } from "react";
import { CompositionProps } from "../../types/constants";
import { SSEMessage } from "../../types/schema";

export type RenderState =
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

export type RenderItem = {
	id: string;
	state: RenderState;
};

export const useRendering = (
	compositionId: string,
	inputProps: z.infer<typeof CompositionProps>,
) => {
	const [renders, setRenders] = useState<RenderItem[]>([]);

	const renderMedia = useCallback(async () => {
		const renderId = `render-${Date.now()}`;

		setRenders((prev) => [
			...prev,
			{
				id: renderId,
				state: {
					status: "invoking",
					phase: "Starting...",
					progress: 0,
					logs: [],
				},
			},
		]);

		const updateRender = (
			updater: (state: RenderState) => RenderState | null,
		) => {
			setRenders((prev) =>
				prev.map((r) => {
					if (r.id !== renderId) return r;
					const newState = updater(r.state);
					if (newState === null) return r;
					return { ...r, state: newState };
				}),
			);
		};

		try {
			const response = await fetch("/api/render", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({ id: compositionId, inputProps }),
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
						updateRender((state) => ({
							...state,
							logs: [...state.logs, message.data],
						}));
					} else if (message.type === "progress") {
						updateRender((state) => {
							if (state.status !== "invoking") return null;
							return {
								...state,
								progress: message.progress,
							};
						});
					} else if (message.type === "phase") {
						updateRender((state) => {
							if (state.status !== "invoking") return null;
							return {
								...state,
								phase: message.phase,
							};
						});
					} else if (message.type === "done") {
						updateRender((state) => ({
							status: "done",
							url: message.url,
							size: message.size,
							logs: state.logs,
						}));
					} else if (message.type === "error") {
						updateRender((state) => ({
							status: "error",
							error: new Error(message.message),
							logs: state.logs,
						}));
					}
				}
			}
		} catch (err) {
			updateRender((state) => ({
				status: "error",
				error: err as Error,
				logs: state.logs,
			}));
		}
	}, [compositionId, inputProps]);

	const removeRender = useCallback((renderId: string) => {
		setRenders((prev) => prev.filter((r) => r.id !== renderId));
	}, []);

	return useMemo(() => {
		return {
			renderMedia,
			renders,
			removeRender,
		};
	}, [renderMedia, renders, removeRender]);
};
