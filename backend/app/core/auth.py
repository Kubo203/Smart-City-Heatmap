import logging
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from gotrue import User
from supabase import AsyncClientOptions
from supabase._async.client import AsyncClient, create_client

from app.core.config import settings

logger = logging.getLogger(__name__)

# OAuth2 scheme for token extraction
reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login",
    auto_error=False,
)
TokenDep = Annotated[str | None, Depends(reusable_oauth2)]


async def get_supabase_client() -> AsyncClient:
    """Create and return Supabase async client for user operations"""
    client = await create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_ANON_KEY,
        options=AsyncClientOptions(
            postgrest_client_timeout=10, storage_client_timeout=10
        ),
    )
    if not client:
        raise HTTPException(
            status_code=500, detail="Supabase client not initialized"
        )
    return client


SupabaseClient = Annotated[AsyncClient, Depends(get_supabase_client)]


async def get_supabase_admin_client() -> AsyncClient:
    """Create and return Supabase async client with service role key for admin operations"""
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise HTTPException(
            status_code=500,
            detail="Service role key not configured for admin operations",
        )
    client = await create_client(
        settings.SUPABASE_URL,
        settings.SUPABASE_SERVICE_ROLE_KEY,
        options=AsyncClientOptions(
            postgrest_client_timeout=10, storage_client_timeout=10
        ),
    )
    if not client:
        raise HTTPException(
            status_code=500, detail="Supabase admin client not initialized"
        )
    return client


async def get_current_user(
    token: TokenDep, client: SupabaseClient
) -> User:
    """Get current user from JWT token and validate"""
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        user_response = await client.auth.get_user(jwt=token)
        if not user_response or not user_response.user:
            logger.error("User not found in token")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user_response.user
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


CurrentUser = Annotated[User, Depends(get_current_user)]

