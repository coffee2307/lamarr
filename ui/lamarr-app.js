/**
 * LAMARR Cockpit — UI độc lập, CSI heatmap + quét 3D
 * Không phụ thuộc app.js / RuView cũ
 */

const WS_PORT_MAP = { '3000': '3001', '8080': '8765', '': '3001' };

function wsUrl() {
  const loc = window.location;
  const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = loc.hostname;
  const port = WS_PORT_MAP[loc.port] || loc.port || '3001';
  return `${proto}//${host}:${port}/ws/sensing`;
}

function httpBase() {
  return window.location.origin;
}

// ---- State ----
let ws = null;
let lastData = null;
let frameCount = 0;
let reconnectTimer = null;
let dataSource = 'wait';
let scanRenderer = null;
let animPhase = 0;
let pollTimer = null;
let bootTime = Date.now();

// ---- DOM ----
const $ = (id) => document.getElementById(id);

function setStatus(kind, text) {
  const pill = $('status-pill');
  if (!pill) return;
  pill.className = `lamarr-status-pill ${kind}`;
  pill.textContent = text;
}

function setMetric(id, val) {
  const el = $(id);
  if (el) el.textContent = val;
}

function setBar(id, pct) {
  const el = $(id);
  if (el) el.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

// ---- WebSocket ----
function connect() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) return;
  setStatus('wait', 'ĐANG KẾT NỐI CSI…');
  try {
    ws = new WebSocket(wsUrl());
  } catch (e) {
    setStatus('off', 'LỖI WEBSOCKET');
    scheduleReconnect();
    return;
  }

  ws.onopen = () => {
    setStatus('wait', 'ĐÃ KẾT NỐI — CHỜ CSI ESP32');
    fetchHealth();
    startPollFallback();
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      if (data.type === 'sensing_update' || data.signal_field) {
        onSensingFrame(data);
      }
    } catch { /* ignore */ }
  };

  ws.onclose = () => {
    ws = null;
    setStatus('off', 'MẤT KẾT NỐI — THỬ LẠI…');
    scheduleReconnect();
  };

  ws.onerror = () => { /* onclose handles */ };
}

function scheduleReconnect() {
  clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connect, 2500);
}

const SRC_VI = {
  esp32: 'ESP32 (UDP)',
  simulated: 'Mô phỏng',
  simulate: 'Mô phỏng',
  wifi: 'WiFi máy tính',
  linux: 'WiFi Linux',
  macos: 'WiFi macOS',
};

function showEsp32Banner(show, text) {
  let el = $('esp32-banner');
  if (!el) return;
  el.hidden = !show;
  if (text) el.textContent = text;
}

function startPollFallback() {
  clearInterval(pollTimer);
  pollTimer = setInterval(async () => {
    if (frameCount > 0) {
      showEsp32Banner(false);
      return;
    }
    try {
      const r = await fetch(`${httpBase()}/api/v1/sensing/latest`, { signal: AbortSignal.timeout(2000) });
      if (!r.ok) return;
      const data = await r.json();
      if (data?.signal_field || data?.type === 'sensing_update') {
        onSensingFrame(data);
      }
    } catch { /* ignore */ }
    if (frameCount === 0 && Date.now() - bootTime > 8000) {
      showEsp32Banner(true,
        'Chưa nhận CSI từ ESP32 (0 node). Kiểm tra: firmware flash, WiFi provision, target-ip PC, cổng UDP 5005, ESP32 cùng mạng LAN.');
    }
  }, 2000);
}

async function fetchHealth() {
  try {
    const r = await fetch(`${httpBase()}/health`, { signal: AbortSignal.timeout(2000) });
    const h = await r.json();
    const st = (h.status || '').toLowerCase();
    $('footer-health').textContent = st === 'ok' || st === 'healthy' ? 'Sẵn sàng' : (h.status || '—');
    const src = (h.source || '').toLowerCase();
    $('footer-source').textContent = SRC_VI[src] || h.source || '—';
  } catch {
    $('footer-health').textContent = '—';
  }
}

function onSensingFrame(data) {
  lastData = data;
  frameCount++;
  const src = (data.source || '').toLowerCase();
  const isEsp = src === 'esp32' || src === 'wifi' || src === 'linux' || src === 'macos';

  showEsp32Banner(false);

  if (isEsp) {
    dataSource = 'live';
    setStatus('live', '● CSI TRỰC TIẾP — ESP32');
  } else if (src === 'simulated' || src === 'simulate') {
    dataSource = 'sim';
    setStatus('sim', '◆ MÔ PHỎNG SERVER');
  } else {
    dataSource = 'live';
    setStatus('live', '● DỮ LIỆU SENSING');
  }

  const c = data.classification || {};
  const f = data.features || {};
  const motion = c.motion_level || 'absent';
  const motionVi = { absent: 'Vắng', present_still: 'Đứng yên', active: 'Chuyển động' }[motion] || motion;

  setMetric('m-presence', c.presence ? 'CÓ NGƯỜI' : 'KHÔNG');
  setMetric('m-motion', motionVi);
  setMetric('m-conf', `${Math.round((c.confidence || 0) * 100)}%`);
  setMetric('m-rssi', f.mean_rssi != null ? `${f.mean_rssi.toFixed(1)} dBm` : '—');
  setMetric('m-motion-pwr', (f.motion_band_power || 0).toFixed(4));
  setMetric('m-breath', (f.breathing_band_power || 0).toFixed(4));
  setMetric('m-nodes', String(data.nodes?.length || 0));
  setMetric('m-frames', String(frameCount));
  setMetric('m-src', SRC_VI[(data.source || '').toLowerCase()] || data.source || '—');

  setBar('bar-motion', (f.motion_band_power || 0) * 200);
  setBar('bar-breath', (f.breathing_band_power || 0) * 200);
  setBar('bar-conf', (c.confidence || 0) * 100);

  drawHeatmap(data);
  drawSpectrumMini(data);
  if (scanRenderer) scanRenderer.update(data);

  $('footer-fps').textContent = String(frameCount);
  const pfc = $('panel-frame-count');
  if (pfc) pfc.textContent = `${frameCount} khung`;
  $('footer-ts').textContent = new Date().toLocaleTimeString('vi-VN');
}

// ---- 2D Heatmap (luôn vẽ — kể cả mô phỏng) ----
function drawHeatmap(data) {
  const canvas = $('heatmap-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const grid = 20;
  const cell = w / grid;
  const vals = data?.signal_field?.values || generateDemoField();

  ctx.fillStyle = '#05040a';
  ctx.fillRect(0, 0, w, h);

  for (let z = 0; z < grid; z++) {
    for (let x = 0; x < grid; x++) {
      const v = Math.min(1, Math.max(0, vals[z * grid + x] ?? 0));
      const hue = 280 - v * 220;
      const lit = 28 + v * 52;
      ctx.fillStyle = `hsl(${hue}, 85%, ${lit}%)`;
      ctx.fillRect(x * cell + 1, z * cell + 1, cell - 2, cell - 2);
    }
  }

  // Grid overlay
  ctx.strokeStyle = 'rgba(0,245,212,0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i <= grid; i++) {
    ctx.beginPath();
    ctx.moveTo(i * cell, 0);
    ctx.lineTo(i * cell, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * cell);
    ctx.lineTo(w, i * cell);
    ctx.stroke();
  }

  // Peak từ CSI thật
  let maxV = 0, mx = 0, mz = 0;
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] > maxV) {
      maxV = vals[i];
      mz = Math.floor(i / grid);
      mx = i % grid;
    }
  }
  if (maxV > 0.05) {
    const cx = (mx + 0.5) * cell;
    const cy = (mz + 0.5) * cell;
    ctx.strokeStyle = '#00f5d4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, cell * 0.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(0,245,212,0.9)';
    ctx.font = '11px JetBrains Mono';
    ctx.fillText('ĐỈNH CSI', cx + cell * 0.45, cy - 4);
  }
}

function generateDemoField() {
  animPhase += 0.04;
  const out = new Array(400).fill(0);
  const cx = 10 + Math.sin(animPhase) * 4;
  const cz = 10 + Math.cos(animPhase * 0.7) * 4;
  for (let z = 0; z < 20; z++) {
    for (let x = 0; x < 20; x++) {
      const d = Math.hypot(x - cx, z - cz);
      out[z * 20 + x] = Math.max(0, 1 - d / 6) * 0.7;
    }
  }
  return out;
}

function drawSpectrumMini(data) {
  const canvas = $('spectrum-mini');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  const amp = data?.nodes?.[0]?.amplitude;
  const src = amp?.length ? amp : Array.from({ length: 48 }, (_, i) => 0.3 + 0.7 * Math.abs(Math.sin(i * 0.2 + animPhase)));

  ctx.fillStyle = '#05040a';
  ctx.fillRect(0, 0, w, h);
  const n = src.length;
  const bw = w / n;
  let max = 1;
  for (const a of src) max = Math.max(max, Math.abs(a));

  for (let i = 0; i < n; i++) {
    const norm = Math.abs(src[i]) / max;
    const bh = norm * (h - 4);
    const g = ctx.createLinearGradient(0, h, 0, 0);
    g.addColorStop(0, '#1a0a2e');
    g.addColorStop(1, `rgba(255,107,203,${0.5 + norm * 0.5})`);
    ctx.fillStyle = g;
    ctx.fillRect(i * bw, h - bh, Math.max(1, bw - 1), bh);
  }
}

// ---- Three.js 3D scan ----
async function initScan3D() {
  if (window.THREE) return;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
    s.onload = res;
    s.onerror = rej;
    document.head.appendChild(s);
  });
}

function createScanRenderer(container) {
  const THREE = window.THREE;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05040a);
  const w = container.clientWidth || 600;
  const h = container.clientHeight || 280;
  const camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 100);
  camera.position.set(0, 12, 14);
  camera.lookAt(0, 0, 0);
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(w, h);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const grid = new THREE.GridHelper(20, 20, 0x7b61ff, 0x1a1030);
  scene.add(grid);

  const count = 400;
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const ix = i % 20, iz = Math.floor(i / 20);
    pos[i * 3] = ix - 9.5;
    pos[i * 3 + 1] = 0.05;
    pos[i * 3 + 2] = iz - 9.5;
    col[i * 3] = 0.1; col[i * 3 + 1] = 0.2; col[i * 3 + 2] = 0.5;
    sizes[i] = 2;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.35,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let az = 0;
  function animate() {
    requestAnimationFrame(animate);
    az += 0.002;
    camera.position.x = Math.sin(az) * 16;
    camera.position.z = Math.cos(az) * 16;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  animate();

  return {
    update(data) {
      const vals = data?.signal_field?.values || generateDemoField();
      const p = geo.attributes.position.array;
      const c = geo.attributes.color.array;
      for (let i = 0; i < count; i++) {
        const v = Math.min(1, vals[i] ?? 0);
        p[i * 3 + 1] = v * 3.5;
        c[i * 3] = 0.2 + v * 0.8;
        c[i * 3 + 1] = 0.1 + v * 0.6;
        c[i * 3 + 2] = 0.9 - v * 0.5;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.color.needsUpdate = true;
    },
    resize() {
      const rw = container.clientWidth;
      const rh = container.clientHeight;
      if (rw < 10) return;
      camera.aspect = rw / rh;
      camera.updateProjectionMatrix();
      renderer.setSize(rw, rh);
    },
  };
}

// ---- Boot ----
async function boot() {
  connect();

  const heatCanvas = $('heatmap-canvas');
  if (heatCanvas) {
    const ro = new ResizeObserver(() => {
      const rect = heatCanvas.parentElement.getBoundingClientRect();
      heatCanvas.width = Math.floor(rect.width) || 400;
      heatCanvas.height = Math.floor(rect.height) || 400;
      if (lastData) drawHeatmap(lastData);
      else drawHeatmap({ signal_field: { values: generateDemoField() } });
    });
    ro.observe(heatCanvas.parentElement);
  }

  // Demo animation khi chưa có WS
  setInterval(() => {
    if (!lastData) {
      drawHeatmap({ signal_field: { values: generateDemoField() } });
      drawSpectrumMini(null);
    }
  }, 80);

  await initScan3D();
  const vp = $('scan-viewport');
  if (vp) {
    scanRenderer = createScanRenderer(vp);
    new ResizeObserver(() => scanRenderer?.resize()).observe(vp);
  }

  document.querySelectorAll('.lamarr-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lamarr-nav-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.unregister());
    });
  }
}

boot();
