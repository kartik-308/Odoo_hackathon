import { store } from '../store.js';
import { showToast, formatDate, formatCurrency, statusBadge, createModal, closeModal, exportCSV } from '../utils.js';
import { sortData, renderSortIcon } from '../sorting.js';

const currentFilters = { status: "" };

export function renderTrips() {
  const statusEl = document.getElementById('trip-filter-status');
  if (statusEl) currentFilters.status = statusEl.value;
  const filterStatus = currentFilters.status;
  let trips = store.getTrips();
  if (filterStatus) trips = trips.filter(t => t.status === filterStatus);
  trips = sortData(trips, 'trips');
  const canEdit = store.hasFullAccess('trips');
  return `
    <div class="page-header">
      <div><h1>Trip Dispatcher</h1><p>Create, dispatch, and manage trips</p></div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="window.app.exportTrips()"><span class="material-icons-round">download</span> Export CSV</button>
        ${canEdit ? `<button class="btn btn-primary" onclick="window.app.showAddTrip()"><span class="material-icons-round">add</span> New Trip</button>` : ''}
      </div>
    </div>
    <div class="filter-bar">
      <select id="trip-filter-status" onchange="window.app.navigate('trips')">
        <option value="">All Status</option>
        <option value="Draft" ${filterStatus === 'Draft' ? 'selected' : ''}>Draft</option>
        <option value="Dispatched" ${filterStatus === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
        <option value="Completed" ${filterStatus === 'Completed' ? 'selected' : ''}>Completed</option>
        <option value="Cancelled" ${filterStatus === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
      </select>
    </div>
    ${!canEdit ? '<div class="view-only-banner"><span class="material-icons-round">visibility</span> You have view-only access to trips</div>' : ''}
    <div class="table-container">
      <table class="data-table">
        <thead><tr>
          <th onclick="window.app.sortBy('trips', 'source')" style="cursor:pointer">Route ${renderSortIcon('trips', 'source')}</th>
          <th onclick="window.app.sortBy('trips', 'vehicleId')" style="cursor:pointer">Vehicle ${renderSortIcon('trips', 'vehicleId')}</th>
          <th onclick="window.app.sortBy('trips', 'driverId')" style="cursor:pointer">Driver ${renderSortIcon('trips', 'driverId')}</th>
          <th onclick="window.app.sortBy('trips', 'cargoWeight')" style="cursor:pointer">Cargo ${renderSortIcon('trips', 'cargoWeight')}</th>
          <th onclick="window.app.sortBy('trips', 'plannedDistance')" style="cursor:pointer">Distance ${renderSortIcon('trips', 'plannedDistance')}</th>
          <th onclick="window.app.sortBy('trips', 'status')" style="cursor:pointer">Status ${renderSortIcon('trips', 'status')}</th>
          <th onclick="window.app.sortBy('trips', 'createdAt')" style="cursor:pointer">Created ${renderSortIcon('trips', 'createdAt')}</th>
          <th>Actions</th>
        </tr></thead>
        <tbody>
          ${trips.map(t => {
    const v = store.getVehicleById(t.vehicleId);
    const d = store.getDriverById(t.driverId);
    return `<tr>
              <td style="font-weight:600">${t.source} → ${t.destination}</td>
              <td>${v ? v.regNumber : '—'}</td>
              <td>${d ? d.name : '—'}</td>
              <td>${t.cargoWeight} kg</td>
              <td>${t.plannedDistance} km</td>
              <td>${statusBadge(t.status)}</td>
              <td>${formatDate(t.createdAt)}</td>
              <td class="table-actions">
                ${canEdit && t.status === 'Draft' ? `<button class="btn btn-success btn-sm" onclick="window.app.dispatchTrip('${t.id}')"><span class="material-icons-round">send</span></button>` : ''}
                ${canEdit && t.status === 'Dispatched' ? `<button class="btn btn-primary btn-sm" onclick="window.app.showCompleteTrip('${t.id}')"><span class="material-icons-round">check_circle</span></button>` : ''}
                ${canEdit && (t.status === 'Draft' || t.status === 'Dispatched') ? `<button class="btn btn-danger btn-sm" onclick="window.app.cancelTrip('${t.id}')"><span class="material-icons-round">cancel</span></button>` : ''}
              </td>
            </tr>`;
  }).join('')}
          ${trips.length === 0 ? '<tr><td colspan="8"><div class="empty-state"><span class="material-icons-round">local_shipping</span><h3>No trips created</h3></div></td></tr>' : ''}
        </tbody>
      </table>
    </div>
  `;
}

export function showAddTripModal() {
  const availableVehicles = store.getAvailableVehicles();
  const availableDrivers = store.getAvailableDrivers();
  const body = `
    <div class="form-error" id="trip-form-error"><span class="material-icons-round">error</span><span id="trip-error-msg"></span></div>
    <div class="form-row">
      <div class="form-group"><label>Source</label><input type="text" id="trip-source" placeholder="e.g. New York" /></div>
      <div class="form-group"><label>Destination</label><input type="text" id="trip-dest" placeholder="e.g. Boston" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Vehicle</label>
        <select id="trip-vehicle">
          <option value="">Select vehicle...</option>
          ${availableVehicles.map(v => `<option value="${v.id}">${v.regNumber} — ${v.name} (${v.maxLoad}kg)</option>`).join('')}
        </select>
      </div>
      <div class="form-group"><label>Driver</label>
        <select id="trip-driver">
          <option value="">Select driver...</option>
          ${availableDrivers.map(d => `<option value="${d.id}">${d.name} (${d.licenseCategory})</option>`).join('')}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Cargo Weight (kg)</label><input type="number" id="trip-cargo" placeholder="e.g. 450" /></div>
      <div class="form-group"><label>Planned Distance (km)</label><input type="number" id="trip-distance" placeholder="e.g. 350" /></div>
    </div>
    <div class="form-group"><label>Revenue ($)</label><input type="number" id="trip-revenue" placeholder="e.g. 2500" /></div>
    <div style="background:var(--bg-input);border:1px solid var(--border);border-radius:var(--radius-sm);padding:.75rem 1rem;font-size:.8rem;color:var(--text-muted);margin-top:.5rem">
      <span class="material-icons-round" style="font-size:1rem;vertical-align:middle;color:var(--accent-orange)">info</span>
      Only <strong>Available</strong> vehicles & drivers with <strong>valid licenses</strong> are shown. Cargo weight must not exceed vehicle capacity.
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button>
    <button class="btn btn-primary" onclick="window.app.saveTrip()">Create Trip</button>
  `;
  document.body.insertAdjacentHTML('beforeend', createModal('Create New Trip', body, footer));
}

export function saveTrip() {
  const data = {
    source: document.getElementById('trip-source').value.trim(),
    destination: document.getElementById('trip-dest').value.trim(),
    vehicleId: document.getElementById('trip-vehicle').value,
    driverId: document.getElementById('trip-driver').value,
    cargoWeight: parseInt(document.getElementById('trip-cargo').value) || 0,
    plannedDistance: parseInt(document.getElementById('trip-distance').value) || 0,
    revenue: parseInt(document.getElementById('trip-revenue').value) || 0,
  };
  if (!data.source || !data.destination || !data.vehicleId || !data.driverId || !data.cargoWeight) {
    document.getElementById('trip-error-msg').textContent = 'Please fill all required fields';
    document.getElementById('trip-form-error').classList.add('visible');
    return;
  }
  const result = store.addTrip(data);
  if (result.success) { closeModal(); showToast('Trip created as Draft'); window.app.navigate('trips'); }
  else { document.getElementById('trip-error-msg').textContent = result.error; document.getElementById('trip-form-error').classList.add('visible'); }
}

export function dispatchTrip(id) {
  const result = store.dispatchTrip(id);
  if (result.success) { showToast('Trip dispatched! Vehicle & driver set to On Trip'); window.app.navigate('trips'); }
  else { showToast(result.error, 'error'); }
}

export function showCompleteTripModal(id) {
  const trip = store.getTripById(id);
  if (!trip) return;
  const v = store.getVehicleById(trip.vehicleId);
  const body = `
    <div class="form-error" id="complete-form-error"><span class="material-icons-round">error</span><span id="complete-error-msg"></span></div>
    <p style="color:var(--text-secondary);margin-bottom:1rem">Complete trip: <strong>${trip.source} → ${trip.destination}</strong></p>
    <div class="form-row">
      <div class="form-group"><label>Final Odometer (km)</label><input type="number" id="comp-odometer" placeholder="e.g. ${v ? v.odometer + trip.plannedDistance : ''}" /></div>
      <div class="form-group"><label>Fuel Consumed (liters)</label><input type="number" id="comp-fuel" placeholder="e.g. 65" /></div>
    </div>
    <div class="form-group"><label>Revenue ($)</label><input type="number" id="comp-revenue" value="${trip.revenue || ''}" /></div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button>
    <button class="btn btn-success" onclick="window.app.completeTrip('${id}')"><span class="material-icons-round">check_circle</span> Complete Trip</button>
  `;
  document.body.insertAdjacentHTML('beforeend', createModal('Complete Trip', body, footer));
}

export function completeTrip(id) {
  const odometer = parseInt(document.getElementById('comp-odometer').value) || 0;
  const fuel = parseInt(document.getElementById('comp-fuel').value) || 0;
  const revenue = parseInt(document.getElementById('comp-revenue').value) || 0;
  if (!odometer) { document.getElementById('complete-error-msg').textContent = 'Please enter final odometer'; document.getElementById('complete-form-error').classList.add('visible'); return; }
  const result = store.completeTrip(id, odometer, fuel, revenue);
  if (result.success) { closeModal(); showToast('Trip completed! Vehicle & driver set to Available'); window.app.navigate('trips'); }
  else { showToast(result.error, 'error'); }
}

export function cancelTrip(id) {
  if (confirm('Cancel this trip?')) {
    const result = store.cancelTrip(id);
    if (result.success) { showToast('Trip cancelled', 'info'); window.app.navigate('trips'); }
    else showToast(result.error, 'error');
  }
}

export function exportTrips() {
  const trips = store.getTrips();
  exportCSV(['Source', 'Destination', 'Vehicle', 'Driver', 'Cargo', 'Distance', 'Status', 'Created'], trips.map(t => {
    const v = store.getVehicleById(t.vehicleId); const d = store.getDriverById(t.driverId);
    return [t.source, t.destination, v?.regNumber || '', d?.name || '', t.cargoWeight, t.plannedDistance, t.status, t.createdAt];
  }), 'trips_export.csv');
}
