const BASE_URL = 'http://localhost:5000'; 
const QR_ENDPOINT = '/api/qr/lesson/';   
const lessonSelect = document.getElementById('lessonSelect');
const generateBtn = document.getElementById('generateBtn');
const shareBtn = document.getElementById('shareBtn');
const copyBtn = document.getElementById('copyBtn');
const qrHolder = document.getElementById('qr-holder');
const titleEl = document.getElementById('lesson-title');
const subEl = document.getElementById('lesson-sub');
let currentQRCode = null;
let currentLink = null;
const MOCK_LESSONS = [
  { id: 12, title: "Математика", group: "ИВТ-21", time: "09:00 — 10:30" },
  { id: 13, title: "Программирование", group: "ИВТ-22", time: "11:00 — 12:30" }
];
function initLessonList() {
  lessonSelect.innerHTML = '';
  MOCK_LESSONS.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l.id;
    opt.textContent = `${l.title} — ${l.group} (${l.time})`;
    lessonSelect.appendChild(opt);
  });
  updateLessonInfo();
}
function updateLessonInfo() {
  const id = lessonSelect.value;
  const lesson = MOCK_LESSONS.find(l => String(l.id) === String(id));
  if (lesson) {
    titleEl.textContent = `${lesson.title}`;
    subEl.textContent = `${lesson.time} • Группа ${lesson.group}`;
  }
}
function makeToken() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'tk_' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
}
function renderQR(text) {
  qrHolder.innerHTML = '';
  currentQRCode = new QRCode(qrHolder, {
    text,
    width: 240,
    height: 240,
    colorDark:"#000000",
    colorLight:"#ffffff",
    correctLevel: QRCode.CorrectLevel.H
  });
  currentLink = text;
}
async function fetchQrLink(lessonId) {
  try {
    const res = await fetch(`${BASE_URL}${QR_ENDPOINT}${lessonId}`, { method: 'GET' });
    if (!res.ok) throw new Error('no server qr');
    const json = await res.json();
    if (json && json.qrData) return json.qrData;
    throw new Error('no qrData');
  } catch (err) {
    const token = makeToken();
    return `${BASE_URL}/attendance/mark?lessonId=${lessonId}&token=${token}`;
  }
}
generateBtn.addEventListener('click', async () => {
  const lessonId = lessonSelect.value;
  generateBtn.disabled = true;
  generateBtn.textContent = 'Генерация...';
  try {
    const link = await fetchQrLink(lessonId);
    renderQR(link);
  } catch (err) {
    alert('Ошибка генерации QR: ' + err.message);
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Генерировать QR';
  }
});
shareBtn.addEventListener('click', async () => {
  if (!currentLink) { alert('Сначала сгенерируйте QR.'); return; }
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'QR для отметки посещаемости',
        text: 'Ссылка для отметки посещаемости',
        url: currentLink
      });
    } catch (err) {
      console.log('share error', err);
    }
    return;
  }
  copyToClipboard(currentLink);
  alert('Ссылка скопирована в буфер обмена');
});
copyBtn.addEventListener('click', () => {
  if (!currentLink) { alert('Сначала сгенерируйте QR.'); return; }
  copyToClipboard(currentLink);
  alert('Ссылка скопирована в буфер обмена');
});
function copyToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else fallbackCopy(text);
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}
document.addEventListener('DOMContentLoaded', () => {
  initLessonList();
  lessonSelect.addEventListener('change', updateLessonInfo);
});
