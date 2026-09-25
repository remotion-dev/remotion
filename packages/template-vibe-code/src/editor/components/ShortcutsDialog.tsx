"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { shortcutGroups } from "../model/shortcuts";
import { useEditor } from "../state/editor-context";

export const Kbd: React.FC<{ readonly children: React.ReactNode }> = ({
  children,
}) => (
  <kbd className="bg-muted text-foreground border-border inline-flex h-5 min-w-5 items-center justify-center rounded border px-1.5 font-sans text-[10px] font-medium">
    {children}
  </kbd>
);

export const ShortcutsDialog: React.FC = () => {
  const { state, actions } = useEditor();

  return (
    <Dialog
      open={state.dialog === "shortcuts"}
      onOpenChange={(open) => actions.openDialog(open ? "shortcuts" : null)}
    >
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Keyboard shortcuts</DialogTitle>
          <DialogDescription>
            The same shortcuts as Remotion Studio, where the editor supports the
            feature.
          </DialogDescription>
        </DialogHeader>
        <div className="grid max-h-[60vh] grid-cols-1 gap-x-8 gap-y-4 overflow-y-auto sm:grid-cols-2">
          {shortcutGroups.map((group) => (
            <section key={group.title}>
              <h3 className="text-muted-foreground mb-2 text-[11px] font-semibold tracking-wide uppercase">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-1.5">
                {group.shortcuts.map((shortcut) => (
                  <li
                    key={shortcut.description}
                    className="flex items-center justify-between gap-3 text-xs"
                  >
                    <span>{shortcut.description}</span>
                    <span className="flex shrink-0 items-center gap-1">
                      {shortcut.keys.map((key, index) => (
                        <React.Fragment key={key}>
                          {index > 0 ? (
                            <span className="text-muted-foreground-dim text-[10px]">
                              /
                            </span>
                          ) : null}
                          <Kbd>{key}</Kbd>
                        </React.Fragment>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
