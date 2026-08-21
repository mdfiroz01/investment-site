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

// Load Settings
async function loadAdminSettings() {
  const doc = await db.collection('settings').doc('global').get();
  if (doc.exists) {
    const data = doc.data();
    document.getElementById('setActMode').value = data.activationMode || 'paid';
    document.getElementById('setActFee').value = data.activationFee || 100;
    document.getElementById('setDailyBonus').value = data.dailyBonusAmount || 15;
    document.getElementById('setNotice').value = data.notices || '';
  }
}

async function saveAdminSettings(e) {
  e.preventDefault();
  await db.collection('settings').doc('global').set({
    activationMode: document.getElementById('setActMode').value,
    activationFee: Number(document.getElementById('setActFee').value),
    dailyBonusAmount: Number(document.getElementById('setDailyBonus').value),
    notices: document.getElementById('setNotice').value
  }, { merge: true });
  alert('সেটিংস সেভ হয়েছে!');
}

// Load Requests
db.collection('requests').where('status', '==', 'pending').onSnapshot(snap => {
  const list = document.getElementById('pendingRequestsList');
  if (snap.empty) {
    list.innerHTML = '<p class="text-xs text-slate-400">কোন পেন্ডিং রিকোয়েস্ট নেই</p>';
    return;
  }
  list.innerHTML = '';
  snap.docs.forEach(doc => {
    const data = doc.data();
    const div = document.createElement('div');
    div.className = 'bg-slate-900 border border-slate-700 p-4 rounded-2xl flex items-center justify-between text-xs';
    div.innerHTML = `
      <div>
        <p class="font-black text-white">${data.userName} (${data.purpose === 'activation' ? 'একাউন্ট একটিভেশন' : 'সাধারণ ডিপোজিট'})</p>
        <p class="text-slate-400">মেথড: ${data.method} | TrxID: <span class="text-amber-300 font-bold">${data.trxId}</span></p>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-black text-emerald-400">৳ ${data.amount}</span>
        <button onclick="approveReq('${doc.id}', '${data.uid}', ${data.amount}, '${data.purpose}')" class="bg-emerald-600 px-3 py-1.5 rounded-xl font-bold">এপ্রুভ</button>
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
    
    // If target purpose was activation, activate user account upon approval
    if (purpose === 'activation') {
      updates.accountActivated = true;
    }
    await userRef.update(updates);
  }
  
  await db.collection('requests').doc(reqId).update({ status: 'completed' });
  alert('রিকোয়েস্ট এপ্রুভ করা হয়েছে!');
}

window.addEventListener('DOMContentLoaded', loadAdminSettings);
