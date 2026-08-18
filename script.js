
const DEFAULT_AVATAR = "https://i.postimg.cc/kXTyBwGr/file-00000000a5dc82119e23c1aae6e24a70.png";

// UNIVERSAL CUSTOM ALERT SYSTEM
window.showCustomAlert = function(message, title = "বিজ্ঞপ্তি", iconType = "success") {
  const modal = document.getElementById('app-alert-modal');
  const titleEl = document.getElementById('app-alert-title');
  const msgEl = document.getElementById('app-alert-msg');
  const iconEl = document.getElementById('app-alert-icon');

  if (!modal || !titleEl || !msgEl) return;
  titleEl.innerText = title;
  msgEl.innerText = message;

  if (iconType === 'success') {
    iconEl.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size:42px; color:#10b981;"></i>';
  } else if (iconType === 'error' || iconType === 'warning') {
    iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:42px; color:#ef4444;"></i>';
  } else if (iconType === 'lock') {
    iconEl.innerHTML = '<i class="fa-solid fa-lock" style="font-size:42px; color:#f59e0b;"></i>';
  } else {
    iconEl.innerHTML = '<i class="fa-solid fa-circle-info" style="font-size:42px; color:#05b381;"></i>';
  }

  modal.classList.remove('hidden');
};

window.closeCustomAlert = function() {
  const modal = document.getElementById('app-alert-modal');
  if (modal) modal.classList.add('hidden');
};

// UNIVERSAL CUSTOM CONFIRM SYSTEM
let onConfirmCallback = null;
window.showCustomConfirm = function(title, message, onConfirm) {
  const modal = document.getElementById('app-confirm-modal');
  const titleEl = document.getElementById('app-confirm-title');
  const msgEl = document.getElementById('app-confirm-msg');

  if (!modal || !titleEl || !msgEl) return;
  titleEl.innerText = title;
  msgEl.innerText = message;
  onConfirmCallback = onConfirm;

  modal.classList.remove('hidden');
};

window.executeCustomConfirm = function() {
  const modal = document.getElementById('app-confirm-modal');
  if (modal) modal.classList.add('hidden');
  if (onConfirmCallback) {
    onConfirmCallback();
    onConfirmCallback = null;
  }
};

window.closeCustomConfirm = function() {
  const modal = document.getElementById('app-confirm-modal');
  if (modal) modal.classList.add('hidden');
  onConfirmCallback = null;
};

// THEME TOGGLE LOGIC
function initAppTheme() {
  const savedTheme = localStorage.getItem('app-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleIcon(savedTheme);
}

window.toggleAppTheme = function() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('app-theme', newTheme);
  updateThemeToggleIcon(newTheme);
};

function updateThemeToggleIcon(theme) {
  const icon = document.getElementById('theme-icon');
  if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
}
initAppTheme();

// AUTH FORM SWITCHERS
window.showRegisterForm = function(e) {
  if (e) e.preventDefault();
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('forgot-password-form').classList.add('hidden');
  document.getElementById('register-form').classList.remove('hidden');
};

window.showLoginForm = function(e) {
  if (e) e.preventDefault();
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('forgot-password-form').classList.add('hidden');
  document.getElementById('login-form').classList.remove('hidden');
};

window.showForgotForm = function(e) {
  if (e) e.preventDefault();
  document.getElementById('login-form').classList.add('hidden');
  document.getElementById('register-form').classList.add('hidden');
  document.getElementById('forgot-password-form').classList.remove('hidden');
};

let currentUser = null;
let userData = null;
let isBalanceShown = false;
let selectedDepositMethodName = 'bKash';
let selectedDepositAmountVal = 500;
let activeTaskObj = null;
let userTodayCompletedCount = 0;
let userMaxDailyTasks = 0;
let sliderImagesList = [];
let sliderIndex = 0;
let sliderIntervalTimer = null;
let incomeChartInstance = null;
let systemMinWithdraw = 200;
let systemWithdrawChargePercent = 5;
let systemRegBonus = 0;
let activePlanTimerInterval = null;

// FIREBASE AUTH OBSERVER
auth.onAuthStateChanged((user) => {
  if (user) {
    currentUser = user;
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');

    loadUserData();
    loadVIPPlans();
    loadDepositHistory();
    loadWithdrawHistory();
    loadReferralCommissionHistory();
    loadGatewaysAndNotices();
    loadHomepageSliders();
    renderLiveWithdrawsInfinite();
    listenLiveBroadcastNotifications();
    checkAndShowWelcomeNotice();
    handleInitialPathRouting();
  } else {
    currentUser = null;
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    handleInitialPathRouting();
  }
});

// GLOBAL UI FUNCTIONS
window.openSidebar = function() {
  document.getElementById('sidebar-drawer').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
};

window.closeSidebar = function() {
  document.getElementById('sidebar-drawer').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
};

window.openNotifModal = function() { document.getElementById('notif-modal').classList.remove('hidden'); };
window.closeNotifModal = function() { document.getElementById('notif-modal').classList.add('hidden'); };
window.closeWelcomeModal = function() { document.getElementById('welcome-modal').classList.add('hidden'); };

window.closeTaskModal = function() {
  document.getElementById('task-modal').classList.add('hidden');
  document.getElementById('task-processing-view').classList.remove('hidden');
  document.getElementById('task-success-view').classList.add('hidden');
};

window.toggleBkashBalance = function() {
  if (!userData) return;
  const btnText = document.getElementById('bkash-balance-text');
  if (!isBalanceShown) {
    isBalanceShown = true;
    btnText.innerText = '৳ ' + (userData.balance || 0).toFixed(2);
    setTimeout(() => {
      isBalanceShown = false;
      btnText.innerText = 'ট্যাপ করে ব্যালেন্স দেখুন';
    }, 4000);
  }
};

window.toggleSupportFab = function() {
  const container = document.getElementById('fab-support-container');
  if (container) container.classList.toggle('open');
};

function loadSocialSupportLinks() {
  db.ref('social_support').on('value', snap => {
    const menu = document.getElementById('fab-support-menu');
    if (!menu) return;

    if (!snap.exists()) {
      menu.innerHTML = `
        <a href="https://t.me/" target="_blank" class="fab-menu-item">
          <span>Telegram Group</span> <i class="fa-brands fa-telegram" style="color:#0088cc"></i>
        </a>
      `;
      return;
    }

    menu.innerHTML = '';
    snap.forEach(child => {
      const s = child.val();
      menu.innerHTML += `
        <a href="${s.url}" target="_blank" class="fab-menu-item">
          <span>${s.name}</span> <i class="${s.icon || 'fa-solid fa-headset'}"></i>
        </a>
      `;
    });
  });
}

// TAB SWITCHER & HASH ROUTING (PREVENTS 404 ERROR)
window.switchTab = function(tabId, el, isDirectPlanTrigger = false) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  const targetTab = document.getElementById(tabId);
  if (targetTab) targetTab.classList.add('active');

  if (tabId === 'tab-deposit' && !isDirectPlanTrigger) {
    resetDepositToGeneralWallet();
  }

  if (el) {
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    el.classList.add('active');
  } else {
    const navMap = { 'tab-home': 0, 'tab-wallet': 1, 'tab-vip': 2, 'tab-withdraw': 3, 'tab-profile': 4 };
    const idx = navMap[tabId];
    const navItems = document.querySelectorAll('.bottom-nav .nav-item');
    if (idx !== undefined && navItems[idx]) {
      navItems.forEach(n => n.classList.remove('active'));
      navItems[idx].classList.add('active');
    }
  }

  const hashRoutes = {
    'tab-home': '#home',
    'tab-wallet': '#wallet',
    'tab-vip': '#vip',
    'tab-tasks': '#tasks',
    'tab-deposit': '#deposit',
    'tab-withdraw': '#withdraw',
    'tab-profile': '#profile'
  };
  if (hashRoutes[tabId]) {
    window.location.hash = hashRoutes[tabId];
  }
};

window.addEventListener('hashchange', () => {
  handleInitialPathRouting();
});

// AUTO REGISTRATION PAGE OPEN ON REFERRAL LINK CLICK (`domain/register?ref=...`)
function handleInitialPathRouting() {
  const urlParams = new URLSearchParams(window.location.search);
  let refCode = urlParams.get('ref') || urlParams.get('refCode');
  
  if (refCode) {
    localStorage.setItem('pendingRefCode', refCode);
  } else {
    refCode = localStorage.getItem('pendingRefCode');
  }

  if (refCode) {
    const refInput = document.getElementById('reg-ref');
    if (refInput) refInput.value = refCode;
  }

  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (!currentUser) {
    // IF VISITING /register OR HAS REFERRAL CODE -> SHOW REGISTER FORM DIRECTLY!
    if (path.includes('/register') || refCode || hash === '#register') {
      showRegisterForm();
    } else {
      showLoginForm();
    }
  } else {
    const hashToTabMap = {
      '#tasks': 'tab-tasks',
      '#vip': 'tab-vip',
      '#wallet': 'tab-wallet',
      '#deposit': 'tab-deposit',
      '#withdraw': 'tab-withdraw',
      '#profile': 'tab-profile',
      '#home': 'tab-home'
    };
    const targetTab = hashToTabMap[hash] || 'tab-home';
    switchTab(targetTab, null, false);
  }
}

function resetDepositToGeneralWallet() {
  const selectEl = document.getElementById('dep-target-plan-select');
  if (selectEl) selectEl.value = 'wallet';
  const amtInput = document.getElementById('input-dep-amount');
  if (amtInput) amtInput.value = 500;
  selectedDepositAmountVal = 500;
  goToDepositStep(1);
}

// USER DATA REALTIME LOAD
function loadUserData() {
  db.ref('users/' + currentUser.uid).on('value', (snapshot) => {
    userData = snapshot.val() || {};

    if (userData.isBlocked === true) {
      showCustomAlert("আপনার একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে!", "অ্যাকাউন্ট স্থগিত", "lock");
      auth.signOut();
      return;
    }

    const userAvatar = userData.avatar || DEFAULT_AVATAR;
    document.getElementById('usr-name').innerText = userData.name || 'User';
    document.getElementById('usr-id').innerText = 'ID: ' + (userData.refCode || currentUser.uid.substring(0,6).toUpperCase());
    
    const avatarEl = document.getElementById('usr-avatar');
    if (avatarEl) {
      avatarEl.src = userAvatar;
      avatarEl.onerror = function() { this.src = DEFAULT_AVATAR; };
    }

    document.getElementById('usr-vip').innerText = (userData.vipLevel && userData.vipLevel > 0)
      ? `এক্টিভ প্ল্যান: ${userData.vipPlanName || 'VIP ' + userData.vipLevel}` 
      : 'এক্টিভ প্ল্যান: নো প্ল্যান';

    const depBal = (userData.depositBalance || 0);
    const incBal = (userData.incomeBalance || 0);
    const totalBal = depBal + incBal;
    userData.balance = totalBal;

    document.getElementById('bal-today').innerText = '৳' + (userData.todayIncome || 0).toFixed(2);
    document.getElementById('bal-total-inc').innerText = '৳' + (userData.totalIncome || 0).toFixed(2);
    document.getElementById('dep-total-bal').innerText = '৳' + depBal.toFixed(2);
    document.getElementById('wallet-balance-display').innerText = '৳' + totalBal.toFixed(2);
    
    document.getElementById('wallet-dep-bal').innerText = '৳' + depBal.toFixed(2);
    document.getElementById('wallet-inc-bal').innerText = '৳' + incBal.toFixed(2);

    document.getElementById('prof-name').value = userData.name || '';
    document.getElementById('prof-phone').value = userData.phone || '';
    
    // FORMATTED REFERRAL LINK: `domain/register?ref=CODE`
    document.getElementById('ref-link-input').value = window.location.origin + '/register?ref=' + (userData.refCode || '');

    renderActivePlanDashboardBanner();
    renderTaskPagePlanBonusBanner();
    checkUserTaskLimitAndLoadTasks();
    initIncomeChartRealtime();
    checkAndRenderEWalletView();
  });
}

// LIVE COUNTDOWN TIMER FOR ACTIVE VIP PLAN & EXPIRATION POPUP
function renderActivePlanDashboardBanner() {
  const container = document.getElementById('dashboard-active-plan-card');
  if (!container) return;

  if (activePlanTimerInterval) {
    clearInterval(activePlanTimerInterval);
    activePlanTimerInterval = null;
  }

  if (!userData || !userData.vipLevel || userData.vipLevel <= 0) {
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <h4 style="font-size:15px; font-weight:800; color:var(--text-main);">আপনার কোনো প্ল্যান এক্টিভ নেই!</h4>
          <p style="font-size:11px; color:var(--text-muted); margin-top:3px;">দৈনিক আয় শুরু করতে একটি প্রিমিয়াম প্ল্যান পছন্দ করুন।</p>
        </div>
        <button class="btn-action" style="width:auto; padding:8px 14px; font-size:12px;" onclick="switchTab('tab-vip')">
          <i class="fa-solid fa-crown"></i> প্ল্যান দেখুন
        </button>
      </div>
    `;
    return;
  }

  const expireTime = userData.vipExpireAt || 0;

  function updateTimer() {
    const now = Date.now();
    const diff = expireTime - now;

    if (diff <= 0) {
      clearInterval(activePlanTimerInterval);
      activePlanTimerInterval = null;

      db.ref('users/' + currentUser.uid).update({
        vipLevel: 0,
        vipPlanName: 'নো প্ল্যান',
        maxDailyTasks: 0,
        vipDailyProfit: 0,
        vipExpireAt: null
      }).then(() => {
        showCustomAlert("আপনার প্রিমিয়াম প্ল্যানের মেয়াদ শেষ হয়ে গেছে! নতুন প্ল্যান এক্টিভ করুন।", "মেয়াদ শেষ ⚠️", "warning");
      });
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const timerHtml = `
      <div class="active-plan-banner" style="padding:15px; border-radius:14px;">
        <div class="active-plan-header">
          <h4><i class="fa-solid fa-crown"></i> ${userData.vipPlanName || 'VIP ' + userData.vipLevel}</h4>
          <span class="plan-live-tag">ACTIVE</span>
        </div>
        <div class="active-plan-metrics">
          <div><p>দৈনিক টাস্ক</p><strong>${userData.maxDailyTasks || 0} টি</strong></div>
          <div><p>দৈনিক আয়</p><strong>৳${userData.vipDailyProfit || 0}</strong></div>
        </div>

        <div style="margin-top:10px; font-size:11px; opacity:0.9; text-align:center;">মেয়াদ শেষের অবশিষ্ট সময়:</div>
        <div class="plan-countdown-grid">
          <div class="plan-countdown-box"><span>${days}</span><small>দিন</small></div>
          <div class="plan-countdown-box"><span>${hours}</span><small>ঘণ্টা</small></div>
          <div class="plan-countdown-box"><span>${minutes}</span><small>মি</small></div>
          <div class="plan-countdown-box"><span>${seconds}</span><small>সে</small></div>
        </div>
      </div>
    `;

    container.innerHTML = timerHtml;
  }

  updateTimer();
  activePlanTimerInterval = setInterval(updateTimer, 1000);
}

// RENDER PLAN ACTIVATION BONUS ON TASK PAGE
function renderTaskPagePlanBonusBanner() {
  const container = document.getElementById('task-plan-bonus-banner');
  if (!container) return;

  if (userData && userData.vipLevel && userData.vipLevel > 0) {
    db.ref('plans').orderByChild('vipLevel').equalTo(userData.vipLevel).once('value', snap => {
      let bonusVal = 0;
      if (snap.exists()) {
        snap.forEach(p => { bonusVal = p.val().activationBonus || 0; });
      }

      container.innerHTML = `
        <div style="background:linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%); color:#ffffff; padding:12px 16px; border-radius:14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 4px 12px rgba(108, 92, 231, 0.25);">
          <div>
            <span style="font-size:11px; opacity:0.9; display:block;">এক্টিভ প্ল্যান বোনাস</span>
            <strong style="font-size:15px; color:#fff;">${userData.vipPlanName || 'VIP Plan'}</strong>
          </div>
          <div style="text-align:right;">
            <span style="font-size:11px; opacity:0.9; display:block;">প্ল্যান বোনাস পরিমাণ</span>
            <strong style="font-size:16px; color:#ffeaa7;">🎁 ৳${bonusVal}</strong>
          </div>
        </div>
      `;
    });
  } else {
    container.innerHTML = '';
  }
}

// SLIDER & WELCOME NOTICE WITH BEAUTIFUL BUTTONS
function loadHomepageSliders() {
  db.ref('slider').on('value', snap => {
    sliderImagesList = [];
    if (snap.exists()) {
      snap.forEach(c => {
        if (c.val() && c.val().url) sliderImagesList.push(c.val().url);
      });
    }

    const sliderCard = document.getElementById('homepage-slider-card');
    if (sliderImagesList.length === 0) {
      if (sliderIntervalTimer) clearInterval(sliderIntervalTimer);
      if (sliderCard) sliderCard.classList.add('hidden');
    } else {
      if (sliderCard) sliderCard.classList.remove('hidden');
      startSliderCarousel();
    }
  });
}

function startSliderCarousel() {
  const sliderImg = document.getElementById('slider-img');
  if (!sliderImg || sliderImagesList.length === 0) return;

  if (sliderIntervalTimer) clearInterval(sliderIntervalTimer);
  sliderIndex = 0;
  sliderImg.src = sliderImagesList[0];

  if (sliderImagesList.length > 1) {
    sliderIntervalTimer = setInterval(() => {
      sliderIndex = (sliderIndex + 1) % sliderImagesList.length;
      sliderImg.src = sliderImagesList[sliderIndex];
    }, 4000);
  }
}

function checkAndShowWelcomeNotice() {
  db.ref('notices/welcome').once('value', snap => {
    if (snap.exists() && snap.val().enabled === true) {
      const notice = snap.val();
      document.getElementById('welcome-title').innerText = notice.title || 'স্বাগতম!';
      document.getElementById('welcome-desc').innerText = notice.text || '';
      
      const imgBox = document.getElementById('welcome-img-box');
      if (notice.image) imgBox.innerHTML = `<img src="${notice.image}" style="width:100%; max-height:140px; border-radius:12px; object-fit:cover; margin-bottom:12px;">`;
      else imgBox.innerHTML = '';

      const btnBox = document.getElementById('welcome-btn-container');
      if (notice.btnText && notice.btnUrl) {
        btnBox.innerHTML = `<a href="${notice.btnUrl}" target="_blank" class="btn-welcome-action">${notice.btnText} 🚀</a>`;
      } else btnBox.innerHTML = '';

      document.getElementById('welcome-modal').classList.remove('hidden');
    }
  });
}

// GATEWAYS & CONFIG (REGISTRATION BONUS DISPLAY ON REGISTER PAGE)
function loadGatewaysAndNotices() {
  db.ref('notices/main').on('value', snap => {
    if (snap.exists() && snap.val().text) {
      document.getElementById('notice-text').innerText = snap.val().text;
    }
  });

  db.ref('settings/config').on('value', snap => {
    if (snap.exists()) {
      const cfg = snap.val();
      if (cfg.logoUrl) {
        document.querySelectorAll('.header-logo-img').forEach(i => i.src = cfg.logoUrl);
        const loginLogo = document.getElementById('login-app-logo');
        if (loginLogo) loginLogo.src = cfg.logoUrl;
      }
      systemMinWithdraw = Number(cfg.minWithdraw || 200);
      systemWithdrawChargePercent = Number(cfg.withdrawChargePercent || 5);
      systemRegBonus = Number(cfg.regBonus || 0);

      if (systemRegBonus > 0) {
        const banner = document.getElementById('reg-bonus-banner');
        if (banner) {
          document.getElementById('reg-bonus-amount').innerText = '৳' + systemRegBonus;
          banner.classList.remove('hidden');
        }
      }

      const rulesSummary = document.getElementById('withdraw-rules-summary');
      if (rulesSummary) {
        const userCharge = (userData && userData.withdrawChargePercent !== undefined) ? userData.withdrawChargePercent : systemWithdrawChargePercent;
        rulesSummary.innerText = `সর্বনিম্ন উত্তোলন ৳${systemMinWithdraw} এবং প্রসেসিং চার্জ ${userCharge}%`;
      }
    }
  });

  db.ref('payment_gateways').on('value', snap => {
    const depGrid = document.getElementById('deposit-methods-grid');
    if (!snap.exists()) {
      renderDefaultGateways(depGrid);
      return;
    }

    if (depGrid) depGrid.innerHTML = '';

    snap.forEach((child) => {
      const g = child.val();
      const type = g.type || 'both';
      if (type === 'deposit' || type === 'both') {
        if (depGrid) depGrid.innerHTML += renderGatewayCardHTML(g);
      }
    });
  });
}

function renderGatewayCardHTML(g) {
  const name = g.name || 'Method';
  const logo = g.logoUrl || 'https://i.ibb.co/3yn9j8p/bkash.png';
  return `
    <div class="method-box" onclick="selectDepositMethod('${name}')">
      <img src="${logo}" class="method-logo-img" alt="${name}" onerror="this.onerror=null; this.src='https://i.ibb.co/3yn9j8p/bkash.png'">
      <h5 style="font-size:13px;">${name}</h5>
      <button class="btn-continue-sm">Continue ></button>
    </div>
  `;
}

function renderDefaultGateways(depGrid) {
  const defaults = [
    { name: 'bKash', logoUrl: 'https://i.ibb.co/3yn9j8p/bkash.png' },
    { name: 'Nagad', logoUrl: 'https://i.ibb.co/6P0zCst/nagad.png' },
    { name: 'Rocket', logoUrl: 'https://i.ibb.co/hK8C7hC/rocket.png' }
  ];
  if (depGrid) depGrid.innerHTML = defaults.map(g => renderGatewayCardHTML(g)).join('');
}

function listenLiveBroadcastNotifications() {
  db.ref('notifications/broadcast').on('value', snap => {
    if (snap.exists()) {
      const notif = snap.val();
      document.getElementById('notif-title').innerText = notif.title || 'নোটিফিকেশন';
      document.getElementById('notif-desc').innerText = notif.desc || '';
    }
  });
}

// ULTRA COMPACT SLEEK VIP PLANS CARD RENDERER (BULLET DOTS COMPLETELY REMOVED)
function loadVIPPlans() {
  db.ref('plans').on('value', snap => {
    const container = document.getElementById('vip-plans-container');
    const depPlanSelect = document.getElementById('dep-target-plan-select');

    container.innerHTML = '';
    if (depPlanSelect) depPlanSelect.innerHTML = '<option value="wallet">সাধারণ ওয়ালেট ডিপোজিট (General Deposit)</option>';

    const defaultPlans = [
      { id: 'p1', name: 'MICRO ONLINE', price: 500, dailyTasks: 2, dailyProfit: 15, durationDays: 30, vipLevel: 1, refCommissionPercent: 10, withdrawChargePercent: 10, activationBonus: 0, isSoldOut: false },
      { id: 'p2', name: 'SUPER VIP', price: 1500, dailyTasks: 5, dailyProfit: 50, durationDays: 30, vipLevel: 2, refCommissionPercent: 12, withdrawChargePercent: 5, activationBonus: 50, badgeText: 'POPULAR', isSoldOut: false }
    ];

    const planList = snap.exists() ? Object.values(snap.val()) : defaultPlans;

    planList.forEach((plan) => {
      container.innerHTML += renderPlanCardHTML(plan);
      if (depPlanSelect && !plan.isSoldOut) {
        depPlanSelect.innerHTML += `<option value="${plan.vipLevel}" data-price="${plan.price}" data-name="${plan.name}" data-tasks="${plan.dailyTasks}" data-profit="${plan.dailyProfit}">${plan.name} - ৳${plan.price}</option>`;
      }
    });
  });
}

function renderPlanCardHTML(plan) {
  const isSoldOut = plan.isSoldOut === true;
  const badgeText = plan.badgeText || '';
  const planName = plan.name || 'VIP Plan';
  const planPrice = Number(plan.price || 0);
  const dailyTasks = Number(plan.dailyTasks || 1);
  const dailyProfit = Number(plan.dailyProfit || 0);
  const duration = Number(plan.durationDays || 30);
  const vipLevel = Number(plan.vipLevel || 1);
  const witCharge = Number(plan.withdrawChargePercent !== undefined ? plan.withdrawChargePercent : 5);
  const actBonus = Number(plan.activationBonus || 0);

  return `
    <div class="plan-card-item">
      ${actBonus > 0 ? `<div class="plan-bonus-badge">🎁 ৳${actBonus} বোনাস</div>` : ''}
      ${isSoldOut ? '<div class="plan-ribbon sold-out-ribbon">SOLD OUT</div>' : (badgeText ? `<div class="plan-ribbon">${badgeText}</div>` : '')}
      
      <div class="plan-card-header" style="${isSoldOut ? 'background:#64748b' : ''}">
        <h3>${planName}</h3>
        <h2>৳${planPrice} <small>/${duration} দিন</small></h2>
      </div>
      <div class="plan-card-body">
        <ul class="plan-features-list">
          <li><i class="fa-solid fa-circle-check"></i> <span>প্রতিদিন <b>${dailyTasks}টি</b> টাস্ক</span></li>
          <li><i class="fa-solid fa-coins"></i> <span>দৈনিক আয়: <b>৳${dailyProfit}</b></span></li>
          ${actBonus > 0 ? `<li style="color:#f59e0b; font-weight:bold;"><i class="fa-solid fa-gift"></i> <span>প্ল্যান এক্টিভ বোনাস: <b>৳${actBonus}</b></span></li>` : ''}
          <li><i class="fa-solid fa-percent"></i> <span>উইথড্র প্রসেসিং ফি: <b>${witCharge}%</b></span></li>
          <li><i class="fa-solid fa-calendar-days"></i> <span>মেয়াদ: <b>${duration} দিন</b></span></li>
          <li><i class="fa-solid fa-chart-line"></i> <span>মোট ইনকাম: <b>৳${(dailyProfit * duration).toFixed(0)}</b></span></li>
        </ul>
        <button class="btn-buy-plan ${isSoldOut ? 'sold-out' : ''}" 
          ${isSoldOut ? 'disabled' : `onclick="buyVIPPlan('${planName}', ${planPrice}, ${vipLevel}, ${dailyTasks}, ${dailyProfit}, ${witCharge}, ${actBonus}, ${duration})"`}>
          ${isSoldOut ? 'সোল্ড আউট (Sold Out)' : 'প্ল্যান কিনুন'}
        </button>
      </div>
    </div>
  `;
}

window.buyVIPPlan = function(planName, price, vipLevel, dailyTasks, dailyProfit, withdrawChargePercent = 5, activationBonus = 0, durationDays = 30) {
  if (!userData) return;
  const depBal = Number(userData.depositBalance || 0);

  if (depBal < price) {
    directDepositForPlan(planName, price, vipLevel, dailyTasks, dailyProfit);
    return;
  }

  showCustomConfirm("প্ল্যান ক্রয় নিশ্চিতকরণ", `আপনি কি ৳${price} দিয়ে ${planName} ক্রয় করতে চান?`, function() {
    const durationMs = Number(durationDays || 30) * 24 * 60 * 60 * 1000;
    const expireTimestamp = Date.now() + durationMs;

    const updates = {};
    updates['users/' + currentUser.uid + '/depositBalance'] = depBal - price;
    updates['users/' + currentUser.uid + '/vipLevel'] = vipLevel;
    updates['users/' + currentUser.uid + '/vipPlanName'] = planName;
    updates['users/' + currentUser.uid + '/maxDailyTasks'] = dailyTasks;
    updates['users/' + currentUser.uid + '/vipDailyProfit'] = dailyProfit;
    updates['users/' + currentUser.uid + '/withdrawChargePercent'] = withdrawChargePercent;
    updates['users/' + currentUser.uid + '/vipActivatedAt'] = Date.now();
    updates['users/' + currentUser.uid + '/vipExpireAt'] = expireTimestamp;

    if (activationBonus > 0) {
      updates['users/' + currentUser.uid + '/incomeBalance'] = (userData.incomeBalance || 0) + activationBonus;
      
      db.ref('history').push().set({
        uid: currentUser.uid,
        type: 'Plan Bonus',
        amount: activationBonus,
        title: `Activation Bonus for ${planName}`,
        status: 'approved',
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });
    }

    db.ref().update(updates).then(() => {
      showCustomAlert(`অভিনন্দন! ${planName} সফলভাবে ক্রয় করা হয়েছে!${activationBonus > 0 ? ` আপনি ৳${activationBonus} বোনাস পেয়েছেন।` : ''}`, "প্ল্যান আনলকড! 🎉", "success");
      switchTab('tab-tasks');
    }).catch(err => showCustomAlert('Error: ' + err.message, "ত্রুটি", "error"));
  });
};

function directDepositForPlan(planName, price, vipLevel, dailyTasks, dailyProfit) {
  selectedDepositAmountVal = price;
  const amtInput = document.getElementById('input-dep-amount');
  if (amtInput) amtInput.value = price;

  const selectEl = document.getElementById('dep-target-plan-select');
  if (selectEl) {
    for (let i = 0; i < selectEl.options.length; i++) {
      if (selectEl.options[i].getAttribute('data-name') === planName) {
        selectEl.selectedIndex = i;
        break;
      }
    }
  }

  switchTab('tab-deposit', null, true);
  goToDepositStep(1);
}

// TASK SYSTEM WITH COMPLETED TASK HIDING & ALL COMPLETED CARD DISPLAY
function checkUserTaskLimitAndLoadTasks() {
  if (!currentUser) return;
  const today = new Date().toISOString().split('T')[0];

  userMaxDailyTasks = userData.maxDailyTasks || 0;

  db.ref(`user_tasks/${currentUser.uid}/${today}`).on('value', taskSnap => {
    userTodayCompletedCount = 0;
    const completedTaskIds = {};

    if (taskSnap.exists()) {
      taskSnap.forEach(child => {
        const tRec = child.val();
        if (tRec.completed) {
          completedTaskIds[child.key] = true;
          if (!tRec.isFreeTask) userTodayCompletedCount++;
        }
      });
    }

    loadTasks(completedTaskIds);
  });
}

function loadTasks(completedTaskIds = {}) {
  const container = document.getElementById('tasks-list-container');
  if (!container) return;
  container.innerHTML = '';

  const summaryEl = document.getElementById('task-limit-status-summary');
  const userVip = userData ? Number(userData.vipLevel || 0) : 0;

  if (summaryEl) {
    summaryEl.innerText = userVip > 0 
      ? `আজকের সম্পন্ন করা ভিআইপি টাস্ক: ${userTodayCompletedCount} / ${userMaxDailyTasks || 0}`
      : "ফ্রি টাস্ক সম্পূর্ণ করুন অথবা ভিআইপি প্ল্যান কিনুন";
  }

  db.ref('tasks').on('value', snap => {
    container.innerHTML = '';
    const userVipTasks = [];

    if (snap.exists()) {
      snap.forEach(child => {
        const task = child.val();
        task.id = child.key;
        const isFree = Number(task.minVip || 0) === 0 || task.isFree === true;
        
        if (userVip === 0 && isFree) {
          userVipTasks.push(task);
        } else if (userVip > 0 && Number(task.minVip || 0) === userVip && !isFree) {
          userVipTasks.push(task);
        }
      });
    }

    // EXPLICITLY FILTER OUT AND HIDE COMPLETED TASKS
    const remainingTasks = userVipTasks.filter(t => !completedTaskIds[t.id]);

    // CHECK IF ALL TASKS COMPLETED OR DAILY LIMIT REACHED
    if ((userVipTasks.length > 0 && remainingTasks.length === 0) || (userVip > 0 && userTodayCompletedCount >= userMaxDailyTasks)) {
      container.innerHTML = `
        <div class="content-card" style="text-align:center; padding:35px 20px;">
          <div class="reward-icon-circle" style="background:#d1fae5; margin:0 auto 12px auto;">
            <i class="fa-solid fa-circle-check" style="font-size:36px; color:#10b981;"></i>
          </div>
          <h3 style="font-size:18px; color:var(--text-main); font-weight:800;">আপনি ইতিমধ্যেই আজকের সকল টাস্ক সম্পন্ন করেছেন!</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-top:6px;">নতুন টাস্কের জন্য আগামীকাল অপেক্ষা করুন।</p>
        </div>
      `;
      return;
    }

    if (userVipTasks.length === 0) {
      container.innerHTML = `
        <div class="content-card" style="text-align:center; padding:30px 15px;">
          <i class="fa-solid fa-lock" style="font-size:40px; color:var(--text-muted); margin-bottom:12px;"></i>
          <h3 style="font-size:16px; margin-bottom:6px;">VIP Level ${userVip}-এর জন্য কোনো টাস্ক উপলব্ধ নেই!</h3>
          <p style="font-size:12px; color:var(--text-muted); margin-bottom:15px;">অন্যান্য টাস্ক আনলক করতে আপনার প্ল্যান আপগ্রেড করুন।</p>
          <button class="btn-action" onclick="switchTab('tab-vip')"><i class="fa-solid fa-crown"></i> প্ল্যান দেখুন</button>
        </div>
      `;
      return;
    }

    // RENDER ONLY UNCOMPLETED REMAINING TASKS
    remainingTasks.forEach(task => {
      const taskId = task.id;
      const isFreeTask = Number(task.minVip || 0) === 0 || task.isFree === true;

      container.innerHTML += `
        <div class="content-card" style="margin:0 0 12px 0;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="display:flex; align-items:center; gap:6px;">
                <h4 style="font-size:14px; color:var(--text-main);">${task.title}</h4>
                ${isFreeTask ? '<span style="background:#e0f2fe; color:#0284c7; font-size:9px; font-weight:800; padding:2px 6px; border-radius:8px;">FREE</span>' : ''}
              </div>
              <p style="font-size:11px; color:var(--text-muted); margin-top:4px;">রিওয়ার্ড: <b style="color:var(--primary-color)">৳${task.reward}</b></p>
            </div>
            <button class="btn-action" style="width:auto; padding:8px 14px; font-size:12px;" 
              onclick="startTask('${taskId}', ${task.reward}, ${isFreeTask})">
              টাস্ক শুরু করুন
            </button>
          </div>
        </div>
      `;
    });
  });
}

window.startTask = function(taskId, reward, isFreeTask = false) {
  activeTaskObj = { taskId, reward, isFreeTask };
  
  document.getElementById('task-modal').classList.remove('hidden');
  document.getElementById('task-processing-view').classList.remove('hidden');
  document.getElementById('task-success-view').classList.add('hidden');
  document.getElementById('btn-claim-task').classList.add('hidden');
  document.getElementById('reward-amount-pop').classList.add('hidden');
  document.getElementById('task-modal-title').innerText = 'টাস্ক প্রসেসিং হচ্ছে...';

  let progress = 0;
  const fill = document.getElementById('task-progress');
  fill.style.width = '0%';

  const interval = setInterval(() => {
    progress += 25;
    fill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      document.getElementById('task-modal-title').innerText = '🎉 টাস্ক সফলভাবে সম্পন্ন!';
      document.getElementById('pop-reward-val').innerText = '+৳' + reward.toFixed(2);
      document.getElementById('reward-amount-pop').classList.remove('hidden');
      document.getElementById('btn-claim-task').classList.remove('hidden');
    }
  }, 500);
};

document.getElementById('btn-claim-task').addEventListener('click', () => {
  if (!activeTaskObj || !userData) return;

  const today = new Date().toISOString().split('T')[0];
  const reward = activeTaskObj.reward;
  const isFree = activeTaskObj.isFreeTask === true;

  const updates = {};
  updates[`users/${currentUser.uid}/incomeBalance`] = (userData.incomeBalance || 0) + reward;
  updates[`users/${currentUser.uid}/todayIncome`] = (userData.todayIncome || 0) + reward;
  updates[`users/${currentUser.uid}/totalIncome`] = (userData.totalIncome || 0) + reward;
  
  updates[`user_tasks/${currentUser.uid}/${today}/${activeTaskObj.taskId}`] = { 
    completed: true, 
    isFreeTask: isFree,
    timestamp: firebase.database.ServerValue.TIMESTAMP 
  };

  db.ref().update(updates).then(() => {
    db.ref('history').push().set({
      uid: currentUser.uid,
      type: 'Task Reward',
      amount: reward,
      title: isFree ? 'Completed Free Task' : 'Completed VIP Task',
      status: 'approved',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    document.getElementById('task-processing-view').classList.add('hidden');
    document.getElementById('task-success-view').classList.remove('hidden');
    document.getElementById('success-reward-val').innerText = '+৳' + reward.toFixed(2);

    activeTaskObj = null;
    initIncomeChartRealtime();
  });
});

// DEPOSIT FLOW
window.goToDepositStep = function(step) {
  document.getElementById('dep-step-1').classList.add('hidden');
  document.getElementById('dep-step-2').classList.add('hidden');
  document.getElementById('dep-step-3').classList.add('hidden');
  document.getElementById('dep-step-' + step).classList.remove('hidden');
};

window.selectDepositMethod = function(method) {
  selectedDepositMethodName = method;
  document.getElementById('selected-method-title').innerText = method;
  goToDepositStep(2);
};

window.onDepositPlanTargetChange = function(selectEl) {
  if (selectEl.value !== 'wallet') {
    const opt = selectEl.options[selectEl.selectedIndex];
    const price = opt.getAttribute('data-price');
    if (price) {
      document.getElementById('input-dep-amount').value = price;
      selectedDepositAmountVal = parseFloat(price);
    }
  }
};

window.setQuickAmount = function(amt, el) {
  selectedDepositAmountVal = amt;
  document.getElementById('input-dep-amount').value = amt;
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
};

window.proceedToStep3 = function() {
  const inputAmt = parseFloat(document.getElementById('input-dep-amount').value);
  if (!inputAmt || inputAmt < 500) return showCustomAlert('সর্বনিম্ন ৫০০ টাকা ডিপোজিট করতে হবে।', 'ডিপোজিট লিমিট', 'warning');

  selectedDepositAmountVal = inputAmt;
  document.getElementById('step3-amount-display').innerText = '৳ ' + selectedDepositAmountVal;
  document.getElementById('step3-confirm-amount').innerText = '৳ ' + selectedDepositAmountVal;

  db.ref('payment_gateways').once('value', snap => {
    let targetNum = '01719856165';
    if (snap.exists()) {
      snap.forEach(c => {
        if (c.val().name === selectedDepositMethodName) targetNum = c.val().number || targetNum;
      });
    }
    document.getElementById('target-phone-num').innerText = targetNum;
  });

  goToDepositStep(3);
};

window.copyPhoneNum = function() {
  const num = document.getElementById('target-phone-num').innerText;
  navigator.clipboard.writeText(num);
  showCustomAlert('নম্বর কপি করা হয়েছে: ' + num, 'কপি সফল', 'info');
};

window.submitDepositFinal = function() {
  const trxId = document.getElementById('input-trx-id').value;
  if (!trxId) return showCustomAlert('অনুগ্রহ করে Transaction ID প্রদান করুন।', 'তথ্য অসম্পূর্ণ', 'warning');

  const targetPlanSelect = document.getElementById('dep-target-plan-select');
  let targetPlanData = null;

  if (targetPlanSelect && targetPlanSelect.value !== 'wallet') {
    const opt = targetPlanSelect.options[targetPlanSelect.selectedIndex];
    targetPlanData = {
      vipLevel: parseInt(targetPlanSelect.value),
      planName: opt.getAttribute('data-name'),
      dailyTasks: parseInt(opt.getAttribute('data-tasks')),
      dailyProfit: parseFloat(opt.getAttribute('data-profit'))
    };
  }

  const depRef = db.ref('deposits').push();
  depRef.set({
    id: depRef.key,
    uid: currentUser.uid,
    email: currentUser.email,
    method: selectedDepositMethodName,
    amount: selectedDepositAmountVal,
    trxId: trxId,
    targetPlan: targetPlanData || 'wallet',
    status: 'pending',
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    showCustomAlert('ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে!', 'ডিপোজিট রিকোয়েস্ট জমা', 'success');
    document.getElementById('input-trx-id').value = '';
    goToDepositStep(1);
    loadDepositHistory();
  });
};

function loadDepositHistory() {
  db.ref('deposits').orderByChild('uid').equalTo(currentUser.uid).on('value', snap => {
    const list = document.getElementById('dep-history-list');
    if (!list) return;
    if (!snap.exists()) {
      list.innerHTML = '<div style="text-align:center;">কোনো ডিপোজিট রেকর্ড নেই</div>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(child => {
      const d = child.val();
      list.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
          <div><b>${d.method}</b> (${d.trxId})</div>
          <div>৳${d.amount} - <span style="color:${d.status === 'approved' ? 'var(--primary-color)' : '#f59e0b'}">${d.status}</span></div>
        </div>
      ` + list.innerHTML;
    });
  });
}

// E-WALLET SETUP & WITHDRAWAL LOGIC (UNIQUE WALLET CONSTRAINT CHECK)
function checkAndRenderEWalletView() {
  const notSetCard = document.getElementById('withdraw-wallet-not-set-card');
  const setView = document.getElementById('withdraw-wallet-set-view');

  if (!userData || !userData.wallet || !userData.wallet.walletNumber) {
    if (notSetCard) notSetCard.classList.remove('hidden');
    if (setView) setView.classList.add('hidden');
  } else {
    if (notSetCard) notSetCard.classList.add('hidden');
    if (setView) setView.classList.remove('hidden');

    const w = userData.wallet;
    document.getElementById('saved-wallet-type-num').innerText = `${w.accountType} - ${w.walletNumber}`;
    document.getElementById('saved-wallet-name').innerText = `নাম: ${w.fullName}`;
  }
}

window.openWalletSetupModal = function() {
  if (userData && userData.wallet) {
    document.getElementById('ewallet-type').value = userData.wallet.accountType || 'bKash';
    document.getElementById('ewallet-fullname').value = userData.wallet.fullName || '';
    document.getElementById('ewallet-number').value = userData.wallet.walletNumber || '';
    document.getElementById('ewallet-pin').value = userData.wallet.withdrawPin || '';
  }
  document.getElementById('wallet-setup-modal').classList.remove('hidden');
};

window.closeWalletSetupModal = function() {
  document.getElementById('wallet-setup-modal').classList.add('hidden');
};

window.saveEWalletSetup = async function(e) {
  e.preventDefault();
  const accType = document.getElementById('ewallet-type').value;
  const fullName = document.getElementById('ewallet-fullname').value.trim();
  const walletNum = document.getElementById('ewallet-number').value.trim();
  const pin = document.getElementById('ewallet-pin').value.trim();

  if (!fullName || !walletNum || !pin) {
    showCustomAlert('সকল তথ্য সঠিকভাবে পূরণ করুন!', 'তথ্য অসম্পূর্ণ', 'warning');
    return;
  }

  if (pin.length !== 5 || isNaN(pin)) {
    showCustomAlert('উইথড্র পিন অবশ্যই ৫ সংখ্যার হতে হবে!', 'ভুল পিন', 'warning');
    return;
  }

  // CHECK IF WALLET NUMBER IS ALREADY USED BY ANOTHER USER
  const walletSnap = await db.ref('wallets/' + walletNum).once('value');
  if (walletSnap.exists() && walletSnap.val() !== currentUser.uid) {
    showCustomAlert('এই ওয়ালেট নম্বরটি ইতিমধ্যে অন্য একটি অ্যাকাউন্টে ব্যবহার করা হয়েছে! আপনি এই নম্বরটি যুক্ত করতে পারবেন না।', 'ওয়ালেট নম্বর ব্যবহৃত', 'error');
    return;
  }

  // IF PREVIOUS WALLET WAS DIFFERENT, REMOVE OLD BINDING
  if (userData && userData.wallet && userData.wallet.walletNumber && userData.wallet.walletNumber !== walletNum) {
    await db.ref('wallets/' + userData.wallet.walletNumber).remove();
  }

  const updates = {};
  updates[`users/${currentUser.uid}/wallet`] = {
    accountType: accType,
    fullName: fullName,
    walletNumber: walletNum,
    withdrawPin: pin
  };
  updates[`wallets/${walletNum}`] = currentUser.uid;

  db.ref().update(updates).then(() => {
    showCustomAlert('E-Wallet সফলভাবে যুক্ত ও সেভ করা হয়েছে!', 'সেটআপ সম্পন্ন', 'success');
    closeWalletSetupModal();
  }).catch(err => showCustomAlert('ত্রুটি: ' + err.message, 'ব্যর্থ', 'error'));
};

function getActiveWithdrawChargePercent() {
  if (userData && userData.withdrawChargePercent !== undefined) return Number(userData.withdrawChargePercent);
  return systemWithdrawChargePercent;
}

window.calculateWithdrawFeePreview = function() {
  const amt = parseFloat(document.getElementById('wit-amount').value) || 0;
  const activeCharge = getActiveWithdrawChargePercent();
  const chargeFee = amt * (activeCharge / 100);
  const netAmount = Math.max(0, amt - chargeFee);

  document.getElementById('wit-fee-amount').innerText = '৳' + chargeFee.toFixed(2);
  document.getElementById('wit-net-receive').innerText = '৳' + netAmount.toFixed(2);
};

window.handleWithdrawSubmit = function(e) {
  e.preventDefault();

  if (!userData || !userData.vipLevel || userData.vipLevel <= 0) {
    showCustomAlert('উত্তোলন করার জন্য আপনাকে অবশ্যই একটি প্রিমিয়াম প্ল্যান এক্টিভ করতে হবে!', 'প্ল্যান প্রয়োজন', 'lock');
    switchTab('tab-vip');
    return;
  }

  const amt = parseFloat(document.getElementById('wit-amount').value);
  const inputPin = document.getElementById('wit-pin-input').value.trim();
  const savedWallet = userData.wallet;

  if (!savedWallet || !savedWallet.withdrawPin) {
    showCustomAlert('দয়া করে প্রথমে আপনার E-Wallet সেটআপ করুন!', 'ওয়ালেট প্রয়োজন', 'warning');
    openWalletSetupModal();
    return;
  }

  if (inputPin !== savedWallet.withdrawPin) {
    showCustomAlert('ভুল উইথড্র পিন প্রদান করেছেন!', 'পাসওয়ার্ড/পিন ভুল', 'error');
    return;
  }

  if (!amt || amt < systemMinWithdraw) {
    showCustomAlert(`সর্বনিম্ন ৳${systemMinWithdraw} টাকা উত্তোলন করতে পারবেন।`, 'উত্তোলন লিমিট', 'warning');
    return;
  }

  const totalBal = (userData.depositBalance || 0) + (userData.incomeBalance || 0);
  if (totalBal < amt) {
    showCustomAlert('পর্যাপ্ত ওয়ালেট ব্যালেন্স নেই!', 'ব্যালেন্স অপ্রতুল', 'warning');
    return;
  }

  let remAmt = amt;
  let newIncBal = userData.incomeBalance || 0;
  let newDepBal = userData.depositBalance || 0;

  if (newIncBal >= remAmt) {
    newIncBal -= remAmt;
  } else {
    remAmt -= newIncBal;
    newIncBal = 0;
    newDepBal = Math.max(0, newDepBal - remAmt);
  }

  const activeCharge = getActiveWithdrawChargePercent();

  const updates = {};
  updates['users/' + currentUser.uid + '/incomeBalance'] = newIncBal;
  updates['users/' + currentUser.uid + '/depositBalance'] = newDepBal;

  db.ref().update(updates).then(() => {
    const witRef = db.ref('withdraws').push();
    return witRef.set({
      id: witRef.key,
      uid: currentUser.uid,
      email: currentUser.email,
      method: savedWallet.accountType,
      walletNumber: savedWallet.walletNumber,
      walletName: savedWallet.fullName,
      amount: amt,
      chargePercent: activeCharge,
      netAmount: Math.max(0, amt - (amt * activeCharge / 100)),
      status: 'pending',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }).then(() => {
    showCustomAlert('উত্তোলন রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে!', 'উত্তোলন সফল', 'success');
    document.getElementById('withdraw-form').reset();
    calculateWithdrawFeePreview();
    loadWithdrawHistory();
  });
};

function loadWithdrawHistory() {
  db.ref('withdraws').orderByChild('uid').equalTo(currentUser.uid).on('value', snap => {
    const list = document.getElementById('wit-history-list');
    const walletList = document.getElementById('wallet-history-list');
    
    if (!snap.exists()) {
      if (list) list.innerHTML = '<div style="text-align:center;">কোনো উইথড্র রেকর্ড নেই</div>';
      if (walletList) walletList.innerHTML = '<div style="text-align:center;">কোনো লেনদেন রেকর্ড নেই</div>';
      return;
    }

    let html = '';
    snap.forEach(child => {
      const w = child.val();
      html = `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #e2e8f0;">
          <div><b>${w.method} Withdrawal</b> (${w.walletNumber})</div>
          <div>৳${w.amount} - <span style="color:${w.status === 'approved' ? 'var(--primary-color)' : '#f59e0b'}">${w.status}</span></div>
        </div>
      ` + html;
    });

    if (list) list.innerHTML = html;
    if (walletList) walletList.innerHTML = html;
  });
}

function loadReferralCommissionHistory() {
  if (!currentUser) return;
  db.ref('referral_commissions/' + currentUser.uid).on('value', snap => {
    const container = document.getElementById('referral-history-list');
    if (!container) return;
    if (!snap.exists()) {
      container.innerHTML = '<div style="text-align:center; padding:10px; font-size:12px; color:var(--text-muted)">কোনো রেফারেল কমিশন রেকর্ড নেই</div>';
      return;
    }

    let html = '';
    snap.forEach(child => {
      const r = child.val();
      const dateStr = new Date(r.timestamp).toLocaleDateString();
      html = `
        <div style="background:var(--primary-light); border:1px solid var(--border-color); border-radius:12px; padding:12px; margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:13px; color:var(--text-main);">${r.buyerName || 'User'} (ID: ${r.buyerRefCode || 'N/A'})</strong>
            <span style="font-size:14px; font-weight:800; color:var(--primary-color);">+৳${Number(r.commissionAmount || 0).toFixed(2)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:11px; color:var(--text-muted);">
            <span>এক্টিভ প্ল্যান: <b>${r.planName} (৳${r.planPrice})</b></span>
            <span>কমিশন হার: <b>${r.commissionPercent}%</b></span>
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:4px;">তারিখ: ${dateStr}</div>
        </div>
      ` + html;
    });

    container.innerHTML = html;
  });
}

// PROFILE UPDATE (AUTOMATICALLY USES DEFAULT AVATAR)
window.handleProfileUpdate = function(e) {
  e.preventDefault();
  const name = document.getElementById('prof-name').value;
  const phone = document.getElementById('prof-phone').value;

  db.ref('users/' + currentUser.uid).update({ name, phone, avatar: DEFAULT_AVATAR }).then(() => {
    showCustomAlert('প্রোফাইল সফলভাবে আপডেট করা হয়েছে!', 'আপডেট সফল', 'success');
  });
};

window.copyRefLink = function() {
  const input = document.getElementById('ref-link-input');
  navigator.clipboard.writeText(input.value);
  showCustomAlert('রেফারেল লিংক কপি করা হয়েছে!', 'কপি সফল', 'info');
};

function initIncomeChartRealtime() {
  const canvas = document.getElementById('incomeChart');
  if (!canvas || !currentUser) return;
  const ctx = canvas.getContext('2d');

  db.ref('history').orderByChild('uid').equalTo(currentUser.uid).once('value', snap => {
    const dailyIncomeMap = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
    const daysArr = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    let hasEarnings = false;

    if (snap.exists()) {
      snap.forEach(child => {
        const item = child.val();
        if (item.amount > 0 && item.type === 'Task Reward' && item.timestamp) {
          hasEarnings = true;
          const dayName = daysArr[new Date(item.timestamp).getDay()];
          if (dailyIncomeMap[dayName] !== undefined) dailyIncomeMap[dayName] += item.amount;
        }
      });
    }

    const chartData = hasEarnings ? [
      dailyIncomeMap['Mon'] || 0, dailyIncomeMap['Tue'] || 0, dailyIncomeMap['Wed'] || 0,
      dailyIncomeMap['Thu'] || 0, dailyIncomeMap['Fri'] || 0, dailyIncomeMap['Sat'] || 0, dailyIncomeMap['Sun'] || 0
    ] : [0, 0, 0, 0, 0, 0, 0];

    if (incomeChartInstance) incomeChartInstance.destroy();

    incomeChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [{
          label: 'আয় (৳)',
          data: chartData,
          borderColor: '#05b381',
          backgroundColor: 'rgba(5, 179, 129, 0.12)',
          fill: true,
          tension: 0.35,
          borderWidth: 2.5
        }]
      },
      options: { 
        responsive: true, 
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } }
      }
    });
  });
}

function renderLiveWithdrawsInfinite() {
  const container = document.getElementById('live-withdraw-feed');
  if (!container) return;

  const mockFeed = [
    { num: '017****1234', method: 'bKash', amount: '৳৫০০' },
    { num: '018****8890', method: 'Nagad', amount: '৳১২০০' },
    { num: '019****4567', method: 'Rocket', amount: '৳৭৫০' },
    { num: '016****9012', method: 'bKash', amount: '৳১৫০০' }
  ];

  let feedIndex = 0;
  function rotateFeed() {
    const item = mockFeed[feedIndex];
    container.innerHTML = `
      <div class="live-withdraw-item">
        <span><b>${item.num}</b> (${item.method})</span>
        <b style="color:var(--primary-color)">${item.amount} <small style="color:#16a34a">✓ Success</small></b>
      </div>
    `;
    feedIndex = (feedIndex + 1) % mockFeed.length;
  }
  rotateFeed();
  setInterval(rotateFeed, 3000);
}

// AUTHENTICATION WITH REGISTRATION BONUS CREDIT
document.addEventListener('DOMContentLoaded', () => {
  loadSocialSupportLinks();

  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const forgotForm = document.getElementById('forgot-password-form');

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-password').value;
      auth.signInWithEmailAndPassword(email, pass).catch(err => {
        let msg = 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন!';
        showCustomAlert(msg, "লগইন ব্যর্থ", "error");
      });
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const phone = document.getElementById('reg-phone').value;
      const country = document.getElementById('reg-country').value;
      const pass = document.getElementById('reg-password').value;
      const refCode = document.getElementById('reg-ref').value;

      auth.createUserWithEmailAndPassword(email, pass).then(cred => {
        const myRef = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        db.ref('settings/config/regBonus').once('value', bSnap => {
          const bonusAmt = parseFloat(bSnap.val()) || 0;
          
          db.ref('users/' + cred.user.uid).set({
            uid: cred.user.uid,
            name, email, phone, country,
            avatar: DEFAULT_AVATAR,
            depositBalance: 0,
            incomeBalance: bonusAmt,
            todayIncome: 0, 
            totalIncome: bonusAmt, 
            vipLevel: 0,
            refCode: myRef, 
            referredBy: refCode || '',
            isBlocked: false
          }).then(() => {
            if (bonusAmt > 0) {
              db.ref('history').push().set({
                uid: cred.user.uid,
                type: 'Registration Bonus',
                amount: bonusAmt,
                title: 'Welcome Registration Bonus',
                status: 'approved',
                timestamp: firebase.database.ServerValue.TIMESTAMP
              });
            }
          });
        });
      }).catch(err => {
        let msg = 'ত্রুটি: ' + err.message;
        if (err.code === 'auth/email-already-in-use') msg = 'এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে!';
        showCustomAlert(msg, "নিবন্ধন ব্যর্থ", "error");
      });
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value;
      auth.sendPasswordResetEmail(email).then(() => {
        showCustomAlert('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।', "ইমেইল পাঠানো হয়েছে", "success");
        forgotForm.reset();
        window.showLoginForm();
      }).catch(err => showCustomAlert('ত্রুটি: ' + err.message, "রিসেট ব্যর্থ", "error"));
    });
  }
});

window.logout = function() { auth.signOut(); };
