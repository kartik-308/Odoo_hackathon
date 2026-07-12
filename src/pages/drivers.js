import { store } from '../store.js';
import { showToast, formatDate, statusBadge, createModal, closeModal, exportCSV, isLicenseExpired, licenseExpiresSoon } from '../utils.js';
import { sortData, renderSortIcon } from '../sorting.js';

const currentFilters = { status: "", search: "" };

export function renderDrivers() {
  const statusEl = document.getElementById('drv-filter-status');
  const searchEl = document.getElementById('drv-search');
  if (statusEl) currentFilters.status = statusEl.value;
  if (searchEl !== null) currentFilters.search = searchEl.value;
  const filterStatus = currentFilters.status;
  const filterSearch = currentFilters.search.toLowerCase();
  let drivers = store.getDrivers();
  if (filterStatus) drivers = drivers.filter(d => d.status === filterStatus);
  if (filterSearch) drivers = drivers.filter(d =>
    d.name.toLowerCase().includes(filterSearch) ||
    d.licenseNumber.toLowerCase().includes(filterSearch) ||
    d.contact.toLowerCase().includes(filterSearch)
  );
  drivers = sortData(drivers, 'drivers');
  const canEdit = store.hasFullAccess('drivers');
  return `
    <div class="page-header">
      <div><h1>Driver Management</h1><p>Manage driver profiles and compliance</p></div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="window.app.exportDrivers()">
          <span class="material-icons-round">download</span> Export CSV
        </button>
        ${canEdit ? `<button class="btn btn-primary" onclick="window.app.showAddDriver()">
          <span class="material-icons-round">add</span> Add Driver
        </button>` : ''}
      </div>
    </div>
    <div class="filter-bar">
      <input type="text" id="drv-search" placeholder="Search name, license, contact…"
        value="${currentFilters.search}"
        oninput="window.app.navigate('drivers')" style="min-width:220px" />
      <select id="drv-filter-status" onchange="window.app.navigate('drivers')">
        <option value="">All Status</option>
        <option value="Available" ${filterStatus === 'Available' ? 'selected' : ''}>Available</option>
        <option value="On Trip" ${filterStatus === 'On Trip' ? 'selected' : ''}>On Trip</option>
        <option value="Off Duty" ${filterStatus === 'Off Duty' ? 'selected' : ''}>Off Duty</option>
        <option value="Suspended" ${filterStatus === 'Suspended' ? 'selected' : ''}>Suspended</option>
      </select>
    </div>
    ${!canEdit ? '<div class="view-only-banner"><span class="material-icons-round">visibility</span> You have view-only access to this page</div>' : ''}
    <div class="table-container">
      <table class="data-table">
        <thead><tr>
          <th onclick="window.app.sortBy('drivers', 'name')" style="cursor:pointer">Name ${renderSortIcon('drivers', 'name')}</th>
          <th onclick="window.app.sortBy('drivers', 'licenseNumber')" style="cursor:pointer">License # ${renderSortIcon('drivers', 'licenseNumber')}</th>
          <th onclick="window.app.sortBy('drivers', 'licenseCategory')" style="cursor:pointer">Category ${renderSortIcon('drivers', 'licenseCategory')}</th>
          <th onclick="window.app.sortBy('drivers', 'licenseExpiry')" style="cursor:pointer">License Expiry ${renderSortIcon('drivers', 'licenseExpiry')}</th>
          <th onclick="window.app.sortBy('drivers', 'contact')" style="cursor:pointer">Contact ${renderSortIcon('drivers', 'contact')}</th>
          <th onclick="window.app.sortBy('drivers', 'safetyScore')" style="cursor:pointer">Safety Score ${renderSortIcon('drivers', 'safetyScore')}</th>
          <th onclick="window.app.sortBy('drivers', 'status')" style="cursor:pointer">Status ${renderSortIcon('drivers', 'status')}</th>
          <th>Actions</th>
        </tr></thead>
        <tbody>
          ${drivers.map(d => {
    const expired = isLicenseExpired(d.licenseExpiry);
    const expSoon = licenseExpiresSoon(d.licenseExpiry);
    const scoreColor = d.safetyScore >= 80 ? '#34d399' : d.safetyScore >= 60 ? '#fbbf24' : '#f87171';
    return `<tr>
              <td style="font-weight:600">${d.name}</td>
              <td>${d.licenseNumber}</td>
              <td>${d.licenseCategory}</td>
              <td>${formatDate(d.licenseExpiry)} ${expired ? '<span class="badge badge-cancelled">Expired</span>' : expSoon ? '<span class="badge badge-in-shop">Expiring</span>' : ''}</td>
              <td>${d.contact}</td>
              <td>${d.safetyScore} <div class="score-bar"><div class="score-bar-fill" style="width:${d.safetyScore}%;background:${scoreColor}"></div></div></td>
              <td>${statusBadge(d.status)}</td>
              <td class="table-actions">
                ${canEdit ? `
                <button class="btn btn-ghost btn-sm" onclick="window.app.editDriver('${d.id}')"><span class="material-icons-round">edit</span></button>
                <button class="btn btn-ghost btn-sm" onclick="window.app.deleteDriver('${d.id}')"><span class="material-icons-round">delete</span></button>
                ` : ''}
              </td>
            </tr>`;
  }).join('')}
          ${drivers.length === 0 ? '<tr><td colspan="8"><div class="empty-state"><span class="material-icons-round">person</span><h3>No drivers registered</h3></div></td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

export function showAddDriverModal(editData = null) {
  const title = editData ? 'Edit Driver' : 'Add New Driver';
  const body = `
    <div class="form-error" id="driver-form-error"><span class="material-icons-round">error</span><span id="driver-error-msg"></span></div>
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input type="text" id="drv-name" value="${editData?.name || ''}" /></div>
      <div class="form-group"><label>License Number</label><input type="text" id="drv-license" value="${editData?.licenseNumber || ''}" ${editData ? 'readonly style="opacity:.6"' : ''} /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>License Category</label>
        <select id="drv-category">
          <option value="Light Vehicle" ${editData?.licenseCategory === 'Light Vehicle' ? 'selected' : ''}>Light Vehicle</option>
          <option value="Heavy Vehicle" ${editData?.licenseCategory === 'Heavy Vehicle' ? 'selected' : ''}>Heavy Vehicle</option>
        </select>
      </div>
      <div class="form-group"><label>License Expiry</label><input type="date" id="drv-expiry" value="${editData?.licenseExpiry || ''}" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Contact Number</label><input type="text" id="drv-contact" value="${editData?.contact || ''}" /></div>
      <div class="form-group"><label>Safety Score (0-100)</label><input type="number" id="drv-score" min="0" max="100" value="${editData?.safetyScore ?? 80}" /></div>
    </div>
    <div class="form-group"><label>Status</label>
      <select id="drv-status">
        <option value="Available" ${editData?.status === 'Available' ? 'selected' : ''}>Available</option>
        <option value="On Trip" ${editData?.status === 'On Trip' ? 'selected' : ''}>On Trip</option>
        <option value="Off Duty" ${editData?.status === 'Off Duty' ? 'selected' : ''}>Off Duty</option>
        <option value="Suspended" ${editData?.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
      </select>
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button>
    <button class="btn btn-primary" onclick="window.app.saveDriver('${editData?.id || ''}')">${editData ? 'Update' : 'Add Driver'}</button>
  `;
  document.body.insertAdjacentHTML('beforeend', createModal(title, body, footer));
}

export function saveDriver(editId) {
  const data = {
    name: document.getElementById('drv-name').value.trim(),
    licenseNumber: document.getElementById('drv-license').value.trim(),
    licenseCategory: document.getElementById('drv-category').value,
    licenseExpiry: document.getElementById('drv-expiry').value,
    contact: document.getElementById('drv-contact').value.trim(),
    safetyScore: parseInt(document.getElementById('drv-score').value) || 0,
    status: document.getElementById('drv-status').value,
  };
  if (!data.name || !data.licenseNumber || !data.licenseExpiry) {
    document.getElementById('driver-error-msg').textContent = 'Please fill all required fields';
    document.getElementById('driver-form-error').classList.add('visible');
    return;
  }
  const result = editId ? store.updateDriver(editId, data) : store.addDriver(data);
  if (result.success) { closeModal(); showToast(editId ? 'Driver updated' : 'Driver added'); window.app.navigate('drivers'); }
  else { document.getElementById('driver-error-msg').textContent = result.error; document.getElementById('driver-form-error').classList.add('visible'); }
}

export function deleteDriver(id) {
  if (confirm('Delete this driver?')) { store.deleteDriver(id); showToast('Driver deleted', 'info'); window.app.navigate('drivers'); }
}

export function exportDrivers() {
  const drivers = store.getDrivers();
  exportCSV(['Name', 'License', 'Category', 'Expiry', 'Contact', 'Safety Score', 'Status'], drivers.map(d => [d.name, d.licenseNumber, d.licenseCategory, d.licenseExpiry, d.contact, d.safetyScore, d.status]), 'drivers_export.csv');
}
