package main

import (
	"github.com/remotion-dev/remotion/packages/goclient"
)

func main() {
	input := &goclient.RemotionOptions{
		// Set the input parameters here
	}
	err := goclient.Render(input)
	if err != nil {
		// Handle the error here
	}
}
