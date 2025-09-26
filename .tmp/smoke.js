const http = require('http');
const get = (p) => new Promise((res, rej) => {
  http.get({ host: 'localhost', port: 4000, path: p }, r => {
    let d = '';
    r.on('data', c => d += c);
    r.on('end', () => res({ status: r.statusCode, body: d }));
  }).on('error', rej);
});

(async () => {
  for (let i = 0; i < 10; i++) {
    try { await get('/'); break; } catch (e) { await new Promise(r => setTimeout(r, 500)); }
  }
  console.log(await get('/auth/start?provider=google&redirect=http://localhost:3000'));
  console.log(await get('/auth/callback/google?code=abc'));
})();
