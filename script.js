
const messages = [
  "Connecting to secure server...",
  "Verifying hardware ID...",
  "Checking encryption keys...",
  "Access Granted."
];

const logEl = document.getElementById('console-log');
const btn = document.getElementById('enterBtn');
let step = 0;

function runBootSequence() {
  if(step < messages.length) {
    logEl.innerText = messages[step];
    logEl.style.opacity = 0.5;
    setTimeout(() => { logEl.style.opacity = 1; }, 100);
    step++;
    setTimeout(runBootSequence, 800);
  } else {
    document.querySelector('.spinner-ring').style.borderColor = '#10b981';
    document.querySelector('.spinner-ring').style.animation = 'none';
    logEl.style.color = '#10b981';
    btn.classList.add('show');
  }
}

window.onload = () => {
  runBootSequence();
  initKey();
};

function enterApp() {
  // 1. Ẩn màn hình Boot
  document.getElementById('bootOverlay').classList.remove('active');
  
  // 2. TÌM VÀ HIỆN THANH NHẠC (Quan trọng nhất)
  const player = document.querySelector('.music-player');
  if(player) {
      player.style.display = 'flex'; // Chuyển từ none sang flex
      setTimeout(() => {
        player.style.opacity = '1'; // Hiệu ứng hiện dần
      }, 50);
  }

  // 3. Tự động phát nhạc (Nếu muốn)
  const audio = document.getElementById('audioPlayer');
  audio.play().then(() => {
    document.getElementById('playIcon').textContent = 'pause';
  }).catch(err => {
    console.log("Trình duyệt chặn auto-play, chờ user nhấn nút Play.");
  });
}

function switchTab(id, el) {
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById('tab-' + id).classList.add('active');
  if (el) el.classList.add('active');
  
  const content = document.getElementById('tab-' + id);
  const animatedElements = content.querySelectorAll('.animate-up');
  animatedElements.forEach(e => {
    e.style.animation = 'none';
    e.offsetHeight;
    e.style.animation = null;
  });

  document.querySelector('.main-view').scrollTop = 0;
  closeMenu();
}

function toggleMenu() {
  document.getElementById('mainSidebar').classList.toggle('open');
}
function closeMenu() {
  document.getElementById('mainSidebar').classList.remove('open');
}

function initKey() {
  const params = new URLSearchParams(window.location.search);
  const key = params.get('key');
  const keyText = document.getElementById('key-text');
  const keyStatus = document.getElementById('keyStatus');
  
  if(key) {
    keyText.innerText = key;
    keyStatus.style.display = 'none';
  } else {
    keyText.innerText = "Chưa có key nào...";
    keyStatus.style.display = 'block';
  }
}

async function copyKey() {
  const textElement = document.getElementById('key-text');
  const text = textElement.innerText.trim();
  const feedback = document.getElementById('copyFeedback');
  
  if(text === "Chưa có key nào..." || text.includes('LOADING')) {
    feedback.innerText = "Chưa có key để copy!";
    feedback.style.background = "rgba(239, 68, 68, 0.9)";
    feedback.classList.add('show');
    setTimeout(() => {
      feedback.classList.remove('show');
      feedback.innerText = "Đã sao chép!";
      feedback.style.background = "";
    }, 2000);
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    feedback.classList.add('show');
    setTimeout(() => feedback.classList.remove('show'), 1800);
  } catch (err) {
    alert('Sao chép thất bại, bạn copy thủ công nhé!');
  }
}

document.addEventListener('DOMContentLoaded', function() {
  const packageBtns = document.querySelectorAll('.package-btn');
  const pricesWeekEl = document.getElementById('pricesWeek');
  const pricesForeverEl = document.getElementById('pricesForever');
  const featuresWeek = document.getElementById('featuresWeek');
  const featuresForever = document.getElementById('featuresForever');
  const currentPriceEl = document.getElementById('currentPrice');
  const qrImg = document.getElementById('paymentQR');
  const customPriceInput = document.getElementById('customPrice');
  const payButton = document.getElementById('payButton');

  let currentType = 'week';
  let currentPrice = 20000;

  function generateQRUrl(amount) {
      const addInfo = currentType === 'week' ? 'Tuan' : 'VinhVien';
      const description = `MuaKeyHopper_${addInfo}_${amount}`;
      return `https://img.vietqr.io/image/970415-888816885666-compact2.jpg?amount=${amount}&addInfo=${description}&accountName=VO%20MINH%20PHAT`;
  }

  function updateUI() {
      pricesWeekEl.style.display = currentType === 'week' ? 'flex' : 'none';
      pricesForeverEl.style.display = currentType === 'forever' ? 'flex' : 'none';
      featuresWeek.style.display = currentType === 'week' ? 'block' : 'none';
      featuresForever.style.display = currentType === 'forever' ? 'block' : 'none';

      if (currentPrice < 10000) currentPrice = 10000;

      currentPriceEl.style.opacity = '0';
      setTimeout(() => {
          currentPriceEl.innerText = currentPrice.toLocaleString('vi-VN') + 'đ';
          currentPriceEl.style.opacity = '1';
      }, 100);

      qrImg.style.filter = 'blur(5px)';
      qrImg.src = generateQRUrl(currentPrice);
      qrImg.onload = () => qrImg.style.filter = 'blur(0)';
  }

  packageBtns.forEach(btn => {
      btn.addEventListener('click', () => {
          packageBtns.forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          currentType = btn.dataset.type;
          currentPrice = currentType === 'week' ? 20000 : 100000;
          customPriceInput.value = '';
          updateUI();
      });
  });

  document.querySelectorAll('.price-btn').forEach(btn => {
      btn.addEventListener('click', () => {
          const parent = btn.closest('.price-options');
          parent.querySelectorAll('.price-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          currentPrice = parseInt(btn.dataset.price);
          customPriceInput.value = '';
          updateUI();
      });
  });

  customPriceInput.addEventListener('input', () => {
      let val = parseInt(customPriceInput.value) || 0;
      if (val >= 10000) {
          currentPrice = val;
          document.querySelectorAll('.price-btn').forEach(b => b.classList.remove('selected'));
          updateUI();
      }
  });

  payButton.addEventListener('click', () => {
      const packageName = currentType === 'week' ? 'Tuần' : 'Vĩnh viễn';
      const msg = `Chào Admin Phát, mình muốn mua Key Hopper gói ${packageName} với giá ${currentPrice.toLocaleString('vi-VN')}đ. Đã chuyển khoản xong!`;
      window.open(`https://zalo.me/0774642574?text=${encodeURIComponent(msg)}`);
  });

  qrImg.addEventListener('click', () => {
      const info = `MuaKeyHopper_${currentType === 'week' ? 'Tuan' : 'VinhVien'}_${currentPrice}`;
      navigator.clipboard.writeText(info);
      alert('Đã sao chép nội dung chuyển khoản: ' + info);
  });

  updateUI();
});

document.getElementById('devQR').src = `https://img.vietqr.io/image/970415-888816885666-compact2.jpg?amount=50000&addInfo=HoTroDevHopper&accountName=VO%20MINH%20PHAT`;

// === SCRIPT CHO MUSIC PLAYER ===
const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const progress = document.getElementById('progress');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');

function formatTime(seconds) {
  if (isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins + ":" + (secs < 10 ? '0' : '') + secs;
}

audio.addEventListener('loadedmetadata', () => {
  durationEl.textContent = formatTime(audio.duration);
});

audio.addEventListener('timeupdate', () => {
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + '%';
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

function togglePlay() {
  if (audio.paused) {
    audio.play();
    playIcon.textContent = 'pause';
  } else {
    audio.pause();
    playIcon.textContent = 'play_arrow';
  }
}

function skip(seconds) {
  audio.currentTime += seconds;
}

progressBar.addEventListener('click', (e) => {
  const width = progressBar.clientWidth;
  const clickX = e.offsetX;
  const percent = clickX / width;
  audio.currentTime = percent * audio.duration;
});

volumeSlider.addEventListener('input', () => {
  audio.volume = volumeSlider.value;
});

let reviewIndex = 0;
let isAnimating = false;  // ← THÊM: chống gọi liên tục khi đang chuyển slide

function updateSlider() {
    const track = document.getElementById('sliderTrack');
    const slides = document.querySelectorAll('.slider-slide');
    const total = slides.length;

    if (total === 0) return;

    // Cách viết gọn + an toàn hơn (thay 2 if)
    reviewIndex = (reviewIndex + total) % total;

    if (track) {
        track.style.transform = `translateX(-${reviewIndex * 100}%)`;
    }
}

function nextSlide() {
    if (isAnimating) return;       // ← BỎ QUA nếu đang chuyển động

    isAnimating = true;
    reviewIndex++;
    updateSlider();

    // Cho phép gọi tiếp theo sau khi transition gần xong
    setTimeout(() => {
        isAnimating = false;
    }, 700);  // điều chỉnh theo thời gian transition CSS của bạn (thường 600-800ms)
}

function prevSlide() {
    if (isAnimating) return;

    isAnimating = true;
    reviewIndex--;
    updateSlider();

    setTimeout(() => {
        isAnimating = false;
    }, 700);
}

// Tự động chạy
let autoInterval = setInterval(() => {
    if (document.getElementById('tab-reviews')?.classList.contains('active')) {
        nextSlide();
    }
}, 5000);

// Click events cho buttons (cải thiện một chút độ tin cậy)
document.addEventListener('click', function(e) {
    const target = e.target;

    // Next
    if (
        target.textContent.includes('chevron_right') ||
        target.closest('button[onclick="nextSlide()"]') ||
        target.closest('[data-action="next"]')
    ) {
        nextSlide();
        resetAuto();  // ← reset timer khi click
    }

    // Prev
    if (
        target.textContent.includes('chevron_left') ||
        target.closest('button[onclick="prevSlide()"]') ||
        target.closest('[data-action="prev"]')
    ) {
        prevSlide();
        resetAuto();
    }
});

// Touch/swipe cho mobile - NGƯỠNG TĂNG LÊN + RESET TIMER
let startX = 0;
const sliderContainer = document.querySelector('.review-slider');

if (sliderContainer) {
    sliderContainer.addEventListener('touchstart', function(e) {
        startX = e.touches[0].clientX;
        resetAuto();  // ← quan trọng: reset auto khi chạm tay
    }, { passive: true });

    sliderContainer.addEventListener('touchend', function(e) {
        const endX = e.changedTouches[0].clientX;
        const diffX = startX - endX;

        // Tăng lên 65–70px để tránh trigger nhầm
        if (Math.abs(diffX) > 65) {
            if (diffX > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }, { passive: true });
}

// Reset timer tự động mỗi khi user tương tác
function resetAuto() {
    clearInterval(autoInterval);
    autoInterval = setInterval(() => {
        if (document.getElementById('tab-reviews')?.classList.contains('active')) {
            nextSlide();
        }
    }, 5000);
}

// Init slider
document.addEventListener('DOMContentLoaded', function() {
    const reviewsTab = document.getElementById('tab-reviews');
    if (reviewsTab && reviewsTab.classList.contains('active')) {
        updateSlider();
    }
});