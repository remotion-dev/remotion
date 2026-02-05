import React from "react";
import { ErrorDisplay } from "@/components/ErrorDisplay";

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
      <ErrorDisplay
        error={`To render videos, set up Remotion Lambda and add your AWS credentials to the .env file.`}
        title="Lambda not configured"
        variant="card"
        size="md"
      >
        <a
          href="https://www.remotion.dev/docs/lambda/setup"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sm"
        >
          Setup guide
        </a>
      </ErrorDisplay>
    );
  }

  return (
    <ErrorDisplay
      error={message}
      title="Error"
      variant="card"
      size="md"
    />
  );
};
