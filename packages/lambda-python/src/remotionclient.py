import boto3
import json
from renderparams import RenderParams


class RemotionClient:

    def __init__(self,  region, serve_url, function_name=None, access_key=None, secret_key=None, session=None, ):
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region
        self.serve_url = serve_url
        self.function_name = function_name
        self.session = session
        self.client = self.create_lambda_client()

    def create_lambda_client(self):
        if self.session:
            return self.session.client('lambda', region_name=self.region)
        elif self.access_key and self.secret_key and self.region:
            return boto3.client('lambda',
                                aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key,
                                region_name=self.region)
        elif self.access_key and self.secret_key:
            return boto3.client('lambda',
                                aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key)
        else:
            return boto3.client('lambda')

    def invoke_lambda(self, function_name, payload):
        try:
            response = self.client.invoke(
                FunctionName=function_name, Payload=payload)
            result = response['Payload'].read().decode('utf-8')
            print("Lambda function invoked successfully.")
            print("Response:", result)
        except Exception as e:
            print(f"Failed to invoke Lambda function: {str(e)}")

    def contruct_request(self, render_params: RenderParams):
        render_params.serveUrl = self.serve_url
        render_params.region = self.region
        return json.dumps(render_params.serializeParams())
        # Function body

    def render_media_on_lambda(self, render_params: RenderParams):
        print(render_params.serializeParams())
        # Function body
