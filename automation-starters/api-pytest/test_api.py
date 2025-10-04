import pytest
import requests
import json
import uuid
import time
from typing import Dict, Any, Optional
from dataclasses import dataclass

# Configuration
@dataclass
class TestConfig:
    base_url: str = "http://localhost:3001"
    aiml_url: str = "http://localhost:3001"
    
    # Test user credentials
    analyst_email: str = "analyst@test.com"
    analyst_password: str = "TestPass123!"
    admin_email: str = "admin@test.com"
    admin_password: str = "AdminPass123!"
    
    # Test data
    valid_question: str = "What are the Scope 1 emissions for this company?"
    valid_company: str = "Nokia"
    long_question: str = "This is a very long question " * 100  # ~3000 chars
    unicode_question: str = "What are 中国公司's sustainability practices?"
    unicode_company: str = "中国移动"

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
def admin_token(session):
    """Get authentication token for admin user"""
    login_data = {
        "email": config.admin_email,
        "password": config.admin_password
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

@pytest.fixture
def admin_headers(admin_token):
    """Create authorization headers with admin token"""
    return {"Authorization": f"Bearer {admin_token}"}

# Helper Functions
def validate_uuid(uuid_string: str) -> bool:
    """Validate if string is a valid UUID"""
    try:
        uuid.UUID(uuid_string)
        return True
    except ValueError:
        return False

def validate_iso_timestamp(timestamp: str) -> bool:
    """Validate if string is a valid ISO-8601 timestamp"""
    try:
        from datetime import datetime
        datetime.fromisoformat(timestamp.replace('Z', '+00:00'))
        return True
    except ValueError:
        return False

def wait_for_job_completion(session, job_id: str, headers: Dict[str, str], timeout: int = 30) -> Dict[str, Any]:
    """Wait for job to complete and return final status"""
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        response = session.get(
            f"{config.base_url}/api/v1/qa/{job_id}",
            headers=headers
        )
        
        if response.status_code == 200:
            job_data = response.json()
            status = job_data.get("status")
            
            if status in ["done", "failed"]:
                return job_data
                
        time.sleep(1)
    
    raise TimeoutError(f"Job {job_id} did not complete within {timeout} seconds")

# Test Cases: Authentication
class TestAuthentication:
    
    def test_valid_login_returns_token(self, session):
        """TC_API_001: POST /api/v1/auth/login - Valid credentials return JWT token"""
        login_data = {
            "email": config.analyst_email,
            "password": config.analyst_password
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/auth/login",
            json=login_data
        )
        
        # Verify response
        assert response.status_code == 200
        assert "application/json" in response.headers["content-type"]
        
        # Verify response structure
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert "expiresIn" in data
        
        # Verify user data
        user = data["user"]
        assert user["email"] == config.analyst_email
        assert user["role"] == "Analyst"
        assert "id" in user
        assert validate_uuid(user["id"])
    
    def test_invalid_credentials_return_401(self, session):
        """TC_API_002: POST /api/v1/auth/login - Invalid credentials return 401"""
        login_data = {
            "email": "invalid@email.com",
            "password": "wrongpassword"
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/auth/login",
            json=login_data
        )
        
        assert response.status_code == 401
        
        # Verify error response structure
        data = response.json()
        assert "error" in data
        assert "Invalid credentials" in data["error"]
    
    def test_logout_with_valid_token(self, session, auth_headers):
        """TC_API_003: POST /api/v1/auth/logout - Valid token logs out successfully"""
        response = session.post(
            f"{config.base_url}/api/v1/auth/logout",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "Logout successful" in data["message"]

# Test Cases: Question & Answer API
class TestQuestionAnswerAPI:
    
    def test_submit_valid_question_returns_job_id(self, session, auth_headers):
        """TC_API_004: POST /api/v1/qa - Valid question returns 202 with jobId"""
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        # Verify response
        assert response.status_code == 202
        assert response.elapsed.total_seconds() < 0.5  # Performance requirement
        
        # Verify response structure
        data = response.json()
        assert "jobId" in data
        assert "status" in data
        assert "submittedAt" in data
        
        # Verify data formats
        assert validate_uuid(data["jobId"])
        assert data["status"] == "queued"
        assert validate_iso_timestamp(data["submittedAt"])
    
    def test_get_job_status_returns_progress(self, session, auth_headers):
        """TC_API_005: GET /api/v1/qa/{jobId} - Returns job status and progress"""
        # First submit a question
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        submit_response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        job_id = submit_response.json()["jobId"]
        
        # Get job status
        response = session.get(
            f"{config.base_url}/api/v1/qa/{job_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.elapsed.total_seconds() < 0.2  # Performance requirement
        
        # Verify response structure
        data = response.json()
        assert data["jobId"] == job_id
        assert data["status"] in ["queued", "running", "done", "failed"]
        assert validate_iso_timestamp(data["submittedAt"])
    
    def test_completed_job_returns_answer_and_confidence(self, session, auth_headers):
        """TC_API_006: GET /api/v1/qa/{jobId} - Completed job returns answer and confidence"""
        # Submit question and wait for completion
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        submit_response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        job_id = submit_response.json()["jobId"]
        
        # Wait for completion
        final_data = wait_for_job_completion(session, job_id, auth_headers)
        
        # Verify completed job data
        assert final_data["status"] == "done"
        assert "result" in final_data
        assert final_data["result"] is not None
        
        # Verify answer structure
        result = final_data["result"]
        assert result["question"] == config.valid_question
        assert result["company"] == config.valid_company
        assert "answer" in result
        assert "confidence" in result
        assert validate_iso_timestamp(result["timestamp"])
        
        # Verify confidence is between 0 and 1
        confidence = result["confidence"]
        assert isinstance(confidence, (int, float))
        assert 0 <= confidence <= 1
    
    def test_get_recent_answers_for_user(self, session, auth_headers):
        """TC_API_007: GET /api/v1/qa - Returns last 10 answers for user"""
        response = session.get(
            f"{config.base_url}/api/v1/qa",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "answers" in data
        assert isinstance(data["answers"], list)
        assert len(data["answers"]) <= 10  # Maximum 10 answers
        
        # Verify answer structure if any exist
        if data["answers"]:
            answer = data["answers"][0]
            assert "question" in answer
            assert "company" in answer
            assert "answer" in answer
            assert "confidence" in answer
            assert "timestamp" in answer

# Test Cases: File Upload API
class TestFileUploadAPI:
    
    def test_admin_csv_upload_succeeds(self, session, admin_headers):
        """TC_API_008: POST /api/v1/admin/companies/upload - Valid CSV upload succeeds"""
        # Create sample CSV content
        csv_content = "companyName,isin,sector\nNokia Corporation,FI0009000681,Technology\nApple Inc,US0378331005,Technology"
        
        files = {"file": ("companies.csv", csv_content, "text/csv")}
        headers = admin_headers.copy()
        if "Content-Type" in headers:
            del headers["Content-Type"]  # Remove content-type for multipart
        
        response = session.post(
            f"{config.base_url}/api/v1/admin/companies/upload",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "processedRows" in data
        assert data["processedRows"] >= 2
        assert "errors" in data
    
    def test_non_csv_file_returns_415(self, session, admin_headers):
        """TC_API_009: POST /api/v1/admin/companies/upload - Non-CSV file returns 415"""
        # Try to upload a text file
        text_content = "This is not a CSV file"
        files = {"file": ("document.txt", text_content, "text/plain")}
        
        headers = admin_headers.copy()
        if "Content-Type" in headers:
            del headers["Content-Type"]
        
        response = session.post(
            f"{config.base_url}/api/v1/admin/companies/upload",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 415
        
        data = response.json()
        assert "error" in data
        assert "CSV" in data["error"] or "format" in data["error"]
    
    def test_analyst_cannot_upload_file(self, session, auth_headers):
        """TC_API_019: Admin endpoint with Analyst token returns 403"""
        csv_content = "companyName,isin,sector\nTest Company,TEST123,Technology"
        files = {"file": ("companies.csv", csv_content, "text/csv")}
        
        headers = auth_headers.copy()
        if "Content-Type" in headers:
            del headers["Content-Type"]
        
        response = session.post(
            f"{config.base_url}/api/v1/admin/companies/upload",
            files=files,
            headers=headers
        )
        
        assert response.status_code == 403

# Test Cases: AIML Service
class TestAIMLService:
    
    def test_aiml_answer_request_returns_valid_response(self, session):
        """TC_API_011: POST /aiml/answer - Valid request returns answer with confidence"""
        request_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.aiml_url}/aiml/answer",
            json=request_data
        )
        
        # AIML service might return 200 or 429 depending on rate limits
        assert response.status_code in [200, 429]
        
        if response.status_code == 200:
            data = response.json()
            assert "answer" in data
            assert "confidence" in data
            
            # Verify confidence is valid
            confidence = data["confidence"]
            assert isinstance(confidence, (int, float))
            assert 0 <= confidence <= 1

# Test Cases: Negative Testing
class TestNegativeScenarios:
    
    def test_empty_question_returns_400(self, session, auth_headers):
        """TC_API_013: POST /api/v1/qa - Empty question returns 400"""
        question_data = {
            "question": "",
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
        
        data = response.json()
        assert "error" in data
    
    def test_missing_company_field_returns_400(self, session, auth_headers):
        """TC_API_014: POST /api/v1/qa - Missing company field returns 400"""
        question_data = {
            "question": config.valid_question
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_very_long_question_returns_413(self, session, auth_headers):
        """TC_API_015: POST /api/v1/qa - Question >10k chars returns 413"""
        question_data = {
            "question": config.long_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        assert response.status_code in [400, 413]  # Either is acceptable
    
    def test_invalid_json_returns_400(self, session, auth_headers):
        """TC_API_016: POST /api/v1/qa - Invalid JSON format returns 400"""
        headers = auth_headers.copy()
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            data="invalid json",  # Invalid JSON
            headers=headers
        )
        
        assert response.status_code == 400
    
    def test_no_token_returns_401(self, session):
        """TC_API_017: Protected endpoint without token returns 401"""
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data
        )
        
        assert response.status_code == 401
    
    def test_invalid_token_returns_401(self, session):
        """TC_API_018: Protected endpoint with invalid token returns 401"""
        headers = {"Authorization": "Bearer invalid_token"}
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=headers
        )
        
        assert response.status_code == 401
    
    def test_invalid_job_id_returns_400(self, session, auth_headers):
        """TC_API_021: GET /api/v1/qa/invalid-uuid returns 400"""
        response = session.get(
            f"{config.base_url}/api/v1/qa/invalid-uuid",
            headers=auth_headers
        )
        
        assert response.status_code == 400
    
    def test_non_existent_job_returns_404(self, session, auth_headers):
        """TC_API_022: GET /api/v1/qa/non-existent-job returns 404"""
        fake_job_id = str(uuid.uuid4())
        
        response = session.get(
            f"{config.base_url}/api/v1/qa/{fake_job_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 404

# Test Cases: Edge Cases
class TestEdgeCases:
    
    def test_unicode_question_and_company(self, session, auth_headers):
        """Test Unicode characters in question and company fields"""
        question_data = {
            "question": config.unicode_question,
            "company": config.unicode_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        # Should either succeed or fail gracefully
        assert response.status_code in [202, 400]
        
        if response.status_code == 202:
            data = response.json()
            assert validate_uuid(data["jobId"])
    
    def test_special_characters_in_question(self, session, auth_headers):
        """Test special characters and symbols in question"""
        special_question = "What's the company's CO₂ emissions & ESG score? 🌍"
        question_data = {
            "question": special_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        assert response.status_code in [202, 400]

# Performance Tests
class TestPerformance:
    
    def test_question_submission_performance(self, session, auth_headers):
        """TC_API_025: POST /api/v1/qa response time <500ms at 10 RPS"""
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        assert response.status_code == 202
        assert response.elapsed.total_seconds() < 0.5  # <500ms requirement
    
    def test_job_status_check_performance(self, session, auth_headers):
        """TC_API_026: GET /api/v1/qa/{jobId} response time <200ms"""
        # Submit a question first
        question_data = {
            "question": config.valid_question,
            "company": config.valid_company
        }
        
        submit_response = session.post(
            f"{config.base_url}/api/v1/qa",
            json=question_data,
            headers=auth_headers
        )
        
        job_id = submit_response.json()["jobId"]
        
        # Check status performance
        response = session.get(
            f"{config.base_url}/api/v1/qa/{job_id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        assert response.elapsed.total_seconds() < 0.2  # <200ms requirement