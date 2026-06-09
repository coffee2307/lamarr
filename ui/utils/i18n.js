// LAMARR — Internationalization (Vietnamese primary)

const translations = {
  vi: {
    'nav.dashboard': 'Bảng điều khiển',
    'nav.hardware': 'Phần cứng',
    'nav.demo': 'Quét CSI trực tiếp',
    'nav.architecture': 'Kiến trúc',
    'nav.performance': 'Hiệu năng',
    'nav.applications': 'Ứng dụng',
    'nav.sensing': 'Cảm biến 3D',
    'nav.training': 'Huấn luyện',
    'nav.observatory': 'Đài quan sát',
    'nav.poseFusion': 'Hợp nhất tín hiệu',

    'brand.title': 'LAMARR',
    'brand.subtitle': 'Cảm biến không gian qua sóng WiFi — dữ liệu CSI thực',
    'brand.tagline': 'Theo dõi hiện diện & chuyển động từ tín hiệu radio, không camera',

    'dashboard.title': 'Cảm biến WiFi LAMARR',
    'dashboard.subtitle': 'Phát hiện người & chuyển động qua tường bằng CSI thực',
    'dashboard.description': 'Hệ thống đọc Channel State Information (CSI) từ ESP32 và hiển thị trường tín hiệu dưới dạng heatmap / điểm sáng 3D. Không dùng skeleton suy diễn — chỉ dữ liệu WiFi đo được.',
    'dashboard.status': 'Trạng thái hệ thống',
    'dashboard.metrics': 'Tài nguyên máy chủ',
    'dashboard.features': 'Tính năng',
    'dashboard.liveStats': 'Thống kê trực tiếp',

    'status.apiServer': 'Máy chủ API',
    'status.hardware': 'ESP32 / Phần cứng',
    'status.inference': 'Xử lý tín hiệu',
    'status.streaming': 'Luồng WebSocket',
    'status.dataSource': 'Nguồn dữ liệu',

    'metrics.cpu': 'CPU',
    'metrics.memory': 'Bộ nhớ',
    'metrics.disk': 'Ổ đĩa',

    'stat.activePersons': 'Vùng nhiễu loạn',
    'stat.avgConfidence': 'Độ tin cậy CSI',
    'stat.totalDetections': 'Khung đã nhận',
    'stat.zoneOccupancy': 'Mức chiếm phòng',

    'benefit.throughWalls': 'Xuyên tường',
    'benefit.throughWallsDesc': 'CSI phản xạ từ cơ thể qua vách kín',
    'benefit.privacy': 'Riêng tư',
    'benefit.privacyDesc': 'Không camera — chỉ phân tích sóng WiFi',
    'benefit.realtime': 'Thời gian thực',
    'benefit.realtimeDesc': 'Cập nhật ~20 Hz từ ESP32-S3',
    'benefit.lowCost': 'Chi phí thấp',
    'benefit.lowCostDesc': 'Node ESP32 từ ~$9',

    'stat.bodyRegions': 'Ô lưới CSI',
    'stat.samplingRate': 'Tần số lấy mẫu',
    'stat.accuracy': 'Nguồn dữ liệu',
    'stat.hardwareCost': 'Node ESP32',

    'hardware.title': 'Cấu hình phần cứng',
    'hardware.antenna': 'Mảng anten 3×3',
    'hardware.wifiConfig': 'Cấu hình WiFi',
    'hardware.csiData': 'CSI thời gian thực',

    'demo.title': 'Quét không gian CSI',
    'demo.start': 'Bắt đầu quét',
    'demo.stop': 'Dừng quét',
    'demo.signal': 'Phổ tín hiệu WiFi',
    'demo.field': 'Trường nhiễu loạn 3D',
    'demo.heatmap': 'Heatmap sàn phòng',

    'arch.title': 'Kiến trúc pipeline',
    'perf.title': 'Phân tích hiệu năng',
    'apps.title': 'Ứng dụng thực tế',
    'train.title': 'Huấn luyện mô hình',
    'train.desc': 'Ghi CSI, huấn luyện và quản lý file .rvf',

    'action.startDetection': 'Bắt đầu',
    'action.stopDetection': 'Dừng',
    'action.toggleTheme': 'Đổi giao diện',
    'action.exportData': 'Xuất dữ liệu',
    'action.screenshot': 'Chụp màn hình',

    'conn.connected': 'Đã kết nối',
    'conn.connecting': 'Đang kết nối...',
    'conn.offline': 'Ngoại tuyến',
    'conn.reconnecting': 'Đang kết nối lại...',
    'conn.live': 'CSI trực tiếp',
    'conn.simulated': 'Mô phỏng',
    'conn.esp32': 'ESP32 thật',

    'misc.loading': 'Đang tải...',
    'misc.error': 'Có lỗi xảy ra',
    'misc.noData': 'Chưa có dữ liệu CSI',
    'misc.close': 'Đóng',
    'misc.cancel': 'Hủy',
    'misc.confirm': 'Xác nhận',
    'misc.settings': 'Cài đặt',
    'misc.language': 'Ngôn ngữ',
    'misc.skip': 'Bỏ qua nội dung chính',

    'sensing.title': 'Cảm biến WiFi trực tiếp',
    'sensing.about': 'Dữ liệu từ CSI thật — heatmap 20×20 ô trên sàn phòng',
    'sensing.connection': 'Kết nối',
    'sensing.classification': 'Phân loại',
    'sensing.nodes': 'Trạng thái node',

    'motion.absent': 'Vắng mặt',
    'motion.still': 'Đứng yên',
    'motion.active': 'Đang chuyển động',
  },

  en: {
    'nav.dashboard': 'Dashboard',
    'nav.hardware': 'Hardware',
    'nav.demo': 'Live CSI Scan',
    'nav.architecture': 'Architecture',
    'nav.performance': 'Performance',
    'nav.applications': 'Applications',
    'nav.sensing': '3D Sensing',
    'nav.training': 'Training',
    'nav.observatory': 'Observatory',
    'nav.poseFusion': 'Signal Fusion',

    'brand.title': 'LAMARR',
    'brand.subtitle': 'Spatial sensing via real WiFi CSI',
    'brand.tagline': 'Presence & motion from radio — no camera',

    'dashboard.title': 'LAMARR WiFi Sensing',
    'dashboard.subtitle': 'Real CSI presence & motion through walls',
    'dashboard.description': 'Reads Channel State Information from ESP32 and renders signal fields as 3D point clouds / heatmaps. No inferred skeletons — WiFi measurements only.',
    'dashboard.status': 'System Status',
    'dashboard.metrics': 'Server Resources',
    'dashboard.features': 'Features',
    'dashboard.liveStats': 'Live Statistics',

    'status.apiServer': 'API Server',
    'status.hardware': 'ESP32 / Hardware',
    'status.inference': 'Signal Processing',
    'status.streaming': 'WebSocket Stream',
    'status.dataSource': 'Data Source',

    'metrics.cpu': 'CPU',
    'metrics.memory': 'Memory',
    'metrics.disk': 'Disk',

    'stat.activePersons': 'Disruption zones',
    'stat.avgConfidence': 'CSI confidence',
    'stat.totalDetections': 'Frames received',
    'stat.zoneOccupancy': 'Room occupancy',

    'benefit.throughWalls': 'Through Walls',
    'benefit.throughWallsDesc': 'CSI reflections from bodies behind barriers',
    'benefit.privacy': 'Privacy',
    'benefit.privacyDesc': 'No cameras — WiFi signal analysis only',
    'benefit.realtime': 'Real-Time',
    'benefit.realtimeDesc': '~20 Hz updates from ESP32-S3',
    'benefit.lowCost': 'Low Cost',
    'benefit.lowCostDesc': 'ESP32 nodes from ~$9',

    'stat.bodyRegions': 'CSI grid cells',
    'stat.samplingRate': 'Sample rate',
    'stat.accuracy': 'Data source',
    'stat.hardwareCost': 'ESP32 node',

    'hardware.title': 'Hardware Configuration',
    'hardware.antenna': '3×3 Antenna Array',
    'hardware.wifiConfig': 'WiFi Configuration',
    'hardware.csiData': 'Real-time CSI',

    'demo.title': 'CSI Space Scan',
    'demo.start': 'Start Scan',
    'demo.stop': 'Stop Scan',
    'demo.signal': 'WiFi Signal Spectrum',
    'demo.field': '3D Disruption Field',
    'demo.heatmap': 'Floor Heatmap',

    'arch.title': 'Pipeline Architecture',
    'perf.title': 'Performance Analysis',
    'apps.title': 'Applications',
    'train.title': 'Model Training',
    'train.desc': 'Record CSI, train models, manage .rvf files',

    'action.startDetection': 'Start',
    'action.stopDetection': 'Stop',
    'action.toggleTheme': 'Toggle theme',
    'action.exportData': 'Export data',
    'action.screenshot': 'Screenshot',

    'conn.connected': 'Connected',
    'conn.connecting': 'Connecting...',
    'conn.offline': 'Offline',
    'conn.reconnecting': 'Reconnecting...',
    'conn.live': 'Live CSI',
    'conn.simulated': 'Simulated',
    'conn.esp32': 'Real ESP32',

    'misc.loading': 'Loading...',
    'misc.error': 'An error occurred',
    'misc.noData': 'No CSI data yet',
    'misc.close': 'Close',
    'misc.cancel': 'Cancel',
    'misc.confirm': 'Confirm',
    'misc.settings': 'Settings',
    'misc.language': 'Language',
    'misc.skip': 'Skip to main content',

    'sensing.title': 'Live WiFi Sensing',
    'sensing.about': 'Real CSI — 20×20 floor heatmap from signal_field',
    'sensing.connection': 'Connection',
    'sensing.classification': 'Classification',
    'sensing.nodes': 'Node status',

    'motion.absent': 'Absent',
    'motion.still': 'Still',
    'motion.active': 'Active',
  },
};

export class I18n {
  constructor() {
    this.locale = this.getSavedLocale() || 'vi';
    this.listeners = [];
  }

  init() {
    document.documentElement.setAttribute('lang', this.locale);
    this.createSelector();
    this.applyTranslations();
  }

  getSavedLocale() {
    try {
      return localStorage.getItem('lamarr-locale')
        || localStorage.getItem('ruview-locale');
    } catch {
      return null;
    }
  }

  saveLocale(locale) {
    try { localStorage.setItem('lamarr-locale', locale); }
    catch { /* noop */ }
  }

  t(key) {
    const dict = translations[this.locale] || translations.vi;
    return dict[key] || translations.vi[key] || translations.en[key] || key;
  }

  setLocale(locale) {
    if (!translations[locale]) return;
    this.locale = locale;
    this.saveLocale(locale);
    document.documentElement.setAttribute('lang', locale);
    this.applyTranslations();
    this.listeners.forEach(cb => { try { cb(locale); } catch { /* noop */ } });
  }

  onLocaleChange(callback) {
    this.listeners.push(callback);
    return () => {
      const i = this.listeners.indexOf(callback);
      if (i > -1) this.listeners.splice(i, 1);
    };
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = this.t(key);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
      el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
    });
    const selector = document.getElementById('lang-selector');
    if (selector) selector.value = this.locale;
    document.title = `${this.t('brand.title')} — ${this.t('brand.subtitle')}`;
  }

  createSelector() {
    const wrapper = document.createElement('div');
    wrapper.className = 'lang-selector-wrap';
    wrapper.innerHTML = `
      <select id="lang-selector" class="lang-selector" aria-label="${this.t('misc.language')}">
        <option value="vi">VI</option>
        <option value="en">EN</option>
      </select>
    `;
    wrapper.querySelector('select').addEventListener('change', (e) => this.setLocale(e.target.value));
    const headerInfo = document.querySelector('.header-info');
    if (headerInfo) headerInfo.appendChild(wrapper);
  }

  dispose() {
    this.listeners = [];
  }
}

export const i18n = new I18n();
