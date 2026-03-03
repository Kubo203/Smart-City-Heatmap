# Smart City Heatmap Backend

FastAPI backend with Supabase authentication supporting Email and Google OAuth.

## Setup

1. Install dependencies:
```bash
pip install -e .
# or with uv
uv pip install -e .
```

2. Create a `.env` file in the `backend` directory (see `.env.example`):
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PROJECT_NAME=Smart City Heatmap API
ENVIRONMENT=local
SECRET_KEY=your-secret-key-here
BACKEND_CORS_ORIGINS=http://localhost:5173
API_V1_STR=/api/v1
```

3. Run the server:
```bash
python -m app.main
# or
uvicorn app.main:app --reload
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/register` - Register a new user with email/password
- `POST /api/v1/auth/login` - Login with email/password
- `POST /api/v1/auth/refresh` - Refresh access token
- `GET /api/v1/auth/me` - Get current user information (requires authentication)
- `POST /api/v1/auth/logout` - Logout current user
- `GET /api/v1/auth/google/authorize` - Get Google OAuth authorization URL
- `POST /api/v1/auth/google/callback` - Handle Google OAuth callback

## Supabase Configuration

1. Create a Supabase project at https://supabase.com
2. Enable Email and Google providers in Authentication settings
3. Configure Google OAuth in Supabase Dashboard:
   - Go to Authentication > Providers > Google
   - Add your Google OAuth credentials
   - Set redirect URLs

## Development

The API documentation is available at:
- Swagger UI: `http://localhost:8000/api/v1/docs`
- ReDoc: `http://localhost:8000/api/v1/redoc`

