require 'aws-sdk-lambda'
require 'json'
require 'logger'
require_relative 'remotion_lambda/version'
require_relative 'remotion_lambda/render_media_on_lambda_payload'
require_relative 'remotion_lambda/render_progress_payload'
require_relative 'remotion_lambda/render_still_on_lambda_payload'
require_relative 'remotion_lambda/s3_output_provider'
require_relative 'remotion_lambda/sdk'

module RemotionLambda
  # This module serves as the namespace for the RemotionLambda gem.
  # Add any top-level methods, constants, or configuration here if needed.
end
