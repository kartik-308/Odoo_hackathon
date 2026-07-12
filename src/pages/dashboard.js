import { store } from '../store.js';
import { formatDate, formatCurrency } from '../utils.js';

export function renderDashboard() {
  const vehicles = store.getVehicles();
  const drivers = store.getDrivers();
  const trips = store.getTrips();
  const maintenance = store.getMaintenanceLogs();

  const activeVehicles = vehicles.filter(v => v.status !== 'Retired').length;
  const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
  const inMaintenance = vehicles.filter(v => v.status === 'In Shop').length;
  const onTrip = vehicles.filter(v => v.status === 'On Trip').length;
  const activeTrips = trips.filter(t => t.status === 'Dispatched').length;
  const pendingTrips = trips.filter(t => t.status === 'Draft').length;
  const driversOnDuty = drivers.filter(d => d.status === 'On Trip').length;
  const utilization = activeVehicles > 0 ? ((onTrip / activeVehicles) * 100).toFixed(1) : 0;

  const recentTrips = [...trips].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return `
    <div class="page-header">
      <div>
        <h1>Dashboard</h1>
        <p>Overview of your transport operations</p>
      </div>
      <div class="page-actions">
        <div class="filter-bar" style="margin-bottom:0">
          <select id="dash-filter-type" onchange="window.app.filterDashboard()">
            <option value="">All Types</option>
            <option value="Van">Van</option>
            <option value="Truck">Truck</option>
            <option value="Sedan">Sedan</option>
          </select>
          <select id="dash-filter-status" onchange="window.app.filterDashboard()">
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="On Trip">On Trip</option>
            <option value="In Shop">In Shop</option>
            <option value="Retired">Retired</option>
          </select>
          <select id="dash-filter-region" onchange="window.app.filterDashboard()">
            <option value="">All Regions</option>
            <option value="North">North</option>
            <option value="South">South</option>
            <option value="East">East</option>
            <option value="West">West</option>
          </select>
        </div>
      </div>
    </div>

    <div class="kpi-grid">
      <div class="kpi-card green">
        <div class="kpi-icon green"><span class="material-icons-round">directions_car</span></div>
        <div class="kpi-value">${activeVehicles}</div>
        <div class="kpi-label">Active Vehicles</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue"><span class="material-icons-round">check_circle</span></div>
        <div class="kpi-value">${availableVehicles}</div>
        <div class="kpi-label">Available Vehicles</div>
      </div>
      <div class="kpi-card orange">
        <div class="kpi-icon orange"><span class="material-icons-round">build</span></div>
        <div class="kpi-value">${inMaintenance}</div>
        <div class="kpi-label">In Maintenance</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-icon purple"><span class="material-icons-round">local_shipping</span></div>
        <div class="kpi-value">${activeTrips}</div>
        <div class="kpi-label">Active Trips</div>
      </div>
      <div class="kpi-card blue">
        <div class="kpi-icon blue"><span class="material-icons-round">pending</span></div>
        <div class="kpi-value">${pendingTrips}</div>
        <div class="kpi-label">Pending Trips</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-icon green"><span class="material-icons-round">person</span></div>
        <div class="kpi-value">${driversOnDuty}</div>
        <div class="kpi-label">Drivers On Duty</div>
      </div>
      <div class="kpi-card purple">
        <div class="kpi-icon purple"><span class="material-icons-round">speed</span></div>
        <div class="kpi-value">${utilization}%</div>
        <div class="kpi-label">Fleet Utilization</div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-card">
        <h3>Vehicle Status Distribution</h3>
        <div class="chart-wrapper"><canvas id="vehicleStatusChart"></canvas></div>
      </div>
      <div class="chart-card">
        <h3>Recent Trip Activity</h3>
        <div class="chart-wrapper"><canvas id="tripActivityChart"></canvas></div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
      <div class="table-container">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border)">
          <h3 style="font-size:.95rem;font-weight:700">Recent Trips</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>Route</th><th>Status</th><th>Date</th></tr></thead>
          <tbody>
            ${recentTrips.map(t => `
              <tr>
                <td>${t.source} → ${t.destination}</td>
                <td>${statusBadgeLocal(t.status)}</td>
                <td>${formatDate(t.createdAt)}</td>
              </tr>
            `).join('')}
            ${recentTrips.length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">No trips yet</td></tr>' : ''}
          </tbody>
        </table>
      </div>
      <div class="table-container">
        <div style="padding:1rem 1.25rem;border-bottom:1px solid var(--border)">
          <h3 style="font-size:.95rem;font-weight:700">Active Maintenance</h3>
        </div>
        <table class="data-table">
          <thead><tr><th>Vehicle</th><th>Type</th><th>Cost</th></tr></thead>
          <tbody>
            ${maintenance.filter(m => m.status === 'Active').map(m => {
              const v = store.getVehicleById(m.vehicleId);
              return `<tr><td>${v ? v.regNumber : '—'}</td><td>${m.type}</td><td>${formatCurrency(m.cost)}</td></tr>`;
            }).join('')}
            ${maintenance.filter(m => m.status === 'Active').length === 0 ? '<tr><td colspan="3" style="text-align:center;color:var(--text-muted)">No active maintenance</td></tr>' : ''}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function statusBadgeLocal(status) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${cls}">${status}</span>`;
}

export function initDashboardCharts() {
  import('chart.js').then(({ Chart, registerables }) => {
    Chart.register(...registerables);
    Chart.defaults.color = '#9ca3af';
    Chart.defaults.font.family = 'Inter';

    const vehicles = store.getVehicles();
    const statuses = ['Available', 'On Trip', 'In Shop', 'Retired'];
    const statusCounts = statuses.map(s => vehicles.filter(v => v.status === s).length);
    const statusColors = ['#34d399', '#60a5fa', '#fbbf24', '#f87171'];

    const ctx1 = document.getElementById('vehicleStatusChart');
    if (ctx1) {
      new Chart(ctx1, {
        type: 'doughnut',
        data: {
          labels: statuses,
          datasets: [{ data: statusCounts, backgroundColor: statusColors, borderWidth: 0, spacing: 3 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          cutout: '65%',
          plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 } } }
        }
      });
    }

    const trips = store.getTrips();
    const last7 = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      last7.push(d.toISOString().split('T')[0]);
    }
    const tripCounts = last7.map(date =>
      trips.filter(t => t.createdAt && t.createdAt.startsWith(date)).length
    );
    const completedCounts = last7.map(date =>
      trips.filter(t => t.completedAt && t.completedAt.startsWith(date)).length
    );

    const ctx2 = document.getElementById('tripActivityChart');
    if (ctx2) {
      new Chart(ctx2, {
        type: 'bar',
        data: {
          labels: last7.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' })),
          datasets: [
            { label: 'Created', data: tripCounts, backgroundColor: '#818cf8', borderRadius: 4 },
            { label: 'Completed', data: completedCounts, backgroundColor: '#34d399', borderRadius: 4 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { stepSize: 1 } } },
          plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true } } }
        }
      });
    }
  });
}
