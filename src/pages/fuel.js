import { store } from '../store.js';
import { showToast, formatDate, formatCurrency, createModal, closeModal, exportCSV } from '../utils.js';

export function renderFuelExpenses() {
  const fuelLogs = store.getFuelLogs();
  const expenses = store.getExpenses();
  const vehicles = store.getVehicles();
  const canEdit = store.hasFullAccess('fuel');

  const totalFuel = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaint = store.getMaintenanceLogs().reduce((s, m) => s + m.cost, 0);
  const totalOther = expenses.filter(e => e.type !== 'Maintenance').reduce((s, e) => s + e.amount, 0);
  const totalOps = totalFuel + totalMaint + totalOther;

  return `
    <div class="page-header">
      <div><h1>Fuel & Expense Management</h1><p>Track operational costs across your fleet</p></div>
      <div class="page-actions">
        ${canEdit ? `
        <button class="btn btn-success btn-sm" onclick="window.app.showAddFuel()"><span class="material-icons-round">local_gas_station</span> Log Fuel</button>
        <button class="btn btn-primary btn-sm" onclick="window.app.showAddExpense()"><span class="material-icons-round">receipt_long</span> Add Expense</button>
        ` : ''}
      </div>
    </div>

    <div class="summary-cards">
      <div class="summary-card"><h4>Total Fuel Cost</h4><div class="value" style="color:var(--accent-green)">${formatCurrency(totalFuel)}</div></div>
      <div class="summary-card"><h4>Total Maintenance Cost</h4><div class="value" style="color:var(--accent-orange)">${formatCurrency(totalMaint)}</div></div>
      <div class="summary-card"><h4>Other Expenses</h4><div class="value" style="color:var(--accent-blue)">${formatCurrency(totalOther)}</div></div>
      <div class="summary-card"><h4>Total Operational Cost</h4><div class="value" style="color:var(--accent-purple)">${formatCurrency(totalOps)}</div></div>
    </div>

    ${!canEdit ? '<div class="view-only-banner"><span class="material-icons-round">visibility</span> You have view-only access to fuel & expenses</div>' : ''}

    <div class="tabs">
      <button class="tab-btn active" onclick="window.app.switchFuelTab('fuel')">Fuel Logs</button>
      <button class="tab-btn" onclick="window.app.switchFuelTab('expenses')">Other Expenses</button>
    </div>

    <div id="fuel-tab-content">
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Vehicle</th><th>Liters</th><th>Cost</th><th>Date</th></tr></thead>
          <tbody>
            ${fuelLogs.map(f => {
              const v = store.getVehicleById(f.vehicleId);
              return `<tr><td>${v ? v.regNumber : '—'}</td><td>${f.liters} L</td><td>${formatCurrency(f.cost)}</td><td>${formatDate(f.date)}</td></tr>`;
            }).join('')}
            ${fuelLogs.length === 0 ? '<tr><td colspan="4"><div class="empty-state"><span class="material-icons-round">local_gas_station</span><h3>No fuel logs</h3></div></td></tr>' : ''}
          </tbody>
        </table>
      </div>

      <div style="margin-top:1.5rem">
        <h3 style="font-size:.95rem;font-weight:700;margin-bottom:1rem">Operational Cost Per Vehicle</h3>
        <div class="table-container">
          <table class="data-table">
            <thead><tr><th>Vehicle</th><th>Fuel Cost</th><th>Maintenance</th><th>Other</th><th>Total</th></tr></thead>
            <tbody>
              ${vehicles.map(v => {
                const costs = store.getVehicleOperationalCost(v.id);
                return `<tr><td style="font-weight:600">${v.regNumber}</td><td>${formatCurrency(costs.fuelCost)}</td><td>${formatCurrency(costs.maintenanceCost)}</td><td>${formatCurrency(costs.otherExpenses)}</td><td style="font-weight:700;color:var(--accent-purple)">${formatCurrency(costs.total)}</td></tr>`;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div id="expenses-tab-content" style="display:none">
      <div class="table-container">
        <table class="data-table">
          <thead><tr><th>Vehicle</th><th>Type</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
          <tbody>
            ${expenses.map(e => {
              const v = store.getVehicleById(e.vehicleId);
              return `<tr><td>${v ? v.regNumber : '—'}</td><td>${e.type}</td><td>${e.description}</td><td>${formatCurrency(e.amount)}</td><td>${formatDate(e.date)}</td></tr>`;
            }).join('')}
            ${expenses.length === 0 ? '<tr><td colspan="5"><div class="empty-state"><span class="material-icons-round">receipt_long</span><h3>No expenses</h3></div></td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

export function switchFuelTab(tab) {
  document.getElementById('fuel-tab-content').style.display = tab === 'fuel' ? '' : 'none';
  document.getElementById('expenses-tab-content').style.display = tab === 'expenses' ? '' : 'none';
  document.querySelectorAll('.tab-btn').forEach((btn, i) => {
    btn.classList.toggle('active', (tab === 'fuel' && i === 0) || (tab === 'expenses' && i === 1));
  });
}

export function showAddFuelModal() {
  const vehicles = store.getVehicles();
  const body = `
    <div class="form-error" id="fuel-form-error"><span class="material-icons-round">error</span><span id="fuel-error-msg"></span></div>
    <div class="form-group"><label>Vehicle</label>
      <select id="fuel-vehicle"><option value="">Select...</option>${vehicles.map(v => `<option value="${v.id}">${v.regNumber}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Liters</label><input type="number" id="fuel-liters" step="0.1" /></div>
      <div class="form-group"><label>Cost ($)</label><input type="number" id="fuel-cost" step="0.01" /></div>
    </div>
    <div class="form-group"><label>Date</label><input type="date" id="fuel-date" value="${new Date().toISOString().split('T')[0]}" /></div>
  `;
  const footer = `<button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button><button class="btn btn-success" onclick="window.app.saveFuel()">Log Fuel</button>`;
  document.body.insertAdjacentHTML('beforeend', createModal('Log Fuel', body, footer));
}

export function saveFuel() {
  const data = {
    vehicleId: document.getElementById('fuel-vehicle').value,
    liters: parseFloat(document.getElementById('fuel-liters').value) || 0,
    cost: parseFloat(document.getElementById('fuel-cost').value) || 0,
    date: document.getElementById('fuel-date').value,
    tripId: null,
  };
  if (!data.vehicleId || !data.liters) { document.getElementById('fuel-error-msg').textContent = 'Fill all fields'; document.getElementById('fuel-form-error').classList.add('visible'); return; }
  store.addFuelLog(data);
  closeModal(); showToast('Fuel logged'); window.app.navigate('fuel');
}

export function showAddExpenseModal() {
  const vehicles = store.getVehicles();
  const body = `
    <div class="form-error" id="exp-form-error"><span class="material-icons-round">error</span><span id="exp-error-msg"></span></div>
    <div class="form-group"><label>Vehicle</label>
      <select id="exp-vehicle"><option value="">Select...</option>${vehicles.map(v => `<option value="${v.id}">${v.regNumber}</option>`).join('')}</select>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Type</label>
        <select id="exp-type"><option>Toll</option><option>Parking</option><option>Insurance</option><option>Other</option></select>
      </div>
      <div class="form-group"><label>Amount ($)</label><input type="number" id="exp-amount" step="0.01" /></div>
    </div>
    <div class="form-group"><label>Description</label><input type="text" id="exp-desc" /></div>
    <div class="form-group"><label>Date</label><input type="date" id="exp-date" value="${new Date().toISOString().split('T')[0]}" /></div>
  `;
  const footer = `<button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button><button class="btn btn-primary" onclick="window.app.saveExpense()">Add Expense</button>`;
  document.body.insertAdjacentHTML('beforeend', createModal('Add Expense', body, footer));
}

export function saveExpense() {
  const data = {
    vehicleId: document.getElementById('exp-vehicle').value,
    type: document.getElementById('exp-type').value,
    amount: parseFloat(document.getElementById('exp-amount').value) || 0,
    description: document.getElementById('exp-desc').value.trim(),
    date: document.getElementById('exp-date').value,
    tripId: null,
  };
  if (!data.vehicleId || !data.amount) { document.getElementById('exp-error-msg').textContent = 'Fill all fields'; document.getElementById('exp-form-error').classList.add('visible'); return; }
  store.addExpense(data);
  closeModal(); showToast('Expense added'); window.app.navigate('fuel');
}
