// --- FIREBASE INITIALIZATION ---
const firebaseConfig = {
  projectId: "easy-earning-app-990d9",
  appId: "1:344566716068:web:9966b6fbeaed9b8610f831",
  apiKey: "AIzaSyCi7VY8ge8_8VR0NhCkQXWGCTuTEiIrC6I",
  authDomain: "easy-earning-app-990d9.firebaseapp.com",
  firestoreDatabaseId: "(default)",
  storageBucket: "easy-earning-app-990d9.firebasestorage.app",
  messagingSenderId: "344566716068",
  measurementId: "G-95N3XLN8T0"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

// --- GLOBAL STATE ---
let currentUser = null;
let userProfile = null;
let globalSettings = {
  siteName: "Nexora Platform",
  registrationBonus: 50,
  activationFee: 100,
  activationMode: "paid", // "paid", "bonus", "free"
  dailyBonusAmount: 15,
  dailyScratchLimit: 5,
  dailySpinLimit: 10,
  referralBonus: 20,
  minWithdraw: 100,
  minDeposit: 50
};

let paymentMethods = [];
let vipPlans = [];
let allTasks = [];
let selectedDepositMethodObj = null;
let currentDepositAmount = 500;

// --- TOAST & MODAL UTILITIES ---
function showToast(msg, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.innerText = msg;
  toast.classList.remove('hidden', '-translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(() => toast.classList.add('-translate-y-20', 'opacity-0'), 3500);
}

function openModal(id) { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }

// Sidebar Drawer Toggle
function toggleSidebar() {
  const drawer = document.getElementById('sidebarDrawer');
  const overlay = document.getElementById('sidebarOverlay');
  if (drawer.classList.contains('-translate-x-full')) {
    drawer.classList.remove('-translate-x-full');
    overlay.classList.remove('hidden');
  } else {
    drawer.classList.add('-translate-x-full');
    overlay.classList.add('hidden');
  }
}

// Navigation System
function navigateTo(pageId) {
  const pages = ['home', 'depositStep1', 'depositStep2', 'depositStep3', 'earn', 'spin', 'scratch', 'plans', 'referral', 'leaderboard', 'history', 'support'];
  pages.forEach(p => document.getElementById('page' + capitalize(p))?.classList.add('hidden'));

  const target = document.getElementById('page' + capitalize(pageId));
  if (target) target.classList.remove('hidden');

  // Trigger page-specific loaders
  if (pageId === 'earn') renderVIPPlanTasks();
  if (pageId === 'plans') renderPlans();
  if (pageId === 'spin') setupSpinWheel();
  if (pageId === 'scratch') setupScratchCard();
  if (pageId === 'leaderboard') loadLeaderboard();
  if (pageId === 'history') loadHistory();

  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// --- AUTH HANDLING ---
function switchAuthTab(tab) {
  if (tab === 'login') {
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
  } else {
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  try {
    await auth.signInWithEmailAndPassword(
      document.getElementById('loginEmail').value.trim(),
      document.getElementById('loginPassword').value
    );
    showToast('লগইন সফল হয়েছে!');
  } catch (err) {
    showToast('লগইন ব্যর্থ: ' + err.message, false);
  } finally { btn.disabled = false; }
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signupBtn');
  btn.disabled = true;
  try {
    const email = document.getElementById('signupEmail').value.trim();
    const name = document.getElementById('signupName').value.trim();
    const refCode = document.getElementById('signupReferral').value.trim().toUpperCase();
    const res = await auth.createUserWithEmailAndPassword(email, document.getElementById('signupPassword').value);
    
    const myRef = Math.random().toString(36).substring(2, 8).toUpperCase();
    await db.collection('users').doc(res.user.uid).set({
      name: name,
      email: email,
      balance: 0,
      bonusBalance: globalSettings.registrationBonus || 50,
      accountActivated: false,
      activePlanId: null,
      activePlanName: null,
      role: email === 'mdfirozhossain2007@gmail.com' ? 'admin' : 'user',
      referralCode: myRef,
      referredBy: refCode || null,
      totalEarned: 0,
      createdAt: Date.now()
    });

    showToast('একাউন্ট সফলভাবে তৈরি হয়েছে!');
  } catch (err) {
    showToast('রেজিস্ট্রেশন ব্যর্থ: ' + err.message, false);
  } finally { btn.disabled = false; }
}

async function handleLogout() {
  if (confirm('আপনি কি লগআউট করতে চান?')) {
    await auth.signOut();
    showToast('লগআউট করা হয়েছে');
  }
}

// --- REALTIME FIRESTORE LISTENERS ---
auth.onAuthStateChanged(user => {
  currentUser = user;
  const splash = document.getElementById('loadingSplash');
  if (splash) splash.classList.add('hidden');

  if (user) {
    document.getElementById('authView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');

    db.collection('users').doc(user.uid).onSnapshot(doc => {
      if (doc.exists) {
        userProfile = { uid: user.uid, ...doc.data() };
        updateUserUI();
      }
    });

    navigateTo('home');
  } else {
    document.getElementById('mainView').classList.add('hidden');
    document.getElementById('authView').classList.remove('hidden');
  }
});

db.collection('settings').doc('global').onSnapshot(doc => {
  if (doc.exists) {
    globalSettings = { ...globalSettings, ...doc.data() };
    updateSettingsUI();
  }
});

db.collection('paymentMethods').where('active', '==', true).onSnapshot(snap => {
  paymentMethods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

db.collection('plans').where('active', '==', true).onSnapshot(snap => {
  vipPlans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderPlans();
});

db.collection('customTasks').onSnapshot(snap => {
  allTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

// --- UI UPDATE HELPERS ---
function updateUserUI() {
  if (!userProfile) return;
  document.getElementById('userMainBalance').innerText = '৳ ' + (userProfile.balance || 0).toFixed(2);
  document.getElementById('userBonusBalance').innerText = '৳ ' + (userProfile.bonusBalance || 0).toFixed(2);
  document.getElementById('sidebarUserName').innerText = userProfile.name || 'User';
  document.getElementById('sidebarUserEmail').innerText = userProfile.email || '';
  document.getElementById('headerProfileName').innerText = userProfile.name || 'User';
  document.getElementById('headerProfileId').innerText = 'ID: ' + (userProfile.referralCode || 'NX100');
  document.getElementById('headerProfilePlan').innerText = userProfile.activePlanName ? `প্ল্যান: ${userProfile.activePlanName}` : 'প্ল্যান: কোনো প্ল্যান নেই';

  // Activation Banner
  const banner = document.getElementById('activationBanner');
  const statusText = document.getElementById('activationStatusText');
  const subText = document.getElementById('activationSubText');
  const actionBtn = document.getElementById('activationActionBtn');

  if (userProfile.accountActivated) {
    banner.className = 'p-4 rounded-3xl border flex items-center justify-between shadow-xs bg-emerald-50 border-emerald-200';
    statusText.innerText = 'একাউন্ট স্ট্যাটাস: একটিভ ✅';
    subText.innerText = 'সকল সুবিধা আনলক রয়েছে';
    actionBtn.classList.add('hidden');
  } else {
    banner.className = 'p-4 rounded-3xl border flex items-center justify-between shadow-xs bg-amber-50 border-amber-200';
    statusText.innerText = 'একাউন্ট স্ট্যাটাস: ইন-একটিভ ⚠️';
    
    if (globalSettings.activationMode === 'free') {
      subText.innerText = 'ফ্রি একাউন্ট একটিভেশন অপশন রয়েছে';
      actionBtn.innerText = 'ফ্রি একটিভ করুন ✨';
    } else if (globalSettings.activationMode === 'bonus') {
      subText.innerText = `বোনাস ব্যালেন্স কেটে হবে: ৳ ${globalSettings.activationFee || 100}`;
      actionBtn.innerText = 'বোনাস দিয়ে একটিভ';
    } else {
      subText.innerText = `একটিভেশন ফি: ৳ ${globalSettings.activationFee || 100}`;
      actionBtn.innerText = 'একটিভ করুন 🚀';
    }
    actionBtn.classList.remove('hidden');
  }

  if (userProfile.role === 'admin') {
    document.getElementById('sidebarAdminBtn').classList.remove('hidden');
  }
}

function updateSettingsUI() {
  document.getElementById('noticeMarqueeText').innerText = globalSettings.notices || 'স্বাগতম Nexora এ!';
  document.getElementById('signupBonusText').innerText = globalSettings.registrationBonus || 50;
  document.getElementById('dailyBonusAmtText').innerText = '৳ ' + (globalSettings.dailyBonusAmount || 15);
  document.getElementById('refBonusAmtText').innerText = globalSettings.referralBonus || 20;
}

// --- ACTIVATION HANDLER ---
async function handleActivationButtonClick() {
  if (!userProfile) return;

  if (globalSettings.activationMode === 'free') {
    await db.collection('users').doc(userProfile.uid).update({ accountActivated: true });
    showToast('🎉 ফ্রি একাউন্ট সফলভাবে একটিভ করা হয়েছে!');
  } else if (globalSettings.activationMode === 'bonus') {
    const fee = globalSettings.activationFee || 100;
    if ((userProfile.bonusBalance || 0) < fee) {
      showToast(`বোনাস ব্যালেন্সে টাকা নেই! প্রয়োজন ৳ ${fee}`, false);
      return;
    }
    await db.collection('users').doc(userProfile.uid).update({
      bonusBalance: userProfile.bonusBalance - fee,
      accountActivated: true
    });
    showToast('🎉 বোনাস ব্যালেন্স দিয়ে একাউন্ট একটিভ হয়েছে!');
  } else {
    openDepositFlow('activation');
  }
}

// --- RENDER TASKS BY VIP PLAN ---
function renderVIPPlanTasks() {
  const container = document.getElementById('tasksListContainer');
  const titleEl = document.getElementById('taskPagePlanTitle');
  const countBadge = document.getElementById('taskCountBadge');
  if (!container) return;

  if (!userProfile?.activePlanId) {
    titleEl.innerText = 'আপনার কোনো একটিভ প্ল্যান নেই';
    countBadge.innerText = '0 Tasks';
    container.innerHTML = `
      <div class="bg-white rounded-3xl p-6 text-center border shadow-xs space-y-3">
        <div class="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center text-2xl mx-auto">🔒</div>
        <h3 class="font-extrabold text-slate-800 text-sm">টাস্ক আনলক করতে প্ল্যান সক্রিয় করুন</h3>
        <p class="text-xs text-slate-500">কাজ শুরু করতে ভিআইপি প্ল্যান সেকশন থেকে আপনার পছন্দ অনুযায়ী প্ল্যান সাবস্ক্রাইব করুন।</p>
        <button onclick="navigateTo('plans')" class="bg-[#00a86b] text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md">ভিআইপি প্ল্যান দেখুন 🚀</button>
      </div>
    `;
    return;
  }

  titleEl.innerText = `আপনার প্ল্যান: ${userProfile.activePlanName}`;

  // Filter tasks matching current user's active plan ID
  const matchedTasks = allTasks.filter(t => t.planId === userProfile.activePlanId);
  countBadge.innerText = `${matchedTasks.length} Tasks`;

  if (matchedTasks.length === 0) {
    container.innerHTML = `<div class="bg-white rounded-3xl p-6 text-center border text-xs font-bold text-slate-500">এই প্ল্যানের জন্য বর্তমানে নতুন কোনো কাজ নেই!</div>`;
    return;
  }

  container.innerHTML = '';
  matchedTasks.forEach(t => {
    const div = document.createElement('div');
    div.className = 'bg-white border rounded-2xl p-4 shadow-2xs flex items-center justify-between';
    div.innerHTML = `
      <div class="space-y-1">
        <h4 class="font-extrabold text-xs text-slate-800">${t.title}</h4>
        <p class="text-[10px] text-emerald-600 font-bold">পুরস্কার: ৳ ${t.reward}</p>
      </div>
      <button onclick="completeTask('${t.id}', ${t.reward}, '${t.link || ''}')" class="bg-[#00a86b] hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition">
        সম্পন্ন করুন ⚡
      </button>
    `;
    container.appendChild(div);
  });
}

async function completeTask(taskId, reward, link) {
  if (link) window.open(link, '_blank');

  try {
    await db.collection('users').doc(userProfile.uid).update({
      balance: (userProfile.balance || 0) + reward,
      totalEarned: (userProfile.totalEarned || 0) + reward
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: 'ডেইলি ভিআইপি টাস্ক রিওয়ার্ড',
      amount: reward,
      type: 'earn',
      status: 'completed',
      date: Date.now()
    });

    showToast(`🎉 ৳ ${reward} আপনার ব্যালেন্সে যোগ হয়েছে!`);
  } catch (err) {
    showToast('টাস্ক সম্পন্ন করতে সমস্যা: ' + err.message, false);
  }
}

// --- DEPOSIT FLOW ---
function openDepositFlow(purpose = 'general') {
  navigateTo('depositStep1');
  const purposeSelect = document.getElementById('depositTargetPurpose');
  if (purposeSelect) purposeSelect.value = purpose;
  renderPaymentMethodsGrid();
}

function renderPaymentMethodsGrid() {
  const grid = document.getElementById('paymentMethodsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const defaultMethods = [
    { id: 'm1', name: 'BKASH', number: '01700000000' },
    { id: 'm2', name: 'NOGOD', number: '01800000000' },
    { id: 'm3', name: 'ROCKET', number: '01900000000' }
  ];

  const methodsToRender = paymentMethods.length > 0 ? paymentMethods : defaultMethods;

  methodsToRender.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-between space-y-2 text-center cursor-pointer hover:border-[#00a86b] transition';
    card.onclick = () => selectPaymentMethod(m);
    card.innerHTML = `
      <div class="w-10 h-10 bg-white rounded-xl shadow-2xs flex items-center justify-center font-black text-xs text-[#00a86b]">
        ${m.name.substring(0, 3)}
      </div>
      <p class="font-black text-slate-800 text-[11px] uppercase">${m.name}</p>
      <button class="w-full bg-[#00a86b] text-white font-black text-[10px] py-1 rounded-xl">Continue ></button>
    `;
    grid.appendChild(card);
  });
}

function selectPaymentMethod(methodObj) {
  selectedDepositMethodObj = methodObj;
  document.getElementById('selectedMethodBadge').innerText = methodObj.name;
  navigateTo('depositStep2');
}

function setQuickAmount(amt) {
  currentDepositAmount = amt;
  document.getElementById('depositAmountInput').value = amt;
}

function proceedToDepositStep3() {
  const amtInput = Number(document.getElementById('depositAmountInput').value);
  if (!amtInput || amtInput < 50) {
    showToast('সর্বনিম্ন ডিপোজিট ৫০ টাকা!', false);
    return;
  }
  currentDepositAmount = amtInput;
  document.getElementById('confirmAmountDisplay').innerText = '৳ ' + amtInput;
  document.getElementById('confirmAmountSubDisplay').innerText = '৳ ' + amtInput;
  document.getElementById('paymentNumberDisplay').innerText = selectedDepositMethodObj?.number || '01700000000';
  navigateTo('depositStep3');
}

function copyPaymentNumber() {
  const num = document.getElementById('paymentNumberDisplay').innerText;
  navigator.clipboard.writeText(num);
  showToast('নম্বর কপি করা হয়েছে!');
}

async function submitDepositVerification() {
  if (!userProfile) return;
  const trxId = document.getElementById('inputTrxId').value.trim();
  const purpose = document.getElementById('depositTargetPurpose').value;

  if (!trxId) {
    showToast('অনুগ্রহ করে Transaction ID দিন!', false);
    return;
  }

  const btn = document.getElementById('verifySubmitBtn');
  btn.disabled = true;
  btn.innerText = 'VERIFYING...';

  try {
    await db.collection('requests').add({
      uid: userProfile.uid,
      userName: userProfile.name,
      userEmail: userProfile.email,
      amount: currentDepositAmount,
      method: selectedDepositMethodObj?.name || 'bKash',
      number: selectedDepositMethodObj?.number || '',
      trxId: trxId,
      purpose: purpose,
      type: 'deposit',
      status: 'pending',
      createdAt: Date.now()
    });

    showToast('ডিপোজিট রিকোয়েস্ট জমা হয়েছে! এডমিন দ্রুত এপ্রুভ করবে।');
    document.getElementById('inputTrxId').value = '';
    navigateTo('home');
  } catch (err) {
    showToast('ব্যর্থ হয়েছে: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'VERIFY';
  }
}

// --- RENDER VIP PLANS ---
function renderPlans() {
  const container = document.getElementById('plansListContainer');
  if (!container) return;

  const defaultPlans = [
    { id: 'p1', title: 'Starter VIP 1', price: 100, dailyEarn: 25, dailyTaskLimit: 5, validityDays: 30 },
    { id: 'p2', title: 'Pro VIP Star 2', price: 500, dailyEarn: 130, dailyTaskLimit: 12, validityDays: 30 }
  ];

  const activePlans = vipPlans.length > 0 ? vipPlans : defaultPlans;
  container.innerHTML = '';

  activePlans.forEach(plan => {
    const isCurrent = userProfile?.activePlanId === plan.id;
    const div = document.createElement('div');
    div.className = 'bg-white border rounded-3xl p-5 shadow-xs space-y-3';
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <span class="bg-[#00a86b] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">${plan.title}</span>
          <h3 class="text-2xl font-black text-slate-800 en-num mt-1">৳ ${plan.price}</h3>
        </div>
        <p class="text-xs font-black text-slate-500 en-num">${plan.validityDays} Days</p>
      </div>
      <div class="bg-slate-50 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs font-bold">
        <div>দৈনিক ইনকাম: <span class="text-emerald-600 en-num">৳ ${plan.dailyEarn}</span></div>
        <div>টাস্ক লিমিট: <span class="text-indigo-600 en-num">${plan.dailyTaskLimit}</span></div>
      </div>
      <button onclick="buyVipPlan('${plan.id}', '${plan.title}', ${plan.price})" class="w-full ${isCurrent ? 'bg-emerald-600' : 'bg-[#00a86b]'} text-white font-black py-3 rounded-2xl text-xs transition active:scale-98">
        ${isCurrent ? '✅ আপনার বর্তমান প্ল্যান' : 'প্ল্যান কিনুন 🚀'}
      </button>
    `;
    container.appendChild(div);
  });
}

async function buyVipPlan(id, title, price) {
  if (!userProfile) return;
  if ((userProfile.balance || 0) < price) {
    showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্ল্যানের মূল্য ৳ ${price}`, false);
    return;
  }

  if (!confirm(`আপনি কি ৳ ${price} দিয়ে "${title}" প্ল্যান কিনতে চান?`)) return;

  try {
    await db.collection('users').doc(userProfile.uid).update({
      balance: userProfile.balance - price,
      activePlanId: id,
      activePlanName: title
    });

    showToast(`🎉 অভিনন্দন! "${title}" প্যাকেজ সফলভাবে অ্যাক্টিভেট হয়েছে।`);
  } catch (err) {
    showToast('প্ল্যান কিনতে সমস্যা: ' + err.message, false);
  }
}

// --- DAILY BONUS & TIMERS ---
async function claimDailyBonus() {
  if (!userProfile) return;
  const today = new Date().toISOString().split('T')[0];
  if (userProfile.lastDailyBonusDate === today) {
    showToast('আজকের বোনাস ইতিমধ্যেই নিয়েছেন!', false);
    return;
  }

  const bonus = globalSettings.dailyBonusAmount || 15;
  await db.collection('users').doc(userProfile.uid).update({
    balance: (userProfile.balance || 0) + bonus,
    lastDailyBonusDate: today
  });

  showToast(`🎉 ৳ ${bonus} বোনাস পাবেন!`);
}

function startTimers() {
  setInterval(() => {
    const now = Date.now();
    const ageSec = Math.floor(now / 1000) % 60;
    if (document.getElementById('ageSeconds')) document.getElementById('ageSeconds').innerText = ageSec;
    if (document.getElementById('expSeconds')) document.getElementById('expSeconds').innerText = 60 - ageSec;
  }, 1000);
}
startTimers();

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
