const DEFAULT_AVATAR = "https://i.postimg.cc/kXTyBwGr/file-00000000a5dc82119e23c1aae6e24a70.png";

// UNIVERSAL CUSTOM ALERT SYSTEM (NO BROWSER ALERT)
window.showCustomAlert = function(message, title = "বিজ্ঞপ্তি", iconType = "success") {
  const modal = document.getElementById('app-alert-modal');
  const titleEl = document.getElementById('app-alert-title');
  const msgEl = document.getElementById('app-alert-msg');
  const iconEl = document.getElementById('app-alert-icon');

  if (!modal || !titleEl || !msgEl) return;

  titleEl.innerText = title;
  msgEl.innerText = message;

  if (iconEl) {
    if (iconType === 'success') {
      iconEl.innerHTML = '<i class="fa-solid fa-circle-check" style="font-size:42px; color:#10b981;"></i>';
    } else if (iconType === 'error' || iconType === 'warning') {
      iconEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation" style="font-size:42px; color:#ef4444;"></i>';
    } else if (iconType === 'lock') {
      iconEl.innerHTML = '<i class="fa-solid fa-lock" style="font-size:42px; color:#f59e0b;"></i>';
    } else {
      iconEl.innerHTML = '<i class="fa-solid fa-circle-info" style="font-size:42px; color:#05b381;"></i>';
    }
  }

  modal.classList.remove('hidden');
};

window.closeCustomAlert = function() {
  const modal = document.getElementById('app-alert-modal');
  if (modal) modal.classList.add('hidden');
};

// UNIVERSAL CUSTOM CONFIRM SYSTEM (NO BROWSER CONFIRM)
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
  if (icon) {
    icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  }
}

initAppTheme();

// AUTH FORM SWITCHERS WITH CLEAN URL ROUTING
window.showRegisterForm = function(e) {
  if (e) e.preventDefault();
  if (document.getElementById('login-form')) document.getElementById('login-form').classList.add('hidden');
  if (document.getElementById('forgot-password-form')) document.getElementById('forgot-password-form').classList.add('hidden');
  if (document.getElementById('register-form')) document.getElementById('register-form').classList.remove('hidden');

  const pendingRef = localStorage.getItem('pendingRefCode') || '';
  const newUrl = '/register' + (pendingRef ? '?ref=' + pendingRef : '');
  if (window.location.pathname !== '/register') {
    window.history.pushState({}, '', newUrl);
  }
};

window.showLoginForm = function(e) {
  if (e) e.preventDefault();
  if (document.getElementById('register-form')) document.getElementById('register-form').classList.add('hidden');
  if (document.getElementById('forgot-password-form')) document.getElementById('forgot-password-form').classList.add('hidden');
  if (document.getElementById('login-form')) document.getElementById('login-form').classList.remove('hidden');

  if (window.location.pathname !== '/login') {
    window.history.pushState({}, '', '/login');
  }
};

window.showForgotForm = function(e) {
  if (e) e.preventDefault();
  if (document.getElementById('login-form')) document.getElementById('login-form').classList.add('hidden');
  if (document.getElementById('register-form')) document.getElementById('register-form').classList.add('hidden');
  if (document.getElementById('forgot-password-form')) document.getElementById('forgot-password-form').classList.remove('hidden');

  if (window.location.pathname !== '/forgot') {
    window.history.pushState({}, '', '/forgot');
  }
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
let planCountdownTimer = null;
let incomeChartInstance = null;
let systemMinWithdraw = 200;
let systemWithdrawChargePercent = 5;

// Auth Observer
if (typeof auth !== 'undefined') {
  auth.onAuthStateChanged((user) => {
    if (user) {
      currentUser = user;
      if (document.getElementById('auth-container')) document.getElementById('auth-container').classList.add('hidden');
      if (document.getElementById('app-container')) document.getElementById('app-container').classList.remove('hidden');

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
      if (document.getElementById('auth-container')) document.getElementById('auth-container').classList.remove('hidden');
      if (document.getElementById('app-container')) document.getElementById('app-container').classList.add('hidden');
      handleInitialPathRouting();
    }
  });
}

// GLOBAL UI FUNCTIONS
window.openSidebar = function() {
  if (document.getElementById('sidebar-drawer')) document.getElementById('sidebar-drawer').classList.add('open');
  if (document.getElementById('sidebar-overlay')) document.getElementById('sidebar-overlay').classList.add('open');
};

window.closeSidebar = function() {
  if (document.getElementById('sidebar-drawer')) document.getElementById('sidebar-drawer').classList.remove('open');
  if (document.getElementById('sidebar-overlay')) document.getElementById('sidebar-overlay').classList.remove('open');
};

window.openNotifModal = function() {
  if (document.getElementById('notif-modal')) document.getElementById('notif-modal').classList.remove('hidden');
};

window.closeNotifModal = function() {
  if (document.getElementById('notif-modal')) document.getElementById('notif-modal').classList.add('hidden');
};

window.closeWelcomeModal = function() {
  if (document.getElementById('welcome-modal')) document.getElementById('welcome-modal').classList.add('hidden');
};

window.closeTaskModal = function() {
  if (document.getElementById('task-modal')) document.getElementById('task-modal').classList.add('hidden');
  if (document.getElementById('task-processing-view')) document.getElementById('task-processing-view').classList.remove('hidden');
  if (document.getElementById('task-success-view')) document.getElementById('task-success-view').classList.add('hidden');
};

window.toggleBkashBalance = function() {
  if (!userData) return;
  const btnText = document.getElementById('bkash-balance-text');
  if (!btnText) return;

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
  if (container) {
    container.classList.toggle('open');
  }
};

window.openWalletSetupModal = function() {
  const modal = document.getElementById('wallet-setup-modal');
  if (modal) modal.classList.remove('hidden');
  if (userData && userData.walletSetup) {
    const ws = userData.walletSetup;
    if (document.getElementById('setup-wallet-method')) document.getElementById('setup-wallet-method').value = ws.method || 'bKash';
    if (document.getElementById('setup-account-name')) document.getElementById('setup-account-name').value = ws.accountName || '';
    if (document.getElementById('setup-wallet-number')) document.getElementById('setup-wallet-number').value = ws.walletNumber || '';
  }
};

window.closeWalletSetupModal = function() {
  const modal = document.getElementById('wallet-setup-modal');
  if (modal) modal.classList.add('hidden');
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
        <a href="https://wa.me/" target="_blank" class="fab-menu-item">
          <span>WhatsApp Support</span> <i class="fa-brands fa-whatsapp" style="color:#25d366"></i>
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

window.switchTab = function(tabId, el, isDirectPlanTrigger = false, pushState = true) {
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

  if (pushState) {
    const routePaths = {
      'tab-home': '/home',
      'tab-wallet': '/wallet',
      'tab-vip': '/vip',
      'tab-tasks': '/tasks',
      'tab-deposit': '/deposit',
      'tab-withdraw': '/withdraw',
      'tab-profile': '/profile'
    };

    const newPath = routePaths[tabId] || '/home';
    if (window.location.pathname !== newPath) {
      window.history.pushState({ tabId: tabId }, '', newPath);
    }
  }
};

window.addEventListener('popstate', () => {
  handleInitialPathRouting();
});

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

  if (!currentUser) {
    if (path === '/register' || refCode) {
      window.showRegisterForm();
    } else if (path === '/forgot' || path === '/reset') {
      window.showForgotForm();
    } else {
      window.showLoginForm();
    }
  } else {
    const pathToTabMap = {
      '/tasks': 'tab-tasks',
      '/vip': 'tab-vip',
      '/wallet': 'tab-wallet',
      '/deposit': 'tab-deposit',
      '/withdraw': 'tab-withdraw',
      '/profile': 'tab-profile',
      '/home': 'tab-home',
      '/': 'tab-home'
    };

    const targetTab = pathToTabMap[path] || 'tab-home';
    switchTab(targetTab, null, false, false);
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

// USER DATA REALTIME LOAD WITH AUTO PLAN EXPIRY CHECK
function loadUserData() {
  if (!currentUser) return;
  db.ref('users/' + currentUser.uid).on('value', (snapshot) => {
    userData = snapshot.val() || {};

    if (userData.isBlocked === true) {
      showCustomAlert("আপনার একাউন্টটি সাময়িকভাবে স্থগিত করা হয়েছে!", "অ্যাকাউন্ট স্থগিত", "lock");
      auth.signOut();
      return;
    }

    if (userData.vipLevel > 0 && userData.vipExpireAt && typeof userData.vipExpireAt === 'number' && Date.now() >= userData.vipExpireAt) {
      db.ref('users/' + currentUser.uid).update({
        vipLevel: 0,
        vipPlanName: 'মেয়াদ শেষ (Expired)',
        maxDailyTasks: 0,
        vipDailyProfit: 0,
        vipExpireAt: null
      }).then(() => {
        showCustomAlert("আপনার এক্টিভ প্ল্যানের মেয়াদ শেষ হয়ে গেছে! অনুগ্রহ করে নতুন প্ল্যান ক্রয় করুন।", "মেয়াদ শেষ ⏳", "warning");
      });
      return;
    }

    const userAvatar = userData.avatar || DEFAULT_AVATAR;
    if (document.getElementById('usr-name')) document.getElementById('usr-name').innerText = userData.name || 'User';
    if (document.getElementById('usr-id')) document.getElementById('usr-id').innerText = 'ID: ' + (userData.refCode || currentUser.uid.substring(0,6).toUpperCase());
    
    const avatarEl = document.getElementById('usr-avatar');
    if (avatarEl) {
      avatarEl.src = userAvatar;
      avatarEl.onerror = function() { this.src = DEFAULT_AVATAR; };
    }

    if (document.getElementById('usr-vip')) {
      document.getElementById('usr-vip').innerText = (userData.vipLevel && userData.vipLevel > 0)
        ? `এক্টিভ প্ল্যান: ${userData.vipPlanName || 'VIP ' + userData.vipLevel}` 
        : 'এক্টিভ প্ল্যান: নো প্ল্যান';
    }

    const depBal = (userData.depositBalance || 0);
    const incBal = (userData.incomeBalance || 0);
    const totalBal = depBal + incBal;
    userData.balance = totalBal;

    const balVal = '৳' + totalBal.toFixed(2);
    if (document.getElementById('bal-today')) document.getElementById('bal-today').innerText = '৳' + (userData.todayIncome || 0).toFixed(2);
    if (document.getElementById('bal-total-inc')) document.getElementById('bal-total-inc').innerText = '৳' + (userData.totalIncome || 0).toFixed(2);
    if (document.getElementById('dep-total-bal')) document.getElementById('dep-total-bal').innerText = '৳' + depBal.toFixed(2);
    if (document.getElementById('wallet-balance-display')) document.getElementById('wallet-balance-display').innerText = balVal;
    
    if (document.getElementById('wallet-dep-bal')) document.getElementById('wallet-dep-bal').innerText = '৳' + depBal.toFixed(2);
    if (document.getElementById('wallet-inc-bal')) document.getElementById('wallet-inc-bal').innerText = '৳' + incBal.toFixed(2);

    if (document.getElementById('prof-name')) document.getElementById('prof-name').value = userData.name || '';
    if (document.getElementById('prof-phone')) document.getElementById('prof-phone').value = userData.phone || '';
    if (document.getElementById('ref-link-input')) document.getElementById('ref-link-input').value = window.location.origin + '?ref=' + (userData.refCode || '');

    renderActivePlanDashboardBanner();
    checkUserTaskLimitAndLoadTasks();
    renderWithdrawPageForm();
    initIncomeChartRealtime();
    loadVIPPlans();
  });
}

function renderActivePlanDashboardBanner() {
  const container = document.getElementById('dashboard-active-plan-card');
  if (!container) return;

  if (planCountdownTimer) clearInterval(planCountdownTimer);

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

  container.innerHTML = `
    <div class="active-plan-banner" style="padding:16px; border-radius:16px; background:linear-gradient(135deg, #05b381 0%, #038d65 100%); color:#fff;">
      <div class="active-plan-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <h4 style="font-size:16px; font-weight:800;"><i class="fa-solid fa-crown"></i> ${userData.vipPlanName || 'VIP ' + userData.vipLevel}</h4>
        <span class="plan-live-tag" style="background:rgba(255,255,255,0.25); padding:2px 8px; border-radius:10px; font-size:10px; font-weight:800;">ACTIVE</span>
      </div>
      <div class="active-plan-metrics" style="display:flex; justify-content:space-between; margin-bottom:10px; font-size:12px;">
        <div><p style="opacity:0.8;">দৈনিক টাস্ক</p><strong>${userData.maxDailyTasks || 0} টি</strong></div>
        <div><p style="opacity:0.8;">দৈনিক আয়</p><strong>৳${userData.vipDailyProfit || 0}</strong></div>
      </div>
      <div class="plan-validity-box" style="display:flex; justify-content:space-between; font-size:11px; border-top:1px solid rgba(255,255,255,0.2); padding-top:8px;">
        <span><i class="fa-solid fa-clock"></i> মেয়াদের সময়সীমা</span>
        <span id="plan-live-countdown-text" style="color:#ffffff; font-weight:700;">হিসাব করা হচ্ছে...</span>
      </div>
    </div>
  `;

  startLivePlanCountdownTimer();
}

function startLivePlanCountdownTimer() {
  const countEl = document.getElementById('plan-live-countdown-text');
  if (!countEl || !userData || !userData.vipExpireAt || userData.vipLevel <= 0) return;

  function updateTick() {
    const msLeft = userData.vipExpireAt - Date.now();
    if (msLeft <= 0) {
      countEl.innerText = "মেয়াদ শেষ ⏳";
      if (planCountdownTimer) clearInterval(planCountdownTimer);
      return;
    }

    const days = Math.floor(msLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((msLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const mins = Math.floor((msLeft % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((msLeft % (1000 * 60)) / 1000);

    countEl.innerText = `বাকি: ${days}দিন ${hours}ঘণ্টা ${mins}মিঃ ${secs}সে.`;
  }

  updateTick();
  planCountdownTimer = setInterval(updateTick, 1000);
}

// HOMEPAGE CAROUSEL BANNER SLIDER
function loadHomepageSliders() {
  db.ref('slider').on('value', snap => {
    sliderImagesList = [];
    if (snap.exists()) {
      snap.forEach(c => {
        if (c.val() && c.val().url) {
          sliderImagesList.push(c.val().url);
        }
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

// WELCOME POP-UP NOTICE
function checkAndShowWelcomeNotice() {
  db.ref('notices/welcome').once('value', snap => {
    if (snap.exists()) {
      const notice = snap.val();
      if (notice.enabled === true) {
        if (document.getElementById('welcome-title')) document.getElementById('welcome-title').innerText = notice.title || 'স্বাগতম!';
        if (document.getElementById('welcome-desc')) document.getElementById('welcome-desc').innerText = notice.text || '';
        
        const imgBox = document.getElementById('welcome-img-box');
        if (imgBox) {
          if (notice.image) {
            imgBox.innerHTML = `<img src="${notice.image}" style="width:100%; max-height:140px; border-radius:12px; object-fit:cover; margin-bottom:12px;">`;
          } else {
            imgBox.innerHTML = '';
          }
        }

        const btnBox = document.getElementById('welcome-btn-container');
        if (btnBox) {
          if (notice.btnText && notice.btnUrl) {
            btnBox.innerHTML = `
              <a href="${notice.btnUrl}" target="_blank" class="btn-action" style="display:block; text-decoration:none; margin-bottom:6px;">
                ${notice.btnText}
              </a>
            `;
          } else {
            btnBox.innerHTML = '';
          }
        }

        if (document.getElementById('welcome-modal')) document.getElementById('welcome-modal').classList.remove('hidden');
      }
    }
  });
}

// GATEWAYS, APP SETTINGS & NOTICES
function loadGatewaysAndNotices() {
  db.ref('notices/main').on('value', snap => {
    if (snap.exists() && snap.val().text && document.getElementById('notice-text')) {
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

    const walletSelect = document.getElementById('setup-wallet-method');
    if (walletSelect) walletSelect.innerHTML = '';

    snap.forEach((child) => {
      const g = child.val();
      const type = g.type || 'both';

      if (type === 'deposit' || type === 'both') {
        if (depGrid) depGrid.innerHTML += renderGatewayCardHTML(g, 'deposit');
      }
      if (type === 'withdraw' || type === 'both') {
        if (walletSelect) {
          walletSelect.innerHTML += `<option value="${g.name}">${g.name}</option>`;
        }
      }
    });
  });
}

function renderGatewayCardHTML(g, mode) {
  const name = g.name || 'Method';
  const logo = g.logoUrl || 'https://i.ibb.co/3yn9j8p/bkash.png';

  return `
    <div class="method-box" onclick="selectDepositMethod('${name}')" style="background:var(--card-bg); border:1px solid var(--border-color); border-radius:12px; padding:12px; text-align:center; cursor:pointer;">
      <img src="${logo}" class="method-logo-img" alt="${name}" style="width:40px; height:40px; object-fit:contain; margin-bottom:6px;" onerror="this.onerror=null; this.src='https://i.ibb.co/3yn9j8p/bkash.png'">
      <h5 style="font-size:13px; margin-bottom:6px; color:var(--text-main);">${name}</h5>
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

  if (depGrid) {
    depGrid.innerHTML = defaults.map(g => renderGatewayCardHTML(g, 'deposit')).join('');
  }
}

function listenLiveBroadcastNotifications() {
  db.ref('notifications/broadcast').on('value', snap => {
    if (snap.exists()) {
      const notif = snap.val();
      if (document.getElementById('notif-title')) document.getElementById('notif-title').innerText = notif.title || 'নোটিফিকেশন';
      if (document.getElementById('notif-desc')) document.getElementById('notif-desc').innerText = notif.desc || '';
    }
  });
}

// VIP PLANS LOAD & PURCHASE
function loadVIPPlans() {
  db.ref('plans').on('value', snap => {
    const container = document.getElementById('vip-plans-container');
    const depPlanSelect = document.getElementById('dep-target-plan-select');

    if (container) container.innerHTML = '';
    if (depPlanSelect) {
      depPlanSelect.innerHTML = '<option value="wallet">সাধারণ ওয়ালেট ডিপোজিট (General Deposit)</option>';
    }

    const defaultPlans = [
      { id: 'p1', name: 'MICRO ONLINE', price: 500, dailyTasks: 2, dailyProfit: 15, durationDays: 30, vipLevel: 1, refCommissionPercent: 10, withdrawChargePercent: 10, activationBonus: 50, badgeText: '', isSoldOut: false },
      { id: 'p2', name: 'SUPER VIP', price: 1500, dailyTasks: 5, dailyProfit: 50, durationDays: 30, vipLevel: 2, refCommissionPercent: 12, withdrawChargePercent: 5, activationBonus: 100, badgeText: 'POPULAR', isSoldOut: false },
      { id: 'p3', name: 'PRO EARNER', price: 3000, dailyTasks: 10, dailyProfit: 110, durationDays: 30, vipLevel: 3, refCommissionPercent: 15, withdrawChargePercent: 0, activationBonus: 200, badgeText: 'HOT DEAL', isSoldOut: false }
    ];

    const planList = snap.exists() ? Object.values(snap.val()) : defaultPlans;

    planList.forEach((plan) => {
      if (container) container.innerHTML += renderPlanCardHTML(plan);
      if (depPlanSelect && !plan.isSoldOut) {
        depPlanSelect.innerHTML += `<option value="${plan.vipLevel}" data-price="${plan.price}" data-name="${plan.name}" data-tasks="${plan.dailyTasks}" data-profit="${plan.dailyProfit}" data-duration="${plan.durationDays || 30}">${plan.name} - ৳${plan.price}</option>`;
      }
    });
  });
}

function renderPlanCardHTML(plan) {
  const isSoldOut = plan.isSoldOut === true;
  const userVip = userData ? Number(userData.vipLevel || 0) : 0;
  const isCurrentActivePlan = userVip > 0 && Number(plan.vipLevel) === userVip;

  let badgeText = plan.badgeText || (plan.isPopular ? 'POPULAR' : '');
  if (isCurrentActivePlan) {
    badgeText = 'এক্টিভ প্ল্যান';
  }

  const planName = plan.name || 'VIP Plan';
  const planPrice = Number(plan.price || 0);
  const dailyTasks = Number(plan.dailyTasks || 1);
  const dailyProfit = Number(plan.dailyProfit || 0);
  const duration = Number(plan.durationDays || 30);
  const vipLevel = Number(plan.vipLevel || 1);
  const witCharge = Number(plan.withdrawChargePercent !== undefined ? plan.withdrawChargePercent : 5);
  const actBonus = Number(plan.activationBonus || 0);

  let btnClass = 'btn-buy-plan';
  let btnText = 'প্ল্যান কিনুন';
  let btnDisabled = '';

  if (isCurrentActivePlan) {
    btnClass = 'btn-buy-plan active-plan-btn';
    btnText = 'এক্টিভ রয়েছে ✓';
    btnDisabled = 'disabled';
  } else if (isSoldOut) {
    btnClass = 'btn-buy-plan sold-out';
    btnText = 'সোল্ড আউট (Sold Out)';
    btnDisabled = 'disabled';
  }

  return `
    <div class="content-card" style="position:relative; margin-bottom:15px; padding:18px;">
      ${isCurrentActivePlan 
        ? '<div style="position:absolute; top:10px; right:10px; background:#10b981; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">ACTIVE</div>' 
        : (isSoldOut ? '<div style="position:absolute; top:10px; right:10px; background:#ef4444; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">SOLD OUT</div>' : (badgeText ? `<div style="position:absolute; top:10px; right:10px; background:#0284c7; color:#fff; font-size:10px; font-weight:800; padding:2px 8px; border-radius:10px;">${badgeText}</div>` : ''))}
      <div style="border-bottom:1px solid var(--border-color); padding-bottom:10px; margin-bottom:12px;">
        <h3 style="font-size:16px; font-weight:800; color:var(--text-main);">${planName}</h3>
        <h2 style="font-size:22px; font-weight:900; color:var(--primary-color);">৳${planPrice} <small style="font-size:12px; color:var(--text-muted);">/${duration} দিন</small></h2>
        ${actBonus > 0 ? `<div style="font-size:11px; color:#10b981; font-weight:700; margin-top:4px;">🎁 এক্টিভেশন বোনাস ৳${actBonus}</div>` : ''}
      </div>
      <ul style="list-style:none; font-size:12px; margin-bottom:15px; display:grid; gap:6px; color:var(--text-main);">
        <li><i class="fa-solid fa-circle-check" style="color:#10b981;"></i> প্রতিদিন <b>${dailyTasks}টি</b> টাস্ক</li>
        <li><i class="fa-solid fa-coins" style="color:#f59e0b;"></i> দৈনিক আয়: <b>৳${dailyProfit}</b></li>
        <li><i class="fa-solid fa-percent" style="color:#8b5cf6;"></i> উইথড্র প্রসেসিং ফি: <b>${witCharge}%</b></li>
        <li><i class="fa-solid fa-calendar-days" style="color:#0284c7;"></i> মেয়াদের সময়সীমা: <b>${duration} দিন</b></li>
        <li><i class="fa-solid fa-chart-line" style="color:#10b981;"></i> মোট সম্ভাব্য আয়: <b>৳${(dailyProfit * duration).toFixed(0)}</b></li>
      </ul>
      <button class="btn-action ${btnClass}" ${btnDisabled} 
        onclick="buyVIPPlan('${planName}', ${planPrice}, ${vipLevel}, ${dailyTasks}, ${dailyProfit}, ${witCharge}, ${duration}, ${actBonus})">
        ${btnText}
      </button>
    </div>
  `;
}

window.buyVIPPlan = function(planName, price, vipLevel, dailyTasks, dailyProfit, withdrawChargePercent = 5, durationDays = 30, activationBonus = 0) {
  if (!userData) return;
  const depBal = Number(userData.depositBalance || 0);

  if (depBal < price) {
    directDepositForPlan(planName, price, vipLevel, dailyTasks, dailyProfit);
    return;
  }

  showCustomConfirm("প্ল্যান ক্রয় নিশ্চিতকরণ", `আপনি কি ৳${price} দিয়ে ${planName} ক্রয় করতে চান? (মেয়াদ: ${durationDays} দিন)`, function() {
    const nowMs = Date.now();
    const durationMs = Number(durationDays || 30) * 24 * 60 * 60 * 1000;
    const expireMs = nowMs + durationMs;

    const updates = {};
    updates['users/' + currentUser.uid + '/depositBalance'] = depBal - price;
    updates['users/' + currentUser.uid + '/vipLevel'] = vipLevel;
    updates['users/' + currentUser.uid + '/vipPlanName'] = planName;
    updates['users/' + currentUser.uid + '/maxDailyTasks'] = dailyTasks;
    updates['users/' + currentUser.uid + '/vipDailyProfit'] = dailyProfit;
    updates['users/' + currentUser.uid + '/withdrawChargePercent'] = withdrawChargePercent;
    updates['users/' + currentUser.uid + '/vipActivatedAt'] = nowMs;
    updates['users/' + currentUser.uid + '/vipExpireAt'] = expireMs;

    if (activationBonus > 0) {
      updates['users/' + currentUser.uid + '/unclaimedPlanBonus'] = activationBonus;
    }

    db.ref().update(updates).then(() => {
      userData.depositBalance = depBal - price;
      userData.vipLevel = vipLevel;
      userData.vipPlanName = planName;
      userData.maxDailyTasks = dailyTasks;
      userData.vipDailyProfit = dailyProfit;
      userData.withdrawChargePercent = withdrawChargePercent;
      userData.vipExpireAt = expireMs;

      const histRef = db.ref('history').push();
      histRef.set({
        uid: currentUser.uid,
        type: 'Plan Purchase',
        amount: -price,
        title: 'Purchased ' + planName,
        status: 'approved',
        timestamp: firebase.database.ServerValue.TIMESTAMP
      });

      showCustomAlert(`অভিনন্দন! ${planName} সফলভাবে ক্রয় করা হয়েছে। মেয়াদের সময়সীমা ${durationDays} দিন।${activationBonus > 0 ? ' টাস্ক পেজ থেকে বোনাস ক্লেইম করুন!' : ''}`, "প্ল্যান এক্টিভেটেড! 🎉", "success");
      renderActivePlanDashboardBanner();
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

// TASK SYSTEM WITH EXPLICIT UNIQUE FIREBASE KEY BINDING
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
          if (!tRec.isFreeTask) {
            userTodayCompletedCount++;
          }
        }
      });
    }

    loadTasks(completedTaskIds);
  });
}

function loadTasks(completedTaskIds = {}) {
  const container = document.getElementById('tasks-list-container');
  const bonusContainer = document.getElementById('plan-bonus-claim-container');
  
  if (!container) return;
  container.innerHTML = '';

  if (bonusContainer) {
    if (userData && userData.unclaimedPlanBonus && userData.unclaimedPlanBonus > 0) {
      bonusContainer.innerHTML = `
        <div class="content-card" style="background:linear-gradient(135deg, #05b381 0%, #0284c7 100%); color:#ffffff; padding:16px; margin-bottom:12px;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="background:rgba(255,255,255,0.2); color:#ffffff; font-size:10px; padding:2px 8px; border-radius:10px;"><i class="fa-solid fa-gift"></i> প্ল্যান বোনাস</span>
              <h3 style="color:#ffffff; font-size:22px; font-weight:900; margin-top:4px;">৳${userData.unclaimedPlanBonus}</h3>
            </div>
            <button class="btn-action" style="width:auto; padding:8px 16px; background:#ffffff !important; color:var(--primary-color) !important; font-weight:800;" onclick="claimPlanActivationBonus()">ক্লেইম করুন 🚀</button>
          </div>
        </div>
      `;
    } else {
      bonusContainer.innerHTML = '';
    }
  }

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

    const uncompletedTasks = userVipTasks.filter(task => !completedTaskIds[task.id]);

    if (userVipTasks.length > 0 && uncompletedTasks.length === 0) {
      container.innerHTML = `
        <div class="content-card" style="text-align:center; padding:35px 20px;">
          <div style="width:60px; height:60px; border-radius:50%; background:#d1fae5; display:flex; align-items:center; justify-content:center; margin:0 auto 15px;">
            <i class="fa-solid fa-circle-check" style="font-size:36px; color:#10b981;"></i>
          </div>
          <h3 style="font-size:18px; font-weight:800; color:var(--primary-color); margin-bottom:6px;">আজকের সকল টাস্ক সম্পন্ন! 🎉</h3>
          <p style="font-size:12px; color:var(--text-muted); line-height:1.5;">
            অভিনন্দন! আজকের দিনের জন্য নির্ধারিত সকল টাস্ক আপনি সফলভাবে সম্পন্ন করেছেন।
          </p>
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

    uncompletedTasks.forEach(task => {
      const taskId = task.id; 
      const isFreeTask = Number(task.minVip || 0) === 0 || task.isFree === true;
      const limitReached = !isFreeTask && (userTodayCompletedCount >= userMaxDailyTasks);

      let btnText = 'টাস্ক শুরু করুন';
      let btnDisabled = false;
      let btnStyle = '';

      if (limitReached) {
        btnText = 'আজকের লিমিট শেষ 🔒';
        btnDisabled = true;
        btnStyle = 'background:#ef4444; cursor:not-allowed;';
      }

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
            <button class="btn-action" style="width:auto; padding:8px 14px; font-size:12px; ${btnStyle}" 
              ${btnDisabled ? 'disabled' : `onclick="startTask('${taskId}', ${task.reward}, ${isFreeTask})"`}>
              ${btnText}
            </button>
          </div>
        </div>
      `;
    });
  });
}

window.claimPlanActivationBonus = function() {
  if (!userData || !userData.unclaimedPlanBonus || userData.unclaimedPlanBonus <= 0) return;
  const bonus = Number(userData.unclaimedPlanBonus);

  const updates = {};
  updates[`users/${currentUser.uid}/incomeBalance`] = (userData.incomeBalance || 0) + bonus;
  updates[`users/${currentUser.uid}/unclaimedPlanBonus`] = 0;

  db.ref().update(updates).then(() => {
    const histRef = db.ref('history').push();
    histRef.set({
      uid: currentUser.uid,
      type: 'Plan Bonus',
      amount: bonus,
      title: 'Claimed Plan Activation Bonus',
      status: 'approved',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });

    showCustomAlert(`অভিনন্দন! ৳${bonus} প্ল্যান এক্টিভেশন বোনাস আপনার ইনকাম ওয়ালেটে যোগ করা হয়েছে। 🎉`, "বোনাস ক্লেইমড!", "success");
  });
};

window.startTask = function(taskId, reward, isFreeTask = false) {
  activeTaskObj = { taskId, reward, isFreeTask };
  
  if (document.getElementById('task-modal')) document.getElementById('task-modal').classList.remove('hidden');
  if (document.getElementById('task-processing-view')) document.getElementById('task-processing-view').classList.remove('hidden');
  if (document.getElementById('task-success-view')) document.getElementById('task-success-view').classList.add('hidden');
  if (document.getElementById('btn-claim-task')) document.getElementById('btn-claim-task').classList.add('hidden');
  if (document.getElementById('reward-amount-pop')) document.getElementById('reward-amount-pop').classList.add('hidden');
  if (document.getElementById('task-modal-title')) document.getElementById('task-modal-title').innerText = 'টাস্ক প্রসেসিং হচ্ছে...';

  let progress = 0;
  const fill = document.getElementById('task-progress');
  if (fill) fill.style.width = '0%';

  const interval = setInterval(() => {
    progress += 25;
    if (fill) fill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(interval);
      if (document.getElementById('task-modal-title')) document.getElementById('task-modal-title').innerText = '🎉 টাস্ক সফলভাবে সম্পন্ন!';
      if (document.getElementById('pop-reward-val')) document.getElementById('pop-reward-val').innerText = '+৳' + reward.toFixed(2);
      if (document.getElementById('reward-amount-pop')) document.getElementById('reward-amount-pop').classList.remove('hidden');
      if (document.getElementById('btn-claim-task')) document.getElementById('btn-claim-task').classList.remove('hidden');
    }
  }, 500);
};

// REWARD CLAIM LISTENERS
document.addEventListener('DOMContentLoaded', () => {
  const claimBtn = document.getElementById('btn-claim-task');
  if (claimBtn) {
    claimBtn.addEventListener('click', () => {
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
        const histRef = db.ref('history').push();
        histRef.set({
          uid: currentUser.uid,
          type: 'Task Reward',
          amount: reward,
          title: isFree ? 'Completed Free Task' : 'Completed VIP Task',
          status: 'approved',
          timestamp: firebase.database.ServerValue.TIMESTAMP
        });

        if (document.getElementById('task-processing-view')) document.getElementById('task-processing-view').classList.add('hidden');
        if (document.getElementById('task-success-view')) document.getElementById('task-success-view').classList.remove('hidden');
        if (document.getElementById('success-reward-val')) document.getElementById('success-reward-val').innerText = '+৳' + reward.toFixed(2);

        activeTaskObj = null;
        initIncomeChartRealtime();
      });
    });
  }
});

// MULTI-STEP DEPOSIT
window.goToDepositStep = function(step) {
  if (document.getElementById('dep-step-1')) document.getElementById('dep-step-1').classList.add('hidden');
  if (document.getElementById('dep-step-2')) document.getElementById('dep-step-2').classList.add('hidden');
  if (document.getElementById('dep-step-3')) document.getElementById('dep-step-3').classList.add('hidden');

  const targetStep = document.getElementById('dep-step-' + step);
  if (targetStep) targetStep.classList.remove('hidden');
};

window.selectDepositMethod = function(method) {
  selectedDepositMethodName = method;
  if (document.getElementById('selected-method-title')) document.getElementById('selected-method-title').innerText = method;
  goToDepositStep(2);
};

window.onDepositPlanTargetChange = function(selectEl) {
  const opt = selectEl.options[selectEl.selectedIndex];
  if (selectEl.value !== 'wallet') {
    const price = opt.getAttribute('data-price');
    if (price && document.getElementById('input-dep-amount')) {
      document.getElementById('input-dep-amount').value = price;
      selectedDepositAmountVal = parseFloat(price);
    }
  }
};

window.setQuickAmount = function(amt, el) {
  selectedDepositAmountVal = amt;
  if (document.getElementById('input-dep-amount')) document.getElementById('input-dep-amount').value = amt;
  document.querySelectorAll('.amount-btn').forEach(b => b.classList.remove('active'));
  if (el) el.classList.add('active');
};

window.proceedToStep3 = function() {
  const amtInput = document.getElementById('input-dep-amount');
  const inputAmt = amtInput ? parseFloat(amtInput.value) : 500;

  if (!inputAmt || inputAmt < 500) {
    showCustomAlert('সর্বনিম্ন ৫০০ টাকা ডিপোজিট করতে হবে।', 'ডিপোজিট লিমিট', 'warning');
    return;
  }

  selectedDepositAmountVal = inputAmt;
  if (document.getElementById('step3-amount-display')) document.getElementById('step3-amount-display').innerText = '৳ ' + selectedDepositAmountVal;
  if (document.getElementById('step3-confirm-amount')) document.getElementById('step3-confirm-amount').innerText = '৳ ' + selectedDepositAmountVal;

  db.ref('payment_gateways').once('value', snap => {
    let targetNum = '01719856165';
    if (snap.exists()) {
      snap.forEach(c => {
        if (c.val().name === selectedDepositMethodName) {
          targetNum = c.val().number || targetNum;
        }
      });
    }
    if (document.getElementById('target-phone-num')) document.getElementById('target-phone-num').innerText = targetNum;
  });

  goToDepositStep(3);
};

window.copyPhoneNum = function() {
  const numEl = document.getElementById('target-phone-num');
  const num = numEl ? numEl.innerText : '';
  if (num) {
    navigator.clipboard.writeText(num);
    showCustomAlert('নম্বর কপি করা হয়েছে: ' + num, 'কপি সফল', 'info');
  }
};

window.submitDepositFinal = function() {
  const trxIdInput = document.getElementById('input-trx-id');
  const trxId = trxIdInput ? trxIdInput.value.trim() : '';

  if (!trxId) {
    showCustomAlert('অনুগ্রহ করে Transaction ID প্রদান করুন।', 'তথ্য অসম্পূর্ণ', 'warning');
    return;
  }

  const targetPlanSelect = document.getElementById('dep-target-plan-select');
  let targetPlanData = null;

  if (targetPlanSelect && targetPlanSelect.value !== 'wallet') {
    const opt = targetPlanSelect.options[targetPlanSelect.selectedIndex];
    targetPlanData = {
      vipLevel: parseInt(targetPlanSelect.value),
      planName: opt.getAttribute('data-name'),
      dailyTasks: parseInt(opt.getAttribute('data-tasks')),
      dailyProfit: parseFloat(opt.getAttribute('data-profit')),
      durationDays: parseInt(opt.getAttribute('data-duration') || 30)
    };
  }

  const depRef = db.ref('deposits').push();
  const depObj = {
    id: depRef.key,
    uid: currentUser.uid,
    email: currentUser.email,
    method: selectedDepositMethodName,
    amount: selectedDepositAmountVal,
    trxId: trxId,
    targetPlan: targetPlanData || 'wallet',
    status: 'pending',
    timestamp: firebase.database.ServerValue.TIMESTAMP
  };

  depRef.set(depObj).then(() => {
    showCustomAlert('ডিপোজিট রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে!', 'ডিপোজিট রিকোয়েস্ট জমা', 'success');
    if (trxIdInput) trxIdInput.value = '';
    goToDepositStep(1);
    loadDepositHistory();
  });
};

function loadDepositHistory() {
  if (!currentUser) return;
  db.ref('deposits').orderByChild('uid').equalTo(currentUser.uid).on('value', snap => {
    const list = document.getElementById('dep-history-list');
    if (!list) return;

    if (!snap.exists()) {
      list.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--text-muted);">কোনো ডিপোজিট রেকর্ড নেই</div>';
      return;
    }

    list.innerHTML = '';
    snap.forEach(child => {
      const d = child.val();
      list.innerHTML = `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
          <div><b>${d.method}</b> (${d.trxId})</div>
          <div>৳${d.amount} - <span style="color:${d.status === 'approved' ? 'var(--primary-color)' : '#f59e0b'}">${d.status}</span></div>
        </div>
      ` + list.innerHTML;
    });
  });
}

// WALLET METHOD & 5-DIGIT PIN SETUP WITH UNIQUE NUMBER CHECK
window.handleWalletSetupSubmit = function(e) {
  e.preventDefault();
  const method = document.getElementById('setup-wallet-method').value;
  const accName = document.getElementById('setup-account-name').value;
  const walletNum = document.getElementById('setup-wallet-number').value.trim();
  const pin = document.getElementById('setup-wallet-pin').value.trim();

  if (!pin || pin.length !== 5 || isNaN(pin)) {
    showCustomAlert('অনুগ্রহ করে সঠিক ৫ সংখ্যার পিন প্রদান করুন!', 'ভুল পিন', 'warning');
    return;
  }

  db.ref('users').once('value', snap => {
    let isUsedByAnotherUser = false;

    if (snap.exists()) {
      snap.forEach(child => {
        const u = child.val();
        if (child.key !== currentUser.uid && u.walletSetup && u.walletSetup.walletNumber === walletNum) {
          isUsedByAnotherUser = true;
        }
      });
    }

    if (isUsedByAnotherUser) {
      showCustomAlert('এই ওয়ালেট নম্বরটি ইতোমধ্যে অন্য একজন ইউজার ব্যবহার করেছেন!', 'নম্বর ইতোমধ্যে ব্যবহৃত', 'error');
      return;
    }

    const walletSetupData = {
      method: method,
      accountName: accName,
      walletNumber: walletNum,
      pin: pin
    };

    db.ref('users/' + currentUser.uid + '/walletSetup').set(walletSetupData).then(() => {
      closeWalletSetupModal();
      showCustomAlert('আপনার উইথড্র ওয়ালেট ও ৫ সংখ্যার পিন সফলভাবে সেভ করা হয়েছে!', 'সেটআপ সফল', 'success');
      renderWithdrawPageForm();
    });
  });
};

// RENDER SAVED SINGLE WALLET WITHDRAWAL FORM
function renderWithdrawPageForm() {
  const container = document.getElementById('withdraw-page-container');
  if (!container) return;

  if (!userData || !userData.walletSetup) {
    container.innerHTML = `
      <div class="content-card" style="text-align:center; padding:25px 15px; cursor:pointer;" onclick="openWalletSetupModal()">
        <i class="fa-solid fa-circle-plus" style="font-size:36px; color:var(--primary-color); margin-bottom:8px;"></i>
        <h4 style="font-size:14px; color:var(--text-main);">পেমেন্ট ওয়ালেট সেটআপ করুন</h4>
        <p style="font-size:11px; color:var(--text-muted);">উত্তোলনের জন্য ওয়ালেট ও পিন সেভ করুন</p>
      </div>
      <button class="btn-action" style="margin-top:10px;" onclick="openWalletSetupModal()">Add Payment Method ⚙️</button>
    `;
    return;
  }

  const ws = userData.walletSetup;
  const withdrawableTotal = (userData.depositBalance || 0) + (userData.incomeBalance || 0);

  container.innerHTML = `
    <div class="content-card">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <i class="fa-solid fa-shield-halved" style="color:var(--primary-color); font-size:20px;"></i>
          <div>
            <strong style="font-size:14px; color:var(--text-main);">${ws.method} Wallet</strong>
            <small style="display:block; color:var(--text-muted);">${ws.accountName}</small>
          </div>
        </div>
        <button class="btn-continue-sm" style="width:auto; padding:5px 12px;" onclick="openWalletSetupModal()">পরিবর্তন ⚙️</button>
      </div>
      <div style="font-size:13px; font-weight:800; color:var(--primary-color); background:var(--primary-light); padding:8px 12px; border-radius:10px; text-align:center;">
        ${ws.walletNumber}
      </div>
    </div>

    <div class="content-card">
      <form id="withdraw-form" onsubmit="handleWithdrawSubmit(event)">
        <div class="form-group">
          <label>উত্তোলনের পরিমাণ (৳)</label>
          <div style="display:flex; gap:8px;">
            <input type="number" id="wit-amount" class="form-control" required placeholder="সর্বনিম্ন ৳${systemMinWithdraw}" oninput="calculateWithdrawFeePreview()">
            <button type="button" class="btn-continue-sm" style="width:auto; white-space:nowrap;" onclick="setWithdrawAllBalance(${withdrawableTotal})">ALL</button>
          </div>
        </div>

        <div class="form-group">
          <label>আপনার ৫ সংখ্যার সিকিউরিটি পিন (PIN)</label>
          <input type="password" id="wit-pin-input" class="form-control" required maxlength="5" minlength="5" placeholder="৫ সংখ্যার পিন লিখুন">
        </div>

        <div id="wit-fee-preview-box" style="background:var(--primary-light); padding:10px; border-radius:10px; margin-bottom:14px; font-size:12px; border:1px solid var(--border-color);">
          <div>প্রসেসিং চার্জ: <strong id="wit-fee-amount" style="color:var(--danger)">৳০.০০</strong></div>
          <div>আপনি পাবেন: <strong id="wit-net-receive" style="color:var(--primary-color)">৳০.০০</strong></div>
        </div>

        <button type="submit" class="btn-action">উত্তোলনের আবেদন করুন 💸</button>
      </form>
    </div>
  `;
}

window.setWithdrawAllBalance = function(maxBal) {
  const amtInput = document.getElementById('wit-amount');
  if (amtInput) {
    amtInput.value = maxBal.toFixed(2);
    calculateWithdrawFeePreview();
  }
};

function getActiveWithdrawChargePercent() {
  if (userData && userData.withdrawChargePercent !== undefined) {
    return Number(userData.withdrawChargePercent);
  }
  return systemWithdrawChargePercent;
}

window.calculateWithdrawFeePreview = function() {
  const amtInput = document.getElementById('wit-amount');
  if (!amtInput) return;
  const amt = parseFloat(amtInput.value) || 0;
  const activeCharge = getActiveWithdrawChargePercent();
  const chargeFee = amt * (activeCharge / 100);
  const netAmount = Math.max(0, amt - chargeFee);

  const feeEl = document.getElementById('wit-fee-amount');
  const netEl = document.getElementById('wit-net-receive');
  if (feeEl) feeEl.innerText = '৳' + chargeFee.toFixed(2);
  if (netEl) netEl.innerText = '৳' + netAmount.toFixed(2);
};

window.handleWithdrawSubmit = function(e) {
  e.preventDefault();

  if (!userData || !userData.vipLevel || userData.vipLevel <= 0) {
    showCustomAlert('উত্তোলন করার জন্য আপনাকে অবশ্যই একটি প্রিমিয়াম প্ল্যান এক্টিভ করতে হবে!', 'প্ল্যান প্রয়োজন', 'lock');
    switchTab('tab-vip');
    return;
  }

  if (!userData.walletSetup) {
    showCustomAlert('আগে আপনার উইথড্র ওয়ালেট ও ৫ সংখ্যার পিন সেটআপ করুন!', 'ওয়ালেট প্রয়োজন', 'warning');
    openWalletSetupModal();
    return;
  }

  const amt = parseFloat(document.getElementById('wit-amount').value);
  const enteredPin = document.getElementById('wit-pin-input').value;

  if (enteredPin !== userData.walletSetup.pin) {
    showCustomAlert('ভুল ৫ সংখ্যার সিকিউরিটি পিন প্রদান করেছেন!', 'ভুল পিন', 'error');
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
      method: userData.walletSetup.method,
      walletNumber: userData.walletSetup.walletNumber,
      accountName: userData.walletSetup.accountName,
      amount: amt,
      chargePercent: activeCharge,
      netAmount: Math.max(0, amt - (amt * activeCharge / 100)),
      status: 'pending',
      timestamp: firebase.database.ServerValue.TIMESTAMP
    });
  }).then(() => {
    showCustomAlert('উত্তোলন রিকোয়েস্ট সফলভাবে সাবমিট করা হয়েছে!', 'উত্তোলন সফল', 'success');
    renderWithdrawPageForm();
    loadWithdrawHistory();
  });
};

function loadWithdrawHistory() {
  if (!currentUser) return;
  db.ref('withdraws').orderByChild('uid').equalTo(currentUser.uid).on('value', snap => {
    const list = document.getElementById('wit-history-list');
    const walletList = document.getElementById('wallet-history-list');
    
    if (!snap.exists()) {
      if (list) list.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--text-muted);">কোনো উইথড্র রেকর্ড নেই</div>';
      if (walletList) walletList.innerHTML = '<div style="text-align:center; font-size:12px; color:var(--text-muted);">কোনো লেনদেন রেকর্ড নেই</div>';
      return;
    }

    let html = '';
    snap.forEach(child => {
      const w = child.val();
      html = `
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border-color); font-size:12px;">
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

// PROFILE UPDATE
window.handleProfileUpdate = function(e) {
  e.preventDefault();
  const nameInput = document.getElementById('prof-name');
  const phoneInput = document.getElementById('prof-phone');

  const name = nameInput ? nameInput.value : '';
  const phone = phoneInput ? phoneInput.value : '';

  db.ref('users/' + currentUser.uid).update({ name, phone }).then(() => {
    showCustomAlert('প্রোফাইল তথ্য সফলভাবে আপডেট করা হয়েছে!', 'আপডেট সফল', 'success');
  });
};

window.copyRefLink = function() {
  const input = document.getElementById('ref-link-input');
  if (input && input.value) {
    navigator.clipboard.writeText(input.value);
    showCustomAlert('রেফারেল লিংক কপি করা হয়েছে!', 'কপি সফল', 'info');
  }
};

// REALTIME USER INCOME GRAPH CHART
function initIncomeChartRealtime() {
  const canvas = document.getElementById('incomeChart');
  if (!canvas || !currentUser || typeof Chart === 'undefined') return;
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
          if (dailyIncomeMap[dayName] !== undefined) {
            dailyIncomeMap[dayName] += item.amount;
          }
        }
      });
    }

    const chartData = hasEarnings ? [
      dailyIncomeMap['Mon'] || 0,
      dailyIncomeMap['Tue'] || 0,
      dailyIncomeMap['Wed'] || 0,
      dailyIncomeMap['Thu'] || 0,
      dailyIncomeMap['Fri'] || 0,
      dailyIncomeMap['Sat'] || 0,
      dailyIncomeMap['Sun'] || 0
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

// INFINITE AUTO LIVE WITHDRAW TICKER
function renderLiveWithdrawsInfinite() {
  const container = document.getElementById('live-withdraw-feed');
  if (!container) return;

  const mockFeed = [
    { num: '017****1234', method: 'bKash', amount: '৳৫০০' },
    { num: '018****8890', method: 'Nagad', amount: '৳১২০০' },
    { num: '019****4567', method: 'Rocket', amount: '৳৭৫০' },
    { num: '016****9012', method: 'bKash', amount: '৳১৫০০' },
    { num: '013****3456', method: 'Nagad', amount: '৳২০০০' }
  ];

  let feedIndex = 0;

  function rotateFeed() {
    const item = mockFeed[feedIndex];
    container.innerHTML = `
      <div class="live-withdraw-item" style="display:flex; justify-content:space-between; padding:8px 12px; background:var(--primary-light); border-radius:10px; font-size:12px; margin-bottom:6px;">
        <span><b>${item.num}</b> (${item.method})</span>
        <b style="color:var(--primary-color)">${item.amount} <small style="color:#16a34a">✓ Success</small></b>
      </div>
    `;
    feedIndex = (feedIndex + 1) % mockFeed.length;
  }

  rotateFeed();
  setInterval(rotateFeed, 3000);
}

// AUTH LISTENERS
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
        let msg = 'ত্রুটি: ' + err.message;
        if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          msg = 'ভুল ইমেইল অথবা পাসওয়ার্ড প্রদান করেছেন!';
        }
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

      db.ref('settings/config/regBonus').once('value', snap => {
        const regBonusAmt = Number(snap.val() || 0);

        auth.createUserWithEmailAndPassword(email, pass).then(cred => {
          const myRef = Math.random().toString(36).substring(2, 8).toUpperCase();
          
          const newUserData = {
            uid: cred.user.uid,
            name, email, phone, country,
            avatar: DEFAULT_AVATAR,
            depositBalance: 0,
            incomeBalance: regBonusAmt,
            todayIncome: 0, 
            totalIncome: regBonusAmt, 
            vipLevel: 0,
            refCode: myRef, 
            referredBy: refCode || '',
            isBlocked: false
          };

          return db.ref('users/' + cred.user.uid).set(newUserData).then(() => {
            if (regBonusAmt > 0) {
              const histRef = db.ref('history').push();
              histRef.set({
                uid: cred.user.uid,
                type: 'Registration Bonus',
                amount: regBonusAmt,
                title: 'Welcome Registration Bonus',
                status: 'approved',
                timestamp: firebase.database.ServerValue.TIMESTAMP
              });
            }
          });
        }).catch(err => {
          let msg = 'ত্রুটি: ' + err.message;
          if (err.code === 'auth/email-already-in-use') msg = 'এই ইমেইল দিয়ে ইতিপূর্বে অ্যাকাউন্ট খোলা হয়েছে!';
          if (err.code === 'auth/weak-password') msg = 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড দিন!';
          showCustomAlert(msg, "নিবন্ধন ব্যর্থ", "error");
        });
      });
    });
  }

  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value;
      
      if (!email) {
        showCustomAlert('অনুগ্রহ করে আপনার অ্যাকাউন্টের ইমেইল অ্যাড্রেস লিখুন!', "ইমেইল প্রয়োজন", "warning");
        return;
      }

      auth.sendPasswordResetEmail(email).then(() => {
        showCustomAlert('পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে। ইমেইলের Inbox বা Spam ফোল্ডার চেক করুন।', "ইমেইল পাঠানো হয়েছে", "success");
        forgotForm.reset();
        window.showLoginForm();
      }).catch(err => {
        let msg = 'ত্রুটি: ' + err.message;
        if (err.code === 'auth/user-not-found') msg = 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি!';
        showCustomAlert(msg, "রিসেট ব্যর্থ", "error");
      });
    });
  }
});

window.logout = function() { 
  showCustomConfirm("লগআউট", "আপনি কি একাউন্ট থেকে লগআউট করতে চান?", function() {
    auth.signOut().then(() => {
      window.location.replace('/');
    });
  });
};
