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
  process.env.WATCHMODE_API_KEY =
    overrides.WATCHMODE_API_KEY || 'watchmode-test-key';

  if (overrides.hasOwnProperty('GROQ_API_KEY')) {
    process.env.GROQ_API_KEY = overrides.GROQ_API_KEY;
  } else {
    process.env.GROQ_API_KEY = 'groq-test-token';
  }

  if (overrides.hasOwnProperty('PORT')) {
    process.env.PORT = overrides.PORT;
  } else {
    delete process.env.PORT;
  }

  return require('../src/server');
}

describe('GET /api/movies/search/:title', () => {
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
    restoreEnv();
  });

  it('aggregates TMDB, Watchmode, and Groq data into a single payload', async () => {
    const app = loadAppWithEnv();

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
        { type: 'free', web_url: 'https://example.com/free-1' },
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

    const response = await request(app).get(
      '/api/movies/search/The%20Matrix'
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      naziv: 'The Matrix',
      godina: 1999,
      tip: 'movie',
      reference_tmdb_id: 603,
      reference_url: 'https://www.themoviedb.org/movie/603',
      opis: 'A hacker discovers the nature of his reality.',
      poster_url: 'https://image.tmdb.org/t/p/w500/matrix.jpg',
      top5_besplatno: [
        'https://example.com/free-1',
        'https://example.com/free-2',
      ],
    });
    expect(response.body.alternativni_rezultati).toEqual([
      expect.objectContaining({
        tmdb_id: 1396,
        media_type: 'tv',
        title: 'Incredible Stories',
        year: 2018,
        reference_url: 'https://www.themoviedb.org/tv/1396',
      }),
    ]);
    expect(response.body.ai_pregled).toEqual([
      'Prva preporuka',
      'Druga preporuka',
      'Treca preporuka',
    ]);
  });

  it('returns empty fields when TMDB has no results', async () => {
    const app = loadAppWithEnv({ GROQ_API_KEY: '' });

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
});
