import React, { useCallback } from "react";

export const Input: React.FC<{
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}> = ({ text, setText, disabled }) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      setText(e.currentTarget.value);
    },
    [setText],
  );

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="video-text"
        className="text-sm font-medium text-foreground"
      >
        Text
      </label>
      <input
        id="video-text"
        className="leading-[1.7] block w-full rounded-geist bg-background p-geist-half text-foreground text-sm border border-unfocused-border-color transition-colors duration-150 ease-in-out focus:border-focused-border-color outline-none"
        disabled={disabled}
        name="title"
        value={text}
        onChange={onChange}
      />
    </div>
  );
};
