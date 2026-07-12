import { store } from '../store.js';
import { showToast, formatDate, formatCurrency, statusBadge, createModal, closeModal } from '../utils.js';

export function renderMaintenance() {
  const filterStatus = document.getElementById('maint-filter-status')?.value || '';
  let logs = store.getMaintenanceLogs();
  if (filterStatus) logs = logs.filter(m => m.status === filterStatus);
  const canEdit = store.hasFullAccess('maintenance');
  return `
    <div class="page-header">
      <div><h1>Maintenance</h1><p>Vehicle maintenance records and workflows</p></div>
      <div class="page-actions">
        ${canEdit ? `<button class="btn btn-primary" onclick="window.app.showAddMaintenance()"><span class="material-icons-round">add</span> Add Record</button>` : ''}
      </div>
    </div>
    <div class="filter-bar">
      <select id="maint-filter-status" onchange="window.app.navigate('maintenance')">
        <option value="">All Status</option>
        <option value="Active" ${filterStatus === 'Active' ? 'selected' : ''}>Active</option>
        <option value="Closed" ${filterStatus === 'Closed' ? 'selected' : ''}>Closed</option>
      </select>
    </div>
    ${!canEdit ? '<div class="view-only-banner"><span class="material-icons-round">visibility</span> You have view-only access to maintenance</div>' : ''}
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Cost</th><th>Start Date</th><th>End Date</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>
          ${logs.map(m => {
    const v = store.getVehicleById(m.vehicleId);
    return `<tr>
              <td style="font-weight:600">${v ? v.regNumber : '—'}</td>
              <td>${m.type}</td>
              <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${m.description}</td>
              <td>${formatCurrency(m.cost)}</td>
              <td>${formatDate(m.startDate)}</td>
              <td>${m.endDate ? formatDate(m.endDate) : '—'}</td>
              <td>${statusBadge(m.status)}</td>
              <td class="table-actions">
                ${canEdit && m.status === 'Active' ? `<button class="btn btn-success btn-sm" onclick="window.app.closeMaintenance('${m.id}')"><span class="material-icons-round">check_circle</span> Close</button>` : ''}
              </td>
            </tr>`;
  }).join('')}
          ${logs.length === 0 ? '<tr><td colspan="8"><div class="empty-state"><span class="material-icons-round">build</span><h3>No maintenance records</h3></div></td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

export function showAddMaintenanceModal() {
  const vehicles = store.getVehicles().filter(v => v.status !== 'Retired');
  const body = `
    <div class="form-error" id="maint-form-error"><span class="material-icons-round">error</span><span id="maint-error-msg"></span></div>
    <div class="form-group"><label>Vehicle</label>
      <select id="maint-vehicle">
        <option value="">Select vehicle...</option>
        ${vehicles.map(v => `<option value="${v.id}">${v.regNumber} — ${v.name} (${v.status})</option>`).join('')}
      </select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Maintenance Type</label>
        <select id="maint-type">
          <option>Oil Change</option><option>Tire Replacement</option><option>Engine Repair</option>
          <option>Brake Service</option><option>Transmission</option><option>Body Work</option><option>Other</option>
        </select>
      </div>
      <div class="form-group"><label>Cost ($)</label><input type="number" id="maint-cost" placeholder="e.g. 500" /></div>
    </div>
    <div class="form-group"><label>Description</label><textarea id="maint-desc" rows="3" placeholder="Describe the maintenance work..."></textarea></div>
    <div class="form-group"><label>Start Date</label><input type="date" id="maint-date" value="${new Date().toISOString().split('T')[0]}" /></div>
    <div style="background:var(--accent-orange-bg);border:1px solid rgba(251,191,36,.3);border-radius:var(--radius-sm);padding:.75rem 1rem;font-size:.8rem;color:var(--accent-orange)">
      <span class="material-icons-round" style="font-size:1rem;vertical-align:middle">warning</span>
      Adding a maintenance record will automatically set the vehicle status to <strong>"In Shop"</strong> and remove it from the dispatch pool.
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button>
    <button class="btn btn-primary" onclick="window.app.saveMaintenance()">Create Record</button>
  `;
  document.body.insertAdjacentHTML('beforeend', createModal('Add Maintenance Record', body, footer));
}

export function saveMaintenance() {
  const data = {
    vehicleId: document.getElementById('maint-vehicle').value,
    type: document.getElementById('maint-type').value,
    cost: parseFloat(document.getElementById('maint-cost').value) || 0,
    description: document.getElementById('maint-desc').value.trim(),
    startDate: document.getElementById('maint-date').value,
    endDate: null,
  };
  if (!data.vehicleId || !data.cost) {
    document.getElementById('maint-error-msg').textContent = 'Please select a vehicle and enter cost';
    document.getElementById('maint-form-error').classList.add('visible'); return;
  }
  const result = store.addMaintenanceLog(data);
  if (result.success) { closeModal(); showToast('Maintenance record created. Vehicle status → In Shop'); window.app.navigate('maintenance'); }
  else { showToast(result.error, 'error'); }
}

export function closeMaintenance(id) {
  if (confirm('Close this maintenance record? Vehicle will be restored to Available.')) {
    const result = store.closeMaintenanceLog(id);
    if (result.success) { showToast('Maintenance closed. Vehicle status → Available'); window.app.navigate('maintenance'); }
    else showToast(result.error, 'error');
  }
}
