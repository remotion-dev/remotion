import { Still } from "remotion";
import { PreviewCard } from "./PreviewCard";
import { myCompSchema } from "./PreviewCard";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Still
        id="PreviewCard"
        component={PreviewCard}
        width={1200}
        height={627}
        schema={myCompSchema}
        defaultProps={{
          title: "Welcome to Remotion" as const,
          description: "Edit Video.tsx to change template" as const,
          color: "#0B84F3" as const,
        }}
      />
    </>
  );
};
