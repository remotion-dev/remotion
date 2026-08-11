package lambda_go_sdk

func RenderMediaOnLambda(input RemotionOptions) (*RemotionRenderResponse, error) {
	return invokeRenderLambda(input)
}

func GetRenderProgress(input RenderConfig) (*RenderProgress, error) {
	return invokeRenderProgressLambda(input)
}
