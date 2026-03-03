import logging
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from gotrue.errors import AuthApiError
from supabase._async.client import AsyncClient

from app.core.auth import CurrentUser, SupabaseClient
from app.schemas.auth import (
    AuthResponse,
    GoogleAuthRequest,
    LoginRequest,
    PasswordResetRequest,
    RefreshTokenRequest,
    RegisterRequest,
    TokenResponse,
    UpdatePasswordRequest,
    UserResponse,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["authentication"])


def _create_token_response(session) -> TokenResponse:
    """Helper to create token response from Supabase session"""
    return TokenResponse(
        access_token=session.access_token,
        refresh_token=session.refresh_token,
        expires_in=session.expires_in,
    )


def _create_user_response(user) -> UserResponse:
    """Helper to create user response from Supabase user"""
    return UserResponse(
        id=user.id,
        email=user.email,
        phone=user.phone,
        email_confirmed_at=user.email_confirmed_at,
        phone_confirmed_at=user.phone_confirmed_at,
        confirmed_at=user.confirmed_at,
        last_sign_in_at=user.last_sign_in_at,
        app_metadata=user.app_metadata,
        user_metadata=user.user_metadata,
        identities=user.identities,
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    client: SupabaseClient,
) -> AuthResponse:
    """
    Register a new user with email and password
    """
    try:
        response = await client.auth.sign_up(
            {
                "email": request.email,
                "password": request.password,
                "options": {
                    "data": request.user_metadata or {},
                },
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create user",
            )

        if not response.session:
            # User created but needs email confirmation
            return AuthResponse(
                user=_create_user_response(response.user),
                tokens=TokenResponse(
                    access_token="",
                    refresh_token="",
                ),
            )

        return AuthResponse(
            user=_create_user_response(response.user),
            tokens=_create_token_response(response.session),
        )
    except AuthApiError as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message or "Registration failed",
        )
    except Exception as e:
        logger.error(f"Unexpected registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration",
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    client: SupabaseClient,
) -> AuthResponse:
    """
    Login with email and password
    """
    try:
        response = await client.auth.sign_in_with_password(
            {
                "email": request.email,
                "password": request.password,
            }
        )

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication failed - no session created",
            )

        return AuthResponse(
            user=_create_user_response(response.user),
            tokens=_create_token_response(response.session),
        )
    except AuthApiError as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message or "Invalid email or password",
        )
    except Exception as e:
        logger.error(f"Unexpected login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login",
        )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    client: SupabaseClient,
) -> TokenResponse:
    """
    Refresh access token using refresh token
    """
    try:
        response = await client.auth.refresh_session(
            refresh_token=request.refresh_token
        )

        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        return _create_token_response(response.session)
    except AuthApiError as e:
        logger.error(f"Token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message or "Invalid or expired refresh token",
        )
    except Exception as e:
        logger.error(f"Unexpected token refresh error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during token refresh",
        )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: CurrentUser,
) -> UserResponse:
    """
    Get current authenticated user information
    """
    return _create_user_response(current_user)


@router.post("/logout")
async def logout(
    client: SupabaseClient,
    current_user: CurrentUser,
) -> dict[str, str]:
    """
    Logout the current user
    """
    try:
        await client.auth.sign_out()
        return {"message": "Successfully logged out"}
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        # Even if logout fails, we can still return success
        return {"message": "Logged out"}


@router.post("/reset-password")
async def reset_password(
    request: PasswordResetRequest,
    client: SupabaseClient,
) -> dict[str, str]:
    """
    Send password reset email to user
    """
    try:
        from app.core.config import settings
        
        # Default redirect URL if not provided - use the frontend login URL
        # Note: This should be configured in Supabase dashboard as allowed redirect URL
        # The frontend should pass the redirect_to when calling this endpoint
        redirect_to = request.redirect_to or "http://localhost:3000/login"
        
        await client.auth.reset_password_for_email(
            request.email,
            {
                "redirect_to": redirect_to,
            }
        )
        
        return {
            "message": "Password reset email sent. Please check your inbox."
        }
    except AuthApiError as e:
        logger.error(f"Password reset error: {str(e)}")
        # Don't reveal if email exists or not for security
        return {
            "message": "If an account with that email exists, a password reset link has been sent."
        }
    except Exception as e:
        logger.error(f"Unexpected password reset error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while sending password reset email",
        )


@router.post("/update-password")
async def update_password(
    request: UpdatePasswordRequest,
) -> dict[str, str]:
    """
    Update password using reset token
    Uses Supabase REST API directly with the reset token
    """
    try:
        from app.core.config import settings
        
        # Use Supabase REST API directly to update password with reset token
        async with httpx.AsyncClient() as client:
            response = await client.put(
                f"{settings.SUPABASE_URL}/auth/v1/user",
                headers={
                    "Authorization": f"Bearer {request.access_token}",
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Content-Type": "application/json",
                },
                json={
                    "password": request.password,
                },
                timeout=10.0,
            )
            
            if response.status_code == 200:
                return {
                    "message": "Password updated successfully. You can now sign in with your new password."
                }
            elif response.status_code == 401:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired reset token. Please request a new password reset.",
                )
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {}
                error_message = error_data.get("message", error_data.get("error_description", "Failed to update password"))
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=error_message,
                )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected password update error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating password",
        )


@router.get("/google/authorize")
async def google_authorize(
    redirect_to: str | None = None,
) -> dict[str, str]:
    """
    Get Google OAuth authorization URL
    Returns the URL where the user should be redirected for Google OAuth.
    
    The redirect_to should be your frontend callback URL (e.g., http://localhost:3000/auth/callback)
    that will receive the authorization code from Supabase after Google authentication.
    
    Note: In Google OAuth Console, use:
    - Authorized JavaScript origins: http://localhost:3000 (your frontend)
    - Authorized redirect URIs: https://<your-project>.supabase.co/auth/v1/callback (Supabase's callback)
    """
    from app.core.config import settings

    # Construct the Google OAuth URL using Supabase's OAuth endpoint
    # The redirect_to should be your frontend callback URL
    # Supabase will redirect back to this URL with a code parameter after handling Google OAuth
    redirect_url = redirect_to or "http://localhost:3000/auth/callback"
    auth_url = (
        f"{settings.SUPABASE_URL}/auth/v1/authorize"
        f"?provider=google&redirect_to={redirect_url}"
    )

    return {
        "authorization_url": auth_url,
        "redirect_to": redirect_url,
    }


@router.post("/google/callback", response_model=AuthResponse)
async def google_callback(
    request: GoogleAuthRequest,
    client: SupabaseClient,
) -> AuthResponse:
    """
    Handle Google OAuth callback
    This endpoint should be called after the user authorizes with Google.
    The frontend should send the authorization code received from Supabase.
    """
    try:
        if not request.code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Authorization code is required",
            )

        # Exchange the authorization code for a session
        # The code is obtained from the OAuth redirect callback
        # redirect_to should match the URL used in the authorization request
        response = await client.auth.exchange_code_for_session(
            code=request.code,
            redirect_to=request.redirect_to,
        )

        if not response.user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to authenticate with Google",
            )

        if not response.session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to create session",
            )

        return AuthResponse(
            user=_create_user_response(response.user),
            tokens=_create_token_response(response.session),
        )
    except AuthApiError as e:
        logger.error(f"Google OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=e.message or "Google authentication failed",
        )
    except Exception as e:
        logger.error(f"Unexpected Google OAuth error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during Google authentication",
        )

