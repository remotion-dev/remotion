package lambda_go_sdk

import "github.com/go-playground/validator/v10"

func RenderMediaOnLambda(input RemotionOptions) (*RemotionRenderResponse, error) {
	return invokeRenderLambda(input)
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
