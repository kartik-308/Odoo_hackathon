import { store } from '../store.js';
import { formatCurrency, exportCSV, showToast } from '../utils.js';

export function renderReports() {
  const vehicles = store.getVehicles();
  const trips = store.getTrips().filter(t => t.status === 'Completed');
  const totalVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const utilization = totalVehicles > 0 ? ((onTrip / totalVehicles) * 100).toFixed(1) : 0;

  // Fuel efficiency across fleet
  const totalDistance = trips.reduce((s, t) => s + t.plannedDistance, 0);
  const totalFuelConsumed = trips.reduce((s, t) => s + (t.fuelConsumed || 0), 0);
  const avgEfficiency = totalFuelConsumed > 0 ? (totalDistance / totalFuelConsumed).toFixed(2) : 0;

  // Total costs
  const fuelLogs = store.getFuelLogs();
  const mLogs = store.getMaintenanceLogs();
  const totalFuelCost = fuelLogs.reduce((s, f) => s + f.cost, 0);
  const totalMaintCost = mLogs.reduce((s, m) => s + m.cost, 0);
  const totalOpsCost = totalFuelCost + totalMaintCost;
  const totalRevenue = trips.reduce((s, t) => s + (t.revenue || 0), 0);

  return `
    <div class="page-header">
      <div><h1>Reports & Analytics</h1><p>Operational insights and performance metrics</p></div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="window.app.exportReportCSV()"><span class="material-icons-round">download</span> Export CSV</button>
        <button class="btn btn-primary btn-sm" onclick="window.app.exportReportPDF()"><span class="material-icons-round">picture_as_pdf</span> Export PDF</button>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card blue">
        <div class="kpi-icon blue"><span class="material-icons-round">speed</span></div>
        <div class="kpi-value">${avgEfficiency}</div>
        <div class="kpi-label">Avg Fuel Efficiency (km/L)</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-icon green"><span class="material-icons-round">pie_chart</span></div>
        <div class="kpi-value">${utilization}%</div>
        <div class="kpi-label">Fleet Utilization</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon orange"><span class="material-icons-round">payments</span></div>
        <div class="kpi-value">${formatCurrency(totalOpsCost)}</div>
        <div class="kpi-label">Total Operational Cost</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-icon purple"><span class="material-icons-round">trending_up</span></div>
        <div class="kpi-value">${formatCurrency(totalRevenue)}</div>
        <div class="kpi-label">Total Revenue</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <h3>Operational Cost Breakdown</h3>
        <div class="chart-wrapper"><canvas id="costBreakdownChart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>Revenue vs Cost Per Vehicle</h3>
        <div class="chart-wrapper"><canvas id="revenueCostChart"></canvas></div>
      </div>
    </div>
    <div class="chart-grid">
      <div class="chart-card">
        <h3>Fuel Efficiency Per Vehicle (km/L)</h3>
        <div class="chart-wrapper"><canvas id="fuelEffChart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>Vehicle ROI</h3>
        <div class="chart-wrapper"><canvas id="roiChart"></canvas></div>
      </div>
    </div>

    <h3 style="font-size:.95rem;font-weight:700;margin-bottom:1rem">Vehicle Performance Summary</h3>
    <div class="table-container">
      <table class="data-table">
        <thead><tr><th>Vehicle</th><th>Fuel Eff.</th><th>Revenue</th><th>Fuel Cost</th><th>Maint. Cost</th><th>Total Cost</th><th>ROI</th></tr></thead>
        <tbody>
          ${vehicles.map(v => {
            const eff = store.getFuelEfficiency(v.id);
            const rev = store.getVehicleRevenue(v.id);
            const costs = store.getVehicleOperationalCost(v.id);
            const roi = v.acquisitionCost > 0 ? (((rev - costs.total) / v.acquisitionCost) * 100).toFixed(1) : 0;
            const roiColor = roi >= 0 ? 'var(--accent-green)' : 'var(--accent-red)';
            return `<tr>
              <td style="font-weight:600">${v.regNumber}</td>
              <td>${eff} km/L</td>
              <td>${formatCurrency(rev)}</td>
              <td>${formatCurrency(costs.fuelCost)}</td>
              <td>${formatCurrency(costs.maintenanceCost)}</td>
              <td style="font-weight:600">${formatCurrency(costs.total)}</td>
              <td style="font-weight:700;color:${roiColor}">${roi}%</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

export function initReportCharts() {
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = 'Inter';

    const vehicles = store.getVehicles();
    const fuelTotal = store.getFuelLogs().reduce((s, f) => s + f.cost, 0);
    const maintTotal = store.getMaintenanceLogs().reduce((s, m) => s + m.cost, 0);
    const otherTotal = store.getExpenses().filter(e => e.type !== 'Maintenance').reduce((s, e) => s + e.amount, 0);

    const ctx1 = document.getElementById('costBreakdownChart');
    if (ctx1) new Chart(ctx1, { type: 'doughnut', data: { labels: ['Fuel', 'Maintenance', 'Other'], datasets: [{ data: [fuelTotal, maintTotal, otherTotal], backgroundColor: ['#34d399', '#fbbf24', '#60a5fa'], borderWidth: 0, spacing: 3 }] }, options: { responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } } });

    const vLabels = vehicles.map(v => v.regNumber);
    const revenues = vehicles.map(v => store.getVehicleRevenue(v.id));
    const costs = vehicles.map(v => store.getVehicleOperationalCost(v.id).total);

    const ctx2 = document.getElementById('revenueCostChart');
    if (ctx2) new Chart(ctx2, { type: 'bar', data: { labels: vLabels, datasets: [{ label: 'Revenue', data: revenues, backgroundColor: '#34d399', borderRadius: 4 }, { label: 'Cost', data: costs, backgroundColor: '#f87171', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } }, plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } } } });

    const efficiencies = vehicles.map(v => parseFloat(store.getFuelEfficiency(v.id)) || 0);
    const ctx3 = document.getElementById('fuelEffChart');
    if (ctx3) new Chart(ctx3, { type: 'bar', data: { labels: vLabels, datasets: [{ label: 'km/L', data: efficiencies, backgroundColor: '#818cf8', borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', scales: { x: { beginAtZero: true }, y: { grid: { display: false } } }, plugins: { legend: { display: false } } } });

    const rois = vehicles.map(v => { const rev = store.getVehicleRevenue(v.id); const c = store.getVehicleOperationalCost(v.id).total; return v.acquisitionCost > 0 ? parseFloat((((rev - c) / v.acquisitionCost) * 100).toFixed(1)) : 0; });
    const roiColors = rois.map(r => r >= 0 ? '#34d399' : '#f87171');
    const ctx4 = document.getElementById('roiChart');
    if (ctx4) new Chart(ctx4, { type: 'bar', data: { labels: vLabels, datasets: [{ label: 'ROI %', data: rois, backgroundColor: roiColors, borderRadius: 4 }] }, options: { responsive: true, maintainAspectRatio: false, scales: { x: { grid: { display: false } }, y: { beginAtZero: false } }, plugins: { legend: { display: false } } } });
  });
}

export function exportReportCSV() {
  const vehicles = store.getVehicles();
  const headers = ['Vehicle', 'Fuel Efficiency', 'Revenue', 'Fuel Cost', 'Maint Cost', 'Total Cost', 'ROI %'];
  const rows = vehicles.map(v => {
    const eff = store.getFuelEfficiency(v.id);
    const rev = store.getVehicleRevenue(v.id);
    const costs = store.getVehicleOperationalCost(v.id);
    const roi = v.acquisitionCost > 0 ? (((rev - costs.total) / v.acquisitionCost) * 100).toFixed(1) : 0;
    return [v.regNumber, eff, rev, costs.fuelCost, costs.maintenanceCost, costs.total, roi];
  });
  exportCSV(headers, rows, 'reports_export.csv');
}

export async function exportReportPDF() {
  try {
    const { jsPDF } = await import('jspdf');
    await import('jspdf-autotable');
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.setTextColor(99, 102, 241);
    doc.text('TransitOps — Fleet Performance Report', 14, 22);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const vehicles = store.getVehicles();
    const rows = vehicles.map(v => {
      const eff = store.getFuelEfficiency(v.id);
      const rev = store.getVehicleRevenue(v.id);
      const costs = store.getVehicleOperationalCost(v.id);
      const roi = v.acquisitionCost > 0 ? (((rev - costs.total) / v.acquisitionCost) * 100).toFixed(1) + '%' : '0%';
      return [v.regNumber, v.name, eff + ' km/L', '$' + rev, '$' + costs.fuelCost, '$' + costs.maintenanceCost, '$' + costs.total, roi];
    });

    doc.autoTable({
      startY: 36,
      head: [['Vehicle', 'Model', 'Fuel Eff.', 'Revenue', 'Fuel', 'Maint.', 'Total Cost', 'ROI']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241] },
      styles: { fontSize: 8 },
    });
    doc.save('transitops_report.pdf');
    showToast('PDF report exported');
  } catch (e) {
    showToast('PDF export failed: ' + e.message, 'error');
  }
}
