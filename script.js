
// --- 1. FIREBASE INITIALIZATION ---
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

// --- 2. GLOBAL STATE ---
let currentUser = null;
let userProfile = null;
let globalSettings = {
  siteName: "Nexora Platform",
  registrationBonus: 50,
  activationFee: 100,
  dailyBonusAmount: 15,
  dailyScratchLimit: 5,
  dailySpinLimit: 10,
  referralBonus: 20,
  minWithdraw: 100,
  minDeposit: 50,
  siteStartDate: Date.now() - 13000000000,
  siteExpiryDate: Date.now() + 300000000000,
  notices: "স্বাগতম Nexora এ! কাজ সম্পন্ন করুন এবং নিশ্চিত নগদ বোনাস অর্জন করুন।",
  supportVideos: [
    {
      title: "কিভাবে কাজ করে পেমেন্ট নিবেন - সম্পূর্ণ টিউটোরিয়াল",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
    }
  ]
};
let paymentMethods = [];
let vipPlans = [];
let customTasks = [];

// --- 3. TOAST & MODAL UTILITIES ---
function showToast(msg, isSuccess = true) {
  const toast = document.getElementById('toast');
  const toastInner = document.getElementById('toastInner');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg || !toastInner) return;
  
  toastMsg.innerText = msg;
  toastInner.className = `text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-2xl flex items-center justify-between border ${
    isSuccess ? 'bg-emerald-600 border-emerald-500' : 'bg-rose-600 border-rose-500'
  }`;
  toast.classList.remove('hidden', '-translate-y-20', 'opacity-0');
  toast.classList.add('translate-y-0', 'opacity-100');
  setTimeout(hideToast, 3500);
}

function hideToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.classList.add('-translate-y-20', 'opacity-0');
}

function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('hidden');
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

// --- 4. NAVIGATION SYSTEM ---
function navigateTo(pageId) {
  const pages = ['home', 'spin', 'scratch', 'earn', 'plans', 'referral', 'leaderboard', 'history', 'support'];
  pages.forEach(p => {
    const el = document.getElementById('page' + capitalize(p));
    if (el) el.classList.add('hidden');
  });

  const target = document.getElementById('page' + capitalize(pageId));
  if (target) target.classList.remove('hidden');

  ['Home', 'Spin', 'Scratch', 'Referral', 'Plans'].forEach(nav => {
    const btn = document.getElementById('nav' + nav);
    if (btn) {
      if (nav.toLowerCase() === pageId.toLowerCase()) {
        btn.className = 'flex flex-col items-center gap-0.5 text-indigo-600 scale-105';
      } else {
        btn.className = 'flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600';
      }
    }
  });

  if (pageId === 'spin') setupSpinWheel();
  if (pageId === 'scratch') setupScratchCard();
  if (pageId === 'earn') setupQuiz();
  if (pageId === 'plans') renderPlans();
  if (pageId === 'leaderboard') loadLeaderboard();
  if (pageId === 'history') loadHistory();
  if (pageId === 'support') renderSupportVideos();

  window.scrollTo(0, 0);
  if (window.lucide) lucide.createIcons();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// --- 5. AUTH TABS & HANDLERS ---
function switchAuthTab(tab) {
  if (tab === 'login') {
    document.getElementById('tabLogin').className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all bg-white text-indigo-700 shadow-sm';
    document.getElementById('tabSignup').className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all text-slate-500 hover:text-slate-800';
    document.getElementById('loginForm').classList.remove('hidden');
    document.getElementById('signupForm').classList.add('hidden');
    document.getElementById('authTitle').innerText = 'Nexora এ প্রবেশ করুন';
    document.getElementById('authSubtitle').innerText = 'লগইন করতে আপনার ইমেইল ও পাসওয়ার্ড দিন';
  } else {
    document.getElementById('tabSignup').className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all bg-white text-indigo-700 shadow-sm';
    document.getElementById('tabLogin').className = 'flex-1 py-2.5 rounded-xl text-xs font-black transition-all text-slate-500 hover:text-slate-800';
    document.getElementById('signupForm').classList.remove('hidden');
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('authTitle').innerText = 'নতুন একাউন্ট খুলুন';
    document.getElementById('authSubtitle').innerText = 'সাইন আপ করলেই পাবেন নিশ্চিত বোনাস!';
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const btn = document.getElementById('loginBtn');
  btn.innerText = 'লগইন হচ্ছে...';
  btn.disabled = true;

  try {
    await auth.signInWithEmailAndPassword(email, pass);
    showToast('লগইন সফল হয়েছে! স্বাগতম।');
  } catch (err) {
    showToast('লগইন ব্যর্থ: ' + err.message, false);
  } finally {
    btn.innerText = 'লগইন করুন 🚀';
    btn.disabled = false;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  const refCode = document.getElementById('signupReferral').value.trim().toUpperCase();
  const btn = document.getElementById('signupBtn');
  btn.innerText = 'একাউন্ট তৈরি হচ্ছে...';
  btn.disabled = true;

  try {
    const res = await auth.createUserWithEmailAndPassword(email, pass);
    const uid = res.user.uid;
    const myRef = Math.random().toString(36).substring(2, 8).toUpperCase();
    const regBonus = globalSettings.registrationBonus || 50;

    await db.collection('users').doc(uid).set({
      name: name,
      email: email,
      balance: 0,
      bonusBalance: regBonus,
      accountActivated: false,
      role: email === 'mdfirozhossain2007@gmail.com' ? 'admin' : 'user',
      referralCode: myRef,
      referredBy: refCode || null,
      totalEarned: 0,
      createdAt: Date.now()
    });

    await db.collection('history').add({
      uid: uid,
      title: 'রেজিস্ট্রেশন বোনাস প্রাপ্তি',
      amount: regBonus,
      type: 'bonus',
      status: 'completed',
      date: Date.now()
    });

    if (refCode) {
      const refSnap = await db.collection('users').where('referralCode', '==', refCode).get();
      if (!refSnap.empty) {
        const refDoc = refSnap.docs[0];
        const refData = refDoc.data();
        const refBonus = globalSettings.referralBonus || 20;
        await db.collection('users').doc(refDoc.id).update({
          balance: (refData.balance || 0) + refBonus,
          totalEarned: (refData.totalEarned || 0) + refBonus
        });
        await db.collection('history').add({
          uid: refDoc.id,
          title: `রেফারেল কমিশন (${name})`,
          amount: refBonus,
          type: 'earn',
          status: 'completed',
          date: Date.now()
        });
      }
    }

    showToast('একাউন্ট তৈরি সম্পন্ন! ৳ ' + regBonus + ' বোনাস যোগ হয়েছে।');
  } catch (err) {
    showToast('রেজিস্ট্রেশন ব্যর্থ: ' + err.message, false);
  } finally {
    btn.innerText = 'একাউন্ট তৈরি করুন ✨';
    btn.disabled = false;
  }
}

async function handleLogout() {
  if (confirm('আপনি কি নিশ্চিত যে লগআউট করতে চান?')) {
    await auth.signOut();
    showToast('লগআউট করা হয়েছে');
  }
}

// --- 6. REALTIME LISTENERS ---
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
      } else {
        const myRef = Math.random().toString(36).substring(2, 8).toUpperCase();
        db.collection('users').doc(user.uid).set({
          name: user.displayName || user.email.split('@')[0],
          email: user.email,
          balance: 0,
          bonusBalance: 50,
          accountActivated: false,
          role: user.email === 'mdfirozhossain2007@gmail.com' ? 'admin' : 'user',
          referralCode: myRef,
          totalEarned: 0,
          createdAt: Date.now()
        });
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

db.collection('paymentMethods').where('active', '==', true).onSnapshot(snap => {
  paymentMethods = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderPaymentMethods();
});

db.collection('plans').where('active', '==', true).onSnapshot(snap => {
  vipPlans = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  renderPlans();
});

db.collection('customTasks').where('active', '==', true).onSnapshot(snap => {
  customTasks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
});

// --- 7. UI UPDATE HELPERS ---
function updateUserUI() {
  if (!userProfile) return;
  document.getElementById('userMainBalance').innerText = '৳ ' + (userProfile.balance || 0).toFixed(2);
  document.getElementById('userBonusBalance').innerText = '৳ ' + (userProfile.bonusBalance || 0).toFixed(2);
  document.getElementById('withdrawAvailBal').innerText = '৳ ' + (userProfile.balance || 0).toFixed(2);
  document.getElementById('refCodeInput').value = userProfile.referralCode || 'NX100';

  const isActivated = !!userProfile.accountActivated;
  const banner = document.getElementById('activationBanner');
  const badgeIcon = document.getElementById('activationBadgeIcon');
  const statusText = document.getElementById('activationStatusText');
  const subText = document.getElementById('activationSubText');
  const actionBtn = document.getElementById('activationActionBtn');

  if (isActivated) {
    banner.className = 'p-4 rounded-3xl border flex items-center justify-between shadow-xs bg-emerald-50 border-emerald-200';
    badgeIcon.className = 'w-10 h-10 rounded-2xl flex items-center justify-center font-bold bg-emerald-100 text-emerald-700';
    badgeIcon.innerHTML = '<i data-lucide="shield-check" class="w-5 h-5"></i>';
    statusText.innerText = 'একাউন্ট স্ট্যাটাস: একটিভ';
    subText.innerText = 'সকল সুবিধা ও উইথড্র আনলক রয়েছে';
    actionBtn.classList.add('hidden');
  } else {
    banner.className = 'p-4 rounded-3xl border flex items-center justify-between shadow-xs bg-amber-50 border-amber-200';
    badgeIcon.className = 'w-10 h-10 rounded-2xl flex items-center justify-center font-bold bg-amber-100 text-amber-700';
    badgeIcon.innerHTML = '<i data-lucide="shield-alert" class="w-5 h-5"></i>';
    statusText.innerText = 'একাউন্ট স্ট্যাটাস: ইন-একটিভ';
    subText.innerHTML = `একটিভেশন ফি ৳ <span id="activationFeeText">${globalSettings.activationFee || 100}</span>`;
    actionBtn.classList.remove('hidden');
  }

  if (userProfile.role === 'admin') {
    document.getElementById('adminBtn').classList.remove('hidden');
  } else {
    document.getElementById('adminBtn').classList.add('hidden');
  }

  if (window.lucide) lucide.createIcons();
}

function updateSettingsUI() {
  document.getElementById('navAppName').innerText = globalSettings.siteName || 'Nexora';
  document.title = (globalSettings.siteName || 'Nexora') + ' - Earning App';
  document.getElementById('noticeMarqueeText').innerText = globalSettings.notices || 'স্বাগতম Nexora এ!';
  document.getElementById('signupBonusText').innerText = globalSettings.registrationBonus || 50;
  document.getElementById('dailyBonusAmtText').innerText = '৳ ' + (globalSettings.dailyBonusAmount || 15);
  document.getElementById('activationFeeText').innerText = globalSettings.activationFee || 100;
  document.getElementById('actBonusFeeText').innerText = globalSettings.activationFee || 100;
  document.getElementById('actMainFeeText').innerText = globalSettings.activationFee || 100;
  document.getElementById('refBonusAmtText').innerText = globalSettings.referralBonus || 20;

  renderHomeVideos();
}

// --- 8. DAILY BONUS CLAIM ---
async function claimDailyBonus() {
  if (!userProfile) return;
  const today = new Date().toISOString().split('T')[0];

  if (userProfile.lastDailyBonusDate === today) {
    showToast('আপনি আজকের দৈনিক বোনাস ইতিমধ্যে দাবি করেছেন! কাল আবার আসুন।', false);
    return;
  }

  const bonusAmt = globalSettings.dailyBonusAmount || 15;
  const btn = document.getElementById('claimDailyBonusBtn');
  btn.disabled = true;
  btn.innerText = 'প্রসেসিং...';

  try {
    await db.collection('users').doc(userProfile.uid).update({
      balance: (userProfile.balance || 0) + bonusAmt,
      totalEarned: (userProfile.totalEarned || 0) + bonusAmt,
      lastDailyBonusDate: today
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: 'দৈনিক চেক-ইন বোনাস',
      amount: bonusAmt,
      type: 'bonus',
      status: 'completed',
      date: Date.now()
    });

    if (window.confetti) confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    showToast(`🎉 অভিনন্দন! ৳ ${bonusAmt} দৈনিক বোনাস আপনার ব্যালেন্সে যোগ হয়েছে!`);
  } catch (err) {
    showToast('বোনাস দাবি করতে সমস্যা: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'দাবি করুন ⚡';
  }
}

// --- 9. LIVE TIMERS ---
function startTimers() {
  setInterval(() => {
    const now = Date.now();
    const start = globalSettings.siteStartDate || (now - 13000000000);
    const expiry = globalSettings.siteExpiryDate || (now + 300000000000);

    const ageSec = Math.floor(Math.max(0, now - start) / 1000);
    const aM = Math.floor(ageSec / (30 * 24 * 3600));
    let aRem = ageSec % (30 * 24 * 3600);
    const aD = Math.floor(aRem / (24 * 3600));
    aRem = aRem % (24 * 3600);
    const aH = Math.floor(aRem / 3600);
    aRem = aRem % 3600;
    const aMin = Math.floor(aRem / 60);
    const aS = aRem % 60;

    if(document.getElementById('ageMonths')) document.getElementById('ageMonths').innerText = aM;
    if(document.getElementById('ageDays')) document.getElementById('ageDays').innerText = aD;
    if(document.getElementById('ageHours')) document.getElementById('ageHours').innerText = aH;
    if(document.getElementById('ageMinutes')) document.getElementById('ageMinutes').innerText = aMin;
    if(document.getElementById('ageSeconds')) document.getElementById('ageSeconds').innerText = aS;

    const expSec = Math.floor(Math.max(0, expiry - now) / 1000);
    const eY = Math.floor(expSec / (365 * 24 * 3600));
    let eRem = expSec % (365 * 24 * 3600);
    const eM = Math.floor(eRem / (30 * 24 * 3600));
    eRem = eRem % (30 * 24 * 3600);
    const eD = Math.floor(eRem / (24 * 3600));
    eRem = eRem % (24 * 3600);
    const eH = Math.floor(eRem / 3600);
    eRem = eRem % 3600;
    const eS = eRem % 60;

    if(document.getElementById('expYears')) document.getElementById('expYears').innerText = eY;
    if(document.getElementById('expMonths')) document.getElementById('expMonths').innerText = eM;
    if(document.getElementById('expDays')) document.getElementById('expDays').innerText = eD;
    if(document.getElementById('expHours')) document.getElementById('expHours').innerText = eH;
    if(document.getElementById('expSeconds')) document.getElementById('expSeconds').innerText = eS;
  }, 1000);
}
startTimers();

// --- 10. SPIN WHEEL GAME ---
const wheelSegments = [
  { label: '৳ 5', val: 5, color: '#4f46e5' },
  { label: '৳ 10', val: 10, color: '#059669' },
  { label: '৳ 2', val: 2, color: '#d97706' },
  { label: '৳ 20', val: 20, color: '#dc2626' },
  { label: '৳ 0', val: 0, color: '#64748b' },
  { label: '৳ 15', val: 15, color: '#7c3aed' },
  { label: '৳ 8', val: 8, color: '#2563eb' },
  { label: '৳ 25', val: 25, color: '#0284c7' }
];
let currentWheelRotation = 0;
let isSpinning = false;

function setupSpinWheel() {
  const today = new Date().toISOString().split('T')[0];
  const count = userProfile?.lastSpinDate === today ? (userProfile.dailySpinCount || 0) : 0;
  const limit = globalSettings.dailySpinLimit || 10;
  const rem = Math.max(0, limit - count);

  document.getElementById('spinRemainingText').innerText = `${rem} / ${limit}`;
  document.getElementById('spinResultBox').classList.add('hidden');

  drawWheel();
}

function drawWheel() {
  const canvas = document.getElementById('wheelCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const numSegments = wheelSegments.length;
  const angle = (2 * Math.PI) / numSegments;
  const radius = canvas.width / 2;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  wheelSegments.forEach((seg, i) => {
    ctx.beginPath();
    ctx.fillStyle = seg.color;
    ctx.moveTo(radius, radius);
    ctx.arc(radius, radius, radius - 5, i * angle, (i + 1) * angle);
    ctx.lineTo(radius, radius);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.save();
    ctx.translate(radius, radius);
    ctx.rotate(i * angle + angle / 2);
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
    ctx.fillText(seg.label, radius - 20, 5);
    ctx.restore();
  });
}

async function spinTheWheel() {
  if (isSpinning || !userProfile) return;
  const today = new Date().toISOString().split('T')[0];
  const count = userProfile.lastSpinDate === today ? (userProfile.dailySpinCount || 0) : 0;
  const limit = globalSettings.dailySpinLimit || 10;
  if (count >= limit) {
    showToast('আজকের স্পিন লিমিট শেষ! কাল আবার চেষ্টা করুন।', false);
    return;
  }

  isSpinning = true;
  document.getElementById('spinActionBtn').disabled = true;
  document.getElementById('spinResultBox').classList.add('hidden');

  const winningIdx = Math.floor(Math.random() * wheelSegments.length);
  const prize = wheelSegments[winningIdx];
  const segmentAngle = 360 / wheelSegments.length;

  const targetAngle = 360 - (winningIdx * segmentAngle + segmentAngle / 2) + 270;
  const extraRot = 360 * 5;
  const totalRot = currentWheelRotation + extraRot + (targetAngle - (currentWheelRotation % 360));
  currentWheelRotation = totalRot;

  const canvas = document.getElementById('wheelCanvas');
  canvas.style.transition = 'transform 4s cubic-bezier(0.15, 0.9, 0.25, 1)';
  canvas.style.transform = `rotate(${totalRot}deg)`;

  setTimeout(async () => {
    isSpinning = false;
    document.getElementById('spinActionBtn').disabled = false;
    document.getElementById('spinWinAmount').innerText = '৳ ' + prize.val;
    document.getElementById('spinResultBox').classList.remove('hidden');

    if (prize.val > 0 && window.confetti) {
      confetti({ particleCount: 80, spread: 60 });
    }

    const newCount = count + 1;
    await db.collection('users').doc(userProfile.uid).update({
      balance: (userProfile.balance || 0) + prize.val,
      totalEarned: (userProfile.totalEarned || 0) + prize.val,
      dailySpinCount: newCount,
      lastSpinDate: today
    });

    if (prize.val > 0) {
      await db.collection('history').add({
        uid: userProfile.uid,
        title: `স্পিন হুইল রিওয়ার্ড (৳ ${prize.val})`,
        amount: prize.val,
        type: 'earn',
        status: 'completed',
        date: Date.now()
      });
    }

    setupSpinWheel();
  }, 4100);
}

// --- 11. SCRATCH CARD GAME ---
let currentScratchPrize = 10;
let isScratchRevealed = false;

function setupScratchCard() {
  const today = new Date().toISOString().split('T')[0];
  const count = userProfile?.lastScratchDate === today ? (userProfile.dailyScratchCount || 0) : 0;
  const limit = globalSettings.dailyScratchLimit || 5;
  const rem = Math.max(0, limit - count);

  document.getElementById('scratchRemainingText').innerText = `${rem} / ${limit}`;
  document.getElementById('scratchResultBox').classList.add('hidden');
  document.getElementById('scratchClaimBtn').classList.add('hidden');

  const prizes = [3, 5, 8, 10, 12, 15];
  currentScratchPrize = prizes[Math.floor(Math.random() * prizes.length)];
  document.getElementById('scratchPrizeVal').innerText = '৳ ' + currentScratchPrize;
  isScratchRevealed = false;

  initScratchCanvas();
}

function initScratchCanvas() {
  const canvas = document.getElementById('scratchCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  ctx.globalCompositeOperation = 'source-over';
  const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  grad.addColorStop(0, '#4f46e5');
  grad.addColorStop(0.5, '#7c3aed');
  grad.addColorStop(1, '#3b82f6');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px "Hind Siliguri", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('✨ এখানে ঘষে পুরস্কার দেখুন ✨', canvas.width / 2, canvas.height / 2);

  let isDrawing = false;
  function scratchPoint(x, y) {
    if (isScratchRevealed) return;
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.fill();

    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let clear = 0;
    for (let i = 3; i < imgData.data.length; i += 40) {
      if (imgData.data[i] === 0) clear++;
    }
    if (clear / (imgData.data.length / 40) > 0.45 && !isScratchRevealed) {
      isScratchRevealed = true;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      document.getElementById('scratchResultBox').classList.remove('hidden');
      document.getElementById('scratchClaimBtn').classList.remove('hidden');
      if (window.confetti) confetti({ particleCount: 70, spread: 60 });
    }
  }

  canvas.onmousedown = (e) => { isDrawing = true; scratchPoint(e.offsetX, e.offsetY); };
  canvas.onmousemove = (e) => { if (isDrawing) scratchPoint(e.offsetX, e.offsetY); };
  window.onmouseup = () => { isDrawing = false; };

  canvas.ontouchstart = (e) => {
    isDrawing = true;
    const rect = canvas.getBoundingClientRect();
    scratchPoint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
  };
  canvas.ontouchmove = (e) => {
    if (!isDrawing) return;
    const rect = canvas.getBoundingClientRect();
    scratchPoint(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
  };
  canvas.ontouchend = () => { isDrawing = false; };
}

async function claimScratchReward() {
  if (!userProfile) return;
  const today = new Date().toISOString().split('T')[0];
  const count = userProfile.lastScratchDate === today ? (userProfile.dailyScratchCount || 0) : 0;
  const limit = globalSettings.dailyScratchLimit || 5;

  if (count >= limit) {
    showToast('আজকের স্ক্র্যাচ লিমিট শেষ!', false);
    return;
  }

  const btn = document.getElementById('scratchClaimBtn');
  btn.disabled = true;
  btn.innerText = 'যোগ হচ্ছে...';

  try {
    const newCount = count + 1;
    await db.collection('users').doc(userProfile.uid).update({
      balance: (userProfile.balance || 0) + currentScratchPrize,
      totalEarned: (userProfile.totalEarned || 0) + currentScratchPrize,
      dailyScratchCount: newCount,
      lastScratchDate: today
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: `স্ক্র্যাচ কার্ড রিওয়ার্ড (৳ ${currentScratchPrize})`,
      amount: currentScratchPrize,
      type: 'earn',
      status: 'completed',
      date: Date.now()
    });

    showToast(`🎉 ৳ ${currentScratchPrize} সফলভাবে মেইন ব্যালেন্সে যোগ হয়েছে!`);
    setupScratchCard();
  } catch (err) {
    showToast('সমস্যা: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'ব্যালেন্সে যোগ করুন 💰';
  }
}

// --- 12. MATH QUIZ SYSTEM ---
const quizQuestions = [
  { q: '18 + 18 = ?', options: ['32', '36', '34', '40'], correct: 1 },
  { q: '25 + 15 = ?', options: ['40', '35', '45', '50'], correct: 0 },
  { q: '12 x 3 = ?', options: ['32', '34', '36', '38'], correct: 2 }
];
let currentQuizStep = 0;
let selectedQuizOpt = null;

function setupQuiz() {
  currentQuizStep = 0;
  selectedQuizOpt = null;
  renderQuizStep();
}

function renderQuizStep() {
  const q = quizQuestions[currentQuizStep];
  document.getElementById('quizStepText').innerText = `Question ${currentQuizStep + 1}/${quizQuestions.length}`;
  document.getElementById('quizProgressBar').style.width = `${((currentQuizStep + 1) / quizQuestions.length) * 100}%`;
  document.getElementById('quizQuestionText').innerText = q.q;

  const grid = document.getElementById('quizOptionsGrid');
  grid.innerHTML = '';
  q.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = `py-4 rounded-2xl text-2xl font-black text-center transition-all border shadow-2xs en-num ${
      selectedQuizOpt === idx 
        ? 'bg-amber-100 border-indigo-600 text-indigo-900 ring-2 ring-indigo-600/30' 
        : 'bg-[#fbf7f0] hover:bg-amber-50 border-[#eee7da] text-slate-800'
    }`;
    btn.innerText = opt;
    btn.onclick = () => {
      selectedQuizOpt = idx;
      renderQuizStep();
    };
    grid.appendChild(btn);
  });
}

async function handleQuizNext() {
  if (selectedQuizOpt === null) {
    showToast('অনুগ্রহ করে একটি উত্তর সিলেক্ট করুন', false);
    return;
  }
  const q = quizQuestions[currentQuizStep];
  if (selectedQuizOpt !== q.correct) {
    showToast('ভুল উত্তর! আবার চেষ্টা করুন।', false);
    selectedQuizOpt = null;
    renderQuizStep();
    return;
  }

  if (currentQuizStep + 1 < quizQuestions.length) {
    currentQuizStep++;
    selectedQuizOpt = null;
    renderQuizStep();
  } else {
    if (!userProfile) return;
    const reward = 6;
    const btn = document.getElementById('quizSubmitBtn');
    btn.disabled = true;
    btn.innerText = 'পুরস্কার দেওয়া হচ্ছে...';

    try {
      await db.collection('users').doc(userProfile.uid).update({
        balance: (userProfile.balance || 0) + reward,
        totalEarned: (userProfile.totalEarned || 0) + reward
      });

      await db.collection('history').add({
        uid: userProfile.uid,
        title: 'ম্যাথ কুইজ রিওয়ার্ড',
        amount: reward,
        type: 'earn',
        status: 'completed',
        date: Date.now()
      });

      if (window.confetti) confetti({ particleCount: 90, spread: 70 });
      showToast(`🎉 অভিনন্দন! ম্যাথ কুইজ সলভ করে ৳ ${reward} আয় করেছেন!`);
      setupQuiz();
    } catch (err) {
      showToast('সমস্যা: ' + err.message, false);
    } finally {
      btn.disabled = false;
      btn.innerText = 'পরবর্তী (Next) ➡️';
    }
  }
}

// --- 13. VIP PLANS ---
function renderPlans() {
  const container = document.getElementById('plansListContainer');
  if (!container) return;

  const defaultPlans = [
    { id: 'p1', title: 'Starter VIP', price: 100, dailyEarn: 25, dailyTaskLimit: 5, validityDays: 30, badge: 'from-amber-500 to-orange-500' },
    { id: 'p2', title: 'Pro VIP Star', price: 500, dailyEarn: 130, dailyTaskLimit: 12, validityDays: 30, badge: 'from-indigo-600 to-purple-600' },
    { id: 'p3', title: 'Ultra Diamond VIP', price: 1000, dailyEarn: 280, dailyTaskLimit: 25, validityDays: 30, badge: 'from-cyan-500 to-blue-600' }
  ];
  const activePlans = vipPlans.length > 0 ? vipPlans : defaultPlans;

  container.innerHTML = '';
  activePlans.forEach(plan => {
    const isCurrent = userProfile?.activePlanId === plan.id;
    const div = document.createElement('div');
    div.className = 'bg-white border-2 border-indigo-50 rounded-3xl p-5 shadow-xs space-y-4';
    div.innerHTML = `
      <div class="flex justify-between items-start">
        <div class="space-y-1">
          <span class="bg-gradient-to-r ${plan.badge || 'from-indigo-600 to-purple-600'} text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
            ${plan.title}
          </span>
          <h3 class="text-2xl font-black text-slate-800 en-num mt-1">৳ ${plan.price}</h3>
        </div>
        <div class="text-right">
          <span class="text-xs font-bold text-slate-400">মেয়াদকাল</span>
          <p class="text-sm font-black text-slate-700 en-num">${plan.validityDays} Days</p>
        </div>
      </div>
      <div class="bg-slate-50 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span class="text-slate-500">দৈনিক ইনকাম:</span>
          <p class="font-black text-emerald-600 en-num">৳ ${plan.dailyEarn}</p>
        </div>
        <div>
          <span class="text-slate-500">দৈনিক টাস্ক লিমিট:</span>
          <p class="font-black text-indigo-600 en-num">${plan.dailyTaskLimit} Tasks</p>
        </div>
      </div>
      <button onclick="buyVipPlan('${plan.id}', '${plan.title}', ${plan.price}, ${plan.validityDays})" class="w-full ${isCurrent ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'} font-black py-3 rounded-2xl shadow-md text-xs transition active:scale-98">
        ${isCurrent ? '✅ আপনার বর্তমান প্ল্যান' : 'প্ল্যান কিনুন 🚀'}
      </button>
    `;
    container.appendChild(div);
  });
}

async function buyVipPlan(id, title, price, days) {
  if (!userProfile) return;
  if ((userProfile.balance || 0) < price) {
    showToast(`পর্যাপ্ত ব্যালেন্স নেই! প্ল্যানের মূল্য ৳ ${price}। আগে ডিপোজিট করুন।`, false);
    return;
  }
  if (!confirm(`আপনি কি ৳ ${price} দিয়ে "${title}" প্যাকেজটি কিনতে চান?`)) return;

  try {
    const expiry = Date.now() + (days * 24 * 60 * 60 * 1000);
    await db.collection('users').doc(userProfile.uid).update({
      balance: userProfile.balance - price,
      activePlanId: id,
      activePlanName: title,
      planExpiryDate: expiry
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: `ভিআইপি প্ল্যান সাবস্ক্রিপশন (${title})`,
      amount: price,
      type: 'plan',
      status: 'completed',
      date: Date.now()
    });

    if (window.confetti) confetti({ particleCount: 100, spread: 70 });
    showToast(`🎉 অভিনন্দন! "${title}" প্ল্যান সফলভাবে চালু করা হয়েছে।`);
  } catch (err) {
    showToast('প্ল্যান কিনতে ব্যর্থ: ' + err.message, false);
  }
}

// --- 14. REFERRAL SHARING ---
function copyReferralCode() {
  const code = document.getElementById('refCodeInput').value;
  navigator.clipboard.writeText(code);
  showToast('রেফার কোড কপি করা হয়েছে: ' + code);
}

function shareReferralLink() {
  const code = document.getElementById('refCodeInput').value;
  const url = `${window.location.origin}${window.location.pathname}?ref=${code}`;
  if (navigator.share) {
    navigator.share({
      title: 'Nexora Easy Earning App',
      text: `আমার সাথে যোগ দিন এবং সাইন আপ করলেই ফ্রি নগদ বোনাস জিতে নিন! রেফার কোড: ${code}`,
      url: url
    }).catch(() => {});
  } else {
    navigator.clipboard.writeText(url);
    showToast('রেফারেল লিংক ক্লিপবোর্ডে কপি করা হয়েছে!');
  }
}

// --- 15. PAYMENT METHODS & TRANSACTIONS ---
let selectedDepositMethod = null;
let selectedWithdrawMethod = null;

function renderPaymentMethods() {
  const defaultMethods = [
    { id: 'm1', name: 'bKash Personal', type: 'both', number: '01700000000', instruction: 'Send Money করে TrxID দিন।', minDeposit: 50, minWithdraw: 100 },
    { id: 'm2', name: 'Nagad Personal', type: 'both', number: '01800000000', instruction: 'Send Money করে TrxID দিন।', minDeposit: 50, minWithdraw: 100 },
    { id: 'm3', name: 'Rocket Personal', type: 'both', number: '01900000000', instruction: 'Send Money করে TrxID দিন।', minDeposit: 50, minWithdraw: 100 },
    { id: 'm4', name: 'Mobile Recharge', type: 'withdraw', number: '', instruction: 'রিচার্জের জন্য নম্বর দিন।', minDeposit: 50, minWithdraw: 50 }
  ];
  const activeList = paymentMethods.length > 0 ? paymentMethods : defaultMethods;

  const depList = document.getElementById('depositMethodList');
  if (depList) {
    depList.innerHTML = '';
    const depMethods = activeList.filter(m => m.type === 'deposit' || m.type === 'both');
    depMethods.forEach((m, idx) => {
      if (idx === 0 && !selectedDepositMethod) selectedDepositMethod = m;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-center text-center ${
        selectedDepositMethod?.name === m.name ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`;
      btn.innerText = m.name;
      btn.onclick = () => {
        selectedDepositMethod = m;
        document.getElementById('depositNumberText').innerText = m.accountNumber || m.number || '01700000000';
        document.getElementById('depositInstructionText').innerText = m.instruction || 'Send Money করে ট্রানজেকশন আইডি দিন।';
        renderPaymentMethods();
      };
      depList.appendChild(btn);
    });
  }

  const withList = document.getElementById('withdrawMethodList');
  if (withList) {
    withList.innerHTML = '';
    const withMethods = activeList.filter(m => m.type === 'withdraw' || m.type === 'both');
    withMethods.forEach((m, idx) => {
      if (idx === 0 && !selectedWithdrawMethod) selectedWithdrawMethod = m;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `p-2.5 rounded-2xl border text-xs font-bold transition flex items-center justify-center text-center ${
        selectedWithdrawMethod?.name === m.name ? 'bg-amber-50 border-amber-500 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-700'
      }`;
      btn.innerText = m.name;
      btn.onclick = () => {
        selectedWithdrawMethod = m;
        renderPaymentMethods();
      };
      withList.appendChild(btn);
    });
  }
}

function copyDepositNumber() {
  const num = document.getElementById('depositNumberText').innerText;
  navigator.clipboard.writeText(num);
  showToast('নম্বর কপি করা হয়েছে: ' + num);
}

async function handleDepositSubmit(e) {
  e.preventDefault();
  if (!userProfile) return;

  const amount = Number(document.getElementById('depositAmount').value);
  const sender = document.getElementById('depositSender').value.trim();
  const trxId = document.getElementById('depositTrxId').value.trim();
  const min = globalSettings.minDeposit || 50;

  if (amount < min) {
    showToast(`সর্বনিম্ন ডিপোজিট ৳ ${min}`, false);
    return;
  }

  const btn = document.getElementById('depositSubmitBtn');
  btn.disabled = true;
  btn.innerText = 'সাবমিট হচ্ছে...';

  try {
    await db.collection('requests').add({
      uid: userProfile.uid,
      userEmail: userProfile.email,
      userName: userProfile.name,
      amount: amount,
      status: 'pending',
      method: selectedDepositMethod?.name || 'bKash',
      number: sender,
      trxId: trxId,
      type: 'deposit',
      createdAt: Date.now()
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: `ডিপোজিট রিকোয়েস্ট (${selectedDepositMethod?.name || 'bKash'})`,
      amount: amount,
      type: 'deposit',
      status: 'pending',
      date: Date.now()
    });

    closeModal('depositModal');
    showToast('ডিপোজিট রিকোয়েস্ট সফলভাবে জমা হয়েছে! এডমিন দ্রুত অনুমোদন করবেন।');
    document.getElementById('depositAmount').value = '';
    document.getElementById('depositSender').value = '';
    document.getElementById('depositTrxId').value = '';
  } catch (err) {
    showToast('রিকোয়েস্ট পাঠাতে ব্যর্থ: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'ডিপোজিট সাবমিট করুন 🚀';
  }
}

async function handleWithdrawSubmit(e) {
  e.preventDefault();
  if (!userProfile) return;

  if (!userProfile.accountActivated) {
    showToast('উইথড্র করতে আগে একাউন্ট একটিভ করুন!', false);
    openModal('activationModal');
    return;
  }

  const amount = Number(document.getElementById('withdrawAmount').value);
  const num = document.getElementById('withdrawNumber').value.trim();
  const min = globalSettings.minWithdraw || 100;

  if (amount < min) {
    showToast(`সর্বনিম্ন উইথড্র পরিমাণ ৳ ${min}`, false);
    return;
  }

  if ((userProfile.balance || 0) < amount) {
    showToast('আপনার মেইন ব্যালেন্সে পর্যাপ্ত টাকা নেই!', false);
    return;
  }

  const btn = document.getElementById('withdrawSubmitBtn');
  btn.disabled = true;
  btn.innerText = 'সাবমিট হচ্ছে...';

  try {
    await db.collection('users').doc(userProfile.uid).update({
      balance: userProfile.balance - amount
    });

    await db.collection('requests').add({
      uid: userProfile.uid,
      userEmail: userProfile.email,
      userName: userProfile.name,
      amount: amount,
      status: 'pending',
      method: selectedWithdrawMethod?.name || 'bKash',
      number: num,
      type: 'withdraw',
      createdAt: Date.now()
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: `উইথড্র রিকোয়েস্ট (${selectedWithdrawMethod?.name || 'bKash'})`,
      amount: amount,
      type: 'withdraw',
      status: 'pending',
      date: Date.now()
    });

    closeModal('withdrawModal');
    showToast('উইথড্র রিকোয়েস্ট সফল হয়েছে! খুব শীঘ্রই পেমেন্ট পৌঁছে যাবে।');
    document.getElementById('withdrawAmount').value = '';
    document.getElementById('withdrawNumber').value = '';
  } catch (err) {
    showToast('উইথড্র করতে ব্যর্থ: ' + err.message, false);
  } finally {
    btn.disabled = false;
    btn.innerText = 'উইথড্র রিকোয়েস্ট পাঠান ⚡';
  }
}

// --- 16. ACTIVATION LOGIC ---
async function activateWithBonus() {
  if (!userProfile) return;
  const fee = globalSettings.activationFee || 100;
  if ((userProfile.bonusBalance || 0) < fee) {
    showToast(`আপনার বোনাস ব্যালেন্স ৳ ${userProfile.bonusBalance}। প্রয়োজন ৳ ${fee}`, false);
    return;
  }
  if (!confirm(`৳ ${fee} বোনাস ব্যালেন্স কেটে একাউন্ট একটিভ করতে চান?`)) return;

  try {
    await db.collection('users').doc(userProfile.uid).update({
      bonusBalance: userProfile.bonusBalance - fee,
      accountActivated: true
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: 'একাউন্ট একটিভেশন (বোনাস ব্যালেন্স)',
      amount: fee,
      type: 'bonus',
      status: 'completed',
      date: Date.now()
    });

    closeModal('activationModal');
    if (window.confetti) confetti({ particleCount: 90, spread: 60 });
    showToast('অভিনন্দন! আপনার একাউন্ট একটিভ হয়েছে।');
  } catch (err) {
    showToast('একটিভেশন ব্যর্থ: ' + err.message, false);
  }
}

async function activateWithMain() {
  if (!userProfile) return;
  const fee = globalSettings.activationFee || 100;
  if ((userProfile.balance || 0) < fee) {
    showToast(`আপনার মেইন ব্যালেন্স ৳ ${userProfile.balance}। প্রয়োজন ৳ ${fee}। দয়া করে আগে ডিপোজিট করুন।`, false);
    return;
  }
  if (!confirm(`৳ ${fee} মেইন ব্যালেন্স কেটে একাউন্ট একটিভ করতে চান?`)) return;

  try {
    await db.collection('users').doc(userProfile.uid).update({
      balance: userProfile.balance - fee,
      accountActivated: true
    });

    await db.collection('history').add({
      uid: userProfile.uid,
      title: 'একাউন্ট একটিভেশন (মেইন ব্যালেন্স)',
      amount: fee,
      type: 'deposit',
      status: 'completed',
      date: Date.now()
    });

    closeModal('activationModal');
    if (window.confetti) confetti({ particleCount: 90, spread: 60 });
    showToast('অভিনন্দন! আপনার একাউন্ট একটিভ হয়েছে।');
  } catch (err) {
    showToast('একটিভেশন ব্যর্থ: ' + err.message, false);
  }
}

// --- 17. HISTORY & LEADERBOARD LOADERS ---
async function loadHistory() {
  if (!userProfile) return;
  const container = document.getElementById('historyListContainer');
  if (!container) return;
  container.innerHTML = '<p class="text-center text-xs text-slate-400 py-4">হিস্ট্রি লোড হচ্ছে...</p>';

  try {
    const snap = await db.collection('history')
      .where('uid', '==', userProfile.uid)
      .get();

    if (snap.empty) {
      container.innerHTML = '<div class="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 font-bold">এখনও কোন হিস্ট্রি নেই</div>';
      return;
    }

    const items = snap.docs.map(d => d.data());
    items.sort((a, b) => (b.date || 0) - (a.date || 0));

    container.innerHTML = '';
    items.forEach(it => {
      const div = document.createElement('div');
      div.className = 'bg-white border border-slate-100 rounded-2xl p-3.5 flex justify-between items-center shadow-xs';
      const isPos = it.type === 'earn' || it.type === 'bonus';
      div.innerHTML = `
        <div>
          <h4 class="font-extrabold text-xs text-slate-800">${it.title}</h4>
          <p class="text-[10px] text-slate-400 mt-0.5">${new Date(it.date).toLocaleString('bn-BD')}</p>
        </div>
        <div class="text-right">
          <span class="font-black text-sm en-num ${isPos ? 'text-emerald-600' : 'text-amber-600'}">
            ${isPos ? '+' : '-'}৳ ${it.amount}
          </span>
          <p class="text-[9px] font-black uppercase tracking-wider ${it.status === 'completed' ? 'text-emerald-600' : it.status === 'pending' ? 'text-amber-600' : 'text-rose-600'}">
            ${it.status}
          </p>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<p class="text-center text-xs text-rose-500">হিস্ট্রি লোড করতে ত্রুটি: ' + err.message + '</p>';
  }
}

async function loadLeaderboard() {
  const container = document.getElementById('leaderboardList');
  if (!container) return;
  container.innerHTML = '<p class="text-center text-xs text-slate-400 py-4">লিডারবোর্ড লোড হচ্ছে...</p>';

  try {
    const snap = await db.collection('users')
      .orderBy('totalEarned', 'desc')
      .limit(20)
      .get();

    if (snap.empty) {
      container.innerHTML = '<div class="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-500 font-bold">কোন ডাটা পাওয়া যায়নি</div>';
      return;
    }

    container.innerHTML = '';
    snap.docs.forEach((d, idx) => {
      const u = d.data();
      const div = document.createElement('div');
      div.className = `p-3 rounded-2xl flex items-center justify-between border shadow-2xs ${
        idx === 0 ? 'bg-amber-50/80 border-amber-200' : idx === 1 ? 'bg-slate-50 border-slate-200' : idx === 2 ? 'bg-orange-50/70 border-orange-200' : 'bg-white border-slate-100'
      }`;
      const medal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
      div.innerHTML = `
        <div class="flex items-center gap-3">
          <span class="font-black text-sm w-7 text-center">${medal}</span>
          <div>
            <h4 class="font-extrabold text-xs text-slate-800">${u.name || 'User'}</h4>
            <p class="text-[10px] text-slate-400 font-medium">${u.email ? u.email.substring(0, 4) + '***' : ''}</p>
          </div>
        </div>
        <div class="text-right">
          <span class="font-black text-xs text-emerald-700 en-num">৳ ${(u.totalEarned || 0).toFixed(2)}</span>
        </div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    container.innerHTML = '<p class="text-center text-xs text-rose-500">লিডারবোর্ড ত্রুটি: ' + err.message + '</p>';
  }
}

// --- 18. VIDEO SUPPORT MODAL & RENDERING ---
function getYouTubeId(url) {
  if (!url) return '';
  let id = '';
  if (url.includes('v=')) id = url.split('v=')[1]?.split('&')[0];
  else if (url.includes('youtu.be/')) id = url.split('youtu.be/')[1]?.split('?')[0];
  else if (url.includes('embed/')) id = url.split('embed/')[1]?.split('?')[0];
  return id;
}

function renderHomeVideos() {
  const container = document.getElementById('homeVideosContainer');
  if (!container) return;
  const vids = globalSettings.supportVideos || [];
  if (vids.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-400 font-bold p-2">কোন ভিডিও টিউটোরিয়াল নেই</p>';
    return;
  }
  container.innerHTML = '';
  vids.forEach(v => {
    const id = getYouTubeId(v.url);
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60';
    const div = document.createElement('div');
    div.className = 'min-w-[200px] max-w-[220px] bg-white border border-slate-100 rounded-2xl p-2.5 shadow-xs cursor-pointer group flex-shrink-0';
    div.onclick = () => openVideoModal(v.url);
    div.innerHTML = `
      <div class="aspect-video bg-slate-900 rounded-xl mb-2 flex items-center justify-center relative overflow-hidden">
        <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300">
        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
          <div class="w-9 h-9 bg-white/90 rounded-full flex items-center justify-center text-indigo-600 shadow">
            ▶
          </div>
        </div>
      </div>
      <h4 class="font-bold text-slate-800 text-xs line-clamp-1">${v.title}</h4>
    `;
    container.appendChild(div);
  });
}

function renderSupportVideos() {
  const container = document.getElementById('supportVideosList');
  if (!container) return;
  const vids = globalSettings.supportVideos || [];
  container.innerHTML = '';
  vids.forEach(v => {
    const id = getYouTubeId(v.url);
    const thumb = id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60';
    const div = document.createElement('div');
    div.className = 'bg-white border-2 border-indigo-50 rounded-3xl p-4 shadow-xs space-y-2 cursor-pointer';
    div.onclick = () => openVideoModal(v.url);
    div.innerHTML = `
      <div class="aspect-video bg-slate-900 rounded-2xl overflow-hidden relative group">
        <img src="${thumb}" alt="${v.title}" class="w-full h-full object-cover opacity-80 group-hover:scale-105 transition duration-300">
        <div class="absolute inset-0 flex items-center justify-center bg-black/20">
          <div class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-indigo-600 shadow-md">
            ▶
          </div>
        </div>
      </div>
      <div class="flex justify-between items-center">
        <h4 class="font-extrabold text-slate-800 text-xs">${v.title}</h4>
        <span class="text-indigo-600 text-xs font-black bg-indigo-50 px-3 py-1 rounded-full">দেখুন</span>
      </div>
    `;
    container.appendChild(div);
  });
}

function openVideoModal(url) {
  const id = getYouTubeId(url);
  const embedUrl = id ? `https://www.youtube.com/embed/${id}?autoplay=1` : url;
  document.getElementById('videoIframe').src = embedUrl;
  openModal('videoModal');
}

function closeVideoModal() {
  document.getElementById('videoIframe').src = '';
  closeModal('videoModal');
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
