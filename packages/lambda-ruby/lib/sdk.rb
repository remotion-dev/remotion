require 'aws-sdk-lambda'
require 'json'
require 'logger'
require_relative 'version'

module RemotionLambda
  class Client
    attr_reader :bucket_name, :function_name, :serve_url

    def initialize(
      function_name:,
      serve_url:,
      region: ENV.fetch('AWS_REGION', ''),
      aws_profile: ENV.fetch('AWS_PROFILE', 'default')
    )
      @region = region
      @aws_profile = aws_profile
      @function_name = function_name
      @serve_url = serve_url
      @lambda_client = create_lambda_client
    end

    # Lambda methods
    def invoke(payload, function_name: @function_name)
      response = @lambda_client.invoke({
        function_name: function_name,
        payload: JSON.generate(payload)
      })

      JSON.parse(response.payload.string)
    rescue Aws::Lambda::Errors::ServiceError => e
      raise Remotion::Error, "Lambda invocation failed: #{e.message}"
    end

    def get_render_progress(render_id, bucket_name)
      payload = {
        "type" => "status",
        "renderId" => render_id,
        "bucketName" => bucket_name,
        "version" => VERSION,
      }

      body = invoke(payload)      
      raise "Failed to fetch progress: #{body['message']}" if body["type"] == "error"
      
      body
    end

    def get_render_progress_payload(
      render_id:,
      bucket_name:,
      force_path_style: false,
      log_level: 'info',
      s3_output_provider: nil
    )
      payload = {
        "type" => "status",
        "renderId" => render_id,
        "bucketName" => bucket_name,
        "version" => VERSION,
        "forcePathStyle" => force_path_style,
        "logLevel" => log_level,
        "s3OutputProvider" => s3_output_provider
      }

      payload
    end

    def create_lambda_client
      Aws::Lambda::Client.new(region: @region, credentials: aws_credentials)
    end

    def aws_credentials
      if @aws_profile
        Aws::SharedCredentials.new(profile_name: @aws_profile)
      else
        Aws::Credentials.new(ENV['AWS_ACCESS_KEY'], ENV['AWS_SECRET_KEY'])
      end
    end
  end
end 
