const request = require('supertest');
const nock = require('nock');

const originalEnv = { ...process.env };

function restoreEnv() {
  Object.keys(process.env).forEach((key) => {
    if (!(key in originalEnv)) {
      delete process.env[key];
    }
  });

  Object.entries(originalEnv).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

function loadAppWithEnv(overrides = {}) {
  jest.resetModules();
  process.env.NODE_ENV = 'test';
  process.env.TMDB_BEARER = overrides.TMDB_BEARER || 'tmdb-test-token';
  process.env.WATCHMODE_API_KEY = overrides.WATCHMODE_API_KEY || 'watchmode-test-key';
  process.env.GROQ_API_KEY =
    overrides.hasOwnProperty('GROQ_API_KEY') && overrides.GROQ_API_KEY !== undefined
      ? overrides.GROQ_API_KEY
      : '';
  process.env.JWT_SECRET = overrides.JWT_SECRET || 'test-secret';
  process.env.DATABASE_URL = overrides.DATABASE_URL || ':memory:';
  process.env.SUPABASE_DISABLED = 'true';
  process.env.DISABLE_TORRENTS = 'true';

  if (overrides.hasOwnProperty('PORT')) {
    process.env.PORT = overrides.PORT;
  } else {
    delete process.env.PORT;
  }

  return require('../src/server');
}

function uniqueEmail() {
  return `user${Date.now()}${Math.floor(Math.random() * 1000)}@test.rs`;
}

async function registerAndLogin(app, { email = uniqueEmail(), password = 'secret123' } = {}) {
  const name = 'Test User';
  const registerResponse = await request(app)
    .post('/api/auth/register')
    .send({ name, email, password });

  expect(registerResponse.status).toBe(201);
  expect(registerResponse.body).toHaveProperty('token');

  const loginResponse = await request(app).post('/api/auth/login').send({ email, password });
  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body).toHaveProperty('token');

  return {
    registerResponse,
    loginResponse,
    credentials: { email, password },
  };
}

describe('API server', () => {
  beforeAll(() => {
    nock.disableNetConnect();
    nock.enableNetConnect(/127\.0\.0\.1|localhost/);
  });

  afterAll(() => {
    nock.enableNetConnect();
    restoreEnv();
  });

  afterEach(() => {
    nock.cleanAll();
    jest.resetModules();
  });

  describe('GET /api/movies/search/:title', () => {
    it('aggregates TMDB, Watchmode, and Groq data into a single payload', async () => {
      const app = loadAppWithEnv({ GROQ_API_KEY: 'groq-test-token' });

      nock('https://api.themoviedb.org')
        .get('/3/search/multi')
        .query(true)
        .reply(200, {
          results: [
            {
              id: 603,
              media_type: 'movie',
              title: 'The Matrix',
              release_date: '1999-03-31',
              overview: 'A hacker discovers the nature of his reality.',
              poster_path: '/matrix.jpg',
            },
            {
              id: 1396,
              media_type: 'tv',
              name: 'Incredible Stories',
              first_air_date: '2018-10-01',
              overview: 'Anthology of incredible tales.',
              poster_path: '/tvposter.jpg',
            },
          ],
        });

      nock('https://api.watchmode.com')
        .get('/v1/title/movie-603/sources/')
        .query({ apiKey: 'watchmode-test-key' })
        .reply(200, [
          { type: 'free', web_url: 'https://example.com/free-1' },
          { type: 'purchase', web_url: 'https://example.com/buy' },
          { type: 'tve', web_url: 'https://example.com/free-2' },
        ]);

      nock('https://api.groq.com')
        .post('/openai/v1/chat/completions')
        .reply(200, {
          choices: [
            {
              message: {
                content: '- Prva preporuka\n- Druga preporuka\n- Treca preporuka\n',
              },
            },
          ],
        });

      const response = await request(app).get('/api/movies/search/The%20Matrix');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        naziv: 'The Matrix',
        godina: 1999,
        tip: 'movie',
        reference_tmdb_id: 603,
        reference_url: 'https://www.themoviedb.org/movie/603',
        opis: 'A hacker discovers the nature of his reality.',
        poster_url: 'https://image.tmdb.org/t/p/w500/matrix.jpg',
      });
      expect(response.body.top5_besplatno).toEqual([
        'https://example.com/free-1',
        'https://example.com/free-2',
      ]);
      expect(response.body.ai_pregled).toEqual([
        'Prva preporuka',
        'Druga preporuka',
        'Treca preporuka',
      ]);
    });

    it('returns empty fields when TMDB has no results', async () => {
      const app = loadAppWithEnv();

      nock('https://api.themoviedb.org')
        .get('/3/search/multi')
        .query(true)
        .reply(200, { results: [] });

      const response = await request(app).get('/api/movies/search/Nepoznato');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        naziv: 'Nepoznato',
        godina: null,
        opis: '',
        poster_url: '',
        tip: null,
        reference_tmdb_id: null,
        reference_url: '',
        alternativni_rezultati: [],
        top5_besplatno: [],
        top5_piratizovano: [],
        ai_pregled: [],
      });
    });

    it('supports filter-based search via TMDB discover endpoint', async () => {
      const app = loadAppWithEnv();

      nock('https://api.themoviedb.org')
        .get('/3/discover/movie')
        .query((params) => params.with_genres === '28' && params.vote_average.gte === '8')
        .reply(200, {
          results: [
            {
              id: 27205,
              title: 'Inception',
              release_date: '2010-07-15',
              overview: 'Dream layers.',
              poster_path: '/inception.jpg',
            },
          ],
        });

      nock('https://api.themoviedb.org')
        .get('/3/discover/tv')
        .query(true)
        .reply(200, { results: [] });

      const response = await request(app).get(
        '/api/movies/search?genre=28&rating=8&title=Inception'
      );

      expect(response.status).toBe(200);
      expect(response.body.naziv).toBe('Inception');
    });
  });

  describe('Authentication and user flows', () => {
    it('registers, logs in and resolves current user', async () => {
      const app = loadAppWithEnv();
      const { registerResponse, loginResponse, credentials } = await registerAndLogin(app);

      expect(registerResponse.body.user.tokens).toBeDefined();
      expect(loginResponse.body.user.email).toBe(credentials.email);

      const meResponse = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(meResponse.status).toBe(200);
      expect(meResponse.body.user.email).toBe(credentials.email);
    });

    it('enforces authentication on watchlist routes and supports CRUD operations', async () => {
      const app = loadAppWithEnv();
      const { loginResponse } = await registerAndLogin(app);
      const token = loginResponse.body.token;

      const unauthorized = await request(app).get('/api/watchlist');
      expect(unauthorized.status).toBe(401);

      const addResponse = await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: '603',
          title: 'The Matrix',
          mediaType: 'movie',
          posterUrl: 'https://img.test/matrix.jpg',
        });
      expect(addResponse.status).toBe(201);

      const listResponse = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${token}`);
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.items).toHaveLength(1);

      const deleteResponse = await request(app)
        .delete('/api/watchlist/603')
        .set('Authorization', `Bearer ${token}`);
      expect(deleteResponse.status).toBe(200);

      const emptyResponse = await request(app)
        .get('/api/watchlist')
        .set('Authorization', `Bearer ${token}`);
      expect(emptyResponse.body.items).toHaveLength(0);
    });

    it('deducts a token when fetching pricing data and blocks when balance is zero', async () => {
      const app = loadAppWithEnv();
      const { loginResponse, registerResponse } = await registerAndLogin(app);
      const token = loginResponse.body.token;
      const userId = registerResponse.body.user.id;

      nock('https://api.watchmode.com')
        .get('/v1/title/movie-603/sources/')
        .query({ apiKey: 'watchmode-test-key' })
        .reply(200, [
          { name: 'Neon Stream', type: 'subscription', price: 0, web_url: 'https://neon.test' },
        ]);

      const pricingResponse = await request(app)
        .get('/api/movies/pricing/603?mediaType=movie')
        .set('Authorization', `Bearer ${token}`);

      expect(pricingResponse.status).toBe(200);
      expect(pricingResponse.body.providers[0].provider_name).toBe('Neon Stream');
      expect(pricingResponse.body.tokens).toBe(19);

      const db = require('../src/db');
      db.prepare('UPDATE users SET tokens = 0 WHERE id = ?').run(userId);

      const insufficient = await request(app)
        .get('/api/movies/pricing/603?mediaType=movie')
        .set('Authorization', `Bearer ${token}`);

      expect(insufficient.status).toBe(402);
    });

    it('returns AI recommendations and consumes a token', async () => {
      const app = loadAppWithEnv({ GROQ_API_KEY: '' });
      const { loginResponse } = await registerAndLogin(app);
      const token = loginResponse.body.token;

      await request(app)
        .post('/api/watchlist')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tmdbId: '603',
          title: 'The Matrix',
          mediaType: 'movie',
        });

      const recResponse = await request(app)
        .post('/api/recommendations')
        .set('Authorization', `Bearer ${token}`)
        .send({ lastSearch: 'Matrix' });

      expect(recResponse.status).toBe(200);
      expect(recResponse.body.recommendations.length).toBeGreaterThan(0);
      expect(recResponse.body.tokens).toBe(19);
    });
  });
});
