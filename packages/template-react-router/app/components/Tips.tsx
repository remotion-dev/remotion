import React from "react";

const Tip: React.FC<{
  title: React.ReactNode;
  description: React.ReactNode;
  href: string;
}> = ({ title, description, href }) => {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex-1">
      <div className="transition-transform duration-200 ease-in-out p-2.5 group hover:-translate-y-0.5">
        <div className="flex flex-row items-center justify-start">
          <h4 className="my-3 font-bold text-foreground">{title}</h4>
          <div className="flex-1"></div>
          <svg
            className="opacity-0 transition-opacity duration-200 ease-in-out group-hover:opacity-100"
            height="1em"
            viewBox="0 0 448 512"
          >
            <path
              fill="var(--foreground)"
              d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"
            />
          </svg>
        </div>
        <p className="text-sm leading-normal text-subtitle mb-6">
          {description}
        </p>
      </div>
    </a>
  );
};

export const Tips: React.FC = () => {
  return (
    <div className="flex flex-col md:flex-row font-geist">
      <Tip
        href="https://www.remotion.dev/docs/the-fundamentals"
        title="Learn Remotion"
        description="Learn how to customize this video written in React."
      ></Tip>
      <Tip
        href="https://github.com/remotion-dev/template-react-router"
        title="See source"
        description="Visit the GitHub repository for this app."
      ></Tip>
      <Tip
        href="https://remotion.dev/discord"
        title="Join the community"
        description="Chat with others builders on Discord."
      ></Tip>
    </div>
  );
};
