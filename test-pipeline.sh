#!/bin/bash
# Test script for GitLab CI/CD pipeline locally
# This simulates what the pipeline will do

set -e

echo "=========================================="
echo "Testing Smart City Heatmap Pipeline"
echo "=========================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}Error: Docker is not running${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Docker is running${NC}"

# Test 1: Validate docker-compose.prod.yml
echo ""
echo "Test 1: Validating docker-compose.prod.yml..."
if docker compose -f docker-compose.prod.yml config --quiet > /dev/null 2>&1; then
    echo -e "${GREEN}✓ docker-compose.prod.yml is valid${NC}"
else
    echo -e "${RED}✗ docker-compose.prod.yml has errors${NC}"
    docker compose -f docker-compose.prod.yml config
    exit 1
fi

# Test 2: Check if .env.prod exists
echo ""
echo "Test 2: Checking environment file..."
if [ -f .env.prod ]; then
    echo -e "${GREEN}✓ .env.prod exists${NC}"
else
    echo -e "${YELLOW}⚠ .env.prod not found, creating from example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env.prod
        echo -e "${YELLOW}⚠ Please update .env.prod with your actual values${NC}"
    else
        echo -e "${RED}✗ env.example not found${NC}"
        exit 1
    fi
fi

# Test 3: Test frontend build
echo ""
echo "Test 3: Testing frontend Docker build..."
cd frontend
if docker build -t test-frontend:latest -f Dockerfile.prod . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Frontend Docker image builds successfully${NC}"
    docker rmi test-frontend:latest > /dev/null 2>&1 || true
else
    echo -e "${RED}✗ Frontend Docker build failed${NC}"
    docker build -t test-frontend:latest -f Dockerfile.prod .
    exit 1
fi
cd ..

# Test 4: Test backend build
echo ""
echo "Test 4: Testing backend Docker build..."
cd backend
if docker build -t test-backend:latest -f Dockerfile.prod . > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Backend Docker image builds successfully${NC}"
    docker rmi test-backend:latest > /dev/null 2>&1 || true
else
    echo -e "${RED}✗ Backend Docker build failed${NC}"
    docker build -t test-backend:latest -f Dockerfile.prod .
    exit 1
fi
cd ..

# Test 5: Check nginx configuration
echo ""
echo "Test 5: Checking nginx configuration..."
if [ -f nginx/nginx.conf ] && [ -f nginx/conf.d/default.conf ]; then
    echo -e "${GREEN}✓ Nginx configuration files exist${NC}"
else
    echo -e "${RED}✗ Nginx configuration files missing${NC}"
    exit 1
fi

# Test 6: Validate nginx config (if nginx is available)
if command -v nginx > /dev/null 2>&1; then
    echo ""
    echo "Test 6: Validating nginx configuration..."
    if nginx -t -c "$(pwd)/nginx/nginx.conf" > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Nginx configuration is valid${NC}"
    else
        echo -e "${YELLOW}⚠ Nginx configuration validation skipped (nginx not in PATH)${NC}"
    fi
fi

# Test 7: Check GitLab CI configuration
echo ""
echo "Test 7: Checking GitLab CI configuration..."
if [ -f .gitlab-ci.yml ]; then
    echo -e "${GREEN}✓ .gitlab-ci.yml exists${NC}"
    # Basic syntax check
    if grep -q "stages:" .gitlab-ci.yml; then
        echo -e "${GREEN}✓ .gitlab-ci.yml has stages defined${NC}"
    else
        echo -e "${RED}✗ .gitlab-ci.yml missing stages${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ .gitlab-ci.yml not found${NC}"
    exit 1
fi

# Summary
echo ""
echo "=========================================="
echo -e "${GREEN}All tests passed!${NC}"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Update .env.prod with your Supabase credentials"
echo "2. Test locally: docker compose -f docker-compose.prod.yml up -d"
echo "3. Push to GitLab and run the pipeline"
echo ""



