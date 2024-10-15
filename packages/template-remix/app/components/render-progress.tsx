import { usePollRenderStatus } from "../hooks/use-poll-render-status";

interface Props {
  renderId: string;
  bucketName: string;
}

export const RenderProgress = ({ renderId, bucketName }: Props) => {
  const { progress } = usePollRenderStatus({
    renderId,
    bucketName,
  });

  if (!progress) {
    return <div>Invoking...</div>;
  }

  if (progress.errors.length > 0) {
    return (
      <div>
        <h3>Well this is unfortunate but there is an error...</h3>
        <span>{progress.errors[0].message}</span>
      </div>
    );
  }

  if (progress.outputFile) {
    return (
      <div>
        <a href={progress.outputFile} target="_blank" rel="noopener noreferrer">
          Download Video
        </a>
      </div>
    );
  }

  return (
    <div>
      <p>Rendering...</p>
      {progress ? (
        <div>{`${Math.round(progress.overallProgress * 100)}%`}</div>
      ) : null}
    </div>
  );
};
