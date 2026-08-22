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

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Global Settings Load
async function loadAdminSettings() {
  const doc = await db.collection('settings').doc('global').get();
  if (doc.exists) {
    const d = doc.data();
    document.getElementById('setActMode').value = d.activationMode || 'paid';
    document.getElementById('setActFee').value = d.activationFee || 100;
    document.getElementById('setRegBonus').value = d.registrationBonus || 50;
    document.getElementById('setDailyBonus').value = d.dailyBonusAmount || 15;
    document.getElementById('setRefBonus').value = d.referralBonus || 20;
    document.getElementById('setMinWithdraw').value = d.minWithdraw || 100;
    document.getElementById('setNotice').value = d.notices || '';
  }
}

async function saveAdminSettings(e) {
  e.preventDefault();
  await db.collection('settings').doc('global').set({
    activationMode: document.getElementById('setActMode').value,
    activationFee: Number(document.getElementById('setActFee').value),
    registrationBonus: Number(document.getElementById('setRegBonus').value),
    dailyBonusAmount: Number(document.getElementById('setDailyBonus').value),
    referralBonus: Number(document.getElementById('setRefBonus').value),
    minWithdraw: Number(document.getElementById('setMinWithdraw').value),
    notices: document.getElementById('setNotice').value
  }, { merge: true });
  alert('গ্লোবাল সেটিংস আপডেট করা হয়েছে!');
}

// VIP Plans Management
async function addVipPlan(e) {
  e.preventDefault();
  await db.collection('plans').add({
    title: document.getElementById('planTitle').value,
    price: Number(document.getElementById('planPrice').value),
    dailyEarn: Number(document.getElementById('planDailyEarn').value),
    dailyTaskLimit: Number(document.getElementById('planTaskLimit').value),
    validityDays: 30,
    active: true
  });
  alert('নতুন ভিআইপি প্ল্যান যুক্ত হয়েছে!');
  e.target.reset();
}

db.collection('plans').onSnapshot(snap => {
  const list = document.getElementById('adminPlansList');
  const taskDropdown = document.getElementById('taskTargetPlan');
  if (!list) return;
  list.innerHTML = '';
  taskDropdown.innerHTML = '<option value="">-- প্ল্যান সিলেক্ট করুন --</option>';

  snap.docs.forEach(doc => {
    const d = doc.data();
    // Dropdown populate
    const opt = document.createElement('option');
    opt.value = doc.id;
    opt.innerText = `${d.title} (৳${d.price})`;
    taskDropdown.appendChild(opt);

    // List render
    const div = document.createElement('div');
    div.className = 'bg-slate-900 p-3 rounded-2xl border border-slate-700 flex justify-between items-center text-xs';
    div.innerHTML = `
      <div>
        <p class="font-black text-purple-400">${d.title}</p>
        <p class="text-slate-400">মূল্য: ৳${d.price} | দৈনিক ইনকাম: ৳${d.dailyEarn}</p>
      </div>
      <button onclick="deleteDoc('plans', '${doc.id}')" class="bg-rose-600 px-3 py-1 rounded-xl text-white font-bold">মুছুন</button>
    `;
    list.appendChild(div);
  });
});

// Tasks Management
async function addPlanTask(e) {
  e.preventDefault();
  await db.collection('customTasks').add({
    planId: document.getElementById('taskTargetPlan').value,
    title: document.getElementById('taskTitle').value,
    reward: Number(document.getElementById('taskReward').value),
    link: document.getElementById('taskLink').value || '',
    active: true
  });
  alert('টাস্ক যুক্ত হয়েছে!');
  e.target.reset();
}

db.collection('customTasks').onSnapshot(snap => {
  const list = document.getElementById('adminTasksList');
  if (!list) return;
  list.innerHTML = '';
  snap.docs.forEach(doc => {
    const d = doc.data();
    const div = document.createElement('div');
    div.className = 'bg-slate-900 p-3 rounded-2xl border border-slate-700 flex justify-between items-center text-xs';
    div.innerHTML = `
      <div>
        <p class="font-black text-sky-400">${d.title}</p>
        <p class="text-slate-400">রিওয়ার্ড: ৳${d.reward}</p>
      </div>
      <button onclick="deleteDoc('customTasks', '${doc.id}')" class="bg-rose-600 px-3 py-1 rounded-xl text-white font-bold">মুছুন</button>
    `;
    list.appendChild(div);
  });
});

// Payment Methods
async function addPaymentMethod(e) {
  e.preventDefault();
  await db.collection('paymentMethods').add({
    name: document.getElementById('pmName').value,
    number: document.getElementById('pmNumber').value,
    active: true
  });
  alert('পেমেন্ট মেথড সেভ হয়েছে!');
  e.target.reset();
}

db.collection('paymentMethods').onSnapshot(snap => {
  const list = document.getElementById('adminPaymentList');
  if (!list) return;
  list.innerHTML = '';
  snap.docs.forEach(doc => {
    const d = doc.data();
    const div = document.createElement('div');
    div.className = 'bg-slate-900 p-2.5 rounded-xl border border-slate-700 text-center text-xs';
    div.innerHTML = `
      <p class="font-black text-emerald-400">${d.name}</p>
      <p class="text-slate-300 font-mono my-1">${d.number}</p>
      <button onclick="deleteDoc('paymentMethods', '${doc.id}')" class="bg-rose-600 px-2 py-0.5 rounded text-[10px] text-white">ডিলিট</button>
    `;
    list.appendChild(div);
  });
});

// Pending Deposit/Activation Requests
db.collection('requests').where('status', '==', 'pending').onSnapshot(snap => {
  const list = document.getElementById('pendingRequestsList');
  if (!list) return;
  if (snap.empty) {
    list.innerHTML = '<p class="text-xs text-slate-400">কোন পেন্ডিং রিকোয়েস্ট নেই</p>';
    return;
  }
  list.innerHTML = '';
  snap.docs.forEach(doc => {
    const d = doc.data();
    const div = document.createElement('div');
    div.className = 'bg-slate-900 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-xs';
    div.innerHTML = `
      <div>
        <p class="font-black text-white">${d.userName} (${d.purpose === 'activation' ? 'একাউন্ট একটিভেশন' : 'সাধারণ ডিপোজিট'})</p>
        <p class="text-slate-400">মেথড: ${d.method} | TrxID: <span class="text-amber-300 font-bold font-mono">${d.trxId}</span></p>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-black text-emerald-400">৳ ${d.amount}</span>
        <button onclick="approveReq('${doc.id}', '${d.uid}', ${d.amount}, '${d.purpose}')" class="bg-emerald-600 px-3 py-1.5 rounded-xl font-bold">এপ্রুভ</button>
      </div>
    `;
    list.appendChild(div);
  });
});

async function approveReq(reqId, uid, amount, purpose) {
  const userRef = db.collection('users').doc(uid);
  const userDoc = await userRef.get();
  
  if (userDoc.exists) {
    const currentBal = userDoc.data().balance || 0;
    const updates = { balance: currentBal + amount };
    if (purpose === 'activation') updates.accountActivated = true;
    await userRef.update(updates);
  }
  
  await db.collection('requests').doc(reqId).update({ status: 'completed' });
  alert('রিকোয়েস্ট সফলভাবে অনুমোদিত করা হয়েছে!');
}

async function deleteDoc(coll, id) {
  if (confirm('আপনি কি এটি মুছে ফেলতে চান?')) {
    await db.collection(coll).doc(id).delete();
  }
}

window.addEventListener('DOMContentLoaded', loadAdminSettings);
