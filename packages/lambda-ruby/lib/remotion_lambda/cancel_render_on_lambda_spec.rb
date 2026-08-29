require_relative 'sdk'
require 'aws-sdk-s3'
require 'json'

s3_client = Aws::S3::Client.new(stub_responses: true)
s3_client.stub_responses(:get_object, body: JSON.generate(cancellationEnabled: true))
client = RemotionLambda::Client.new(s3_client: s3_client)

client.cancel_render_on_lambda('remotionlambda-test', 'render-id')

requests = s3_client.api_requests
raise 'Expected progress to be read' unless requests[0][:params][:key] == 'renders/render-id/progress.json'
raise 'Expected cancellation signal to be written' unless requests[1][:params][:key] == 'renders/render-id/cancel.json'
cancellation_body = JSON.parse(requests[1][:params][:body])
raise 'Expected cancelledAt timestamp' unless cancellation_body['cancelledAt'] > 0

disabled_s3_client = Aws::S3::Client.new(stub_responses: true)
disabled_s3_client.stub_responses(:get_object, body: '{}')
disabled_client = RemotionLambda::Client.new(s3_client: disabled_s3_client)

begin
  disabled_client.cancel_render_on_lambda('remotionlambda-test', 'render-id')
  raise 'Expected cancellation to fail without opt-in'
rescue => error
  raise error unless error.message.include?('enableCancellation: true')
end
