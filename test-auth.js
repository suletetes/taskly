// Simple test script to verify authentication works
const axios = require('axios');
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');

const API_BASE = 'http://localhost:5000/api';

async function testAuth() {
  try {
    console.log('Testing authentication flow...\n');

    // Create cookie jar and axios instance with cookie support
    const cookieJar = new tough.CookieJar();
    const client = wrapper(axios.create({
      baseURL: API_BASE,
      withCredentials: true,
      jar: cookieJar,
    }));

    // Test 1: Login
    console.log('1. Testing login...');
    const loginResponse = await client.post('/auth/login', {
      username: 'john@example.com',
      password: 'password123'
    });

    if (loginResponse.data.success) {
      console.log('✅ Login successful');
      console.log('User:', loginResponse.data.data.user.fullname);
    } else {
      console.log('❌ Login failed');
      return;
    }

    // Test 2: Get current user
    console.log('\n2. Testing get current user...');
    const meResponse = await client.get('/auth/me');

    if (meResponse.data.success) {
      console.log('✅ Get current user successful');
      console.log('User:', meResponse.data.data.user.fullname);
    } else {
      console.log('❌ Get current user failed');
    }

    // Test 3: Get user tasks
    console.log('\n3. Testing get user tasks...');
    const userId = loginResponse.data.data.user._id;
    const tasksResponse = await client.get(`/users/${userId}/tasks`);

    if (tasksResponse.data.success) {
      console.log('✅ Get user tasks successful');
      console.log('Tasks count:', tasksResponse.data.data.tasks.length);
      console.log('First task:', tasksResponse.data.data.tasks[0]?.title || 'No tasks');
    } else {
      console.log('❌ Get user tasks failed');
    }

    // Test 4: Get user stats
    console.log('\n4. Testing get user stats...');
    const statsResponse = await client.get(`/users/${userId}/stats`);

    if (statsResponse.data.success) {
      console.log('✅ Get user stats successful');
      console.log('Stats:', statsResponse.data.data);
    } else {
      console.log('❌ Get user stats failed');
    }

    // Test 5: Logout
    console.log('\n5. Testing logout...');
    const logoutResponse = await client.post('/auth/logout');

    if (logoutResponse.data.success) {
      console.log('✅ Logout successful');
    } else {
      console.log('❌ Logout failed');
    }

    // Test 6: Try to access protected route after logout
    console.log('\n6. Testing access after logout...');
    try {
      await client.get('/auth/me');
      console.log('❌ Should not be able to access protected route after logout');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Correctly blocked access after logout');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\n🎉 All authentication tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testAuth();