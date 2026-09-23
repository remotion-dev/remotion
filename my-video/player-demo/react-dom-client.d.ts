// my-video depends on @types/react but not @types/react-dom, and the root
// tsconfig.json type-checks this folder too (`npm run lint` runs `tsc`), so
// without this, importing "react-dom/client" in main.tsx fails with TS7016 in a
// standalone checkout. (Inside the Remotion monorepo, tsc happens to find the
// monorepo's own @types/react-dom one directory up.) Types only the one
// function main.tsx uses. Delete this file if @types/react-dom is ever added.
declare module "react-dom/client" {
  import type {ReactNode} from "react";

  export const createRoot: (container: Element) => {
    render: (children: ReactNode) => void;
    unmount: () => void;
  };
}
