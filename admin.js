
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

const ADMIN_EMAIL = "mdfirozhossain2007@gmail.com";

auth.onAuthStateChanged(async (user) => {
  if (!user || user.email !== ADMIN_EMAIL) {
    document.getElementById('adminAccessDenied').classList.remove('hidden');
    document.getElementById('adminApp').classList.add('hidden');
    return;
  }

  document.getElementById('adminAccessDenied').classList.add('hidden');
  document.getElementById('adminApp').classList.remove('hidden');

  loadAdminStats();
  loadRequests();
  loadSettingsForm();
});

async function loadAdminStats() {
  const usersSnap = await db.collection('users').get();
  document.getElementById('statTotalUsers').innerText = usersSnap.size;

  let activeCount = 0;
  usersSnap.forEach(d => {
    if (d.data().accountActivated) activeCount++;
  });
  document.getElementById('statActiveUsers').innerText = activeCount;

  const pendingDep = await db.collection('requests').where('type', '==', 'deposit').where('status', '==', 'pending').get();
  document.getElementById('statPendingDeposit').innerText = pendingDep.size;

  const pendingWith = await db.collection('requests').where('type', '==', 'withdraw').where('status', '==', 'pending').get();
  document.getElementById('statPendingWithdraw').innerText = pendingWith.size;
}

function loadRequests() {
  // Deposits
  db.collection('requests').where('type', '==', 'deposit').where('status', '==', 'pending').onSnapshot(snap => {
    const list = document.getElementById('adminDepositList');
    if (snap.empty) {
      list.innerHTML = '<p class="text-xs text-slate-500">কোন পেন্ডিং ডিপোজিট রিকোয়েস্ট নেই</p>';
      return;
    }
    list.innerHTML = '';
    snap.docs.forEach(doc => {
      const data = doc.data();
      const div = document.createElement('div');
      div.className = 'bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs';
      div.innerHTML = `
        <div>
          <p class="font-black text-white">${data.userName || data.userEmail}</p>
          <p class="text-slate-400">মেথড: <span class="text-emerald-400 font-bold">${data.method}</span> | নম্বর: ${data.number}</p>
          <p class="text-slate-400">TrxID: <span class="font-mono text-amber-300 font-bold">${data.trxId}</span></p>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-black text-base text-emerald-400 en-num">৳ ${data.amount}</span>
          <button onclick="approveRequest('${doc.id}', '${data.uid}', ${data.amount}, 'deposit')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl">অনুমোদন</button>
          <button onclick="rejectRequest('${doc.id}')" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl">বাতিল</button>
        </div>
      `;
      list.appendChild(div);
    });
  });

  // Withdraws
  db.collection('requests').where('type', '==', 'withdraw').where('status', '==', 'pending').onSnapshot(snap => {
    const list = document.getElementById('adminWithdrawList');
    if (snap.empty) {
      list.innerHTML = '<p class="text-xs text-slate-500">কোন পেন্ডিং উইথড্র রিকোয়েস্ট নেই</p>';
      return;
    }
    list.innerHTML = '';
    snap.docs.forEach(doc => {
      const data = doc.data();
      const div = document.createElement('div');
      div.className = 'bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs';
      div.innerHTML = `
        <div>
          <p class="font-black text-white">${data.userName || data.userEmail}</p>
          <p class="text-slate-400">মেথড: <span class="text-amber-400 font-bold">${data.method}</span> | নম্বর: ${data.number}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-black text-base text-amber-400 en-num">৳ ${data.amount}</span>
          <button onclick="approveRequest('${doc.id}', '${data.uid}', ${data.amount}, 'withdraw')" class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl">পেমেন্ট সম্পন্ন</button>
          <button onclick="rejectRequest('${doc.id}', '${data.uid}', ${data.amount}, 'withdraw')" class="bg-rose-600 hover:bg-rose-500 text-white font-bold px-3 py-1.5 rounded-xl">বাতিল ও রিফান্ড</button>
        </div>
      `;
      list.appendChild(div);
    });
  });
}

async function approveRequest(reqId, uid, amount, type) {
  try {
    if (type === 'deposit') {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const bal = userDoc.data().balance || 0;
        await userRef.update({ balance: bal + amount });
      }
    }
    await db.collection('requests').doc(reqId).update({ status: 'completed' });
    alert('রিকোয়েস্ট সফলভাবে সাকসেস করা হয়েছে!');
    loadAdminStats();
  } catch (err) {
    alert('ত্রুটি: ' + err.message);
  }
}

async function rejectRequest(reqId, uid = null, amount = 0, type = '') {
  try {
    if (type === 'withdraw' && uid) {
      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();
      if (userDoc.exists) {
        const bal = userDoc.data().balance || 0;
        await userRef.update({ balance: bal + amount });
      }
    }
    await db.collection('requests').doc(reqId).update({ status: 'rejected' });
    alert('রিকোয়েস্ট রিজেক্ট করা হয়েছে!');
    loadAdminStats();
  } catch (err) {
    alert('ত্রুটি: ' + err.message);
  }
}

async function loadSettingsForm() {
  const doc = await db.collection('settings').doc('global').get();
  if (doc.exists) {
    const data = doc.data();
    document.getElementById('setSiteName').value = data.siteName || 'Nexora';
    document.getElementById('setRegBonus').value = data.registrationBonus || 50;
    document.getElementById('setActFee').value = data.activationFee || 100;
    document.getElementById('setDailyBonus').value = data.dailyBonusAmount || 15;
    document.getElementById('setNotice').value = data.notices || '';
  }
}

async function saveAdminSettings(e) {
  e.preventDefault();
  try {
    await db.collection('settings').doc('global').set({
      siteName: document.getElementById('setSiteName').value,
      registrationBonus: Number(document.getElementById('setRegBonus').value),
      activationFee: Number(document.getElementById('setActFee').value),
      dailyBonusAmount: Number(document.getElementById('setDailyBonus').value),
      notices: document.getElementById('setNotice').value
    }, { merge: true });
    alert('গ্লোবাল সেটিংস আপডেট হয়েছে!');
  } catch (err) {
    alert('সেটিংস সেভ করতে ব্যর্থ: ' + err.message);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.lucide) lucide.createIcons();
});
