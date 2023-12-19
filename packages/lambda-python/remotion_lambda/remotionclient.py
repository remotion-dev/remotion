# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught
import json
from math import ceil
import boto3
from .models import RenderParams, RenderProgress, RenderResponse, RenderProgressParams


class RemotionClient:
    """A client for interacting with the Remotion service."""

    # pylint: disable=too-many-arguments
    def __init__(self, region, serve_url, function_name, access_key=None, secret_key=None):
        """
        Initialize the RemotionClient.

        Args:
            region (str): AWS region.
            serve_url (str): URL for the Remotion service.
            function_name (str): Name of the AWS Lambda function.
            access_key (str): AWS access key (optional).
            secret_key (str): AWS secret key (optional).
        """
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region
        self.serve_url = serve_url
        self.function_name = function_name

    def _serialize_input_props(self, input_props, render_type):
        """
        Serialize inputProps to a format compatible with Lambda.

        Args:
            input_props (dict): Input properties to be serialized.
            type (str): Type of the render (e.g., 'still' or 'video-or-audio').

        Raises:
            ValueError: If the inputProps are too large or cannot be serialized.

        Returns:
            dict: Serialized inputProps.
        """
        try:
            payload = json.dumps(input_props, separators=(',', ':'))
            max_inline_payload_size = 5000000 if render_type == 'still' else 200000

            if len(payload) > max_inline_payload_size:
                raise ValueError(
                    (
                        f"InputProps are over {round(max_inline_payload_size / 1000)}KB "
                        f"({ceil(len(payload) / 1024)}KB) in size. This is not currently supported."
                    )
                )

            return {
                'type': 'payload',
                'payload': payload if payload not in ('', 'null') else json.dumps({})
            }
        except ValueError as error:
            raise ValueError(
                'Error serializing InputProps. Check for circular ' +
                'references or reduce the object size.'
            ) from error

    def _create_lambda_client(self):
        if self.access_key and self.secret_key and self.region:
            return boto3.client('lambda',
                                aws_access_key_id=self.access_key,
                                aws_secret_access_key=self.secret_key,
                                region_name=self.region)

        return boto3.client('lambda',  region_name=self.region)

    def _invoke_lambda(self, function_name, payload):
        client = self._create_lambda_client()
        response = client.invoke(
            FunctionName=function_name, Payload=payload)
        result = response['Payload'].read().decode('utf-8')
        decoded_result = json.loads(result)
        if 'errorMessage' in decoded_result:
            raise ValueError(decoded_result['errorMessage'])

        if 'type' in decoded_result and decoded_result['type'] == 'error':
            raise ValueError(decoded_result['message'])
        if not 'type' in decoded_result or decoded_result['type'] != 'success':
            raise ValueError(result)

        return decoded_result

    def construct_render_request(self, render_params: RenderParams) -> str:
        """
        Construct a render request in JSON format.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            str: JSON representation of the render request.
        """
        render_params.serve_url = self.serve_url
        render_params.region = self.region
        render_params.function_name = self.function_name
        render_params.private_serialized_input_props = self._serialize_input_props(
            input_props=render_params.data,
            render_type="video-or-audio"
        )
        return json.dumps(render_params.serialize_params())

    def construct_render_progress_request(self, render_id: str, bucket_name: str) -> str:
        """
        Construct a render progress request in JSON format.

        Args:
            render_id (str): ID of the render.
            bucket_name (str): Name of the bucket.

        Returns:
            str: JSON representation of the render progress request.
        """
        progress_params = RenderProgressParams(
            render_id=render_id,
            bucket_name=bucket_name,
            function_name=self.function_name,
            region=self.region
        )
        return json.dumps(progress_params.serialize_params())

    def render_media_on_lambda(self, render_params: RenderParams) -> RenderResponse:
        """
        Render media using AWS Lambda.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            RenderResponse: Response from the render operation.
        """
        params = self.construct_render_request(render_params)
        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params)
        if body_object:
            return RenderResponse(body_object['bucketName'], body_object['renderId'])

        return None

    def get_render_progress(self, render_id: str, bucket_name: str) -> RenderProgress:
        """
        Get the progress of a render.

        Args:
            render_id (str): ID of the render.
            bucket_name (str): Name of the bucket.

        Returns:
            RenderProgress: Progress of the render.
        """
        params = self.construct_render_progress_request(render_id, bucket_name)
        progress_response = self._invoke_lambda(
            function_name=self.function_name, payload=params)
        if progress_response:
            render_progress = RenderProgress()
            render_progress.__dict__.update(progress_response)
            return render_progress
        return None
