const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = '';

async function runTests() {
  console.log('--- STARTING API TESTS ---');

  try {
    // 1. Health specific route
    const health = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health Check:', health.data.status);

    // 2. Login
    const loginRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'admin@studyhive.com',
      password: 'password'
    });
    authToken = loginRes.data.token;
    console.log('✅ Login Successful. Token received.');

    // Configure axios defaults
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    // 3. Profile
    const profileRes = await axios.get(`${API_BASE}/auth/me`);
    console.log('✅ Auth Profile:', profileRes.data.user.fullName);

    // 4. Dashboard (Admin only)
    const dashRes = await axios.get(`${API_BASE}/dashboard/summary`);
    console.log('✅ Dashboard Data:', Object.keys(dashRes.data));

    // 5. Users List
    const usersRes = await axios.get(`${API_BASE}/users`);
    console.log(`✅ Users List: Found ${usersRes.data.users.length} users`);

    // 6. Courses List
    const coursesRes = await axios.get(`${API_BASE}/courses`);
    console.log(`✅ Courses List: Found ${coursesRes.data.courses.length} courses`);

    // 7. Materials List
    const materialsRes = await axios.get(`${API_BASE}/materials`);
    console.log(`✅ Materials List: Found ${materialsRes.data.materials.length} materials`);

    // 8. Badges List
    const badgesRes = await axios.get(`${API_BASE}/badges`);
    console.log(`✅ Badges List: Found ${badgesRes.data.badges.length} badges`);

    console.log('\n=======================================');
    console.log('🏆 ALL ENDPOINTS VERIFIED SUCCESSFULLY');
    console.log('=======================================');

  } catch (error) {
    console.error('❌ API Test Failed!');
    if (error.response) {
      console.error(error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

runTests();
