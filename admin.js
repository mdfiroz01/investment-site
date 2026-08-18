const ADMIN_PASS = "admin3";

// Ensure Firebase Auth session for Admin operations
function ensureAdminFirebaseAuth() {
  return new Promise((resolve) => {
    if (typeof auth !== 'undefined' && auth.currentUser) {
      resolve();
    } else if (typeof auth !== 'undefined') {
      auth.signInAnonymously().then(() => resolve()).catch(() => resolve());
    } else {
      resolve();
    }
  });
}

// Initial session check
window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    ensureAdminFirebaseAuth().then(() => {
      showAdminDashboard();
    });
  }

  // Attach login listener
  const loginForm = document.getElementById('admin-login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleAdminLogin);
  }

  // Attach add/edit forms
  const planForm = document.getElementById('admin-add-plan-form');
  if (planForm) planForm.addEventListener('submit', handlePlanSubmit);

  const taskForm = document.getElementById('admin-add-task-form');
  if (taskForm) taskForm.addEventListener('submit', handleTaskSubmit);

  const gatewayForm = document.getElementById('admin-gateway-form');
  if (gatewayForm) gatewayForm.addEventListener('submit', handleGatewaySubmit);

  const socialForm = document.getElementById('admin-social-form');
  if (socialForm) socialForm.addEventListener('submit', handleSocialSubmit);
});

function handleAdminLogin(e) {
  e.preventDefault();
  const passEl = document.getElementById('admin-pass');
  const pass = passEl ? passEl.value : '';

  if (pass === ADMIN_PASS) {
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    ensureAdminFirebaseAuth().then(() => {
      showAdminDashboard();
    });
  } else {
    alert("ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড: admin3");
  }
}

function showAdminDashboard() {
  const authEl = document.getElementById('admin-auth');
  const panelEl = document.getElementById('admin-panel');
  if (authEl) authEl.classList.add('hidden');
  if (panelEl) panelEl.classList.remove('hidden');
  loadAdminDashboard();
}

window.adminLogout = function() {
  sessionStorage.removeItem('isAdminLoggedIn');
  const authEl = document.getElementById('admin-auth');
  const panelEl = document.getElementById('admin-panel');
  if (authEl) authEl.classList.remove('hidden');
  if (panelEl) panelEl.classList.add('hidden');
};

// ADMIN SIDEBAR DRAWER & SECTION SWITCHING
window.openAdminSidebar = function() {
  const drawer = document.getElementById('admin-sidebar-drawer');
  const overlay = document.getElementById('admin-sidebar-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('open');
};

window.closeAdminSidebar = function() {
  const drawer = document.getElementById('admin-sidebar-drawer');
  const overlay = document.getElementById('admin-sidebar-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
};

window.showAdminSection = function(secId) {
  closeAdminSidebar();
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  
  const target = document.getElementById(secId);
  if (target) {
    target.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

function loadAdminDashboard() {
  loadUsersAdmin();
  loadDepositsAdmin();
  loadWithdrawsAdmin();
  loadPlansAdmin();
  loadTasksAdmin();
  loadSlidersAdmin();
  loadGatewaysAdmin();
  loadSocialSupportAdmin();
  loadWelcomeNoticeAdmin();
  loadSettingsAdmin();
}

// ----------------------------------------------------
// 1. SYSTEM SETTINGS
// ----------------------------------------------------
window.saveSystemSettings = async function() {
  await ensureAdminFirebaseAuth();
  const logoUrl = document.getElementById('cfg-site-logo').value.trim();
  const regBonus = parseFloat(document.getElementById('cfg-reg-bonus').value) || 0;
  const minWithdraw = parseFloat(document.getElementById('cfg-min-withdraw').value) || 200;
  const withdrawChargePercent = parseFloat(document.getElementById('cfg-withdraw-charge').value) || 5;

  db.ref('settings/config').set({
    logoUrl: logoUrl,
    regBonus: regBonus,
    minWithdraw: minWithdraw,
    withdrawChargePercent: withdrawChargePercent
  }).then(() => alert('সাইট সেটিংস সফলভাবে সেভ করা হয়েছে!'))
    .catch(err => alert('সেভ ব্যর্থ: ' + err.message));
};

function loadSettingsAdmin() {
  db.ref('settings/config').once('value', snap => {
    if (snap.exists()) {
      const cfg = snap.val();
      if (document.getElementById('cfg-site-logo')) document.getElementById('cfg-site-logo').value = cfg.logoUrl || '';
      if (document.getElementById('cfg-reg-bonus')) document.getElementById('cfg-reg-bonus').value = cfg.regBonus || 0;
      if (document.getElementById('cfg-min-withdraw')) document.getElementById('cfg-min-withdraw').value = cfg.minWithdraw || 200;
      if (document.getElementById('cfg-withdraw-charge')) document.getElementById('cfg-withdraw-charge').value = cfg.withdrawChargePercent || 5;
    }
  });

  db.ref('notices/main').once('value', snap => {
    if (snap.exists() && document.getElementById('admin-notice-input')) {
      document.getElementById('admin-notice-input').value = snap.val().text || '';
    }
  });
}

// ----------------------------------------------------
// 2. USER MANAGEMENT
// ----------------------------------------------------
function loadUsersAdmin() {
  db.ref('users').on('value', snap => {
    const statUsers = document.getElementById('stat-users');
    if (statUsers) statUsers.innerText = snap.exists() ? snap.numChildren() : 0;
    
    const tbody = document.getElementById('admin-users-table');
    if (!tbody) return;
    tbody.innerHTML = '';

    if (!snap.exists()) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">কোনো ইউজার পাওয়া যায়নি</td></tr>';
      return;
    }

    snap.forEach(child => {
      const u = child.val();
      const uid = child.key;
      const isBlocked = u.isBlocked === true;
      const totalBal = (u.depositBalance || 0) + (u.incomeBalance || 0);

      const safeName = (u.name || 'User').replace(/'/g, "\\'");
      const safePhone = (u.phone || '').replace(/'/g, "\\'");

      tbody.innerHTML += `
        <tr>
          <td>
            <b>${u.name || 'User'}</b><br>
            <small style="color:#64748b">${u.email || 'N/A'}</small>
          </td>
          <td><b>৳${totalBal.toFixed(2)}</b></td>
          <td>VIP ${u.vipLevel || 0}</td>
          <td>
            <div style="display:flex; gap:4px; flex-wrap:wrap;">
              <button class="btn-action-sm btn-info" onclick="viewFullUserInfo('${uid}')">Info</button>
              <button class="btn-action-sm btn-secondary" onclick="openEditUserModal('${uid}', '${safeName}', '${safePhone}', ${u.depositBalance || 0}, ${u.incomeBalance || 0}, ${u.vipLevel || 0})">Edit</button>
              <button class="btn-action-sm ${isBlocked ? 'btn-success' : 'btn-danger'}" onclick="toggleBlockUser('${uid}', ${!isBlocked})">
                ${isBlocked ? 'Unblock' : 'Block'}
              </button>
            </div>
          </td>
        </tr>
      `;
    });
  });
}

window.viewFullUserInfo = function(uid) {
  db.ref('users/' + uid).once('value', snap => {
    if (!snap.exists()) return;
    const u = snap.val();
    const modalBody = document.getElementById('user-full-details-body');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
      <div style="display:grid; gap:8px;">
        <div><b>ইউজার নাম:</b> ${u.name || 'N/A'}</div>
        <div><b>ইমেইল:</b> ${u.email || 'N/A'}</div>
        <div><b>ফোন নম্বর:</b> ${u.phone || 'N/A'}</div>
        <div><b>কান্ট্রি:</b> ${u.country || 'N/A'}</div>
        <div><b>ডিপোজিট ব্যালেন্স:</b> ৳${(u.depositBalance || 0).toFixed(2)}</div>
        <div><b>ইনকাম ব্যালেন্স:</b> ৳${(u.incomeBalance || 0).toFixed(2)}</div>
        <div><b>মোট ব্যালেন্স:</b> ৳${((u.depositBalance || 0) + (u.incomeBalance || 0)).toFixed(2)}</div>
        <div><b>এক্টিভ VIP লেভেল:</b> VIP ${u.vipLevel || 0} (${u.vipPlanName || 'নো প্ল্যান'})</div>
        <div><b>উইথড্র ফি (%):</b> ${u.withdrawChargePercent || 5}%</div>
        <div><b>নিজের রেফার কোড:</b> <code>${u.refCode || 'N/A'}</code></div>
        <div><b>যার রেফারে জয়েন করেছে:</b> <code>${u.referredBy || 'কারো রেফারে নয়'}</code></div>
        <div><b>স্ট্যাটাস:</b> <span style="color:${u.isBlocked ? 'red':'green'}; font-weight:bold;">${u.isBlocked ? 'Blocked' : 'Active'}</span></div>
      </div>
    `;

    document.getElementById('user-info-modal').classList.remove('hidden');
  });
};

window.closeUserInfoModal = function() {
  const modal = document.getElementById('user-info-modal');
  if (modal) modal.classList.add('hidden');
};

window.openEditUserModal = function(uid, name, phone, depBal, incBal, vip) {
  document.getElementById('edit-user-uid').value = uid;
  document.getElementById('edit-user-name').value = name;
  document.getElementById('edit-user-phone').value = phone;
  document.getElementById('edit-user-dep-balance').value = depBal;
  document.getElementById('edit-user-inc-balance').value = incBal;
  document.getElementById('edit-user-vip').value = vip;

  document.getElementById('edit-user-modal').classList.remove('hidden');
};

window.closeEditUserModal = function() {
  const modal = document.getElementById('edit-user-modal');
  if (modal) modal.classList.add('hidden');
};

window.saveUserEdit = async function() {
  await ensureAdminFirebaseAuth();
  const uid = document.getElementById('edit-user-uid').value;
  const updates = {
    name: document.getElementById('edit-user-name').value,
    phone: document.getElementById('edit-user-phone').value,
    depositBalance: parseFloat(document.getElementById('edit-user-dep-balance').value) || 0,
    incomeBalance: parseFloat(document.getElementById('edit-user-inc-balance').value) || 0,
    vipLevel: parseInt(document.getElementById('edit-user-vip').value) || 0
  };

  db.ref('users/' + uid).update(updates).then(() => {
    alert('ইউজার ডাটা সফলভাবে আপডেট হয়েছে!');
    closeEditUserModal();
  }).catch(err => alert('আপডেট ব্যর্থ: ' + err.message));
};

window.toggleBlockUser = async function(uid, blockState) {
  await ensureAdminFirebaseAuth();
  const actionText = blockState ? 'ব্লক' : 'আনব্লক';
  if (confirm(`আপনি কি এই ইউজারকে ${actionText} করতে চান?`)) {
    db.ref('users/' + uid + '/isBlocked').set(blockState).then(() => {
      alert(`ইউজার সফলভাবে ${actionText} করা হয়েছে!`);
    }).catch(err => alert('ব্যর্থ: ' + err.message));
  }
};

// ----------------------------------------------------
// 3. VIP PLAN EDIT & MANAGEMENT
// ----------------------------------------------------
async function handlePlanSubmit(e) {
  e.preventDefault();
  await ensureAdminFirebaseAuth();

  const editKey = document.getElementById('edit-plan-key').value;
  const planData = {
    name: document.getElementById('plan-name').value.trim(),
    price: parseFloat(document.getElementById('plan-price').value) || 0,
    dailyTasks: parseInt(document.getElementById('plan-daily-tasks').value) || 1,
    dailyProfit: parseFloat(document.getElementById('plan-daily-profit').value) || 0,
    durationDays: parseInt(document.getElementById('plan-duration').value) || 30,
    vipLevel: parseInt(document.getElementById('plan-vip-level').value) || 1,
    refCommissionPercent: parseFloat(document.getElementById('plan-ref-commission').value) || 10,
    withdrawChargePercent: parseFloat(document.getElementById('plan-withdraw-charge').value) || 5,
    activationBonus: parseFloat(document.getElementById('plan-activation-bonus').value) || 0,
    badgeText: document.getElementById('plan-badge-text').value.trim(),
    isSoldOut: document.getElementById('plan-is-soldout').checked
  };

  if (editKey) {
    db.ref('plans/' + editKey).update(planData).then(() => {
      alert('VIP প্ল্যান সফলভাবে ইডিট করা হয়েছে!');
      resetPlanForm();
    }).catch(err => alert('Error: ' + err.message));
  } else {
    db.ref('plans').push(planData).then(() => {
      alert('নতুন VIP প্ল্যান সফলভাবে যোগ করা হয়েছে!');
      resetPlanForm();
    }).catch(err => alert('Error: ' + err.message));
  }
}

function loadPlansAdmin() {
  db.ref('plans').on('value', snap => {
    const container = document.getElementById('admin-plans-list');
    if (!container) return;
    container.innerHTML = '';
    
    if (!snap.exists()) {
      container.innerHTML = '<div style="font-size:12px; color:#64748b;">কোনো প্ল্যান পাওয়া যায়নি</div>';
      return;
    }

    snap.forEach(child => {
      const p = child.val();
      const key = child.key;
      const safeBadge = (p.badgeText || '').replace(/'/g, "\\'");
      const safeName = (p.name || '').replace(/'/g, "\\'");

      container.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:10px; margin-bottom:8px; font-size:12px;">
          <div>
            <b style="font-size:13px; color:#0f172a;">${p.name}</b> - ৳${p.price} (VIP ${p.vipLevel}) 
            <small style="color:#05b381; font-weight:700;">[Ref: ${p.refCommissionPercent || 10}%, Fee: ${p.withdrawChargePercent !== undefined ? p.withdrawChargePercent : 5}%]</small>
            ${p.isSoldOut ? '<span style="color:#ef4444; font-weight:bold; margin-left:5px;">[Sold Out]</span>' : ''}
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-sm btn-secondary" onclick="editPlan('${key}', '${safeName}', ${p.price}, ${p.dailyTasks}, ${p.dailyProfit}, ${p.durationDays}, ${p.vipLevel}, ${p.refCommissionPercent || 10}, ${p.withdrawChargePercent !== undefined ? p.withdrawChargePercent : 5}, '${safeBadge}', ${p.isSoldOut === true}, ${p.activationBonus || 0})">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="deletePlan('${key}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.deletePlan = async function(key) {
  if (confirm("আপনি কি এই VIP প্ল্যানটি মুছে ফেলতে চান?")) {
    await ensureAdminFirebaseAuth();
    db.ref('plans/' + key).remove();
  }
};

window.editPlan = function(key, name, price, dailyTasks, dailyProfit, duration, vip, refComm, witCharge, badgeText, isSoldOut, actBonus = 0) {
  document.getElementById('edit-plan-key').value = key;
  document.getElementById('plan-name').value = name;
  document.getElementById('plan-price').value = price;
  document.getElementById('plan-daily-tasks').value = dailyTasks;
  document.getElementById('plan-daily-profit').value = dailyProfit;
  document.getElementById('plan-duration').value = duration;
  document.getElementById('plan-vip-level').value = vip;
  document.getElementById('plan-ref-commission').value = refComm;
  document.getElementById('plan-withdraw-charge').value = witCharge;
  document.getElementById('plan-activation-bonus').value = actBonus;
  document.getElementById('plan-badge-text').value = badgeText;
  document.getElementById('plan-is-soldout').checked = isSoldOut;

  document.getElementById('plan-form-title').innerText = 'VIP প্ল্যান ইডিট করুন';
  document.getElementById('btn-save-plan').innerText = 'আপডেট সেভ করুন 💾';
  document.getElementById('btn-cancel-plan-edit').classList.remove('hidden');
  showAdminSection('sec-plans');
};

window.resetPlanForm = function() {
  document.getElementById('edit-plan-key').value = '';
  document.getElementById('admin-add-plan-form').reset();
  document.getElementById('plan-form-title').innerText = 'VIP প্ল্যান তৈরি ও ইডিট';
  document.getElementById('btn-save-plan').innerText = 'সেভ প্ল্যান 💾';
  document.getElementById('btn-cancel-plan-edit').classList.add('hidden');
};

// ----------------------------------------------------
// 4. TASK CREATION
// ----------------------------------------------------
async function handleTaskSubmit(e) {
  e.preventDefault();
  await ensureAdminFirebaseAuth();

  const editKey = document.getElementById('edit-task-key').value;
  const baseTitle = document.getElementById('task-title').value.trim();
  const reward = parseFloat(document.getElementById('task-reward').value) || 0;
  const minVipVal = parseInt(document.getElementById('task-min-vip').value) || 0;
  const qty = parseInt(document.getElementById('task-quantity').value) || 1;

  if (editKey) {
    db.ref('tasks/' + editKey).update({
      title: baseTitle,
      reward: reward,
      minVip: minVipVal,
      isFree: minVipVal === 0
    }).then(() => {
      alert('টাস্ক সফলভাবে ইডিট করা হয়েছে!');
      resetTaskForm();
    }).catch(err => alert('Error: ' + err.message));
  } else {
    const updates = {};
    for (let i = 1; i <= qty; i++) {
      const newKey = db.ref('tasks').push().key;
      const taskTitle = qty > 1 ? `${baseTitle} #${i}` : baseTitle;
      updates['tasks/' + newKey] = {
        id: newKey,
        title: taskTitle,
        reward: reward,
        minVip: minVipVal,
        isFree: minVipVal === 0,
        timestamp: firebase.database.ServerValue.TIMESTAMP
      };
    }

    db.ref().update(updates).then(() => {
      alert(`সফলভাবে VIP Level ${minVipVal}-এর জন্য ${qty}টি টাস্ক সেভ করা হয়েছে!`);
      resetTaskForm();
    }).catch(err => alert('Error: ' + err.message));
  }
}

function loadTasksAdmin() {
  db.ref('tasks').on('value', snap => {
    const list = document.getElementById('admin-tasks-list');
    if (!list) return;
    list.innerHTML = '';
    
    if (!snap.exists()) {
      list.innerHTML = '<div style="font-size:12px; color:#64748b;">কোনো টাস্ক পাওয়া যায়নি</div>';
      return;
    }

    snap.forEach(child => {
      const t = child.val();
      const key = child.key;
      const safeTitle = (t.title || '').replace(/'/g, "\\'");

      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:6px; font-size:12px;">
          <div><b>${t.title}</b> - ৳${t.reward} <small style="color:#64748b">(Level ${t.minVip})</small></div>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-sm btn-secondary" onclick="editTask('${key}', '${safeTitle}', ${t.reward}, ${t.minVip})">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="deleteTask('${key}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.deleteTask = async function(key) {
  if (confirm("আপনি কি এই টাস্কটি মুছে ফেলতে চান?")) {
    await ensureAdminFirebaseAuth();
    db.ref('tasks/' + key).remove();
  }
};

window.editTask = function(key, title, reward, minVip) {
  document.getElementById('edit-task-key').value = key;
  document.getElementById('task-title').value = title;
  document.getElementById('task-reward').value = reward;
  document.getElementById('task-min-vip').value = minVip;
  document.getElementById('task-quantity').value = 1;

  document.getElementById('task-form-title').innerText = 'টাস্ক ইডিট করুন';
  document.getElementById('btn-save-task').innerText = 'টাস্ক আপডেট করুন 💾';
  document.getElementById('btn-cancel-task-edit').classList.remove('hidden');
  showAdminSection('sec-tasks');
};

window.resetTaskForm = function() {
  document.getElementById('edit-task-key').value = '';
  document.getElementById('admin-add-task-form').reset();
  document.getElementById('task-quantity').value = 1;
  document.getElementById('task-form-title').innerText = 'টাস্ক তৈরি ও ইডিট';
  document.getElementById('btn-save-task').innerText = 'টাস্ক সেভ করুন 💾';
  document.getElementById('btn-cancel-task-edit').classList.add('hidden');
};

// ----------------------------------------------------
// 5. SOCIAL MEDIA SUPPORT FAB MANAGEMENT
// ----------------------------------------------------
async function handleSocialSubmit(e) {
  e.preventDefault();
  await ensureAdminFirebaseAuth();

  const editKey = document.getElementById('edit-social-key').value;
  const socialData = {
    name: document.getElementById('social-name').value.trim(),
    icon: document.getElementById('social-icon').value.trim(),
    url: document.getElementById('social-url').value.trim()
  };

  if (editKey) {
    db.ref('social_support/' + editKey).update(socialData).then(() => {
      alert('সোশ্যাল সাপোর্ট লিংক আপডেট হয়েছে!');
      resetSocialForm();
    });
  } else {
    const newRef = db.ref('social_support').push();
    socialData.id = newRef.key;
    newRef.set(socialData).then(() => {
      alert('নতুন সোশ্যাল সাপোর্ট লিংক যোগ করা হয়েছে!');
      resetSocialForm();
    });
  }
}

function loadSocialSupportAdmin() {
  db.ref('social_support').on('value', snap => {
    const list = document.getElementById('admin-social-list');
    if (!list) return;
    list.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      const s = child.val();
      const key = child.key;
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:6px; font-size:12px;">
          <div><i class="${s.icon}" style="color:#05b381; font-size:16px;"></i> <b>${s.name}</b><br><small style="color:#64748b">${s.url}</small></div>
          <div>
            <button class="btn-action-sm btn-danger" onclick="deleteSocial('${key}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.deleteSocial = async function(key) {
  if (confirm("আপনি কি এই সোশ্যাল লিংকটি মুছে ফেলতে চান?")) {
    await ensureAdminFirebaseAuth();
    db.ref('social_support/' + key).remove();
  }
};

function resetSocialForm() {
  document.getElementById('edit-social-key').value = '';
  document.getElementById('admin-social-form').reset();
}

// ----------------------------------------------------
// 6. DEPOSITS MANAGEMENT
// ----------------------------------------------------
function loadDepositsAdmin() {
  db.ref('deposits').on('value', snap => {
    const tbody = document.getElementById('admin-dep-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    let pendingCount = 0;

    if (!snap.exists()) {
      if (document.getElementById('stat-pending-dep')) document.getElementById('stat-pending-dep').innerText = 0;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং ডিপোজিট নেই</td></tr>';
      return;
    }

    snap.forEach(child => {
      const d = child.val();
      if (d.status === 'pending') {
        pendingCount++;
        const targetText = d.targetPlan && d.targetPlan !== 'wallet' ? `<br><small style="color:#05b381; font-weight:bold;">Target: ${d.targetPlan.planName}</small>` : '';
        
        tbody.innerHTML += `
          <tr>
            <td>${d.email || 'User'}${targetText}</td>
            <td><b>${d.method}</b></td>
            <td>৳${d.amount}</td>
            <td><code>${d.trxId}</code></td>
            <td>
              <div style="display:flex; gap:4px;">
                <button class="btn-action-sm btn-success" onclick="approveDeposit('${child.key}', '${d.uid}', ${d.amount})">Approve</button>
                <button class="btn-action-sm btn-danger" onclick="rejectDeposit('${child.key}')">Reject</button>
              </div>
            </td>
          </tr>
        `;
      }
    });

    if (pendingCount === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং ডিপোজিট নেই</td></tr>';
    }
    if (document.getElementById('stat-pending-dep')) {
      document.getElementById('stat-pending-dep').innerText = pendingCount;
    }
  });
}

window.approveDeposit = async function(depId, uid, amount) {
  try {
    await ensureAdminFirebaseAuth();

    const depSnap = await db.ref('deposits/' + depId).once('value');
    if (!depSnap.exists()) return alert('ডিপোজিট রেকর্ড পাওয়া যায়নি!');
    const depData = depSnap.val();

    const userSnap = await db.ref('users/' + uid).once('value');
    if (!userSnap.exists()) return alert('ইউজার ডাটা পাওয়া যায়নি!');
    const user = userSnap.val();

    const updates = {};
    let activatedPlanName = null;

    if (depData.targetPlan && depData.targetPlan !== 'wallet' && typeof depData.targetPlan === 'object') {
      const target = depData.targetPlan;
      const durationDays = Number(target.durationDays || 30);
      const nowMs = Date.now();
      const expireMs = nowMs + (durationDays * 24 * 60 * 60 * 1000);

      updates[`users/${uid}/vipLevel`] = target.vipLevel;
      updates[`users/${uid}/vipPlanName`] = target.planName;
      updates[`users/${uid}/maxDailyTasks`] = target.dailyTasks;
      updates[`users/${uid}/vipDailyProfit`] = target.dailyProfit;
      updates[`users/${uid}/vipActivatedAt`] = nowMs;
      updates[`users/${uid}/vipExpireAt`] = expireMs;
      activatedPlanName = target.planName;

      const planSnap = await db.ref('plans').orderByChild('vipLevel').equalTo(target.vipLevel).once('value');
      if (planSnap.exists()) {
        planSnap.forEach(p => {
          updates[`users/${uid}/withdrawChargePercent`] = p.val().withdrawChargePercent || 5;
        });
      }
    } else {
      updates[`users/${uid}/depositBalance`] = (user.depositBalance || 0) + amount;
    }

    updates[`deposits/${depId}/status`] = 'approved';

    await db.ref().update(updates);

    if (activatedPlanName && user.referredBy) {
      processReferralCommission(user.referredBy, user.name || 'User', user.refCode || 'N/A', amount, activatedPlanName);
    }

    alert('ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে!');
  } catch (err) {
    alert('অনুমোদন ব্যর্থ: ' + err.message);
  }
};

window.rejectDeposit = async function(depId) {
  try {
    await ensureAdminFirebaseAuth();
    await db.ref('deposits/' + depId + '/status').set('rejected');
    alert('ডিপোজিট রিকোয়েস্ট বাতিল করা হয়েছে।');
  } catch (err) {
    alert('বাতিল ব্যর্থ: ' + err.message);
  }
};

function processReferralCommission(referrerRefCode, buyerName, buyerRefCode, planPrice, planName) {
  db.ref('users').orderByChild('refCode').equalTo(referrerRefCode).once('value', snap => {
    if (!snap.exists()) return;

    snap.forEach(child => {
      const referrerUid = child.key;
      const referrerData = child.val();

      if (referrerData.vipLevel && referrerData.vipLevel > 0) {
        db.ref('plans').orderByChild('name').equalTo(planName).once('value', planSnap => {
          let commPercent = 10;
          if (planSnap.exists()) {
            planSnap.forEach(p => commPercent = p.val().refCommissionPercent || 10);
          }

          const commBonus = planPrice * (commPercent / 100);
          const refUpdates = {};
          refUpdates[`users/${referrerUid}/incomeBalance`] = (referrerData.incomeBalance || 0) + commBonus;

          db.ref().update(refUpdates).then(() => {
            const histRef = db.ref('history').push();
            histRef.set({
              uid: referrerUid,
              type: 'Referral Bonus',
              amount: commBonus,
              title: `Referral Bonus (${commPercent}%) for ${planName}`,
              status: 'approved',
              timestamp: firebase.database.ServerValue.TIMESTAMP
            });

            const refCommRef = db.ref('referral_commissions/' + referrerUid).push();
            refCommRef.set({
              buyerName: buyerName || 'User',
              buyerRefCode: buyerRefCode || 'N/A',
              planName: planName,
              planPrice: planPrice,
              commissionPercent: commPercent,
              commissionAmount: commBonus,
              timestamp: firebase.database.ServerValue.TIMESTAMP
            });
          });
        });
      }
    });
  });
}

// ----------------------------------------------------
// 7. WITHDRAWALS MANAGEMENT
// ----------------------------------------------------
function loadWithdrawsAdmin() {
  db.ref('withdraws').on('value', snap => {
    const tbody = document.getElementById('admin-wit-table');
    if (!tbody) return;
    tbody.innerHTML = '';
    let pendingCount = 0;

    if (!snap.exists()) {
      if (document.getElementById('stat-pending-wit')) document.getElementById('stat-pending-wit').innerText = 0;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং উত্তোলন নেই</td></tr>';
      return;
    }

    snap.forEach(child => {
      const w = child.val();
      if (w.status === 'pending') {
        pendingCount++;
        tbody.innerHTML += `
          <tr>
            <td>${w.email || 'User'}</td>
            <td><b>${w.method}</b></td>
            <td><code>${w.walletNumber}</code></td>
            <td>৳${w.amount} <small style="color:#64748b">(Net: ৳${w.netAmount || w.amount})</small></td>
            <td>
              <div style="display:flex; gap:4px;">
                <button class="btn-action-sm btn-success" onclick="approveWithdraw('${child.key}')">Approve</button>
                <button class="btn-action-sm btn-danger" onclick="rejectWithdraw('${child.key}', '${w.uid}', ${w.amount})">Reject</button>
              </div>
            </td>
          </tr>
        `;
      }
    });

    if (pendingCount === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং উত্তোলন নেই</td></tr>';
    }
    if (document.getElementById('stat-pending-wit')) {
      document.getElementById('stat-pending-wit').innerText = pendingCount;
    }
  });
}

window.approveWithdraw = async function(witId) {
  try {
    await ensureAdminFirebaseAuth();
    await db.ref('withdraws/' + witId + '/status').set('approved');
    alert('উত্তোলন রিকোয়েস্ট সফলভাবে অনুমোদন করা হয়েছে!');
  } catch (err) {
    alert('অনুমোদন ব্যর্থ: ' + err.message);
  }
};

window.rejectWithdraw = async function(witId, uid, amount) {
  try {
    await ensureAdminFirebaseAuth();
    const uSnap = await db.ref('users/' + uid).once('value');
    const u = uSnap.val() || {};
    
    const updates = {};
    updates[`users/${uid}/incomeBalance`] = (u.incomeBalance || 0) + amount;
    updates[`withdraws/${witId}/status`] = 'rejected';

    await db.ref().update(updates);
    alert('উত্তোলন বাতিল করা হয়েছে এবং ইউজারের ব্যালেন্স রিফান্ড করা হয়েছে।');
  } catch (err) {
    alert('বাতিল ব্যর্থ: ' + err.message);
  }
};

// ----------------------------------------------------
// 8. UNLIMITED PAYMENT GATEWAYS
// ----------------------------------------------------
async function handleGatewaySubmit(e) {
  e.preventDefault();
  await ensureAdminFirebaseAuth();

  const editKey = document.getElementById('edit-gateway-key').value;
  const gatewayData = {
    name: document.getElementById('gateway-name').value.trim(),
    type: document.getElementById('gateway-type').value,
    number: document.getElementById('gateway-number').value.trim(),
    logoUrl: document.getElementById('gateway-logo').value.trim()
  };

  if (editKey) {
    db.ref('payment_gateways/' + editKey).update(gatewayData).then(() => {
      alert('পেমেন্ট মেথড সফলভাবে আপডেট হয়েছে!');
      resetGatewayForm();
    });
  } else {
    const newRef = db.ref('payment_gateways').push();
    gatewayData.id = newRef.key;
    newRef.set(gatewayData).then(() => {
      alert('নতুন পেমেন্ট মেথড যোগ করা হয়েছে!');
      resetGatewayForm();
    });
  }
}

function loadGatewaysAdmin() {
  db.ref('payment_gateways').on('value', snap => {
    const list = document.getElementById('admin-gateways-list');
    if (!list) return;
    list.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      const g = child.val();
      const key = child.key;
      const safeName = (g.name || '').replace(/'/g, "\\'");
      const safeNumber = (g.number || '').replace(/'/g, "\\'");
      const safeLogo = (g.logoUrl || '').replace(/'/g, "\\'");

      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:6px; font-size:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="${g.logoUrl || 'https://i.ibb.co/3yn9j8p/bkash.png'}" style="width:28px; height:28px; object-fit:contain;">
            <div><b>${g.name}</b> (${g.type})<br><small style="color:#64748b">${g.number}</small></div>
          </div>
          <div style="display:flex; gap:6px;">
            <button class="btn-action-sm btn-secondary" onclick="editGateway('${key}', '${safeName}', '${g.type}', '${safeNumber}', '${safeLogo}')">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="deleteGateway('${key}')">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.deleteGateway = async function(key) {
  if (confirm("আপনি কি এই পেমেন্ট মেথডটি মুছে ফেলতে চান?")) {
    await ensureAdminFirebaseAuth();
    db.ref('payment_gateways/' + key).remove();
  }
};

window.editGateway = function(key, name, type, number, logo) {
  document.getElementById('edit-gateway-key').value = key;
  document.getElementById('gateway-name').value = name;
  document.getElementById('gateway-type').value = type;
  document.getElementById('gateway-number').value = number;
  document.getElementById('gateway-logo').value = logo;
  showAdminSection('sec-gateways');
};

window.resetGatewayForm = function() {
  document.getElementById('edit-gateway-key').value = '';
  document.getElementById('admin-gateway-form').reset();
};

// ----------------------------------------------------
// 9. SLIDER, WELCOME NOTICE & BROADCAST
// ----------------------------------------------------
window.addSliderBannerImage = async function() {
  await ensureAdminFirebaseAuth();
  const urlEl = document.getElementById('admin-slider-url-input');
  const url = urlEl ? urlEl.value.trim() : '';
  if (!url) return alert('ইমেজের URL দিন');
  db.ref('slider').push({ url: url }).then(() => {
    alert('স্লাইডার ইমেজ এড হয়েছে!');
    if (urlEl) urlEl.value = '';
  });
};

function loadSlidersAdmin() {
  db.ref('slider').on('value', snap => {
    const list = document.getElementById('admin-sliders-list');
    if (!list) return;
    list.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 10px; background:#f8fafc; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:6px;">
          <img src="${child.val().url}" style="width:70px; height:40px; border-radius:6px; object-fit:cover;">
          <button class="btn-action-sm btn-danger" onclick="deleteSlider('${child.key}')">Delete</button>
        </div>
      `;
    });
  });
}

window.deleteSlider = async function(key) {
  if (confirm("আপনি কি এই স্লাইডার ইমেজটি মুছে ফেলতে চান?")) {
    await ensureAdminFirebaseAuth();
    db.ref('slider/' + key).remove();
  }
};

window.saveWelcomePopUpNotice = async function() {
  await ensureAdminFirebaseAuth();
  db.ref('notices/welcome').set({
    title: document.getElementById('welcome-title-input').value,
    text: document.getElementById('welcome-text-input').value,
    image: document.getElementById('welcome-image-input').value,
    btnText: document.getElementById('welcome-btn-text-input').value,
    btnUrl: document.getElementById('welcome-btn-url-input').value,
    enabled: document.getElementById('welcome-enable-toggle').checked
  }).then(() => alert('পপ-আপ ওয়েলকাম নোটিশ সেভ করা হয়েছে!'));
};

function loadWelcomeNoticeAdmin() {
  db.ref('notices/welcome').once('value', snap => {
    if (snap.exists()) {
      const w = snap.val();
      if (document.getElementById('welcome-title-input')) document.getElementById('welcome-title-input').value = w.title || '';
      if (document.getElementById('welcome-text-input')) document.getElementById('welcome-text-input').value = w.text || '';
      if (document.getElementById('welcome-image-input')) document.getElementById('welcome-image-input').value = w.image || '';
      if (document.getElementById('welcome-btn-text-input')) document.getElementById('welcome-btn-text-input').value = w.btnText || '';
      if (document.getElementById('welcome-btn-url-input')) document.getElementById('welcome-btn-url-input').value = w.btnUrl || '';
      if (document.getElementById('welcome-enable-toggle')) document.getElementById('welcome-enable-toggle').checked = w.enabled !== false;
    }
  });
}

window.saveMarqueeNotice = async function() {
  await ensureAdminFirebaseAuth();
  const text = document.getElementById('admin-notice-input').value.trim();
  if (!text) return alert('নোটিশ টেক্সট লিখুন');
  db.ref('notices/main').set({ text: text, updatedAt: firebase.database.ServerValue.TIMESTAMP }).then(() => alert('নোটিশ আপডেট হয়েছে!'));
};

window.sendBroadcastNotification = async function() {
  await ensureAdminFirebaseAuth();
  const title = document.getElementById('notif-broadcast-title').value.trim();
  const desc = document.getElementById('notif-broadcast-desc').value.trim();
  if (!title || !desc) return alert('টাইটেল ও মেসেজ দুটিই লিখুন।');

  db.ref('notifications/broadcast').set({
    title: title, desc: desc, timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('পুশ নোটিফিকেশন ব্রডকাস্ট পাঠানো হয়েছে! 🚀');
    document.getElementById('notif-broadcast-title').value = '';
    document.getElementById('notif-broadcast-desc').value = '';
  });
};
