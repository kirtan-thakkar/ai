const assert = require('assert');
const app = require('./src/server');
const storage = require('./src/storage');
const http = require('http');

let server;
const PORT = 4001;
const BASE_URL = `http://localhost:${PORT}/api/v1`;

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function runTests() {
  console.log('--- Starting API Integration Tests ---');
  server = http.createServer(app);
  await new Promise(resolve => server.listen(PORT, resolve));

  try {
    // 1. Health check
    const health = await request('/../../health');
    assert.strictEqual(health.status, 200);
    console.log('✓ Health check endpoint working');

    // 2. User registration
    const testEmail = `test_${Date.now()}@fai-movie.edu`;
    const regRes = await request('/auth/register', {
      method: 'POST',
      body: { name: 'Alice Researcher', email: testEmail, password: 'password123' }
    });
    assert.strictEqual(regRes.status, 201);
    assert.ok(regRes.data.token, 'Token must be returned');
    const token = regRes.data.token;
    console.log('✓ User registration working');

    // 3. User login
    const loginRes = await request('/auth/login', {
      method: 'POST',
      body: { email: testEmail, password: 'password123' }
    });
    assert.strictEqual(loginRes.status, 200);
    assert.ok(loginRes.data.token);
    console.log('✓ User login working');

    // 4. Authenticated profile
    const profileRes = await request('/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(profileRes.status, 200);
    assert.strictEqual(profileRes.data.user.email, testEmail);
    console.log('✓ Protected profile endpoint working');

    // 5. Save interests (Onboarding)
    const interestsRes = await request('/users/me/interests', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: {
        interests: [
          { category: 'genre', value: 'Sci-Fi', preference: 'like', weight: 0.9 },
          { category: 'genre', value: 'Thriller', preference: 'like', weight: 0.8 }
        ]
      }
    });
    assert.strictEqual(interestsRes.status, 200);
    console.log('✓ Onboarding interests persistence working');

    // 6. Watchlist management
    const wlRes = await request('/watchlists', {
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(wlRes.status, 200);
    const defaultWl = wlRes.data.watchlists[0];
    assert.ok(defaultWl);

    // Add movie to watchlist
    const addMovieRes = await request(`/watchlists/${defaultWl.id}/movies`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: { movieId: 'm_inception' }
    });
    assert.strictEqual(addMovieRes.status, 200);
    console.log('✓ Watchlist add movie working');

    // 7. Watch Party creation
    const partyRes = await request('/watch-parties', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    assert.strictEqual(partyRes.status, 201);
    assert.ok(partyRes.data.code);
    console.log('✓ Watch party room creation working');

    console.log('\nAll API integration tests PASSED successfully!');
  } finally {
    server.close();
  }
}

runTests().catch(err => {
  console.error('API Test Failure:', err);
  if (server) server.close();
  process.exit(1);
});
