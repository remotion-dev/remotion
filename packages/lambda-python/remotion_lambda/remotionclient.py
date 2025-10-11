# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught
import logging
from dataclasses import asdict
import random
import json
import hashlib
from math import ceil
from typing import Optional, Union, List
from enum import Enum
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from .models import (
    CostsInfo,
    CustomCredentials,
    RenderMediaParams,
    RenderMediaProgress,
    RenderMediaResponse,
    RenderProgressParams,
    RenderStillResponse,
    RenderStillParams,
    RenderType,
)


logger = logging.getLogger(__name__)

BUCKET_NAME_PREFIX = 'remotionlambda-'
REGION_US_EAST = 'us-east-1'


class RemotionClient:
    """A client for interacting with the Remotion service."""

    # pylint: disable=too-many-arguments
    def __init__(
        self,
        region: str,
        serve_url: str,
        function_name: str,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        force_path_style=False,
    ):
        """
        Initialize the RemotionClient.

        Args:
            region (str): AWS region.
            serve_url (str): URL for the Remotion service.
            function_name (str): Name of the AWS Lambda function.
            access_key (str): AWS access key (optional).
            secret_key (str): AWS secret key (optional).
            force_path_style (bool): Force path-style S3 URLs (optional).
        """
        self.access_key = access_key
        self.secret_key = secret_key
        self.region = region
        self.serve_url = serve_url
        self.function_name = function_name
        self.force_path_style = force_path_style

    def _generate_hash(self, payload):
        """Generate a hash for the payload."""
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def _generate_random_hash(self):
        """Generate a random hash for bucket operations."""
        alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
        return ''.join(random.choice(alphabet) for _ in range(10))

    def _make_bucket_name(self):
        """Generate a bucket name following Remotion conventions."""
        # Use the same logic as JS SDK: prefix + region without dashes + random hash
        region_no_dashes = self.region.replace('-', '')
        random_suffix = self._generate_random_hash()
        return f"{BUCKET_NAME_PREFIX}{region_no_dashes}-{random_suffix}"

    def _input_props_key(self, hash_value):
        """Generate S3 key for input props."""
        return f"input-props/{hash_value}.json"

    def _create_s3_client(self):
        """Create S3 client with appropriate credentials."""
        kwargs = {'region_name': self.region}

        if self.force_path_style:
            kwargs['config'] = Config(s3={'addressing_style': 'path'})

        if self.access_key and self.secret_key:
            kwargs.update(
                {
                    'aws_access_key_id': self.access_key,
                    'aws_secret_access_key': self.secret_key,
                }
            )

        return boto3.client('s3', **kwargs)

    def _get_remotion_buckets(self) -> List[str]:
        s3_client = self._create_s3_client()

        try:
            response = s3_client.list_buckets()
        except ClientError as e:
            logger.warning("Could not list S3 buckets: %s", e)
            return []

        remotion_buckets = []

        for bucket in response.get('Buckets', []):
            bucket_name = bucket['Name']

            if not bucket_name.startswith(BUCKET_NAME_PREFIX):
                continue

            if self._is_bucket_in_current_region(s3_client, bucket_name):
                remotion_buckets.append(bucket_name)

        return remotion_buckets

    def _is_bucket_in_current_region(self, s3_client, bucket_name: str) -> bool:
        try:
            bucket_region = s3_client.get_bucket_location(Bucket=bucket_name)
            location = bucket_region.get('LocationConstraint')

            # us-east-1 returns None for LocationConstraint
            return location == self.region or (
                location is None and self.region == REGION_US_EAST
            )
        except ClientError:
            # Ignore buckets we can't access (permission issues, etc.)
            return False

    def _get_or_create_bucket(self):
        """Get existing bucket or create a new one following JS SDK logic."""
        buckets = self._get_remotion_buckets()

        if len(buckets) > 1:
            raise ValueError(
                f"You have multiple buckets ({', '.join(buckets)}) in your S3 region "
                f"({self.region}) starting with \"remotionlambda-\". "
                "Please see https://remotion.dev/docs/lambda/multiple-buckets."
            )

        if len(buckets) == 1:
            # Use existing bucket - in JS SDK this also applies lifecycle rules
            return buckets[0]

        # Create new bucket
        bucket_name = self._make_bucket_name()
        s3_client = self._create_s3_client()

        try:
            if self.region == REGION_US_EAST:
                s3_client.create_bucket(Bucket=bucket_name)
            else:
                s3_client.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': self.region},
                )
            return bucket_name
        except ClientError as e:
            raise ValueError(f"Failed to create bucket: {str(e)}") from e

    def _upload_to_s3(self, bucket_name, key, payload):
        """Upload payload to S3."""
        s3_client = self._create_s3_client()
        try:
            s3_client.put_object(
                Bucket=bucket_name,
                Key=key,
                Body=payload,
                ContentType='application/json',
            )
        except ClientError as e:
            raise ValueError(f"Failed to upload to S3: {str(e)}") from e

    def _needs_upload(self, payload_size, render_type):
        """Determine if payload needs to be uploaded to S3."""
        # Constants based on AWS Lambda limits with margin for other payload data
        margin = 5_000 + 1024  # 5KB margin + 1KB for webhook data
        max_still_inline_size = 5_000_000 - margin
        max_video_inline_size = 200_000 - margin

        max_size = (
            max_still_inline_size if render_type == 'still' else max_video_inline_size
        )

        if payload_size > max_size:
            # Log warning similar to JavaScript implementation
            logger.warning(
                "Warning: The props are over %sKB (%sKB) in size. Uploading them to S3 to "
                "circumvent AWS Lambda payload size, which may lead to slowdown.",
                round(max_size / 1000),
                ceil(payload_size / 1024),
            )
            return True
        return False

    def _serialize_input_props(self, input_props, render_type):
        """
        Serialize inputProps to a format compatible with Lambda.

        Args:
            input_props (dict): Input properties to be serialized.
            render_type (str): Type of the render (e.g., 'still' or 'video-or-audio').

        Returns:
            dict: Serialized inputProps in either payload or bucket-url format.
        """
        try:
            payload = json.dumps(input_props, separators=(',', ':'))
            payload_size = len(payload.encode('utf-8'))

            if self._needs_upload(payload_size, render_type):
                # Upload to S3 and return bucket-url format
                hash_value = self._generate_hash(payload)
                bucket_name = self._get_or_create_bucket()
                key = self._input_props_key(hash_value)

                self._upload_to_s3(bucket_name, key, payload)

                return {
                    'type': 'bucket-url',
                    'hash': hash_value,
                    'bucketName': bucket_name,
                }
            # Return payload format for smaller payloads
            return {
                'type': 'payload',
                'payload': payload if payload not in ('', 'null') else json.dumps({}),
            }
        except (ValueError, TypeError) as error:
            raise ValueError(
                'Error serializing InputProps. Check for circular '
                + 'references or reduce the object size.'
            ) from error

    def _create_lambda_client(self):
        if self.access_key and self.secret_key and self.region:
            return boto3.client(
                'lambda',
                aws_access_key_id=self.access_key,
                aws_secret_access_key=self.secret_key,
                region_name=self.region,
            )

        return boto3.client('lambda', region_name=self.region)

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
                    objects.append(input_string[start_index : i + 1])

        return objects

    def _parse_stream(self, stream):
        """Parses a stream of concatenated JSON objects."""
        json_objects = self._find_json_objects(stream)
        parsed_objects = [json.loads(obj) for obj in json_objects]
        return parsed_objects

    def _invoke_lambda(self, function_name, payload):

        client = self._create_lambda_client()
        try:
            response = client.invoke(FunctionName=function_name, Payload=payload)
            result = response['Payload'].read().decode('utf-8')
            decoded_result = self._parse_stream(result)[-1]
        except client.exceptions.ResourceNotFoundException as e:
            raise ValueError(f"The function {function_name} does not exist.") from e
        except client.exceptions.InvalidRequestContentException as e:
            raise ValueError("The request content is invalid.") from e
        except client.exceptions.RequestTooLargeException as e:
            raise ValueError("The request payload is too large.") from e
        except client.exceptions.ServiceException as e:
            raise ValueError(f"An internal service error occurred: {str(e)}") from e
        except Exception as e:
            raise ValueError(f"An unexpected error occurred: {str(e)}") from e

        if 'errorMessage' in decoded_result:
            raise ValueError(decoded_result['errorMessage'])

        if 'type' in decoded_result and decoded_result['type'] == 'error':
            raise ValueError(decoded_result['message'])
        if 'type' not in decoded_result or decoded_result['type'] != 'success':
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

    def construct_render_request(
        self,
        render_params: Union[RenderMediaParams, RenderStillParams],
        render_type: RenderType,
    ) -> str:
        """
        Construct a render request in JSON format.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            str: JSON representation of the render request.
        """
        render_params.serve_url = self.serve_url

        render_params.private_serialized_input_props = self._serialize_input_props(
            input_props=render_params.input_props, render_type=render_type
        )

        payload = render_params.serialize_params()
        return json.dumps(payload, default=self._custom_serializer)

    def construct_render_progress_request(
        self,
        render_id: str,
        bucket_name: str,
        log_level="info",
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> str:
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
            log_level=log_level,
            s3_output_provider=s3_output_provider,
        )
        return json.dumps(progress_params.serialize_params())

    def render_media_on_lambda(
        self, render_params: RenderMediaParams
    ) -> Optional[RenderMediaResponse]:
        """
        Render media using AWS Lambda.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            RenderResponse: Response from the render operation.
        """
        params = self.construct_render_request(
            render_params, render_type="video-or-audio"
        )
        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params
        )
        if body_object:
            return RenderMediaResponse(
                body_object['bucketName'], body_object['renderId']
            )

        return None

    def render_still_on_lambda(
        self, render_params: RenderStillParams
    ) -> Optional[RenderStillResponse]:
        """
        Render still using AWS Lambda.

        Args:
            render_params (RenderParams): Render parameters.

        Returns:
            RenderResponse: Response from the render operation.
        """
        params = self.construct_render_request(render_params, render_type='still')

        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params
        )

        if body_object:
            return RenderStillResponse(
                estimated_price=CostsInfo(
                    accrued_so_far=body_object['estimatedPrice']['accruedSoFar'],
                    display_cost=body_object['estimatedPrice']['displayCost'],
                    currency=body_object['estimatedPrice']['currency'],
                    disclaimer=body_object['estimatedPrice']['disclaimer'],
                ),
                url=body_object['output'],
                size_in_bytes=body_object['sizeInBytes'],
                bucket_name=body_object['bucketName'],
                render_id=body_object['renderId'],
                outKey=body_object['outKey'],
            )

        return None

    def get_render_progress(
        self,
        render_id: str,
        bucket_name: str,
        log_level="info",
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> Optional[RenderMediaProgress]:
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
            render_id,
            bucket_name,
            log_level=log_level,
            s3_output_provider=s3_output_provider,
        )
        progress_response = self._invoke_lambda(
            function_name=self.function_name, payload=params
        )
        if progress_response:
            render_progress = RenderMediaProgress()
            render_progress.__dict__.update(progress_response)
            return render_progress
        return None
