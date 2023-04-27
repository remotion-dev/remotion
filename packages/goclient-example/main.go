package main

import (
	"log"

	"github.com/remotion-dev/remotion/packages/goclient"
)

func main() {

	input := &goclient.RemotionOptions{
		// Set the input parameters here
	}
	err := goclient.Render(input)
	if err != nil {
		log.Fatal(err)
	}
}
