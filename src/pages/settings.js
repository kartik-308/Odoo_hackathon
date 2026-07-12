import { store } from '../store.js';
import { showToast, createModal, closeModal, statusBadge } from '../utils.js';

export function renderSettings() {
  const users = store.getUsers();
  const currentUser = store.getCurrentUser();
  return `
    <div class="page-header">
      <div><h1>Settings & RBAC</h1><p>Manage users, roles, and application settings</p></div>
      <div class="page-actions">
        <button class="btn btn-primary" onclick="window.app.showAddUser()"><span class="material-icons-round">person_add</span> Add User</button>
      </div>
    </div>

    <h3 style="font-size:.95rem;font-weight:700;margin-bottom:1rem">User Management</h3>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
        <tbody>
          ${users.map(u => `<tr>
            <td style="font-weight:600"><span style="display:inline-flex;align-items:center;gap:.5rem"><span class="sidebar-avatar" style="width:28px;height:28px;font-size:.75rem">${u.avatar || u.name[0]}</span>${u.name}</span></td>
            <td>${u.email}</td>
            <td><span class="badge badge-${u.role === 'Fleet Manager' ? 'dispatched' : u.role === 'Driver' ? 'available' : u.role === 'Safety Officer' ? 'in-shop' : 'draft'}">${u.role}</span></td>
            <td class="table-actions">
              ${u.id !== currentUser?.id ? `
                <button class="btn btn-ghost btn-sm" onclick="window.app.editUser('${u.id}')"><span class="material-icons-round">edit</span></button>
                <button class="btn btn-ghost btn-sm" onclick="window.app.deleteUserRecord('${u.id}')"><span class="material-icons-round">delete</span></button>
              ` : '<span style="font-size:.75rem;color:var(--text-muted)">Current</span>'}
            </td>
          </tr>`).join('')}
        </tbody>
      </table>
    </div>

    <div style="margin-top:2rem">
      <h3 style="font-size:.95rem;font-weight:700;margin-bottom:1rem">Role Permissions</h3>
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Permission</th><th>Fleet Manager</th><th>Driver</th><th>Safety Officer</th><th>Financial Analyst</th></tr></thead>
          <tbody>
            <tr><td>Dashboard</td><td>✅</td><td>✅</td><td>✅</td><td>✅</td></tr>
            <tr><td>Vehicle Management</td><td>✅</td><td>👁️</td><td>👁️</td><td>👁️</td></tr>
            <tr><td>Driver Management</td><td>✅</td><td>👁️</td><td>✅</td><td>👁️</td></tr>
            <tr><td>Trip Dispatch</td><td>✅</td><td>✅</td><td>👁️</td><td>👁️</td></tr>
            <tr><td>Maintenance</td><td>✅</td><td>👁️</td><td>👁️</td><td>👁️</td></tr>
            <tr><td>Fuel & Expenses</td><td>✅</td><td>✅</td><td>👁️</td><td>✅</td></tr>
            <tr><td>Reports & Analytics</td><td>✅</td><td>👁️</td><td>✅</td><td>✅</td></tr>
            <tr><td>Settings & RBAC</td><td>✅</td><td>❌</td><td>❌</td><td>❌</td></tr>
          </tbody>
        </table>
      </div>
      <p style="font-size:.78rem;color:var(--text-muted);margin-top:.5rem">✅ Full Access &nbsp; 👁️ View Only &nbsp; ❌ No Access</p>
    </div>

    <div style="margin-top:2rem;display:flex;gap:1rem;flex-wrap:wrap">
      <button class="btn btn-danger" onclick="window.app.resetData()"><span class="material-icons-round">restart_alt</span> Reset All Data</button>
    </div>
  `;
}

export function showAddUserModal(editData = null) {
  const title = editData ? 'Edit User' : 'Add New User';
  const body = `
    <div class="form-error" id="user-form-error"><span class="material-icons-round">error</span><span id="user-error-msg"></span></div>
    <div class="form-group"><label>Full Name</label><input type="text" id="user-name" value="${editData?.name || ''}" /></div>
    <div class="form-group"><label>Email</label><input type="email" id="user-email" value="${editData?.email || ''}" ${editData ? 'readonly style="opacity:.6"' : ''} /></div>
    ${!editData ? '<div class="form-group"><label>Password</label><input type="password" id="user-pass" /></div>' : ''}
    <div class="form-group"><label>Role</label>
      <select id="user-role">
        <option value="Fleet Manager" ${editData?.role==='Fleet Manager'?'selected':''}>Fleet Manager</option>
        <option value="Driver" ${editData?.role==='Driver'?'selected':''}>Driver</option>
        <option value="Safety Officer" ${editData?.role==='Safety Officer'?'selected':''}>Safety Officer</option>
        <option value="Financial Analyst" ${editData?.role==='Financial Analyst'?'selected':''}>Financial Analyst</option>
      </select>
    </div>
  `;
  const footer = `<button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button><button class="btn btn-primary" onclick="window.app.saveUser('${editData?.id || ''}')">${editData ? 'Update' : 'Create User'}</button>`;
  document.body.insertAdjacentHTML('beforeend', createModal(title, body, footer));
}

export function saveUser(editId) {
  const name = document.getElementById('user-name').value.trim();
  const email = document.getElementById('user-email').value.trim();
  const role = document.getElementById('user-role').value;
  if (!name || !email) { document.getElementById('user-error-msg').textContent = 'Fill all fields'; document.getElementById('user-form-error').classList.add('visible'); return; }
  let result;
  if (editId) { result = store.updateUser(editId, { name, role }); }
  else { const pass = document.getElementById('user-pass').value; if (!pass) { document.getElementById('user-error-msg').textContent = 'Password required'; document.getElementById('user-form-error').classList.add('visible'); return; } result = store.addUser({ name, email, password: pass, role }); }
  if (result.success) { closeModal(); showToast(editId ? 'User updated' : 'User created'); window.app.navigate('settings'); }
  else { document.getElementById('user-error-msg').textContent = result.error; document.getElementById('user-form-error').classList.add('visible'); }
}

export function deleteUserRecord(id) {
  if (confirm('Delete this user?')) { store.deleteUser(id); showToast('User deleted', 'info'); window.app.navigate('settings'); }
}
