# pylint: disable=too-many-arguments, too-many-positional-arguments
"""Awaitable client for rendering with Remotion Lambda."""
import asyncio
from typing import Any, Dict, List, Optional, Union

from boto3.session import Session
from botocore.config import Config

from .models import (
    CustomCredentials,
    RenderMediaParams,
    RenderMediaProgress,
    RenderMediaResponse,
    RenderStillParams,
    RenderStillResponse,
    RenderType,
    VideoConfig,
)
from .remotionclient import RemotionClient


class AsyncRemotionClient:
    """Run RemotionClient operations without blocking the asyncio event loop."""

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
        """Accept the same configuration and credentials as RemotionClient."""
        self._client = RemotionClient(
            region=region,
            serve_url=serve_url,
            function_name=function_name,
            access_key=access_key,
            secret_key=secret_key,
            force_path_style=force_path_style,
            session=session,
            config=config,
        )

    async def construct_render_request(
        self,
        render_params: Union[RenderMediaParams, RenderStillParams],
        render_type: RenderType,
    ) -> str:
        """Construct a render request, including any required S3 uploads."""
        return await asyncio.get_running_loop().run_in_executor(
            None, self._client.construct_render_request, render_params, render_type
        )

    async def construct_render_progress_request(
        self,
        render_id: str,
        bucket_name: str,
        log_level: str = "info",
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> str:
        """Construct a render progress request in JSON format."""
        return await asyncio.get_running_loop().run_in_executor(
            None,
            self._client.construct_render_progress_request,
            render_id,
            bucket_name,
            log_level,
            s3_output_provider,
        )

    async def construct_get_compositions_request(
        self,
        input_props: Optional[Dict[str, Any]] = None,
        env_variables: Optional[Dict[str, str]] = None,
        chromium_options: Optional[Dict[str, Any]] = None,
        log_level: str = "info",
        force_bucket_name: Optional[str] = None,
        timeout_in_milliseconds: int = 30000,
        offthread_video_cache_size_in_bytes: Optional[int] = None,
        media_cache_size_in_bytes: Optional[int] = None,
        preferred_effect_backend: Optional[str] = None,
    ) -> str:
        """Construct a compositions request, including any required S3 uploads."""
        return await asyncio.get_running_loop().run_in_executor(
            None,
            self._client.construct_get_compositions_request,
            input_props,
            env_variables,
            chromium_options,
            log_level,
            force_bucket_name,
            timeout_in_milliseconds,
            offthread_video_cache_size_in_bytes,
            media_cache_size_in_bytes,
            preferred_effect_backend,
        )

    async def get_compositions_on_lambda(
        self,
        input_props: Optional[Dict[str, Any]] = None,
        env_variables: Optional[Dict[str, str]] = None,
        chromium_options: Optional[Dict[str, Any]] = None,
        log_level: str = "info",
        force_bucket_name: Optional[str] = None,
        timeout_in_milliseconds: int = 30000,
        offthread_video_cache_size_in_bytes: Optional[int] = None,
        media_cache_size_in_bytes: Optional[int] = None,
        preferred_effect_backend: Optional[str] = None,
    ) -> Optional[List[VideoConfig]]:
        """Get the compositions in the deployed project without blocking the event loop."""
        return await asyncio.get_running_loop().run_in_executor(
            None,
            self._client.get_compositions_on_lambda,
            input_props,
            env_variables,
            chromium_options,
            log_level,
            force_bucket_name,
            timeout_in_milliseconds,
            offthread_video_cache_size_in_bytes,
            media_cache_size_in_bytes,
            preferred_effect_backend,
        )

    async def render_media_on_lambda(
        self, render_params: RenderMediaParams
    ) -> Optional[RenderMediaResponse]:
        """Start a media render and return its render ID and bucket name."""
        return await asyncio.get_running_loop().run_in_executor(
            None, self._client.render_media_on_lambda, render_params
        )

    async def render_still_on_lambda(
        self, render_params: RenderStillParams
    ) -> Optional[RenderStillResponse]:
        """Render a still and return its output information."""
        return await asyncio.get_running_loop().run_in_executor(
            None, self._client.render_still_on_lambda, render_params
        )

    async def get_render_progress(
        self,
        render_id: str,
        bucket_name: str,
        log_level: str = "info",
        s3_output_provider: Optional[CustomCredentials] = None,
    ) -> Optional[RenderMediaProgress]:
        """Get the progress of a media render."""
        return await asyncio.get_running_loop().run_in_executor(
            None,
            self._client.get_render_progress,
            render_id,
            bucket_name,
            log_level,
            s3_output_provider,
        )

    async def cancel_render_on_lambda(self, render_id: str, bucket_name: str) -> None:
        """Cancel a render started with enable_cancellation=True."""
        await asyncio.get_running_loop().run_in_executor(
            None, self._client.cancel_render_on_lambda, render_id, bucket_name
        )
