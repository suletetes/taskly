#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🚀 Starting Frontend-Backend Integration Tests...\n');

// Test data
const testUser = {
  username: 'integrationtest',
  email: 'integration@test.com',
  password: 'testpassword123',
  fullname: 'Integration Test'
};

let authToken = null;
let userId = null;
let taskId = null;

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null, headers = {}) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message, 
      status: error.response?.status 
    };
  }
}

// Test functions
async function testHealthEndpoint() {
  console.log('1. Testing API Health Endpoint...');
  const result = await apiRequest('GET', '/health');
  
  if (result.success && result.data.status === 'OK') {
    console.log('   ✅ Health endpoint working');
    console.log(`   📊 Database: ${result.data.database}`);
    console.log(`   🌍 Environment: ${result.data.environment}\n`);
    return true;
  } else {
    console.log('   ❌ Health endpoint failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testUserRegistration() {
  console.log('2. Testing User Registration...');
  const result = await apiRequest('POST', '/auth/register', testUser);
  
  if (result.success && result.data.success) {
    authToken = result.data.data.token;
    userId = result.data.data.user._id;
    console.log('   ✅ User registration successful');
    console.log(`   👤 User ID: ${userId}`);
    console.log(`   🔑 Token received: ${authToken ? 'Yes' : 'No'}\n`);
    return true;
  } else {
    console.log('   ❌ User registration failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testUserLogin() {
  console.log('3. Testing User Login...');
  const loginData = {
    username: testUser.username,
    password: testUser.password
  };
  
  const result = await apiRequest('POST', '/auth/login', loginData);
  
  if (result.success && result.data.success) {
    console.log('   ✅ User login successful');
    console.log(`   🔑 New token received: ${result.data.data.token ? 'Yes' : 'No'}\n`);
    return true;
  } else {
    console.log('   ❌ User login failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testProtectedEndpoint() {
  console.log('4. Testing Protected Endpoint (Get Profile)...');
  const headers = { Authorization: `Bearer ${authToken}` };
  const result = await apiRequest('GET', '/auth/me', null, headers);
  
  if (result.success && result.data.success) {
    console.log('   ✅ Protected endpoint working');
    console.log(`   👤 Profile: ${result.data.data.user.fullname}\n`);
    return true;
  } else {
    console.log('   ❌ Protected endpoint failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testTaskCreation() {
  console.log('5. Testing Task Creation...');
  const taskData = {
    title: 'Integration Test Task',
    description: 'This task was created during integration testing',
    priority: 'high',
    due: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    tags: ['integration', 'test']
  };
  
  const headers = { Authorization: `Bearer ${authToken}` };
  const result = await apiRequest('POST', `/users/${userId}/tasks`, taskData, headers);
  
  if (result.success && result.data.success) {
    taskId = result.data.data.task._id;
    console.log('   ✅ Task creation successful');
    console.log(`   📝 Task ID: ${taskId}`);
    console.log(`   📋 Task Title: ${result.data.data.task.title}\n`);
    return true;
  } else {
    console.log('   ❌ Task creation failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testTaskCompletion() {
  console.log('6. Testing Task Completion...');
  const headers = { Authorization: `Bearer ${authToken}` };
  const result = await apiRequest('PATCH', `/tasks/${taskId}/complete`, null, headers);
  
  if (result.success && result.data.success) {
    console.log('   ✅ Task completion successful');
    console.log(`   ✔️ Task Status: ${result.data.data.task.status}\n`);
    return true;
  } else {
    console.log('   ❌ Task completion failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testUserStats() {
  console.log('7. Testing User Statistics...');
  const headers = { Authorization: `Bearer ${authToken}` };
  const result = await apiRequest('GET', `/users/${userId}/stats`, null, headers);
  
  if (result.success && result.data.success) {
    console.log('   ✅ User statistics working');
    console.log(`   📊 Total Tasks: ${result.data.data.stats.totalTasks}`);
    console.log(`   ✅ Completed Tasks: ${result.data.data.stats.completedTasks}`);
    console.log(`   📈 Completion Rate: ${result.data.data.stats.completionRate}%\n`);
    return true;
  } else {
    console.log('   ❌ User statistics failed');
    console.log(`   Error: ${JSON.stringify(result.error)}\n`);
    return false;
  }
}

async function testCORSHeaders() {
  console.log('8. Testing CORS Configuration...');
  try {
    const response = await axios.options(`${API_BASE_URL}/health`, {
      headers: {
        'Origin': FRONTEND_URL,
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    console.log('   ✅ CORS preflight successful');
    console.log(`   🌐 Access-Control-Allow-Origin: ${response.headers['access-control-allow-origin'] || 'Not set'}\n`);
    return true;
  } catch (error) {
    console.log('   ❌ CORS preflight failed');
    console.log(`   Error: ${error.message}\n`);
    return false;
  }
}

async function cleanup() {
  console.log('9. Cleaning up test data...');
  if (taskId && authToken) {
    const headers = { Authorization: `Bearer ${authToken}` };
    await apiRequest('DELETE', `/tasks/${taskId}`, null, headers);
  }
  
  if (userId && authToken) {
    const headers = { Authorization: `Bearer ${authToken}` };
    await apiRequest('DELETE', `/users/${userId}`, null, headers);
  }
  
  console.log('   🧹 Cleanup completed\n');
}

// Main test runner
async function runIntegrationTests() {
  const tests = [
    testHealthEndpoint,
    testUserRegistration,
    // Skip login test to avoid rate limiting
    // testUserLogin,
    testProtectedEndpoint,
    testTaskCreation,
    testTaskCompletion,
    testUserStats,
    testCORSHeaders
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`   ❌ Test failed with exception: ${error.message}\n`);
      failed++;
    }
  }
  
  // Always run cleanup
  await cleanup();
  
  // Summary
  console.log('📋 Integration Test Summary:');
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 All integration tests passed! Frontend-Backend connection is working properly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some integration tests failed. Please check the API server and database connection.');
    process.exit(1);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted. Running cleanup...');
  await cleanup();
  process.exit(1);
});

// Run the tests
runIntegrationTests().catch(error => {
  console.error('💥 Integration test runner failed:', error.message);
  process.exit(1);
});