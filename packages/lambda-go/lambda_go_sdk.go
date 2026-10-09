package lambda_go_sdk

import "github.com/go-playground/validator/v10"

func RenderMediaOnLambda(input RemotionOptions) (*RemotionRenderResponse, error) {
	return invokeRenderLambda(input, nil)
}

// RenderFramesOnLambda starts an image sequence render. Track it with GetRenderProgress.
func RenderFramesOnLambda(input RenderFramesOptions) (*RemotionRenderResponse, error) {
	return invokeRenderLambda(RemotionOptions{
		ServeUrl:                       input.ServeUrl,
		FunctionName:                   input.FunctionName,
		Region:                         input.Region,
		Composition:                    input.Composition,
		InputProps:                     input.InputProps,
		ImageFormat:                    input.ImageFormat,
		FrameRange:                     input.FrameRange,
		Concurrency:                    input.Concurrency,
		ConcurrencyPerLambda:           input.ConcurrencyPerLambda,
		EveryNthFrame:                  input.EveryNthFrame,
		EnvVariables:                   input.EnvVariables,
		Privacy:                        input.Privacy,
		ChromiumOptions:                input.ChromiumOptions,
		DownloadBehavior:               input.DownloadBehavior,
		Overwrite:                      input.Overwrite,
		Webhook:                        input.Webhook,
		ForceWidth:                     input.ForceWidth,
		ForceHeight:                    input.ForceHeight,
		ForceFps:                       input.ForceFps,
		ForceDurationInFrames:          input.ForceDurationInFrames,
		RendererFunctionName:           input.RendererFunctionName,
		ForceBucketName:                input.ForceBucketName,
		ForcePathStyle:                 input.ForcePathStyle,
		StorageClass:                   input.StorageClass,
		IsProduction:                   input.IsProduction,
		LicenseKey:                     input.LicenseKey,
		LogLevel:                       input.LogLevel,
		TimeoutInMilliseconds:          input.TimeoutInMilliseconds,
		DeleteAfter:                    input.DeleteAfter,
		OffthreadVideoCacheSizeInBytes: input.OffthreadVideoCacheSizeInBytes,
		OffthreadVideoThreads:          input.OffthreadVideoThreads,
		MediaCacheSizeInBytes:          input.MediaCacheSizeInBytes,
		EnableCancellation:             input.EnableCancellation,
	}, &input)
}

func GetRenderProgress(input RenderConfig) (*RenderProgress, error) {
	return invokeRenderProgressLambda(input)
}

func CancelRenderOnLambda(input CancelRenderOnLambdaInput) error {
	validate := validator.New()
	if err := validate.Struct(input); err != nil {
		return err
	}

	s3Client, err := newS3Client(input.Region, input.ForcePathStyle)
	if err != nil {
		return err
	}

	return cancelRenderOnLambda(s3Client, input)
}
