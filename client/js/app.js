// client/js/app.js
// Capture token if redirected with #token=...
(function captureTokenFromHash() {
  if (location.hash && location.hash.includes('token=')) {
    const hash = location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      history.replaceState(null, '', location.pathname + location.search);
      // don't redirect here because dashboard uses this script directly
    }
  }
})();

(async function main() {
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = '/';
    return;
  }

  // Helper for authenticated fetches
  async function authFetch(path, opts = {}) {
    opts.headers = opts.headers || {};
    opts.headers['authorization'] = 'Bearer ' + token;
    if (opts.method && opts.method.toUpperCase() !== 'GET') {
      opts.headers['content-type'] = opts.headers['content-type'] || 'application/json';
    }
    const res = await fetch(path, opts);
    if (res.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/';
      throw new Error('Unauthorized');
    }
    return res;
  }

  // Get user info
  let me;
  try {
    const meRes = await authFetch('/api/auth/me', { method: 'GET' });
    me = await meRes.json();
    document.getElementById('userEmail').innerText = me.email;
  } catch (err) {
    console.error('Failed to fetch user:', err);
    return;
  }

  // Fetch supported & subscriptions
  let supported = [];
  let subscriptions = [];
  try {
    const sRes = await fetch('/api/supported');
    supported = await sRes.json();
    const subRes = await authFetch('/api/subscriptions', { method: 'GET' });
    subscriptions = await subRes.json();
  } catch (err) {
    console.error('Failed to fetch supported/subscriptions:', err);
  }

  // DOM containers
  const supportedList = document.getElementById('supportedList');
  const subscribedList = document.getElementById('subscribedList');

  // Price state
  const prices = {}; // latest price
  const priceHistory = {}; // ticker -> array of recent prices
  const HISTORY_LEN = 30; // number of points for sparkline

  // create initial empty history for supported tickers
  supported.forEach(t => priceHistory[t] = []);

  // RENDER helpers
  function renderSupported() {
    supportedList.innerHTML = '';
    supported.forEach(t => {
      const row = document.createElement('div');
      row.className = 'stock-row';

      const left = document.createElement('div');
      left.innerHTML = `<strong>${t}</strong><div class="small">Ticker</div>`;

      const right = document.createElement('div');
      const isSub = subscriptions.includes(t);

      const btn = document.createElement('button');
      btn.className = isSub ? 'btn-unsub small-btn' : 'btn-sub small-btn';
      btn.textContent = isSub ? 'Unsubscribe' : 'Subscribe';
      btn.onclick = async () => {
        try {
          if (isSub) {
            const r = await authFetch('/api/unsubscribe', { method: 'POST', body: JSON.stringify({ ticker: t }) });
            const data = await r.json();
            subscriptions = data.subscriptions;
          } else {
            const r = await authFetch('/api/subscribe', { method: 'POST', body: JSON.stringify({ ticker: t }) });
            const data = await r.json();
            subscriptions = data.subscriptions;
          }
          renderSubscribed();
          renderSupported();
        } catch (err) {
          console.error('Subscribe/unsubscribe error', err);
          alert('Action failed');
        }
      };

      right.appendChild(btn);
      row.appendChild(left);
      row.appendChild(right);
      supportedList.appendChild(row);
    });
  }

  function renderSubscribed() {
    subscribedList.innerHTML = '';
    subscriptions.forEach(t => {
      // ensure history exists
      if (!priceHistory[t]) priceHistory[t] = [];

      const row = document.createElement('div');
      row.className = 'stock-row';

      const left = document.createElement('div');
      left.innerHTML = `<strong>${t}</strong><div class="small">Subscribed</div>`;

      const right = document.createElement('div');
      right.style.display = 'flex';
      right.style.flexDirection = 'column';
      right.style.alignItems = 'flex-end';
      right.style.minWidth = '160px';

      // price display
      const priceEl = document.createElement('div');
      priceEl.className = 'price';
      priceEl.id = `price-${t}`;
      priceEl.textContent = prices[t] !== undefined ? prices[t] : '—';

      // time display
      const timeEl = document.createElement('div');
      timeEl.className = 'small';
      timeEl.id = `time-${t}`;

      // sparkline canvas
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 40;
      canvas.id = `spark-${t}`;
      canvas.style.marginTop = '6px';
      canvas.style.borderRadius = '4px';

      right.appendChild(priceEl);
      right.appendChild(timeEl);
      right.appendChild(canvas);

      row.appendChild(left);
      row.appendChild(right);
      subscribedList.appendChild(row);

      // draw initial sparkline (blank or seeded)
      drawSparkline(canvas, priceHistory[t]);
    });
  }

  // Draw sparkline function (simple scaled line chart)
  function drawSparkline(canvas, data) {
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    // Clear
    ctx.clearRect(0, 0, w, h);

    if (!data || data.length === 0) {
      // draw small neutral baseline
      ctx.strokeStyle = '#ccc';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(2, h / 2);
      ctx.lineTo(w - 2, h / 2);
      ctx.stroke();
      return;
    }

    // Scale data to fit canvas
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max === min) ? 1 : (max - min);

    // Trend color based on last change
    const trend = data[data.length - 1] - data[0];
    const color = trend >= 0 ? '#16a34a' : '#dc2626'; // green or red

    // Points
    const stepX = w / Math.max(data.length - 1, 1);
    const points = data.map((v, i) => {
      const x = i * stepX;
      // invert y: higher price -> lower y
      const y = h - ((v - min) / range) * (h - 6) - 3;
      return { x, y };
    });

    // draw filled area
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    // close to bottom
    ctx.lineTo(points[points.length - 1].x, h);
    ctx.lineTo(points[0].x, h);
    ctx.closePath();
    // fill with translucent color
    ctx.fillStyle = (trend >= 0) ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.08)';
    ctx.fill();

    // draw line
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();

    // draw last point circle
    const last = points[points.length - 1];
    ctx.beginPath();
    ctx.arc(last.x, last.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  }

  renderSupported();
  renderSubscribed();

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      window.location.href = '/';
    });
  }

  // Connect socket.io
  const socket = io('/', { auth: { token } });
  socket.on('connect_error', (err) => {
    console.error('Socket connect error', err && err.message ? err.message : err);
    if (err && err.message && err.message.toLowerCase().includes('authentication')) {
      alert('Socket authentication failed. Please sign in again.');
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  });

  socket.on('connect', () => console.log('Socket connected', socket.id));

  // Handle price_update: { ticker, price, ts }
  socket.on('price_update', payload => {
    const { ticker, price, ts } = payload;
    // Update latest price
    prices[ticker] = price;

    // Push into history (create if needed)
    if (!priceHistory[ticker]) priceHistory[ticker] = [];
    const hist = priceHistory[ticker];
    hist.push(price);
    if (hist.length > HISTORY_LEN) hist.shift();

    // Update DOM
    const priceEl = document.getElementById('price-' + ticker);
    if (priceEl) priceEl.textContent = price.toFixed ? price.toFixed(2) : price;
    const timeEl = document.getElementById('time-' + ticker);
    if (timeEl) timeEl.textContent = new Date(ts).toLocaleTimeString();

    // Redraw sparkline
    const canvas = document.getElementById('spark-' + ticker);
    if (canvas) drawSparkline(canvas, priceHistory[ticker]);
  });

})();
