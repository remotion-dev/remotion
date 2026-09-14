require 'aws-sdk-lambda'
require 'aws-sdk-s3'
require 'json'
require 'logger'
require_relative 'version'

module RemotionLambda
  class Client
    attr_reader :bucket_name, :serve_url

    def initialize(
      region: ENV.fetch('AWS_REGION', 'us-east-1'),
      aws_profile: nil,
      s3_client: nil
    )
      @region = region
      @aws_profile = aws_profile
      @lambda_client = create_lambda_client
      @s3_client = s3_client
    end

    def get_render_progress(function_name, payload)
      body = invoke(function_name, payload)      
      raise "Failed to fetch progress: #{body['message']}" if body["type"] == "error"
      body
    end

    def render_media_on_lambda(function_name, payload)
      body = invoke(function_name, payload)      
      raise "Failed to call renderMediaOnLambda: #{body['message']}" if body["type"] == "error"
      body
    end

    def render_still_on_lambda(function_name, payload)
      body = invoke(function_name, payload)      
      raise "Failed to call renderStillOnLambda: #{body['message']}" if body["type"] == "error"
      body
    end

    def cancel_render_on_lambda(bucket_name, render_id)
      progress_response = s3_client.get_object(
        bucket: bucket_name,
        key: "renders/#{render_id}/progress.json"
      )
      progress = JSON.parse(progress_response.body.read)

      unless progress['cancellationEnabled'] == true
        raise "Cannot cancel render #{render_id}: The render was not started with enableCancellation: true."
      end

      s3_client.put_object(
        bucket: bucket_name,
        key: "renders/#{render_id}/cancel.json",
        body: JSON.generate(cancelledAt: (Time.now.to_f * 1000).floor),
        content_type: 'application/json'
      )
      nil
    end

    private

    # Lambda methods
    def invoke(function_name, payload)
      response = @lambda_client.invoke({
        function_name: function_name,
        payload: JSON.generate(payload)
      })

      JSON.parse(response.payload.string)
    end

    def create_lambda_client
      Aws::Lambda::Client.new(region: @region, credentials: aws_credentials)
    end

    def s3_client
      @s3_client ||= Aws::S3::Client.new(region: @region, credentials: aws_credentials)
    end

    def aws_credentials
      if @aws_profile
        Aws::SharedCredentials.new(profile_name: @aws_profile)
      else        
        Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY'])
      end
    end
  end
end 
