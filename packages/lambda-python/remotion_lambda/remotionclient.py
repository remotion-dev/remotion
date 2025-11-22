# pylint: disable=too-few-public-methods, missing-module-docstring, broad-exception-caught
import logging
from dataclasses import asdict
import random
import json
import hashlib
from math import ceil
from typing import Optional, Union, List, Dict, Any
from enum import Enum
import warnings
from boto3.session import Session # Explicitly import Session
from botocore.config import Config
from botocore.exceptions import ClientError, ParamValidationError
from botocore.response import StreamingBody # For Lambda payload

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

from .exception import (
    RemotionException,
    RemotionInvalidArgumentException,
    RemotionRenderingOutputError
)


logger = logging.getLogger(__name__)

BUCKET_NAME_PREFIX = 'remotionlambda-'
REGION_US_EAST = 'us-east-1'

 # pylint: disable=too-many-arguments
class RemotionClient:
    """A client for interacting with the Remotion service."""
     # pylint: disable=too-many-instance-attributes
    def __init__(
        self,
        region: str,
        serve_url: str,
        function_name: str,
        access_key: Optional[str] = None,
        secret_key: Optional[str] = None,
        force_path_style: bool = False,
        session: Optional[Session] = None,
        config: Optional[Config] = None,
    ):
        """
        Initialize the RemotionClient.

        Parameters
        ----------
        region : str
            AWS region name (e.g., 'us-east-1')
        serve_url : str
            URL for the Remotion service endpoint
        function_name : str
            Name of the AWS Lambda function to invoke
        access_key : Optional[str], deprecated
            **DEPRECATED** - AWS access key ID. Use `session` instead.
            Will be removed in version 5.0.0.
        secret_key : Optional[str], deprecated
            **DEPRECATED** - AWS secret access key. Use `session` instead.
            Will be removed in version 5.0.0.
        force_path_style : bool, default=False
            Force path-style S3 URLs instead of virtual-hosted-style
        config : Optional[Config]
            Custom botocore configuration object
        session : Optional[Session]
            Pre-configured boto3 Session object (recommended for authentication)

        Raises
        ------
        RemotionInvalidArgumentException
            If required parameters are missing or invalid combinations are provided

        Warnings
        --------
        .. deprecated:: 4.0.377
            Parameters `access_key` and `secret_key` are deprecated.
            Use `session` instead for improved security and flexibility.

        Examples
        --------
        Recommended usage with session:

        >>> import boto3
        >>> session = boto3.Session(profile_name='production')
        >>> client = RemotionClient(
        ...     region='us-east-1',
        ...     serve_url='https://api.example.com',
        ...     function_name='my-function',
        ...     session=session
        ... )

        Using STS AssumeRole for cross-account or temporary credentials:

        >>> import boto3
        >>>
        >>> # Create STS client using your base credentials
        >>> sts_client = boto3.client('sts')
        >>>
        >>> # Assume a role (cross-account or for temporary elevated permissions)
        >>> assumed_role = sts_client.assume_role(
        ...     RoleArn='arn:aws:iam::123456789012:role/RemotionRenderRole',
        ...     RoleSessionName='remotion-render-session',
        ...     DurationSeconds=3600  # Optional: 1 hour (default is 1 hour, max depends on role)
        ... )
        >>>
        >>> # Extract temporary credentials from the response
        >>> credentials = assumed_role['Credentials']
        >>>
        >>> # Create a session with the temporary credentials
        >>> session = boto3.Session(
        ...     aws_access_key_id=credentials['AccessKeyId'],
        ...     aws_secret_access_key=credentials['SecretAccessKey'],
        ...     aws_session_token=credentials['SessionToken'],
        ...     region_name='us-east-1'
        ... )
        >>>
        >>> # Use the session with RemotionClient
        >>> client = RemotionClient(
        ...     region='us-east-1',
        ...     serve_url='https://api.example.com',
        ...     function_name='my-function',
        ...     session=session
        ... )

        Using custom config with timeouts and retries:

        >>> from botocore.config import Config
        >>> import boto3
        >>>
        >>> config = Config(
        ...     connect_timeout=5,
        ...     read_timeout=30,
        ...     retries={'max_attempts': 3, 'mode': 'adaptive'}
        ... )
        >>> session = boto3.Session(profile_name='production')
        >>> client = RemotionClient(
        ...     region='us-east-1',
        ...     serve_url='https://api.example.com',
        ...     function_name='my-function',
        ...     session=session,
        ...     config=config
        ... )

        Legacy usage (deprecated):

        >>> client = RemotionClient(
        ...     region='us-east-1',
        ...     serve_url='https://api.example.com',
        ...     function_name='my-function',
        ...     access_key='AKIA...',
        ...     secret_key='secret...'
        ... )
        """
       # Validate required parameters at construction time
        if not region or not region.strip():
            raise RemotionInvalidArgumentException("'region' parameter is required and cannot be empty or whitespace")
        if not serve_url or not serve_url.strip():
            raise RemotionInvalidArgumentException("'serve_url' parameter is required and cannot be empty or whitespace")
        if not function_name or not function_name.strip():
            raise RemotionInvalidArgumentException("'function_name' parameter is required and cannot be empty or whitespace")


        # Check for conflicting authentication methods
        if session and (access_key or secret_key):
            raise RemotionInvalidArgumentException(
                "Cannot specify both 'session' and explicit credentials "
                "('access_key'/'secret_key'). Please use only 'session'."
            )

        # Handle deprecated credential parameters
        if access_key is not None or secret_key is not None:
            warnings.warn(
                "Parameters 'access_key' and 'secret_key' are deprecated "
                "as of version 4.0.376 and will be removed in version 5.0.0. "
                "Please migrate to using 'session' for improved security. ",
                DeprecationWarning,
                stacklevel=2,
            )
            # Validate both keys are provided together
            if access_key and not secret_key:
                raise RemotionInvalidArgumentException("'secret_key' must be provided when 'access_key' is specified")
            if secret_key and not access_key:
                raise RemotionInvalidArgumentException("'access_key' must be provided when 'secret_key' is specified")

            # Create session from deprecated credentials
            self.session = Session(
                aws_access_key_id=access_key,
                aws_secret_access_key=secret_key,
                region_name=region,
            )
        elif session:
            # Use provided session
            self.session = session
        else:
            # Create default session (uses credential chain)
            self.session = Session(region_name=region)

        # Store configuration
        self.region = region.strip()
        self.serve_url = serve_url.strip().rstrip('/')
        self.function_name = function_name.strip()
        self.force_path_style = force_path_style
        self.config = config or Config()  # Provide default empty config

    def _generate_hash(self, payload: str) -> str: # Added type hints
        """Generate a hash for the payload."""
        return hashlib.sha256(payload.encode('utf-8')).hexdigest()

    def _generate_random_hash(self) -> str: # Added type hint
        """Generate a random hash for bucket operations."""
        alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
        return ''.join(random.choice(alphabet) for _ in range(10))

    def _make_bucket_name(self) -> str: # Added type hint
        """Generate a bucket name following Remotion conventions."""
        # Use the same logic as JS SDK: prefix + region without dashes + random hash
        region_no_dashes = self.region.replace('-', '')
        random_suffix = self._generate_random_hash()
        return f"{BUCKET_NAME_PREFIX}{region_no_dashes}-{random_suffix}"

    def _input_props_key(self, hash_value: str) -> str: # Added type hint
        """Generate S3 key for input props."""
        return f"input-props/{hash_value}.json"

    def _create_boto_client(self, service_name: str) -> Any:
        """
        Creates a boto3 client for the specified service, applying custom
        configuration and credentials if provided.
        """
        # Start with required args
        client_kwargs: Dict[str, Any] = {'region_name': self.region}

        # Handle config
        current_config = self.config

        if service_name == 's3' and self.force_path_style:
            s3_config = Config(s3={'addressing_style': 'path'})
            if current_config:
                current_config = current_config.merge(s3_config)
            else:
                current_config = s3_config


        # Add config only if it's not None
        if current_config:
            client_kwargs['config'] = current_config

        return self.session.client(service_name, **client_kwargs)  # type: ignore[call-overload]

    def _create_s3_client(self) -> Any: # Returns an S3 client type
        """Creates and returns a boto3 S3 client."""
        return self._create_boto_client('s3')

    def _get_remotion_buckets(self) -> List[str]:
        """
        Retrieves a list of Remotion-related S3 buckets in the current region.
        """
        s3_client = self._create_s3_client()
        # The exact type of s3_client is difficult to constrain without using boto3-stubs
        # and more specific type hints for S3Client.
        # For this method, we rely on duck-typing `list_buckets`.

        try:
            # Type hint for the response from list_buckets
            response: Dict[str, Any] = s3_client.list_buckets()
        except ClientError as e:
            raise e
        except ParamValidationError as e:
            logger.warning("Could not list S3 buckets due to parameter validation error: %s", e)
            return []

        remotion_buckets: List[str] = []

        # Iterate through buckets, ensuring 'Name' is present
        for bucket_info in response.get('Buckets', []):
            if not isinstance(bucket_info, dict) or 'Name' not in bucket_info:
                logger.debug("Skipping malformed bucket info: %s", bucket_info)
                continue
            bucket_name: str = bucket_info['Name']

            if not bucket_name.startswith(BUCKET_NAME_PREFIX):
                continue

            if self._is_bucket_in_current_region(s3_client, bucket_name):
                remotion_buckets.append(bucket_name)

        return remotion_buckets

    def _is_bucket_in_current_region(self, s3_client: Any, bucket_name: str) -> bool:
        """
        Checks if a given S3 bucket is located in the client's configured region.
        """
        try:
            # Type hint for the response from get_bucket_location
            bucket_region_response: Dict[str, Any] = s3_client.get_bucket_location(Bucket=bucket_name)
            location: Optional[str] = bucket_region_response.get('LocationConstraint')

            # us-east-1 returns None for LocationConstraint
            return location == self.region or (
                location is None and self.region == REGION_US_EAST
            )
        except ClientError as e:
            logger.debug(
                "Could not get bucket location for %s (possibly permission issue): %s",
                bucket_name,
                e,
            )
            raise e
        except ParamValidationError as e:
            raise RemotionInvalidArgumentException(
                f"Invalid S3 client parameters for get_bucket_location: {e}"
            ) from e

    def _get_or_create_bucket(self) -> str:
        """Get existing bucket or create a new one following JS SDK logic."""
        buckets = self._get_remotion_buckets()

        if len(buckets) > 1:
            raise RemotionException(
                f"You have multiple buckets ({', '.join(buckets)}) in your S3 region "
                f"({self.region}) starting with \"remotionlambda-\". "
                "Please see https://remotion.dev/docs/lambda/multiple-buckets."
            )

        if len(buckets) == 1:
            return buckets[0]

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
            raise e
        except ParamValidationError as e:
            raise RemotionInvalidArgumentException(
                f"Invalid S3 client parameters for create_bucket: {e}"
            ) from e

    def _upload_to_s3(self, bucket_name: str, key: str, payload: str) -> None: # Added type hints
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
            raise e
        except ParamValidationError as e:
            raise RemotionInvalidArgumentException(
                f"Invalid S3 client parameters for put_object: {e}"
            ) from e

    def _needs_upload(self, payload_size: int, render_type: RenderType) -> bool: # Added type hints
        """Determine if payload needs to be uploaded to S3."""
        margin = 5_000 + 1024  # 5KB margin + 1KB for webhook data
        max_still_inline_size = 5_000_000 - margin
        max_video_inline_size = 200_000 - margin

        # Using RenderType Enum for comparison
        max_size = (
            max_still_inline_size if render_type == 'still' else max_video_inline_size
        )

        if payload_size > max_size:
            logger.warning(
                "Warning: The props are over %sKB (%sKB) in size. Uploading them to S3 to "
                "circumvent AWS Lambda payload size, which may lead to slowdown.",
                round(max_size / 1000),
                ceil(payload_size / 1024),
            )
            return True
        return False

    def _serialize_input_props(self, input_props: Optional[Dict[str, Any]], render_type: RenderType) -> Dict[str, Any] : # Added type hints
        """
        Serialize inputProps to a format compatible with Lambda.

        Args:
            input_props (dict): Input properties to be serialized.
            render_type (RenderType): Type of the render (e.g., 'still' or 'video-or-audio').

        Returns:
            dict: Serialized inputProps in either payload or bucket-url format.
        """
        try:
            payload = json.dumps(input_props, separators=(',', ':'))
            payload_size = len(payload.encode('utf-8'))

            if self._needs_upload(payload_size, render_type):
                hash_value = self._generate_hash(payload)
                bucket_name = self._get_or_create_bucket()
                key = self._input_props_key(hash_value)

                self._upload_to_s3(bucket_name, key, payload)

                return {
                    'type': 'bucket-url',
                    'hash': hash_value,
                    'bucketName': bucket_name,
                }
            return {
                'type': 'payload',
                'payload': payload if payload not in ('', 'null') else json.dumps({}),
            }
        except (TypeError, OverflowError) as error:
            raise RemotionInvalidArgumentException(
                'Error serializing InputProps. Check for circular '
                + 'references or invalid data types in the input properties.'
            ) from error
        except ClientError as e:
            raise e

    def _create_lambda_client(self) -> Any: # Returns a Lambda client type
        """Creates and returns a boto3 Lambda client."""
        return self._create_boto_client('lambda')

    def _find_json_objects(self, input_string: str) -> List[str]: # Added type hints
        """Finds and returns a list of complete JSON object strings."""
        objects: List[str] = []
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

    def _parse_stream(self, stream: str) -> List[Dict[str, Any]]: # Added type hints
        """Parses a stream of concatenated JSON objects."""
        json_objects = self._find_json_objects(stream)
        parsed_objects: List[Dict[str, Any]] = []
        for obj_str in json_objects: # Renamed obj to obj_str to avoid confusion with parsed obj
            try:
                parsed_objects.append(json.loads(obj_str))
            except json.JSONDecodeError as e:
                logger.error("Failed to decode JSON object from stream: %s", obj_str)
                raise RemotionException(
                    f"Failed to parse Lambda response stream: {e}"
                ) from e
        return parsed_objects

    def _invoke_lambda(self, function_name: str, payload: str) -> Dict[str, Any]: # Added type hints
        """Invokes the Remotion Lambda function and parses its response."""
        client = self._create_lambda_client()
        result_raw: Optional[str] = None # Renamed to avoid confusion with `decoded_result`
        decoded_result: Dict[str, Any] = {}

        try:
            # boto3.client('lambda').invoke returns a dictionary.
            # 'Payload' is a StreamingBody object.
            response: Dict[str, Any] = client.invoke(FunctionName=function_name, Payload=payload)
            streaming_body: StreamingBody = response['Payload']
            result_raw = streaming_body.read().decode('utf-8')
            parsed_results = self._parse_stream(result_raw)
            decoded_result = parsed_results[-1] if parsed_results else {}
        except ClientError as e:
            raise e
        except ParamValidationError as e:
            raise RemotionInvalidArgumentException(
                f"Invalid Lambda invocation parameters: {e}"
            ) from e
        except json.JSONDecodeError as e:
            raise RemotionException(
                f"Failed to decode final Lambda response: {e}. Raw response: {result_raw}"
            ) from e
        except UnicodeDecodeError as e:
            raise RemotionException(
                f"Failed to decode Lambda response payload: {e}"
            ) from e

        if 'errorMessage' in decoded_result:
            raise RemotionRenderingOutputError(
                f"Lambda function returned an error: {decoded_result['errorMessage']}"
            )

        if 'type' in decoded_result and decoded_result['type'] == 'error':
            raise RemotionRenderingOutputError(
                f"Remotion rendering error: {decoded_result['message']}"
            )
        if 'type' not in decoded_result or decoded_result['type'] != 'success':
            raise RemotionRenderingOutputError(
                f"Unexpected Lambda response format: {result_raw}"
            )

        return decoded_result

    def _custom_serializer(self, obj: Any) -> Any: # Added type hints
        """A custom JSON serializer that handles enums and objects."""
        if isinstance(obj, Enum):
            return obj.value if hasattr(obj, 'value') else obj.name
        # Check if it's a dataclass instance before calling asdict
        # This often works better with mypy than just a try-except.
        if hasattr(obj, '__dataclass_fields__'):
            return asdict(obj)
        if hasattr(obj, '__dict__'):
            return obj.__dict__
        if hasattr(obj, '__iter__') and not isinstance(obj, (str, bytes, bytearray)):
            return list(obj)

        raise TypeError(
            f"Object of type {obj.__class__.__name__} is not JSON serializable"
        )

    def construct_render_request(
        self,
        render_params: Union[RenderMediaParams, RenderStillParams],
        render_type: RenderType,
    ) -> str:
        """
        Construct a render request in JSON format.

        Args:
            render_params (Union[RenderMediaParams, RenderStillParams]): Render parameters.
            render_type (RenderType): The type of render (video-or-audio or still).

        Returns:
            str: JSON representation of the render request.
        """
        render_params.serve_url = self.serve_url

        try:
            # Assuming RenderMediaParams and RenderStillParams both have an input_props attribute
            # and a private_serialized_input_props attribute (even if Optional)
            render_params.private_serialized_input_props = self._serialize_input_props(
                input_props=render_params.input_props, render_type=render_type
            )
        except (RemotionInvalidArgumentException, ClientError) as e:
            raise RemotionInvalidArgumentException(
                f"Failed to serialize input properties for rendering: {e}"
            ) from e

        # Ensure serialize_params method in models.py is typed to return Dict[str, Any]
        payload: Dict[str, Any] = render_params.serialize_params()
        try:
            return json.dumps(payload, default=self._custom_serializer)
        except (TypeError, OverflowError) as e:
            raise RemotionInvalidArgumentException(
                f"Failed to serialize render parameters to JSON: {e}"
            ) from e

    def construct_render_progress_request(
        self,
        render_id: str,
        bucket_name: str,
        log_level: str = "info", # Added type hint
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> str:
        """
        Construct a render progress request in JSON format.

        Args:
            render_id (str): ID of the render.
            bucket_name (str): Name of the bucket.
            log_level (str): Log level ("error", "warning", "info", "verbose").
            s3_output_provider (Optional[CustomCredentials]): Custom S3 credentials.

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
        try:
            # Ensure serialize_params method in models.py is typed to return Dict[str, Any]
            return json.dumps(progress_params.serialize_params())
        except (TypeError, OverflowError) as e:
            raise RemotionInvalidArgumentException(
                f"Failed to serialize progress parameters to JSON: {e}"
            ) from e

    def render_media_on_lambda(
        self, render_params: RenderMediaParams
    ) -> Optional[RenderMediaResponse]:
        """
        Render media using AWS Lambda.

        Args:
            render_params (RenderMediaParams): Render parameters.

        Returns:
            Optional[RenderMediaResponse]: Response from the render operation, or None if no body object.
        """
        params_json_str = self.construct_render_request(
            render_params, render_type='video-or-audio' # Using Enum member
        )
        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params_json_str
        )
        if body_object:
            return RenderMediaResponse(
                bucket_name=body_object['bucketName'], render_id=body_object['renderId']
            )

        return None

    def render_still_on_lambda(
        self, render_params: RenderStillParams
    ) -> Optional[RenderStillResponse]:
        """
        Render still using AWS Lambda.

        Args:
            render_params (RenderStillParams): Render parameters.

        Returns:
            Optional[RenderStillResponse]: Response from the render operation, or None if no body object.
        """
        params_json_str = self.construct_render_request(render_params, render_type='still') # Using Enum member

        body_object = self._invoke_lambda(
            function_name=self.function_name, payload=params_json_str
        )

        if body_object:
            # Type hinting for estimatedPrice, as it's a nested dict
            estimated_price_data: Dict[str, Any] = body_object.get('estimatedPrice', {})
            return RenderStillResponse(
                estimated_price=CostsInfo(
                    accrued_so_far=estimated_price_data.get('accruedSoFar', 0.0), # Use .get with defaults
                    display_cost=estimated_price_data.get('displayCost', ''),
                    currency=estimated_price_data.get('currency', ''),
                    disclaimer=estimated_price_data.get('disclaimer', ''),
                ),
                url=body_object.get('output', ''),
                size_in_bytes=body_object.get('sizeInBytes', 0),
                bucket_name=body_object.get('bucketName', ''),
                render_id=body_object.get('renderId', ''),
                outKey=body_object.get('outKey', ''),
            )

        return None

    def get_render_progress(
        self,
        render_id: str,
        bucket_name: str,
        log_level: str = "info", # Added type hint
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> Optional[RenderMediaProgress]:
        """
        Get the progress of a render.

        Args:
            render_id (str): ID of the render.
            bucket_name (str): Name of the bucket.
            log_level (str): Log level ("error", "warning", "info", "verbose").
            s3_output_provider (Optional[CustomCredentials]): Custom S3 credentials.

        Returns:
            Optional[RenderMediaProgress]: Progress of the render, or None if no progress response.
        """
        params_json_str = self.construct_render_progress_request(
            render_id,
            bucket_name,
            log_level=log_level,
            s3_output_provider=s3_output_provider,
        )
        progress_response_data = self._invoke_lambda(
            function_name=self.function_name, payload=params_json_str
        )
        if progress_response_data:
            render_progress = RenderMediaProgress()
            # Ensure RenderMediaProgress expects a dictionary for __dict__.update()
            # and that all keys match its fields, or handle gracefully.
            render_progress.__dict__.update(progress_response_data)
            return render_progress
        return None
