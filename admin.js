
const ADMIN_PASS = "admin3";

// AUTO CHECK SESSION LOGIN
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
// 1. UNLIMITED DYNAMIC PAYMENT GATEWAYS CRUD
// ----------------------------------------------------
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
    if (!snap.exists()) {
      list.innerHTML = '<div style="font-size:12px; color:var(--text-muted)">কোনো কাস্টম পেমেন্ট মেথড নেই</div>';
      return;
    }

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
            <button style="background:#3b82f6; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="editGateway('${key}', '${g.name}', '${g.type}', '${g.number}', '${g.logoUrl}')">Edit</button>
            <button style="background:#ef4444; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="db.ref('payment_gateways/${key}').remove()">Delete</button>
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

  document.getElementById('gateway-form-title').innerText = 'পেমেন্ট মেথড ইডিট করুন';
  document.getElementById('btn-save-gateway').innerText = 'মেথড আপডেট করুন';
  document.getElementById('btn-cancel-gateway').classList.remove('hidden');
  showAdminSection('sec-gateways');
};

window.resetGatewayForm = function() {
  document.getElementById('edit-gateway-key').value = '';
  document.getElementById('admin-gateway-form').reset();
  document.getElementById('gateway-form-title').innerText = 'আনলিমিটেড পেমেন্ট মেথড তৈরি ও এড';
  document.getElementById('btn-save-gateway').innerText = 'মেথড সেভ করুন';
  document.getElementById('btn-cancel-gateway').classList.add('hidden');
};

// ----------------------------------------------------
// 2. HOMEPAGE SLIDER MANAGEMENT
// ----------------------------------------------------
window.addSliderBannerImage = function() {
  const url = document.getElementById('admin-slider-url-input').value;
  if (!url) {
    alert('অনুগ্রহ করে ব্যানার ইমেজের URL দিন।');
    return;
  }

  db.ref('slider').push({ url: url }).then(() => {
    alert('স্লাইডার ইমেজ সফলভাবে যোগ করা হয়েছে!');
    document.getElementById('admin-slider-url-input').value = '';
  });
};

function loadSlidersAdmin() {
  db.ref('slider').on('value', snap => {
    const list = document.getElementById('admin-sliders-list');
    list.innerHTML = '';
    if (!snap.exists()) {
      list.innerHTML = '<div style="font-size:12px; color:var(--text-muted)">কোনো স্লাইডার ব্যানার নেই</div>';
      return;
    }

    snap.forEach(child => {
      const url = child.val().url;
      list.innerHTML += `
        <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #e2e8f0;">
          <img src="${url}" style="width:60px; height:35px; border-radius:6px; object-fit:cover;">
          <button style="background:#ef4444; color:white; border:none; padding:4px 8px; border-radius:6px; font-size:10px; cursor:pointer;" onclick="db.ref('slider/${child.key}').remove()">Delete</button>
        </div>
      `;
    });
  });
}

// ----------------------------------------------------
// 3. POP-UP WELCOME NOTICE
// ----------------------------------------------------
window.saveWelcomePopUpNotice = function() {
  const title = document.getElementById('welcome-title-input').value;
  const text = document.getElementById('welcome-text-input').value;
  const image = document.getElementById('welcome-image-input').value;
  const btnText = document.getElementById('welcome-btn-text-input').value;
  const btnUrl = document.getElementById('welcome-btn-url-input').value;
  const enabled = document.getElementById('welcome-enable-toggle').checked;

  db.ref('notices/welcome').set({
    title, text, image, btnText, btnUrl, enabled
  }).then(() => {
    alert('পপ-আপ ওয়েলকাম নোটিশ সেটিং সেভ করা হয়েছে!');
  });
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

// ----------------------------------------------------
// 4. USER MANAGEMENT & BAN/BLOCK
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

      tbody.innerHTML += `
        <tr>
          <td><b>${u.name || 'User'}</b><br><small>${u.email || ''}</small></td>
          <td>৳${(u.balance || 0).toFixed(2)}</td>
          <td>VIP ${u.vipLevel || 0}</td>
          <td>
            <span style="color:${isBlocked ? 'var(--danger)' : '#10b981'}; font-weight:bold;">
              ${isBlocked ? 'Blocked' : 'Active'}
            </span>
          </td>
          <td>
            <button onclick="openEditUserModal('${uid}', '${u.name || ''}', '${u.phone || ''}', ${u.balance || 0}, ${u.vipLevel || 0})" style="background:#3b82f6; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">Edit</button>
            <button onclick="toggleBlockUser('${uid}', ${!isBlocked})" style="background:${isBlocked ? '#10b981' : '#ef4444'}; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">
              ${isBlocked ? 'Unblock' : 'Block'}
            </button>
          </td>
        </tr>
      `;
    });
  });
}

window.openEditUserModal = function(uid, name, phone, balance, vip) {
  document.getElementById('edit-user-uid').value = uid;
  document.getElementById('edit-user-name').value = name;
  document.getElementById('edit-user-phone').value = phone;
  document.getElementById('edit-user-balance').value = balance;
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
    balance: parseFloat(document.getElementById('edit-user-balance').value) || 0,
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
// 5. VIP PLAN EDIT & CUSTOM RIBBON BADGE
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
            ${p.badgeText ? `<span style="color:#ef4444; font-weight:bold;">[${p.badgeText}]</span>` : ''}
            ${p.isSoldOut ? '<span style="color:#64748b; font-weight:bold;">[Sold Out]</span>' : ''}
          </div>
          <div>
            <button style="background:#3b82f6; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="editPlan('${key}', '${p.name}', ${p.price}, ${p.dailyTasks}, ${p.dailyProfit}, ${p.durationDays}, ${p.vipLevel}, '${p.badgeText || ''}', ${p.isSoldOut === true})">Edit</button>
            <button style="background:#ef4444; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="db.ref('plans/${key}').remove()">Delete</button>
          </div>
        </div>
      `;
    });
  });
}

window.editPlan = function(key, name, price, dailyTasks, dailyProfit, duration, vip, badgeText, isSoldOut) {
  document.getElementById('edit-plan-key').value = key;
  document.getElementById('plan-name').value = name;
  document.getElementById('plan-price').value = price;
  document.getElementById('plan-daily-tasks').value = dailyTasks;
  document.getElementById('plan-daily-profit').value = dailyProfit;
  document.getElementById('plan-duration').value = duration;
  document.getElementById('plan-vip-level').value = vip;
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
// 6. TASK EDIT & LEVEL SELECTION
// ----------------------------------------------------
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
            <button style="background:#3b82f6; color:white; border:none; padding:2px 6px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="editTask('${key}', '${t.title}', ${t.reward}, ${t.minVip})">Edit</button>
            <button style="background:#ef4444; color:white; border:none; padding:2px 6px; border-radius:4px; font-size:10px; cursor:pointer;" onclick="db.ref('tasks/${key}').remove()">Delete</button>
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

  document.getElementById('task-form-title').innerText = 'টাস্ক ইডিট করুন';
  document.getElementById('btn-save-task').innerText = 'টাস্ক আপডেট করুন';
  document.getElementById('btn-cancel-task-edit').classList.remove('hidden');
  showAdminSection('sec-tasks');
};

window.resetTaskForm = function() {
  document.getElementById('edit-task-key').value = '';
  document.getElementById('admin-add-task-form').reset();
  document.getElementById('task-form-title').innerText = 'টাস্ক তৈরি / ইডিট';
  document.getElementById('btn-save-task').innerText = 'টাস্ক সেভ করুন';
  document.getElementById('btn-cancel-task-edit').classList.add('hidden');
};

// ----------------------------------------------------
// 7. DEPOSITS & WITHDRAWALS
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
        tbody.innerHTML += `
          <tr>
            <td>${d.email || 'User'}</td>
            <td>${d.method}</td>
            <td>৳${d.amount}</td>
            <td>${d.trxId}</td>
            <td>
              <button onclick="approveDeposit('${child.key}', '${d.uid}', ${d.amount})" style="background:#10b981; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">Approve</button>
              <button onclick="db.ref('deposits/${child.key}/status').set('rejected')" style="background:#ef4444; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">Reject</button>
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
  db.ref('users/' + uid).once('value', snap => {
    const u = snap.val() || {};
    const updates = {};
    updates[`users/${uid}/balance`] = (u.balance || 0) + amount;
    updates[`deposits/${depId}/status`] = 'approved';

    db.ref().update(updates).then(() => alert('ডিপোজিট অনুমোদন করা হয়েছে!'));
  });
};

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
            <td>৳${w.amount}</td>
            <td>
              <button onclick="db.ref('withdraws/${child.key}/status').set('approved')" style="background:#10b981; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">Approve</button>
              <button onclick="rejectWithdraw('${child.key}', '${w.uid}', ${w.amount})" style="background:#ef4444; color:white; border:none; padding:3px 7px; border-radius:4px; font-size:10px; cursor:pointer;">Reject</button>
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
    updates[`users/${uid}/balance`] = (u.balance || 0) + amount;
    updates[`withdraws/${witId}/status`] = 'rejected';

    db.ref().update(updates).then(() => alert('উত্তোলন বাতিল ও ব্যালেন্স রিফান্ড করা হয়েছে।'));
  });
};

// ----------------------------------------------------
// 8. NOTICES & BROADCAST PUSH NOTIFICATIONS
// ----------------------------------------------------
function loadSettingsAdmin() {
  db.ref('notices/main').once('value', snap => {
    if (snap.exists()) {
      document.getElementById('admin-notice-input').value = snap.val().text || '';
    }
  });
}

window.saveMarqueeNotice = function() {
  const text = document.getElementById('admin-notice-input').value;
  if (!text) return;

  db.ref('notices/main').set({
    text: text,
    updatedAt: firebase.database.ServerValue.TIMESTAMP
  }).then(() => alert('মার্কিউ নোটিশ সফলভাবে আপডেট করা হয়েছে!'));
};

window.sendBroadcastNotification = function() {
  const title = document.getElementById('notif-broadcast-title').value;
  const desc = document.getElementById('notif-broadcast-desc').value;

  if (!title || !desc) {
    alert('অনুগ্রহ করে নোটিফিকেশন টাইটেল ও মেসেজ দুটিই লিখুন।');
    return;
  }

  db.ref('notifications/broadcast').set({
    title: title,
    desc: desc,
    timestamp: firebase.database.ServerValue.TIMESTAMP
  }).then(() => {
    alert('পুশ নোটিফিকেশন সফলভাবে সকল ইউজারের জন্য পাঠানো হয়েছে! 🚀');
    document.getElementById('notif-broadcast-title').value = '';
    document.getElementById('notif-broadcast-desc').value = '';
  });
};
