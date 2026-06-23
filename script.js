// [STATE] Data global aplikasi
let currentRGB = {r:108, g:99, b:255};
let colorHistory = [];
let activeTab = 'rgb';

// [A] RGB → CMYK
function rgbToCMYK(r, g, b) {
  // Normalisasi ke 0-1
  let rp = r / 255;
  let gp = g / 255;
  let bp = b / 255;

  // Hitung K (Key/Black)
  let K = 1 - Math.max(rp, gp, bp);
  if (K === 1) return { c: 0, m: 0, y: 0, k: 100 };

  // Hitung C, M, Y
  let C = (1 - rp - K) / (1 - K);
  let M = (1 - gp - K) / (1 - K);
  let Y = (1 - bp - K) / (1 - K);

  return {
    c: Math.round(C * 100),
    m: Math.round(M * 100),
    y: Math.round(Y * 100),
    k: Math.round(K * 100)
  };
}

// [B] CMYK → RGB
function cmykToRGB(c, m, y, k) {
  // Konversi persentase ke desimal
  let C = c / 100;
  let M = m / 100;
  let Y = y / 100;
  let K = k / 100;

  let R = Math.round(255 * (1 - C) * (1 - K));
  let G = Math.round(255 * (1 - M) * (1 - K));
  let B = Math.round(255 * (1 - Y) * (1 - K));

  return { r: R, g: G, b: B };
}

// [C] RGB → HSV
function rgbToHSV(r, g, b) {
  // Normalisasi berbasis proporsi
  let sum = r + g + b;
  if (sum === 0) return { h: 0, s: 0, v: 0 };

  let rn = r / sum;
  let gn = g / sum;
  let bn = b / sum;

  let V = Math.max(rn, gn, bn);
  let minVal = Math.min(rn, gn, bn);
  let S = (V > 0) ? 1 - minVal / V : 0;

  // Hitung H berdasarkan komponen dominan
  let H = 0;
  if (V === rn) {
    H = 60 * (gn - bn) / (S * V);
  } else if (V === gn) {
    H = 60 * (2 + (bn - rn) / (S * V));
  } else {
    H = 60 * (4 + (rn - gn) / (S * V));
  }

  if (H < 0) H = H + 360;

  return {
    h: Math.round(H),
    s: Math.round(S * 100),
    v: Math.round(V * 100)
  };
}

// [D] HSV → RGB
function hsvToRGB(h, s, v) {
  let S = s / 100;
  let V = v / 100;

  let C = V * S;
  let X = C * (1 - Math.abs((h / 60) % 2 - 1));
  let m = V - C;

  let r1, g1, b1;
  if (h < 60)      { r1=C; g1=X; b1=0; }
  else if (h < 120){ r1=X; g1=C; b1=0; }
  else if (h < 180){ r1=0; g1=C; b1=X; }
  else if (h < 240){ r1=0; g1=X; b1=C; }
  else if (h < 300){ r1=X; g1=0; b1=C; }
  else             { r1=C; g1=0; b1=X; }

  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255)
  };
}

// [E] RGB → HEX
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(v => {
    let hex = Math.max(0, Math.min(255, v)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

// [F] Update UI — tampilkan semua hasil konversi
function updateUI(r, g, b) {
  currentRGB = { r, g, b };
  let hex = rgbToHex(r, g, b);
  let cmyk = rgbToCMYK(r, g, b);
  let hsv = rgbToHSV(r, g, b);

  // Preview warna
  document.getElementById('preview').style.backgroundColor = hex;
  document.getElementById('preview-label').textContent = hex;
  document.getElementById('hex-display').textContent = hex + ' ✂';

  // Warna teks kontras otomatis
  let brightness = 0.299*r + 0.587*g + 0.114*b;
  document.getElementById('preview-label').style.color = brightness > 128 ? '#000' : '#fff';

  // Output RGB
  document.getElementById('out-r').textContent = r;
  document.getElementById('out-g').textContent = g;
  document.getElementById('out-b').textContent = b;

  // Output CMYK
  document.getElementById('out-c').textContent = cmyk.c + '%';
  document.getElementById('out-m').textContent = cmyk.m + '%';
  document.getElementById('out-y').textContent = cmyk.y + '%';
  document.getElementById('out-k').textContent = cmyk.k + '%';

  // Output HSV
  document.getElementById('out-h').textContent = hsv.h + '°';
  document.getElementById('out-s').textContent = hsv.s + '%';
  document.getElementById('out-v').textContent = hsv.v + '%';

  // Sinkronisasi input (hindari loop)
  if (activeTab !== 'rgb') {
    document.getElementById('rgb-r').value = r;
    document.getElementById('rgb-g').value = g;
    document.getElementById('rgb-b').value = b;
    document.getElementById('sl-r').value = r;
    document.getElementById('sl-g').value = g;
    document.getElementById('sl-b').value = b;
  }
  if (activeTab !== 'cmyk') {
    document.getElementById('cmyk-c').value = cmyk.c;
    document.getElementById('cmyk-m').value = cmyk.m;
    document.getElementById('cmyk-y').value = cmyk.y;
    document.getElementById('cmyk-k').value = cmyk.k;
    document.getElementById('sl-c').value = cmyk.c;
    document.getElementById('sl-m').value = cmyk.m;
    document.getElementById('sl-y').value = cmyk.y;
    document.getElementById('sl-k').value = cmyk.k;
  }
  if (activeTab !== 'hsv') {
    document.getElementById('hsv-h').value = hsv.h;
    document.getElementById('hsv-s').value = hsv.s;
    document.getElementById('hsv-v').value = hsv.v;
    document.getElementById('sl-h').value = hsv.h;
    document.getElementById('sl-s').value = hsv.s;
    document.getElementById('sl-v').value = hsv.v;
  }

  // Sinkronisasi color picker
  document.getElementById('colorPicker').value = hex;
}

// [G] Input handlers
function clamp(val, min, max) {
  return Math.max(min, Math.min(max, parseInt(val) || 0));
}

function fromRGB() {
  let r = clamp(document.getElementById('rgb-r').value, 0, 255);
  let g = clamp(document.getElementById('rgb-g').value, 0, 255);
  let b = clamp(document.getElementById('rgb-b').value, 0, 255);
  document.getElementById('sl-r').value = r;
  document.getElementById('sl-g').value = g;
  document.getElementById('sl-b').value = b;
  updateUI(r, g, b);
}

function fromCMYK() {
  let c = clamp(document.getElementById('cmyk-c').value, 0, 100);
  let m = clamp(document.getElementById('cmyk-m').value, 0, 100);
  let y = clamp(document.getElementById('cmyk-y').value, 0, 100);
  let k = clamp(document.getElementById('cmyk-k').value, 0, 100);
  document.getElementById('sl-c').value = c;
  document.getElementById('sl-m').value = m;
  document.getElementById('sl-y').value = y;
  document.getElementById('sl-k').value = k;
  let rgb = cmykToRGB(c, m, y, k);
  updateUI(rgb.r, rgb.g, rgb.b);
}

function fromHSV() {
  let h = clamp(document.getElementById('hsv-h').value, 0, 360);
  let s = clamp(document.getElementById('hsv-s').value, 0, 100);
  let v = clamp(document.getElementById('hsv-v').value, 0, 100);
  document.getElementById('sl-h').value = h;
  document.getElementById('sl-s').value = s;
  document.getElementById('sl-v').value = v;
  let rgb = hsvToRGB(h, s, v);
  updateUI(rgb.r, rgb.g, rgb.b);
}

function fromPicker() {
  let hex = document.getElementById('colorPicker').value;
  let r = parseInt(hex.slice(1,3),16);
  let g = parseInt(hex.slice(3,5),16);
  let b = parseInt(hex.slice(5,7),16);
  updateUI(r, g, b);
}

// Sinkronisasi slider RGB
function syncSlider(ch, val) {
  document.getElementById('rgb-'+ch).value = val;
  fromRGB();
}

// Sinkronisasi slider CMYK
function syncSliderCMYK(ch, val) {
  document.getElementById('cmyk-'+ch).value = val;
  fromCMYK();
}

// Sinkronisasi slider HSV
function syncSliderHSV(ch, val) {
  document.getElementById('hsv-'+ch).value = val;
  fromHSV();
}

// [H] Pergantian tab
function switchTab(tab) {
  activeTab = tab;
  ['rgb','cmyk','hsv','picker'].forEach(t => {
    document.getElementById('tab-'+t).style.display = t===tab ? 'block' : 'none';
    document.querySelectorAll('.tab')[['rgb','cmyk','hsv','picker'].indexOf(t)].classList.toggle('active', t===tab);
  });
}

// [I] Salin HEX ke clipboard
function copyHex() {
  let hex = rgbToHex(currentRGB.r, currentRGB.g, currentRGB.b);
  navigator.clipboard.writeText(hex).then(() => {
    let el = document.getElementById('hex-display');
    el.textContent = '✅ Tersalin!';
    el.classList.add('copied');
    setTimeout(() => {
      el.textContent = hex + ' ✂';
      el.classList.remove('copied');
    }, 1500);
  });
}

// [J] Riwayat warna
function saveToHistory() {
  let {r, g, b} = currentRGB;
  let hex = rgbToHex(r, g, b);
  if (colorHistory.includes(hex)) return; // hindari duplikat
  colorHistory.unshift(hex);
  if (colorHistory.length > 30) colorHistory.pop();
  renderHistory();
}

function renderHistory() {
  let grid = document.getElementById('history-grid');
  document.getElementById('history-count').textContent = colorHistory.length + ' warna';

  if (colorHistory.length === 0) {
    grid.innerHTML = '<p style="color:var(--muted);font-size:.85rem;grid-column:1/-1">Belum ada warna tersimpan.</p>';
    return;
  }

  grid.innerHTML = colorHistory.map(hex => {
    let r = parseInt(hex.slice(1,3),16);
    let g = parseInt(hex.slice(3,5),16);
    let b = parseInt(hex.slice(5,7),16);
    return `<div class="history-swatch" style="background:${hex}" title="${hex}"
      onclick="loadFromHistory(${r},${g},${b})"></div>`;
  }).join('');
}

function loadFromHistory(r, g, b) {
  currentRGB = {r, g, b};
  document.getElementById('rgb-r').value = r;
  document.getElementById('rgb-g').value = g;
  document.getElementById('rgb-b').value = b;
  document.getElementById('sl-r').value = r;
  document.getElementById('sl-g').value = g;
  document.getElementById('sl-b').value = b;
  activeTab = 'rgb';
  switchTab('rgb');
  updateUI(r, g, b);
}

// [K] Inisialisasi
updateUI(108, 99, 255);
