# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught
from dataclasses import asdict
import json
from math import ceil
from typing import Union, Literal
from enum import Enum
import boto3
from .models import (CostsInfo, RenderMediaParams, RenderMediaProgress,
                     RenderMediaResponse, RenderProgressParams, RenderStillResponse,
                     RenderStillParams)


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

    def _find_json_objects(self, input_string):
        """Finds and returns a list of complete JSON object strings."""
        objects = []
        depth = 0
        start_index = 0

        for i, char in enumerate(input_string):
            if char == '{':
                if depth == 0:
                    start_index = i
                depth += 1
            elif char == '}':
                depth -= 1
                if depth == 0:
                    objects.append(input_string[start_index:i + 1])

        return objects

    def _parse_stream(self, stream):
        """Parses a stream of concatenated JSON objects."""
        json_objects = self._find_json_objects(stream)
        parsed_objects = [json.loads(obj) for obj in json_objects]
        return parsed_objects

    def _invoke_lambda(self, function_name, payload):

        client = self._create_lambda_client()
        response = client.invoke(
            FunctionName=function_name, Payload=payload, )
        result = response['Payload'].read().decode('utf-8')
        decoded_result = self._parse_stream(result)[-1]
        if 'errorMessage' in decoded_result:
            raise ValueError(decoded_result['errorMessage'])

        if 'type' in decoded_result and decoded_result['type'] == 'error':
            raise ValueError(decoded_result['message'])
        if (not 'type' in decoded_result or decoded_result['type'] != 'success'):
            raise ValueError(result)

        return decoded_result

    def _custom_serializer(self, obj):
        """A custom JSON serializer that handles enums and objects."""

        if isinstance(obj, Enum):
            return obj.value if hasattr(obj, 'value') else obj.name
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        if hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
            return list(obj)
        return asdict(obj)

    def construct_render_request(self, render_params: Union[RenderMediaParams, RenderStillParams],
                                 render_type:
                                 Union[Literal["video-or-audio"], Literal["still"]]) -> str:
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
        render_params.type = render_type
        render_params.private_serialized_input_props = self._serialize_input_props(
            input_props=render_params.input_props,
            render_type=render_type
        )
        return json.dumps(render_params.serialize_params(), default=self._custom_serializer)

    def construct_render_progress_request(self,
                                          render_id: str,
                                          bucket_name: str,
                                          log_level="info") -> str:
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
            region=self.region,
            log_level=log_level
        )
        return json.dumps(progress_params.serialize_params())

    def render_media_on_lambda(self, render_params: RenderMediaParams) -> RenderMediaResponse:
        """
        Render media using AWS Lambda.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            RenderResponse: Response from the render operation.
        """
        params = self.construct_render_request(
            render_params, render_type="video-or-audio")
        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params)
        if body_object:
            return RenderMediaResponse(body_object['bucketName'], body_object['renderId'])

        return None

    def render_still_on_lambda(self, render_params: RenderStillParams) -> RenderStillResponse:
        """
        Render still using AWS Lambda.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            RenderResponse: Response from the render operation.
        """
        params = self.construct_render_request(
            render_params, render_type='still')

        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params)

        if body_object:
            return RenderStillResponse(
                estimated_price=CostsInfo(
                    accrued_so_far=body_object['estimatedPrice']['accruedSoFar'],
                    display_cost=body_object['estimatedPrice']['displayCost'],
                    currency=body_object['estimatedPrice']['currency'],
                    disclaimer=body_object['estimatedPrice']['disclaimer']
                ),
                url=body_object['output'],
                size_in_bytes=body_object['size'],
                bucket_name=body_object['bucketName'],
                render_id=body_object['renderId'],
                # cloud_watch_logs=body_object['cloud_watch_logs']
            )

        return None

    def get_render_progress(self,
                            render_id: str,
                            bucket_name: str,
                            log_level="info") -> RenderMediaProgress:
        """
        Get the progress of a render.

        Args:
            render_id (str): ID of the render.
            bucket_name (str): Name of the bucket.
            log_level (str): Log level ("error", "warning", "info", "verbose").

        Returns:
            RenderProgress: Progress of the render.
        """
        params = self.construct_render_progress_request(
            render_id, bucket_name, log_level=log_level)
        progress_response = self._invoke_lambda(
            function_name=self.function_name, payload=params)
        if progress_response:
            render_progress = RenderMediaProgress()
            render_progress.__dict__.update(progress_response)
            return render_progress
        return None
