"use client";

import type { PlayerRef } from "@remotion/player";
import { useEffect, useMemo, useSyncExternalStore } from "react";
import type { PreviewHost } from "@/preview/bridge";

export type PlaybackSnapshot = {
  frame: number;
  playing: boolean;
  muted: boolean;
  volume: number;
  hasPlayer: boolean;
};

export type PlaybackStore = {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => PlaybackSnapshot;
  getPlayer: () => PlayerRef | null;
};

const initialSnapshot: PlaybackSnapshot = {
  frame: 0,
  playing: false,
  muted: false,
  volume: 1,
  hasPlayer: false,
};

/**
 * Mirrors the state of the Player that lives inside the preview iframe into
 * an external store, so only components that care about the current frame
 * re-render on every frame.
 */
export const usePlaybackStore = ({
  host,
  onError,
}: {
  host: PreviewHost | null;
  onError: (message: string) => void;
}): PlaybackStore => {
  const store = useMemo(() => {
    let snapshot = initialSnapshot;
    let player: PlayerRef | null = null;
    const listeners = new Set<() => void>();
    const emit = () => {
      for (const listener of listeners) {
        listener();
      }
    };
    const update = (patch: Partial<PlaybackSnapshot>) => {
      snapshot = { ...snapshot, ...patch };
      emit();
    };

    return {
      subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => {
          listeners.delete(listener);
        };
      },
      getSnapshot: () => snapshot,
      getPlayer: () => player,
      setPlayer: (next: PlayerRef | null) => {
        player = next;
        if (next) {
          update({
            hasPlayer: true,
            frame: next.getCurrentFrame(),
            playing: next.isPlaying(),
            muted: next.isMuted(),
            volume: next.getVolume(),
          });
        } else {
          update({ hasPlayer: false, playing: false });
        }
      },
      update,
    };
  }, []);

  useEffect(() => {
    if (!host) {
      store.setPlayer(null);
      return;
    }

    let attached: PlayerRef | null = null;
    let detach = () => {};

    const attach = (player: PlayerRef) => {
      const onFrame = (event: { detail: { frame: number } }) =>
        store.update({ frame: event.detail.frame });
      const onPlay = () => store.update({ playing: true });
      const onPause = () => store.update({ playing: false });
      const onEnded = () => store.update({ playing: false });
      const onMute = (event: { detail: { isMuted: boolean } }) =>
        store.update({ muted: event.detail.isMuted });
      const onVolume = (event: { detail: { volume: number } }) =>
        store.update({ volume: event.detail.volume });
      const onPlayerError = (event: { detail: { error: Error } }) =>
        onError(event.detail.error.message);

      player.addEventListener("frameupdate", onFrame);
      player.addEventListener("seeked", onFrame);
      player.addEventListener("play", onPlay);
      player.addEventListener("pause", onPause);
      player.addEventListener("ended", onEnded);
      player.addEventListener("mutechange", onMute);
      player.addEventListener("volumechange", onVolume);
      player.addEventListener("error", onPlayerError);
      return () => {
        player.removeEventListener("frameupdate", onFrame);
        player.removeEventListener("seeked", onFrame);
        player.removeEventListener("play", onPlay);
        player.removeEventListener("pause", onPause);
        player.removeEventListener("ended", onEnded);
        player.removeEventListener("mutechange", onMute);
        player.removeEventListener("volumechange", onVolume);
        player.removeEventListener("error", onPlayerError);
      };
    };

    const sync = () => {
      const player = host.getPlayer();
      if (player === attached) {
        return;
      }

      detach();
      attached = player;
      detach = player ? attach(player) : () => {};
      store.setPlayer(player);
    };

    sync();
    const unsubscribe = host.subscribe(sync);
    return () => {
      unsubscribe();
      detach();
      store.setPlayer(null);
    };
  }, [host, onError, store]);

  return store;
};

// Select a primitive so components only re-render when that value changes.
export const usePlaybackValue = <T extends string | number | boolean | null>(
  store: PlaybackStore,
  selector: (snapshot: PlaybackSnapshot) => T,
) =>
  useSyncExternalStore(
    store.subscribe,
    () => selector(store.getSnapshot()),
    () => selector(initialSnapshot),
  );

export const usePlaybackFrame = (store: PlaybackStore) =>
  usePlaybackValue(store, (snapshot) => snapshot.frame);
