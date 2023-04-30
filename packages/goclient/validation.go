package goclient

import (
	"strconv"

	"github.com/go-playground/validator/v10"
)

func qualityRange(fl validator.FieldLevel) bool {
	quality, err := strconv.Atoi(fl.Field().String())
	if err != nil {
		return false
	}
	return quality >= 1 && quality <= 100
}
