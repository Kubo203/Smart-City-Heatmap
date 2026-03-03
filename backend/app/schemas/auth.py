from datetime import datetime
from typing import Any

from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    """Response model for authentication tokens"""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int | None = None


class UserResponse(BaseModel):
    """Response model for user information"""

    id: str
    email: str | None = None
    phone: str | None = None
    email_confirmed_at: datetime | str | None = None
    phone_confirmed_at: datetime | str | None = None
    confirmed_at: datetime | str | None = None
    last_sign_in_at: datetime | str | None = None
    app_metadata: dict | None = None
    user_metadata: dict | None = None
    identities: list[Any] | None = None
    created_at: datetime | str | None = None
    updated_at: datetime | str | None = None


class LoginRequest(BaseModel):
    """Request model for email/password login"""

    email: EmailStr
    password: str


class RegisterRequest(BaseModel):
    """Request model for email/password registration"""

    email: EmailStr
    password: str
    user_metadata: dict | None = None


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh"""

    refresh_token: str


class AuthResponse(BaseModel):
    """Response model for authentication operations"""

    user: UserResponse
    tokens: TokenResponse


class GoogleAuthRequest(BaseModel):
    """Request model for Google OAuth"""

    code: str | None = None
    redirect_to: str | None = None


class PasswordResetRequest(BaseModel):
    """Request model for password reset"""

    email: EmailStr
    redirect_to: str | None = None


class UpdatePasswordRequest(BaseModel):
    """Request model for updating password with reset token"""

    password: str
    access_token: str

