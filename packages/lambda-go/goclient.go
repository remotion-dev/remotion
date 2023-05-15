package remotionlambda

func RenderMediaOnLambda(input RemotionOptions) (*RemotionRenderResponse, error) {
	return invokeRenderLambda(input)
}

func GetRenderProgress(input RenderConfig) (*RenderProgressResponse, error) {
	return invokeRenderProgressLambda(input)
}
