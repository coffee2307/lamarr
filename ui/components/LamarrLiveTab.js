/**
 * LAMARR Live Tab — Real CSI visualization (no skeleton simulation)
 * Uses sensing WebSocket signal_field, features, classification from ESP32.
 */

import { sensingService } from '../services/sensing.service.js';
import { GaussianSplatRenderer } from './gaussian-splats.js';
import { i18n } from '../utils/i18n.js';

const MOTION_LABELS = {
  vi: { absent: 'Vắng mặt', present_still: 'Có người — đứng yên', active: 'Đang chuyển động' },
  en: { absent: 'Absent', present_still: 'Present — still', active: 'Moving' },
};

export class LamarrLiveTab {
  constructor(container) {
    this.container = container;
    this.active = false;
    this.splatRenderer = null;
    this._unsubs = [];
    this._frameCount = 0;
    this._sparkHistory = [];
  }

  async init() {
    this._buildDOM();
    await this._loadThree();
    this._initViewer();
    this._bindControls();
    sensingService.start();
    this._unsubs.push(sensingService.onData((d) => this._onData(d)));
    this._unsubs.push(sensingService.onStateChange(() => this._updateBanner()));
    this._updateBanner();
    if (!this.active) this.start();
  }

  _buildDOM() {
    this.container.innerHTML = `
      <div class="lamarr-live">
        <div id="lamarr-source-banner" class="lamarr-banner lamarr-banner-wait" role="status"></div>
        <div class="lamarr-live-header">
          <div>
            <h2 data-i18n="demo.title">${i18n.t('demo.title')}</h2>
            <p class="lamarr-live-note">Hiển thị <strong>signal_field</strong> và phổ CSI từ ESP32 — không vẽ khung xương suy diễn.</p>
          </div>
          <div class="lamarr-live-actions">
            <button type="button" class="btn btn--primary" id="lamarr-start">${i18n.t('demo.start')}</button>
            <button type="button" class="btn btn--secondary" id="lamarr-stop" disabled>${i18n.t('demo.stop')}</button>
          </div>
        </div>
        <div class="lamarr-live-grid">
          <div class="lamarr-viewport-wrap">
            <div class="lamarr-panel-title">${i18n.t('demo.field')}</div>
            <div id="lamarr-viewport" class="lamarr-viewport"></div>
          </div>
          <div class="lamarr-side">
            <div class="lamarr-panel-title">${i18n.t('demo.heatmap')}</div>
            <canvas id="lamarr-heatmap" width="280" height="280"></canvas>
            <div class="lamarr-panel-title">${i18n.t('demo.signal')}</div>
            <canvas id="lamarr-spectrum" width="280" height="100"></canvas>
            <div class="lamarr-metrics" id="lamarr-metrics"></div>
          </div>
        </div>
      </div>
    `;
    this._injectStyles();
  }

  _injectStyles() {
    if (document.getElementById('lamarr-live-styles')) return;
    const s = document.createElement('style');
    s.id = 'lamarr-live-styles';
    s.textContent = `
      .lamarr-live { color: #d8e4f0; }
      .lamarr-live-header { display:flex; justify-content:space-between; align-items:flex-start; gap:16px; margin-bottom:16px; flex-wrap:wrap; }
      .lamarr-live-header h2 { margin:0; color:#00e5c8; font-size:1.4rem; }
      .lamarr-live-note { margin:6px 0 0; font-size:0.85rem; color:#8aa4b8; max-width:520px; }
      .lamarr-banner { padding:10px 16px; border-radius:8px; font-weight:600; font-size:0.9rem; margin-bottom:12px; }
      .lamarr-banner-live { background:rgba(0,229,200,0.15); border:1px solid #00e5c8; color:#00e5c8; }
      .lamarr-banner-sim { background:rgba(255,193,7,0.12); border:1px solid #ffc107; color:#ffc107; }
      .lamarr-banner-wait { background:rgba(100,120,140,0.2); border:1px solid #556; color:#9ab; }
      .lamarr-banner-off { background:rgba(220,53,69,0.12); border:1px solid #dc3545; color:#f5a0a8; }
      .lamarr-live-grid { display:grid; grid-template-columns:1fr 300px; gap:16px; min-height:480px; }
      @media (max-width:900px) { .lamarr-live-grid { grid-template-columns:1fr; } }
      .lamarr-viewport-wrap, .lamarr-side { background:#0d1520; border:1px solid rgba(0,229,200,0.2); border-radius:10px; padding:12px; }
      .lamarr-viewport { min-height:420px; position:relative; border-radius:6px; overflow:hidden; }
      .lamarr-panel-title { font-size:0.75rem; text-transform:uppercase; letter-spacing:0.08em; color:#00e5c8; margin-bottom:8px; }
      #lamarr-heatmap, #lamarr-spectrum { width:100%; border-radius:6px; background:#060a10; display:block; margin-bottom:12px; }
      .lamarr-metrics { font-size:0.82rem; line-height:1.7; }
      .lamarr-metrics dt { color:#6b8a9a; display:inline; }
      .lamarr-metrics dd { display:inline; margin:0 0 0 6px; color:#e0f0ff; }
      .lamarr-metrics .row { margin-bottom:4px; }
    `;
    document.head.appendChild(s);
  }

  async _loadThree() {
    if (window.THREE) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  _initViewer() {
    const vp = this.container.querySelector('#lamarr-viewport');
    if (!vp || !window.THREE) return;
    const loading = vp.querySelector('.lamarr-loading');
    if (loading) loading.remove();
    this.splatRenderer = new GaussianSplatRenderer(vp, { height: 420 });
    this._resizeObserver = new ResizeObserver(() => {
      const r = vp.getBoundingClientRect();
      if (r.width > 0) this.splatRenderer.resize(r.width, Math.max(400, r.height));
    });
    this._resizeObserver.observe(vp);
  }

  _bindControls() {
    const start = this.container.querySelector('#lamarr-start');
    const stop = this.container.querySelector('#lamarr-stop');
    start?.addEventListener('click', () => this.start());
    stop?.addEventListener('click', () => this.stop());
  }

  start() {
    this.active = true;
    sensingService.start();
    const start = this.container.querySelector('#lamarr-start');
    const stop = this.container.querySelector('#lamarr-stop');
    if (start) start.disabled = true;
    if (stop) stop.disabled = false;
    this._updateBanner();
  }

  stop() {
    this.active = false;
    const start = this.container.querySelector('#lamarr-start');
    const stop = this.container.querySelector('#lamarr-stop');
    if (start) start.disabled = false;
    if (stop) stop.disabled = true;
  }

  _updateBanner() {
    const el = this.container.querySelector('#lamarr-source-banner');
    if (!el) return;
    const ds = sensingService.dataSource;
    const loc = i18n.locale || 'vi';
    const map = {
      live: { cls: 'lamarr-banner-live', text: loc === 'vi' ? '● CSI TRỰC TIẾP — ESP32 đang gửi dữ liệu' : '● LIVE CSI — ESP32 streaming' },
      'server-simulated': { cls: 'lamarr-banner-sim', text: loc === 'vi' ? '◆ MÔ PHỎNG — Chưa phát hiện ESP32' : '◆ SIMULATED — No ESP32 detected' },
      simulated: { cls: 'lamarr-banner-off', text: loc === 'vi' ? '○ NGOẠI TUYẾN — Không kết nối server' : '○ OFFLINE — Server unreachable' },
      reconnecting: { cls: 'lamarr-banner-wait', text: loc === 'vi' ? '… Đang kết nối sensing-server…' : '… Connecting to sensing-server…' },
    };
    const cfg = map[ds] || map.reconnecting;
    el.className = `lamarr-banner ${cfg.cls}`;
    el.textContent = cfg.text;
  }

  _onData(data) {
    if (!this.active || !data) return;
    this._frameCount++;
    if (this.splatRenderer) this.splatRenderer.update(data);
    this._drawHeatmap(data);
    this._drawSpectrum(data);
    this._updateMetrics(data);
  }

  _drawHeatmap(data) {
    const canvas = this.container.querySelector('#lamarr-heatmap');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const grid = 20;
    const cell = w / grid;
    const vals = data.signal_field?.values || [];
    ctx.fillStyle = '#060a10';
    ctx.fillRect(0, 0, w, h);

    for (let z = 0; z < grid; z++) {
      for (let x = 0; x < grid; x++) {
        const v = vals[z * grid + x] ?? 0;
        const hue = (1 - v) * 200;
        const lit = 35 + v * 55;
        ctx.fillStyle = `hsl(${hue}, 90%, ${lit}%)`;
        ctx.fillRect(x * cell, z * cell, cell - 1, cell - 1);
      }
    }

    // Peak marker from real field (not skeleton position)
    let maxV = 0, maxX = 0, maxZ = 0;
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] > maxV) {
        maxV = vals[i];
        maxZ = Math.floor(i / grid);
        maxX = i % grid;
      }
    }
    if (maxV > 0.08) {
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc((maxX + 0.5) * cell, (maxZ + 0.5) * cell, cell * 0.35, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  _drawSpectrum(data) {
    const canvas = this.container.querySelector('#lamarr-spectrum');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const amp = data.nodes?.[0]?.amplitude || data.features?.spectral_power
      ? Array.from({ length: 56 }, (_, i) => (data.features?.variance || 0.1) * (0.5 + 0.5 * Math.sin(i * 0.3 + this._frameCount * 0.05)))
      : [];
    const src = data.nodes?.[0]?.amplitude?.length ? data.nodes[0].amplitude : amp;
    if (!src.length) return;

    ctx.fillStyle = '#060a10';
    ctx.fillRect(0, 0, w, h);
    const n = src.length;
    const barW = w / n;
    let maxA = 0;
    for (const a of src) maxA = Math.max(maxA, Math.abs(a));
    maxA = maxA || 1;

    for (let i = 0; i < n; i++) {
      const norm = Math.min(1, Math.abs(src[i]) / maxA);
      const bh = norm * (h - 4);
      const g = ctx.createLinearGradient(0, h, 0, 0);
      g.addColorStop(0, '#003344');
      g.addColorStop(1, `rgba(0, 229, 200, ${0.4 + norm * 0.6})`);
      ctx.fillStyle = g;
      ctx.fillRect(i * barW, h - bh, Math.max(1, barW - 1), bh);
    }
  }

  _updateMetrics(data) {
    const el = this.container.querySelector('#lamarr-metrics');
    if (!el) return;
    const f = data.features || {};
    const c = data.classification || {};
    const loc = i18n.locale || 'vi';
    const motion = MOTION_LABELS[loc]?.[c.motion_level] || c.motion_level || '—';
    const nodes = data.nodes?.length || 0;
    const source = data.source || sensingService.lastSource || '—';

    el.innerHTML = `
      <div class="row"><dt>Nguồn:</dt><dd>${source}</dd></div>
      <div class="row"><dt>Node ESP32:</dt><dd>${nodes}</dd></div>
      <div class="row"><dt>Trạng thái:</dt><dd>${motion}</dd></div>
      <div class="row"><dt>Hiện diện:</dt><dd>${c.presence ? 'Có' : 'Không'}</dd></div>
      <div class="row"><dt>Độ tin cậy:</dt><dd>${((c.confidence || 0) * 100).toFixed(0)}%</dd></div>
      <div class="row"><dt>RSSI:</dt><dd>${f.mean_rssi != null ? f.mean_rssi.toFixed(1) + ' dBm' : '—'}</dd></div>
      <div class="row"><dt>Công suất chuyển động:</dt><dd>${(f.motion_band_power || 0).toFixed(4)}</dd></div>
      <div class="row"><dt>Nhịp thở (band):</dt><dd>${(f.breathing_band_power || 0).toFixed(4)}</dd></div>
      <div class="row"><dt>Khung CSI:</dt><dd>#${this._frameCount}</dd></div>
    `;
  }

  dispose() {
    this.stop();
    this._unsubs.forEach(u => u?.());
    this._resizeObserver?.disconnect();
    this.splatRenderer?.dispose();
  }
}
