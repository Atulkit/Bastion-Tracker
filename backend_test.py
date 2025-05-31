
import requests
import sys
import json
import time
import os
from datetime import datetime

class BastionTrackerAPITester:
    def __init__(self, base_url=None):
        # Use the environment variable if available, otherwise use default
        self.base_url = base_url or os.environ.get('REACT_APP_BACKEND_URL', 'http://localhost:8001')
        
        # Ensure the base URL has the /api prefix
        if not self.base_url.endswith('/api'):
            self.base_url = f"{self.base_url}/api"
            
        self.tests_run = 0
        self.tests_passed = 0
        self.room_code = None
        
        print(f"Testing API at: {self.base_url}")

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            else:
                print(f"❌ Failed - Unsupported method: {method}")
                return False, None

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json()
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.json()}")
                except:
                    print(f"Response: {response.text}")
                return False, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, None

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )

    def test_create_bastion(self):
        """Test creating a new bastion"""
        success, response = self.run_test(
            "Create Bastion",
            "POST",
            "bastion/create",
            200
        )
        
        if success and response and 'roomCode' in response:
            self.room_code = response['roomCode']
            print(f"Created bastion with room code: {self.room_code}")
            return True, response
        return False, None

    def test_get_bastion(self, room_code=None):
        """Test getting a bastion by room code"""
        code = room_code or self.room_code
        if not code:
            print("❌ No room code available for testing")
            return False, None
            
        return self.run_test(
            f"Get Bastion with code {code}",
            "GET",
            f"bastion/{code}",
            200
        )
    
    def test_invalid_bastion_code(self):
        """Test getting a bastion with an invalid room code"""
        return self.run_test(
            "Get Bastion with invalid code",
            "GET",
            "bastion/INVALID",
            404
        )

    def print_results(self):
        """Print test results summary"""
        print("\n" + "="*50)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} tests passed")
        if self.tests_passed == self.tests_run:
            print("✅ All tests passed!")
        else:
            print(f"❌ {self.tests_run - self.tests_passed} tests failed")
        print("="*50)
        
        return self.tests_passed == self.tests_run

def main():
    # Get backend URL from environment if available
    backend_url = os.environ.get('REACT_APP_BACKEND_URL')
    
    # Setup tester
    tester = BastionTrackerAPITester(backend_url)
    
    # Run tests
    tester.test_root_endpoint()
    tester.test_create_bastion()
    
    # If we have a room code, test getting the bastion
    if tester.room_code:
        tester.test_get_bastion()
    
    # Test invalid room code
    tester.test_invalid_bastion_code()
    
    # Print results
    success = tester.print_results()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())
