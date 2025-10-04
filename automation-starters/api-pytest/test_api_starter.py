import pytest
import requests
import json
from typing import Dict, Any
from dataclasses import dataclass

# Configuration
@dataclass
class TestConfig:
    base_url: str = "http://localhost:3001"
    
    # Test user credentials
    analyst_email: str = "analyst@test.com"
    analyst_password: str = "TestPass123!"
    admin_email: str = "admin@test.com"
    admin_password: str = "AdminPass123!"

config = TestConfig()

# Fixtures
@pytest.fixture(scope="session")
def session():
    """Create a requests session for reuse"""
    session = requests.Session()
    session.headers.update({
        "Content-Type": "application/json",
        "Accept": "application/json"
    })
    return session

@pytest.fixture
def analyst_token(session):
    """Get authentication token for analyst user"""
    login_data = {
        "email": config.analyst_email,
        "password": config.analyst_password
    }
    
    response = session.post(
        f"{config.base_url}/api/v1/auth/login",
        json=login_data
    )
    
    assert response.status_code == 200, f"Login failed: {response.text}"
    token = response.json()["token"]
    return token

@pytest.fixture
def auth_headers(analyst_token):
    """Create authorization headers with analyst token"""
    return {"Authorization": f"Bearer {analyst_token}"}

# Helper Functions
def validate_uuid(uuid_string: str) -> bool:
    """Validate if string is a valid UUID"""
    try:
        import uuid
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

# Example Tests - Expand these for your assignment

class TestAuthentication:
    
    def test_valid_login_returns_token(self, session):
        """Example: Valid credentials should return JWT token"""
        login_data = {
            "email": config.analyst_email,
            "password": config.analyst_password
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/auth/login",
            json=login_data
        )
        
        # Add your assertions here
        assert response.status_code == 200
        data = response.json()
        assert "token" in data
        assert "user" in data
        
        # TODO: Add more comprehensive validation
        # - Verify user data structure
        # - Validate JWT token format
        # - Check expiration time


class TestQuestionAnswerAPI:
    
    def test_submit_question_example(self, session, auth_headers):
        """Example: Submit question and get job ID"""
        question_data = {
            "question": "What are the Scope 1 emissions for this company?",
            "company": "Nokia"
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        # Add your assertions here
        assert response.status_code == 202
        data = response.json()
        assert "jobId" in data
        
        # TODO: Expand this test
        # - Validate job ID format
        # - Check response structure
        # - Test different question types


# TODO: Add more test classes
# class TestFileUpload:
#     pass
# 
# class TestNegativeScenarios:
#     pass
# 
# class TestPerformance:
#     pass

if __name__ == "__main__":
    pytest.main([__file__, "-v"])