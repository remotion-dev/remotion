import { useEffect, useState } from "react";
import { canUseWebFsWriter } from "../helpers/browser-support";

type WebFsState = "loading" | "yes" | "no" | "security-error";

export const EnsureBrowserSupport: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [canUseWebFs, setCanUseWebFs] = useState<WebFsState>("loading");
  useEffect(() => {
    canUseWebFsWriter()
      .then((result) => {
        setCanUseWebFs(result ? "yes" : "no");
      })
      .catch((err) => {
        if ((err as Error).message.includes("Security")) {
          setCanUseWebFs("security-error");
        } else {
          setCanUseWebFs("no");
          console.log(err);
        }
      });
  }, []);

  if (canUseWebFs === "loading") {
    return null;
  }

  if (canUseWebFs === "no") {
    return (
      <div className="justify-center text-white flex items-center flex-col absolute inset-0  text-sm">
        <strong>Browser not supported</strong>
        <p className="max-w-[500px] text-center text-balance">
          Your browser does not support the Web FS API which is needed to use
          this application. Please use a different browser.
        </p>
      </div>
    );
  }

  if (canUseWebFs === "security-error") {
    return (
      <div className="justify-center text-white flex items-center flex-col absolute inset-0  text-sm">
        <strong>Security error</strong>
        <p className="max-w-[500px] text-center text-balance">
          Got an error trying to use the Web File System API. This could be
          because you are in an Private Window. Try opening this app in a
          regular window.
        </p>
      </div>
    );
  }

  return children;
};
