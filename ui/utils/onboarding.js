// LAMARR — Hướng dẫn lần đầu

const STORAGE_KEY = 'lamarr-onboarding-done';

export class Onboarding {
  constructor(app) {
    this.app = app;
    this.overlay = null;
    this.currentStep = 0;
    this.steps = [];
    this.active = false;
  }

  init() {
    this.defineSteps();
    document.addEventListener('start-onboarding', () => this.start());
    if (!this.isDone()) {
      setTimeout(() => this.start(), 800);
    }
  }

  defineSteps() {
    this.steps = [
      {
        title: 'Chào mừng đến LAMARR',
        text: 'Cảm biến không gian qua WiFi CSI thực từ ESP32. Không skeleton giả — chỉ heatmap và điểm sáng 3D.',
        target: null,
        position: 'center',
      },
      {
        title: 'Trạng thái hệ thống',
        text: 'Theo dõi kết nối ESP32, sensing-server và nguồn dữ liệu CSI.',
        target: '.live-status-panel',
        position: 'bottom',
      },
      {
        title: 'Quét CSI trực tiếp',
        text: 'Tab này hiển thị trường signal_field và heatmap sàn phòng từ ESP32.',
        target: '[data-tab="demo"]',
        position: 'bottom',
      },
      {
        title: 'Cảm biến 3D',
        text: 'Xem điểm sáng Gaussian splat trên lưới 20×20 ô CSI.',
        target: '[data-tab="sensing"]',
        position: 'bottom',
      },
      {
        title: 'Phím tắt',
        text: 'Nhấn ? để xem phím tắt, Ctrl+K cho command palette.',
        target: null,
        position: 'center',
      },
      {
        title: 'Sẵn sàng!',
        text: 'Flash ESP32, chạy sensing-server, mở tab Quét CSI hoặc Đài quan sát.',
        target: null,
        position: 'center',
      },
    ];
  }

  isDone() {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1'
        || localStorage.getItem('ruview-onboarding-done') === '1';
    } catch {
      return false;
    }
  }

  markDone() {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch { /* noop */ }
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.currentStep = 0;
    this.showStep();
  }

  showStep() {
    const step = this.steps[this.currentStep];
    if (!step) {
      this.finish();
      return;
    }
    if (!this.overlay) this.createOverlay();
    this.overlay.querySelector('.onboarding-title').textContent = step.title;
    this.overlay.querySelector('.onboarding-text').textContent = step.text;
    const progress = this.overlay.querySelector('.onboarding-progress');
    if (progress) {
      progress.textContent = `${this.currentStep + 1} / ${this.steps.length}`;
    }
  }

  createOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <div class="onboarding-card">
        <div class="onboarding-progress"></div>
        <h3 class="onboarding-title"></h3>
        <p class="onboarding-text"></p>
        <div class="onboarding-actions">
          <button type="button" class="btn btn--secondary onboarding-skip">Bỏ qua</button>
          <button type="button" class="btn btn--primary onboarding-next">Tiếp</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);
    this.overlay.querySelector('.onboarding-skip').addEventListener('click', () => this.finish());
    this.overlay.querySelector('.onboarding-next').addEventListener('click', () => {
      this.currentStep++;
      if (this.currentStep >= this.steps.length) this.finish();
      else this.showStep();
    });
  }

  finish() {
    this.markDone();
    this.active = false;
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }

  dispose() {
    this.finish();
  }
}
