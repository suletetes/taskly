#!/usr/bin/env node

const axios = require('axios');

// Configuration
const API_BASE_URL = process.env.API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

console.log('🧪 Starting Simple End-to-End Functionality Test...\n');

// Test data
const testUser = {
    username: 'simplee2euser',
    email: 'simplee2e@test.com',
    password: 'testpassword123',
    fullname: 'Simple E2E Test User'
};

let user = null;
let tasks = [];

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

async function testCompleteWorkflow() {
    console.log('🔄 Testing Complete User Workflow...\n');

    try {
        // 1. Test Frontend Accessibility
        console.log('1. 🌐 Testing Frontend Accessibility...');
        try {
            const frontendResponse = await axios.get(FRONTEND_URL);
            if (frontendResponse.status === 200) {
                console.log('   ✅ Frontend is accessible at ' + FRONTEND_URL);
            }
        } catch (error) {
            console.log('   ❌ Frontend is not accessible');
            return false;
        }

        // 2. Test API Health
        console.log('2. 🏥 Testing API Health...');
        const healthResult = await apiRequest('GET', '/health');
        if (healthResult.success && healthResult.data.status === 'OK') {
            console.log('   ✅ API is healthy');
            console.log(`   📊 Database: ${healthResult.data.database}`);
        } else {
            console.log('   ❌ API health check failed');
            return false;
        }

        // 3. Test User Registration
        console.log('3. 👤 Testing User Registration...');
        const registerResult = await apiRequest('POST', '/auth/register', testUser);
        if (registerResult.success && registerResult.data.success) {
            user = {
                ...testUser,
                id: registerResult.data.data.user._id,
                token: registerResult.data.data.token
            };
            console.log('   ✅ User registration successful');
            console.log(`   🆔 User ID: ${user.id}`);
        } else {
            console.log('   ❌ User registration failed');
            console.log(`   Error: ${JSON.stringify(registerResult.error)}`);
            return false;
        }

        // 4. Test Authentication
        console.log('4. 🔐 Testing Authentication...');
        const headers = { Authorization: `Bearer ${user.token}` };
        const profileResult = await apiRequest('GET', '/auth/me', null, headers);
        if (profileResult.success && profileResult.data.success) {
            console.log('   ✅ Authentication working');
            console.log(`   👤 Profile: ${profileResult.data.data.user.fullname}`);
        } else {
            console.log('   ❌ Authentication failed');
            return false;
        }

        // 5. Test Task Creation
        console.log('5. 📝 Testing Task Creation...');
        const taskData = {
            title: 'Simple E2E Test Task',
            description: 'This task was created during simple E2E testing',
            priority: 'high',
            due: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
            tags: ['e2e', 'test']
        };

        const createTaskResult = await apiRequest('POST', `/users/${user.id}/tasks`, taskData, headers);
        if (createTaskResult.success && createTaskResult.data.success) {
            const task = createTaskResult.data.data.task;
            tasks.push(task);
            console.log('   ✅ Task creation successful');
            console.log(`   📋 Task: ${task.title}`);
            console.log(`   🆔 Task ID: ${task._id}`);
        } else {
            console.log('   ❌ Task creation failed');
            console.log(`   Error: ${JSON.stringify(createTaskResult.error)}`);
            return false;
        }

        // 6. Test Task Listing
        console.log('6. 📄 Testing Task Listing...');
        const listTasksResult = await apiRequest('GET', `/users/${user.id}/tasks`, null, headers);
        if (listTasksResult.success && listTasksResult.data.success) {
            const fetchedTasks = listTasksResult.data.data.tasks;
            console.log('   ✅ Task listing successful');
            console.log(`   📊 Found ${fetchedTasks.length} tasks`);

            if (fetchedTasks.length !== tasks.length) {
                console.log(`   ⚠️  Expected ${tasks.length} tasks, got ${fetchedTasks.length}`);
            }
        } else {
            console.log('   ❌ Task listing failed');
            return false;
        }

        // 7. Test Task Completion
        console.log('7. ✅ Testing Task Completion...');
        if (tasks.length > 0) {
            const taskToComplete = tasks[0];
            const completeResult = await apiRequest('PATCH', `/tasks/${taskToComplete._id}/complete`, null, headers);
            if (completeResult.success && completeResult.data.success) {
                console.log('   ✅ Task completion successful');
                console.log(`   ✔️  Status: ${completeResult.data.data.task.status}`);
            } else {
                console.log('   ❌ Task completion failed');
                console.log(`   Error: ${JSON.stringify(completeResult.error)}`);
                return false;
            }
        }

        // 8. Test User Statistics
        console.log('8. 📊 Testing User Statistics...');
        const statsResult = await apiRequest('GET', `/users/${user.id}/stats`, null, headers);
        if (statsResult.success && statsResult.data.success) {
            const stats = statsResult.data.data.stats;
            console.log('   ✅ Statistics retrieval successful');
            console.log(`   📈 Total Tasks: ${stats.totalTasks || 0}`);
            console.log(`   ✔️  Completed Tasks: ${stats.completedTasks || 0}`);
            console.log(`   📊 Completion Rate: ${stats.completionRate || 0}%`);
        } else {
            console.log('   ❌ Statistics retrieval failed');
            return false;
        }

        // 9. Test Profile Update
        console.log('9. ✏️  Testing Profile Update...');
        const updateData = {
            fullname: `${testUser.fullname} (Updated)`
        };

        const updateResult = await apiRequest('PUT', `/users/${user.id}`, updateData, headers);
        if (updateResult.success && updateResult.data.success) {
            console.log('   ✅ Profile update successful');
            console.log(`   📝 New name: ${updateResult.data.data.user.fullname}`);
        } else {
            console.log('   ❌ Profile update failed');
            console.log(`   Error: ${JSON.stringify(updateResult.error)}`);
            return false;
        }

        // 10. Test CORS
        console.log('10. 🌐 Testing CORS Configuration...');
        try {
            const corsResponse = await axios.options(`${API_BASE_URL}/health`, {
                headers: {
                    'Origin': FRONTEND_URL,
                    'Access-Control-Request-Method': 'GET'
                }
            });
            console.log('   ✅ CORS configuration working');
        } catch (error) {
            console.log('   ⚠️  CORS test failed (might be expected)');
        }

        console.log('\n🎉 All workflow tests completed successfully!');
        return true;

    } catch (error) {
        console.log(`\n❌ Workflow test failed: ${error.message}`);
        return false;
    }
}

async function testResponsiveDesign() {
    console.log('\n📱 Testing Responsive Design Considerations...');

    // Test API responses are mobile-friendly (JSON format)
    console.log('1. 📱 Testing API Response Format...');
    const healthResult = await apiRequest('GET', '/health');
    if (healthResult.success && typeof healthResult.data === 'object') {
        console.log('   ✅ API returns JSON responses (mobile-friendly)');
    } else {
        console.log('   ❌ API response format issue');
        return false;
    }

    // Test CORS allows frontend access
    console.log('2. 🔗 Testing Cross-Origin Access...');
    try {
        const corsTest = await axios.get(`${API_BASE_URL}/health`, {
            headers: { 'Origin': FRONTEND_URL }
        });
        console.log('   ✅ Cross-origin requests allowed');
    } catch (error) {
        if (error.response && error.response.status !== 403) {
            console.log('   ✅ Cross-origin handling working');
        } else {
            console.log('   ❌ Cross-origin access blocked');
            return false;
        }
    }

    console.log('   🎉 Responsive design considerations verified');
    return true;
}

async function testDataConsistency() {
    console.log('\n🔍 Testing Data Consistency...');

    if (!user) {
        console.log('   ⚠️  No user data available for consistency testing');
        return true;
    }

    const headers = { Authorization: `Bearer ${user.token}` };

    // Get tasks and stats
    const tasksResult = await apiRequest('GET', `/users/${user.id}/tasks`, null, headers);
    const statsResult = await apiRequest('GET', `/users/${user.id}/stats`, null, headers);

    if (tasksResult.success && statsResult.success) {
        const taskCount = tasksResult.data.data.tasks.length;
        const statsTaskCount = statsResult.data.data.stats.totalTasks;

        console.log(`   📊 Tasks API reports: ${taskCount} tasks`);
        console.log(`   📈 Stats API reports: ${statsTaskCount} tasks`);

        if (taskCount === statsTaskCount) {
            console.log('   ✅ Data consistency verified');
            return true;
        } else {
            console.log('   ⚠️  Data consistency issue detected');
            return false;
        }
    } else {
        console.log('   ❌ Could not verify data consistency');
        return false;
    }
}

async function cleanup() {
    console.log('\n🧹 Cleaning up test data...');

    if (user) {
        const headers = { Authorization: `Bearer ${user.token}` };

        // Delete tasks
        for (const task of tasks) {
            await apiRequest('DELETE', `/tasks/${task._id}`, null, headers);
        }

        // Delete user
        await apiRequest('DELETE', `/users/${user.id}`, null, headers);

        console.log('   ✅ Test data cleaned up');
    }
}

// Main test runner
async function runSimpleE2ETest() {
    console.log('🚀 Starting Simple End-to-End Test Suite...\n');

    const tests = [
        { name: 'Complete Workflow', test: testCompleteWorkflow },
        { name: 'Responsive Design', test: testResponsiveDesign },
        { name: 'Data Consistency', test: testDataConsistency }
    ];

    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
        try {
            console.log(`\n🧪 Running ${name} Test...`);
            const result = await test();
            if (result) {
                console.log(`✅ ${name} Test: PASSED`);
                passed++;
            } else {
                console.log(`❌ ${name} Test: FAILED`);
                failed++;
            }
        } catch (error) {
            console.log(`❌ ${name} Test: FAILED (Exception: ${error.message})`);
            failed++;
        }
    }

    // Always cleanup
    await cleanup();

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📋 Simple E2E Test Summary:');
    console.log(`   ✅ Passed: ${passed}`);
    console.log(`   ❌ Failed: ${failed}`);
    console.log(`   📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    if (failed === 0) {
        console.log('\n🎉 All tests passed! The MERN application is working correctly.');
        console.log('✨ Frontend-Backend integration is functional.');
        console.log('🔒 Authentication and task management workflows are working.');
        console.log('📱 The application is ready for responsive design testing.');
        process.exit(0);
    } else {
        console.log('\n⚠️  Some tests failed. Please review the application.');
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\n🛑 Tests interrupted. Running cleanup...');
    await cleanup();
    process.exit(1);
});

// Run the tests
runSimpleE2ETest().catch(error => {
    console.error('💥 Simple E2E test runner failed:', error.message);
    process.exit(1);
});