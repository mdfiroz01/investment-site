const ADMIN_PASS = "admin3";

window.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
    showAdminDashboard();
  }
});

document.getElementById('admin-login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const pass = document.getElementById('admin-pass').value;

  if (pass === ADMIN_PASS) {
    sessionStorage.setItem('isAdminLoggedIn', 'true');
    showAdminDashboard();
  } else {
    alert("ভুল এডমিন পাসওয়ার্ড! সঠিক পাসওয়ার্ড দিন: admin3");
  }
});

function showAdminDashboard() {
  document.getElementById('admin-auth').classList.add('hidden');
  document.getElementById('admin-panel').classList.remove('hidden');
  loadAdminDashboard();
}

window.adminLogout = function() {
  sessionStorage.removeItem('isAdminLoggedIn');
  document.getElementById('admin-auth').classList.remove('hidden');
  document.getElementById('admin-panel').classList.add('hidden');
};

// ADMIN SIDEBAR DRAWER & SECTION SWITCHING
window.openAdminSidebar = function() {
  document.getElementById('admin-sidebar-drawer').classList.add('open');
  document.getElementById('admin-sidebar-overlay').classList.add('open');
};

window.closeAdminSidebar = function() {
  document.getElementById('admin-sidebar-drawer').classList.remove('open');
  document.getElementById('admin-sidebar-overlay').classList.remove('open');
};

window.showAdminSection = function(secId) {
  closeAdminSidebar();
  document.querySelectorAll('.admin-section').forEach(s => s.classList.add('hidden'));
  
  const target = document.getElementById(secId);
  if (target) {
    target.classList.remove('hidden');
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
  loadWelcomeNoticeAdmin();
  loadSettingsAdmin();
}

// ----------------------------------------------------
// 1. SYSTEM SETTINGS
// ----------------------------------------------------
window.saveSystemSettings = function() {
  const logoUrl = document.getElementById('cfg-site-logo').value;
  const minWithdraw = parseFloat(document.getElementById('cfg-min-withdraw').value) || 200;
  const withdrawChargePercent = parseFloat(document.getElementById('cfg-withdraw-charge').value) || 5;

  db.ref('settings/config').set({
    logoUrl: logoUrl,
    minWithdraw: minWithdraw,
    withdrawChargePercent: withdrawChargePercent
  }).then(() => alert('সাইট সেটিংস সফলভাবে সেভ করা হয়েছে!'));
};

function loadSettingsAdmin() {
  db.ref('settings/config').once('value', snap => {
    if (snap.exists()) {
      const cfg = snap.val();
      document.getElementById('cfg-site-logo').value = cfg.logoUrl || '';
      document.getElementById('cfg-min-withdraw').value = cfg.minWithdraw || 200;
      document.getElementById('cfg-withdraw-charge').value = cfg.withdrawChargePercent || 5;
    }
  });

  db.ref('notices/main').once('value', snap => {
    if (snap.exists()) {
      document.getElementById('admin-notice-input').value = snap.val().text || '';
    }
  });
}

// ----------------------------------------------------
// 2. USER MANAGEMENT
// ----------------------------------------------------
function loadUsersAdmin() {
  db.ref('users').on('value', snap => {
    document.getElementById('stat-users').innerText = snap.exists() ? snap.numChildren() : 0;
    const tbody = document.getElementById('admin-users-table');
    tbody.innerHTML = '';

    if (!snap.exists()) return;

    snap.forEach(child => {
      const u = child.val();
      const uid = child.key;
      const isBlocked = u.isBlocked === true;
      const totalBal = (u.depositBalance || 0) + (u.incomeBalance || 0);

      tbody.innerHTML += `
        <tr>
          <td><b>${u.name || 'User'}</b><br><small>${u.email || ''}</small></td>
          <td>৳${totalBal.toFixed(2)}</td>
          <td>VIP ${u.vipLevel || 0}</td>
          <td>
            <button class="btn-action-sm btn-info" onclick="viewFullUserInfo('${uid}')">Full Info</button>
            <button class="btn-action-sm btn-secondary" onclick="openEditUserModal('${uid}', '${u.name || ''}', '${u.phone || ''}', ${u.depositBalance || 0}, ${u.incomeBalance || 0}, ${u.vipLevel || 0})">Edit</button>
            <button class="btn-action-sm ${isBlocked ? 'btn-success' : 'btn-danger'}" onclick="toggleBlockUser('${uid}', ${!isBlocked})">
              ${isBlocked ? 'Unblock' : 'Block'}
            </button>
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
    
    modalBody.innerHTML = `
      <div><b>ইউজার নাম:</b> ${u.name || 'N/A'}</div>
      <div><b>ইমেইল:</b> ${u.email || 'N/A'}</div>
      <div><b>ফোন নম্বর:</b> ${u.phone || 'N/A'}</div>
      <div><b>কান্ট্রি:</b> ${u.country || 'N/A'}</div>
      <div><b>ডিপোজিট ব্যালেন্স:</b> ৳${(u.depositBalance || 0).toFixed(2)}</div>
      <div><b>ইনকাম ব্যালেন্স:</b> ৳${(u.incomeBalance || 0).toFixed(2)}</div>
      <div><b>মোট ব্যালেন্স:</b> ৳${((u.depositBalance || 0) + (u.incomeBalance || 0)).toFixed(2)}</div>
      <div><b>এক্টিভ VIP লেভেল:</b> VIP ${u.vipLevel || 0} (${u.vipPlanName || 'নো প্ল্যান'})</div>
      <div><b>উইথড্র ফি (%):</b> ${u.withdrawChargePercent || 5}%</div>
      <div><b>নিজের রেফার কোড:</b> ${u.refCode || 'N/A'}</div>
      <div><b>যার রেফারে জয়েন করেছে:</b> ${u.referredBy || 'কারো রেফারে নয়'}</div>
      <div><b>স্ট্যাটাস:</b> <span style="color:${u.isBlocked ? 'red':'green'}; font-weight:bold;">${u.isBlocked ? 'Blocked' : 'Active'}</span></div>
    `;

    document.getElementById('user-info-modal').classList.remove('hidden');
  });
};

window.closeUserInfoModal = function() {
  document.getElementById('user-info-modal').classList.add('hidden');
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
  document.getElementById('edit-user-modal').classList.add('hidden');
};

window.saveUserEdit = function() {
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
  });
};

window.toggleBlockUser = function(uid, blockState) {
  const actionText = blockState ? 'ব্লক' : 'আনব্লক';
  if (confirm(`আপনি কি এই ইউজারকে ${actionText} করতে চান?`)) {
    db.ref('users/' + uid + '/isBlocked').set(blockState).then(() => {
      alert(`ইউজার সফলভাবে ${actionText} করা হয়েছে!`);
    });
  }
};

// ----------------------------------------------------
// 3. VIP PLAN EDIT & REFERRAL/WITHDRAW CHARGE %
// ----------------------------------------------------
document.getElementById('admin-add-plan-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const editKey = document.getElementById('edit-plan-key').value;
  const planData = {
    name: document.getElementById('plan-name').value,
    price: parseFloat(document.getElementById('plan-price').value),
    dailyTasks: parseInt(document.getElementById('plan-daily-tasks').value),
    dailyProfit: parseFloat(document.getElementById('plan-daily-profit').value),
    durationDays: parseInt(document.getElementById('plan-duration').value),
    vipLevel: parseInt(document.getElementById('plan-vip-level').value),
    refCommissionPercent: parseFloat(document.getElementById('plan-ref-commission').value) || 10,
    withdrawChargePercent: parseFloat(document.getElementById('plan-withdraw-charge').value) || 5,
    badgeText: document.getElementById('plan-badge-text').value,
    isSoldOut: document.getElementById('plan-is-soldout').checked
  };

  if (editKey) {
    db.ref('plans/' + editKey).update(planData).then(() => {
      alert('VIP প্ল্যান সফলভাবে ইডিট করা হয়েছে!');
      resetPlanForm();
    });
  } else {
    db.ref('plans').push(planData).then(() => {
      alert('নতুন VIP প্ল্যান সফলভাবে যোগ করা হয়েছে!');
      resetPlanForm();
    });
  }
});

function loadPlansAdmin() {
  db.ref('plans').on('value', snap => {
    const container = document.getElementById('admin-plans-list');
    container.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      const p = child.val();
      const key = child.key;
      container.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:12px;">
          <div>
            <b>${p.name}</b> - ৳${p.price} (VIP ${p.vipLevel}) 
            <small style="color:#05b381">[Ref: ${p.refCommissionPercent || 10}%, Wit Fee: ${p.withdrawChargePercent !== undefined ? p.withdrawChargePercent : 5}%]</small>
            ${p.badgeText ? `<span style="color:#ef4444; font-weight:bold;">[${p.badgeText}]</span>` : ''}
          </div>
          <div>
            <button class="btn-action-sm btn-secondary" onclick="editPlan('${key}', '${p.name}', ${p.price}, ${p.dailyTasks}, ${p.dailyProfit}, ${p.durationDays}, ${p.vipLevel}, ${p.refCommissionPercent || 10}, ${p.withdrawChargePercent !== undefined ? p.withdrawChargePercent : 5}, '${p.badgeText || ''}', ${p.isSoldOut === true})">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="db.ref('plans/${key}').remove()">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.editPlan = function(key, name, price, dailyTasks, dailyProfit, duration, vip, refComm, witCharge, badgeText, isSoldOut) {
  document.getElementById('edit-plan-key').value = key;
  document.getElementById('plan-name').value = name;
  document.getElementById('plan-price').value = price;
  document.getElementById('plan-daily-tasks').value = dailyTasks;
  document.getElementById('plan-daily-profit').value = dailyProfit;
  document.getElementById('plan-duration').value = duration;
  document.getElementById('plan-vip-level').value = vip;
  document.getElementById('plan-ref-commission').value = refComm;
  document.getElementById('plan-withdraw-charge').value = witCharge;
  document.getElementById('plan-badge-text').value = badgeText;
  document.getElementById('plan-is-soldout').checked = isSoldOut;

  document.getElementById('plan-form-title').innerText = 'VIP প্ল্যান ইডিট করুন';
  document.getElementById('btn-save-plan').innerText = 'আপডেট সেভ করুন';
  document.getElementById('btn-cancel-plan-edit').classList.remove('hidden');
  showAdminSection('sec-plans');
};

window.resetPlanForm = function() {
  document.getElementById('edit-plan-key').value = '';
  document.getElementById('admin-add-plan-form').reset();
  document.getElementById('plan-form-title').innerText = 'VIP প্ল্যান তৈরি / ইডিট';
  document.getElementById('btn-save-plan').innerText = 'প্ল্যান সেভ করুন';
  document.getElementById('btn-cancel-plan-edit').classList.add('hidden');
};

// ----------------------------------------------------
// 4. DEPOSITS APPROVAL & DIRECT PLAN ACTIVATION
// ----------------------------------------------------
function loadDepositsAdmin() {
  db.ref('deposits').on('value', snap => {
    const tbody = document.getElementById('admin-dep-table');
    tbody.innerHTML = '';
    let pendingCount = 0;

    if (!snap.exists()) {
      document.getElementById('stat-pending-dep').innerText = 0;
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং ডিপোজিট নেই</td></tr>';
      return;
    }

    snap.forEach(child => {
      const d = child.val();
      if (d.status === 'pending') {
        pendingCount++;
        const targetText = d.targetPlan && d.targetPlan !== 'wallet' ? `<br><small style="color:#05b381">Target: ${d.targetPlan.planName}</small>` : '';
        
        tbody.innerHTML += `
          <tr>
            <td>${d.email || 'User'}${targetText}</td>
            <td>${d.method}</td>
            <td>৳${d.amount}</td>
            <td>${d.trxId}</td>
            <td>
              <button class="btn-action-sm btn-success" onclick="approveDeposit('${child.key}', '${d.uid}', ${d.amount})">Approve</button>
              <button class="btn-action-sm btn-danger" onclick="db.ref('deposits/${child.key}/status').set('rejected')">Reject</button>
            </td>
          </tr>
        `;
      }
    });

    if (pendingCount === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং ডিপোজিট নেই</td></tr>';
    }
    document.getElementById('stat-pending-dep').innerText = pendingCount;
  });
}

window.approveDeposit = function(depId, uid, amount) {
  db.ref('deposits/' + depId).once('value', depSnap => {
    if (!depSnap.exists()) return;
    const depData = depSnap.val();

    db.ref('users/' + uid).once('value', userSnap => {
      if (!userSnap.exists()) return;
      const user = userSnap.val();
      const updates = {};
      
      let activatedPlanName = null;
      let activatedPlanPrice = amount;

      if (depData.targetPlan && depData.targetPlan !== 'wallet' && typeof depData.targetPlan === 'object') {
        const target = depData.targetPlan;
        updates[`users/${uid}/vipLevel`] = target.vipLevel;
        updates[`users/${uid}/vipPlanName`] = target.planName;
        updates[`users/${uid}/maxDailyTasks`] = target.dailyTasks;
        updates[`users/${uid}/vipDailyProfit`] = target.dailyProfit;
        activatedPlanName = target.planName;

        db.ref('plans').orderByChild('vipLevel').equalTo(target.vipLevel).once('value', pSnap => {
          if (pSnap.exists()) {
            pSnap.forEach(p => {
              updates[`users/${uid}/withdrawChargePercent`] = p.val().withdrawChargePercent || 5;
            });
          }
        });
      } else {
        updates[`users/${uid}/depositBalance`] = (user.depositBalance || 0) + amount;
      }

      updates[`deposits/${depId}/status`] = 'approved';

      db.ref().update(updates).then(() => {
        if (activatedPlanName && user.referredBy) {
          processReferralCommission(user.referredBy, user.name || 'User', user.refCode || 'N/A', activatedPlanPrice, activatedPlanName);
        }

        alert('ডিপোজিট সফলভাবে অনুমোদন করা হয়েছে!');
      });
    });
  });
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
// 5. WITHDRAWALS
// ----------------------------------------------------
function loadWithdrawsAdmin() {
  db.ref('withdraws').on('value', snap => {
    const tbody = document.getElementById('admin-wit-table');
    tbody.innerHTML = '';
    let pendingCount = 0;

    if (!snap.exists()) {
      document.getElementById('stat-pending-wit').innerText = 0;
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
            <td>${w.method}</td>
            <td>${w.walletNumber}</td>
            <td>৳${w.amount} <small style="color:#64748b">(Net: ৳${w.netAmount || w.amount})</small></td>
            <td>
              <button class="btn-action-sm btn-success" onclick="db.ref('withdraws/${child.key}/status').set('approved')">Approve</button>
              <button class="btn-action-sm btn-danger" onclick="rejectWithdraw('${child.key}', '${w.uid}', ${w.amount})">Reject</button>
            </td>
          </tr>
        `;
      }
    });

    if (pendingCount === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">কোনো পেন্ডিং উত্তোলন নেই</td></tr>';
    }
    document.getElementById('stat-pending-wit').innerText = pendingCount;
  });
}

window.rejectWithdraw = function(witId, uid, amount) {
  db.ref('users/' + uid).once('value', snap => {
    const u = snap.val() || {};
    const updates = {};
    updates[`users/${uid}/incomeBalance`] = (u.incomeBalance || 0) + amount;
    updates[`withdraws/${witId}/status`] = 'rejected';

    db.ref().update(updates).then(() => alert('উত্তোলন বাতিল ও ব্যালেন্স রিফান্ড করা হয়েছে।'));
  });
};

// UNLIMITED DYNAMIC PAYMENT GATEWAYS
document.getElementById('admin-gateway-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const editKey = document.getElementById('edit-gateway-key').value;
  const gatewayData = {
    name: document.getElementById('gateway-name').value,
    type: document.getElementById('gateway-type').value,
    number: document.getElementById('gateway-number').value,
    logoUrl: document.getElementById('gateway-logo').value
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
});

function loadGatewaysAdmin() {
  db.ref('payment_gateways').on('value', snap => {
    const list = document.getElementById('admin-gateways-list');
    list.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      const g = child.val();
      const key = child.key;
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0; font-size:12px;">
          <div style="display:flex; align-items:center; gap:8px;">
            <img src="${g.logoUrl || 'https://i.ibb.co/3yn9j8p/bkash.png'}" style="width:28px; height:28px; object-fit:contain;">
            <div><b>${g.name}</b> (${g.type})<br><small>${g.number}</small></div>
          </div>
          <div>
            <button class="btn-action-sm btn-secondary" onclick="editGateway('${key}', '${g.name}', '${g.type}', '${g.number}', '${g.logoUrl}')">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="db.ref('payment_gateways/${key}').remove()">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

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

// TASKS MANAGEMENT
document.getElementById('admin-add-task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const editKey = document.getElementById('edit-task-key').value;
  const minVipVal = parseInt(document.getElementById('task-min-vip').value) || 0;

  const taskData = {
    title: document.getElementById('task-title').value,
    reward: parseFloat(document.getElementById('task-reward').value),
    minVip: minVipVal,
    isFree: minVipVal === 0
  };

  if (editKey) {
    db.ref('tasks/' + editKey).update(taskData).then(() => {
      alert('টাস্ক সফলভাবে ইডিট করা হয়েছে!');
      resetTaskForm();
    });
  } else {
    const newRef = db.ref('tasks').push();
    taskData.id = newRef.key;
    newRef.set(taskData).then(() => {
      alert('নতুন টাস্ক সফলভাবে যোগ করা হয়েছে!');
      resetTaskForm();
    });
  }
});

function loadTasksAdmin() {
  db.ref('tasks').on('value', snap => {
    const list = document.getElementById('admin-tasks-list');
    list.innerHTML = '';
    if (!snap.exists()) return;

    snap.forEach(child => {
      const t = child.val();
      const key = child.key;
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #e2e8f0; font-size:12px;">
          <div><b>${t.title}</b> - ৳${t.reward} (Level ${t.minVip})</div>
          <div>
            <button class="btn-action-sm btn-secondary" onclick="editTask('${key}', '${t.title}', ${t.reward}, ${t.minVip})">Edit</button>
            <button class="btn-action-sm btn-danger" onclick="db.ref('tasks/${key}').remove()">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.editTask = function(key, title, reward, minVip) {
  document.getElementById('edit-task-key').value = key;
  document.getElementById('task-title').value = title;
  document.getElementById('task-reward').value = reward;
  document.getElementById('task-min-vip').value = minVip;
  showAdminSection('sec-tasks');
};

window.resetTaskForm = function() {
  document.getElementById('edit-task-key').value = '';
  document.getElementById('admin-add-task-form').reset();
};

// SLIDER, WELCOME NOTICE & BROADCAST
window.addSliderBannerImage = function() {
  const url = document.getElementById('admin-slider-url-input').value;
  if (!url) return alert('ইমেজের URL দিন');
  db.ref('slider').push({ url: url }).then(() => {
    alert('স্লাইডার ইমেজ এড হয়েছে!');
    document.getElementById('admin-slider-url-input').value = '';
  });
};

function loadSlidersAdmin() {
  db.ref('slider').on('value', snap => {
    const list = document.getElementById('admin-sliders-list');
    list.innerHTML = '';
    if (!snap.exists()) return;
    snap.forEach(child => {
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;">
          <img src="${child.val().url}" style="width:60px; height:35px; border-radius:6px; object-fit:cover;">
          <button class="btn-action-sm btn-danger" onclick="db.ref('slider/${child.key}').remove()">Delete</button>
        </div>
      `;
    });
  });
}

window.saveWelcomePopUpNotice = function() {
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
      document.getElementById('welcome-title-input').value = w.title || '';
      document.getElementById('welcome-text-input').value = w.text || '';
      document.getElementById('welcome-image-input').value = w.image || '';
      document.getElementById('welcome-btn-text-input').value = w.btnText || '';
      document.getElementById('welcome-btn-url-input').value = w.btnUrl || '';
      document.getElementById('welcome-enable-toggle').checked = w.enabled !== false;
    }
  });
}

window.saveMarqueeNotice = function() {
  const text = document.getElementById('admin-notice-input').value;
  if (!text) return;
  db.ref('notices/main').set({ text: text, updatedAt: firebase.database.ServerValue.TIMESTAMP }).then(() => alert('নোটিশ আপডেট হয়েছে!'));
};

window.sendBroadcastNotification = function() {
  const title = document.getElementById('notif-broadcast-title').value;
  const desc = document.getElementById('notif-broadcast-desc').value;
  if (!title || !desc) return alert('টাইটেল ও মেসেজ দুটিই লিখুন।');

  db.ref('notifications/broadcast').set({
    title: title, desc: desc, timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('পুশ নোটিফিকেশন ব্রডকাস্ট পাঠানো হয়েছে! 🚀');
    document.getElementById('notif-broadcast-title').value = '';
    document.getElementById('notif-broadcast-desc').value = '';
  });
};
