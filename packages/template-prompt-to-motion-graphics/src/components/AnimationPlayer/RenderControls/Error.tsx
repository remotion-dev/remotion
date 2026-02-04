import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const isLambdaNotConfiguredError = (message: string): boolean => {
  return (
    message.includes("Set up Remotion Lambda") ||
    message.includes("Function not found:")
  );
};

export const ErrorComp: React.FC<{
  message: string;
}> = ({ message }) => {
  const isLambdaError = isLambdaNotConfiguredError(message);

  if (isLambdaError) {
    return (
      <Alert variant="destructive" className="my-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Lambda not configured</AlertTitle>
        <AlertDescription>
          To render videos, set up Remotion Lambda and add your AWS credentials
          to the <code className="font-mono text-xs">.env</code> file.{" "}
          <a
            href="https://www.remotion.dev/docs/lambda/setup"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Setup guide
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="destructive" className="my-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription className="font-mono whitespace-pre-wrap break-words">
        {message}
      </AlertDescription>
    </Alert>
  );
};
