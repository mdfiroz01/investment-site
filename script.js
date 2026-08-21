// --- 1. FIREBASE CONFIG ---
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
  activationMode: "paid", // Options: "paid", "bonus", "free"
  dailyBonusAmount: 15,
  dailyScratchLimit: 5,
  dailySpinLimit: 10,
  referralBonus: 20,
  minWithdraw: 100,
  minDeposit: 50
};
let paymentMethods = [
  { id: 'bkash', name: 'BKASH', number: '01700000000', logo: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?w=100' },
  { id: 'nogod', name: 'NOGOD', number: '01800000000', logo: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?w=100' },
  { id: 'rocket', name: 'ROCKET', number: '01900000000', logo: 'https://images.unsplash.com/photo-1613243555988-441166d4d6fd?w=100' }
];

let selectedDepositMethodObj = paymentMethods[0];
let currentDepositAmount = 500;
let isBalanceShown = false;

// UI Helpers
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

// 3-Line Sidebar Menu Toggle
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

function navigateTo(pageId) {
  const pages = ['home', 'depositStep1', 'depositStep2', 'depositStep3', 'spin', 'scratch', 'earn', 'plans', 'referral', 'leaderboard', 'history', 'support'];
  pages.forEach(p => document.getElementById('page' + capitalize(p))?.classList.add('hidden'));

  document.getElementById('page' + capitalize(pageId))?.classList.remove('hidden');
  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// --- AUTH HANDLERS ---
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
  try {
    await auth.signInWithEmailAndPassword(document.getElementById('loginEmail').value, document.getElementById('loginPassword').value);
    showToast('লগইন সফল হয়েছে!');
  } catch (err) { showToast(err.message, false); }
}

async function handleSignup(e) {
  e.preventDefault();
  try {
    const email = document.getElementById('signupEmail').value;
    const name = document.getElementById('signupName').value;
    const res = await auth.createUserWithEmailAndPassword(email, document.getElementById('signupPassword').value);
    await db.collection('users').doc(res.user.uid).set({
      name: name,
      email: email,
      balance: 0,
      bonusBalance: globalSettings.registrationBonus || 50,
      accountActivated: false,
      role: email === 'mdfirozhossain2007@gmail.com' ? 'admin' : 'user',
      referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      createdAt: Date.now()
    });
    showToast('একাউন্ট সফলভাবে তৈরি হয়েছে!');
  } catch (err) { showToast(err.message, false); }
}

async function handleLogout() {
  await auth.signOut();
  showToast('লগআউট করা হয়েছে');
}

// --- REALTIME LISTENERS ---
auth.onAuthStateChanged(user => {
  currentUser = user;
  document.getElementById('loadingSplash')?.classList.add('hidden');
  if (user) {
    document.getElementById('authView').classList.add('hidden');
    document.getElementById('mainView').classList.remove('hidden');
    db.collection('users').doc(user.uid).onSnapshot(doc => {
      if (doc.exists) {
        userProfile = { uid: user.uid, ...doc.data() };
        updateUserUI();
      }
    });
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

db.collection('paymentMethods').onSnapshot(snap => {
  if (!snap.empty) {
    paymentMethods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }
  renderPaymentMethodsGrid();
});

// UI Updates
function updateUserUI() {
  if (!userProfile) return;
  document.getElementById('userMainBalance').innerText = '৳ ' + (userProfile.balance || 0).toFixed(2);
  document.getElementById('userBonusBalance').innerText = '৳ ' + (userProfile.bonusBalance || 0).toFixed(2);
  document.getElementById('sidebarUserName').innerText = userProfile.name || 'User';
  document.getElementById('sidebarUserEmail').innerText = userProfile.email || '';
  document.getElementById('headerProfileName').innerText = userProfile.name || 'User';
  document.getElementById('headerProfileId').innerText = 'ID: ' + (userProfile.referralCode || 'NX100');

  // Account Activation Banner UI Check
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
      subText.innerText = 'ফ্রি একাউন্ট একটিভেশন এভেইলএবল';
      actionBtn.innerText = 'ফ্রি একটিভ করুন ✨';
    } else if (globalSettings.activationMode === 'bonus') {
      subText.innerText = `বোনাস কেটে হবে: ৳ ${globalSettings.activationFee || 100}`;
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
}

// --- ACTIVATION BUTTON ACTION ---
async function handleActivationButtonClick() {
  if (!userProfile) return;

  if (globalSettings.activationMode === 'free') {
    // Free Activation Flow
    await db.collection('users').doc(userProfile.uid).update({ accountActivated: true });
    showToast('🎉 ফ্রি একাউন্ট সফলভাবে একটিভ করা হয়েছে!');
  } else if (globalSettings.activationMode === 'bonus') {
    // Bonus Activation Flow
    const fee = globalSettings.activationFee || 100;
    if ((userProfile.bonusBalance || 0) < fee) {
      showToast(`আপনার বোনাস ব্যালেন্সে পর্যাপ্ত টাকা নেই! প্রয়োজন ৳ ${fee}`, false);
      return;
    }
    await db.collection('users').doc(userProfile.uid).update({
      bonusBalance: userProfile.bonusBalance - fee,
      accountActivated: true
    });
    showToast('🎉 বোনাস ব্যালেন্স দিয়ে একাউন্ট একটিভ করা হয়েছে!');
  } else {
    // Paid Deposit Flow -> Redirect to Step 1 Deposit & set target
    openDepositFlow('activation');
  }
}

// --- STEP-BY-STEP DEPOSIT / ACTIVATION FLOW ---
function openDepositFlow(target = 'general') {
  navigateTo('depositStep1');
  const targetSelect = document.getElementById('depositTargetPurpose');
  if (targetSelect) targetSelect.value = target;
  renderPaymentMethodsGrid();
}

function toggleBalanceVisibility() {
  isBalanceShown = !isBalanceShown;
  document.getElementById('balanceToggleText').innerText = isBalanceShown 
    ? `৳ ${(userProfile?.balance || 0).toFixed(2)}` 
    : 'ট্যাপ করে ব্যালেন্স দেখুন';
}

function renderPaymentMethodsGrid() {
  const grid = document.getElementById('paymentMethodsGrid');
  if (!grid) return;
  grid.innerHTML = '';

  paymentMethods.forEach((m) => {
    const card = document.createElement('div');
    card.className = 'bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-col items-center justify-between space-y-2 text-center shadow-2xs cursor-pointer hover:border-[#00a86b]';
    card.onclick = () => selectPaymentMethod(m);
    card.innerHTML = `
      <div class="w-12 h-12 bg-white rounded-xl shadow-xs flex items-center justify-center font-black text-xs text-[#00a86b]">
        ${m.name}
      </div>
      <p class="font-black text-slate-800 text-[11px] uppercase">${m.name}</p>
      <button class="w-full bg-[#00a86b] text-white font-black text-[10px] py-1.5 rounded-xl">Continue ></button>
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
  document.getElementById('paymentNumberDisplay').innerText = selectedDepositMethodObj.number || '01700000000';
  navigateTo('depositStep3');
}

function copyPaymentNumber() {
  const num = document.getElementById('paymentNumberDisplay').innerText;
  navigator.clipboard.writeText(num);
  showToast('নম্বর কপি করা হয়েছে: ' + num);
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
      method: selectedDepositMethodObj.name,
      number: selectedDepositMethodObj.number,
      trxId: trxId,
      purpose: purpose, // 'activation' or 'general'
      type: 'deposit',
      status: 'pending',
      createdAt: Date.now()
    });

    showToast('ডিপোজিট রিকোয়েস্ট জমা হয়েছে! এডমিন যাচাই করে এপ্রুভ করবে।');
    document.getElementById('inputTrxId').value = '';
    navigateTo('home');
  } catch (err) {
    showToast('ব্যর্থ হয়েছে: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'VERIFY';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
