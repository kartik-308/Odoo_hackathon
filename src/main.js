/* ===== TransitOps Main App ===== */
import './style.css';
import { store } from './store.js';
import { showToast } from './utils.js';
import { renderDashboard, initDashboardCharts } from './pages/dashboard.js';
import { renderVehicles, showAddVehicleModal, saveVehicle, deleteVehicle, exportVehicles } from './pages/vehicles.js';
import { renderDrivers, showAddDriverModal, saveDriver, deleteDriver, exportDrivers } from './pages/drivers.js';
import { renderTrips, showAddTripModal, saveTrip, dispatchTrip, showCompleteTripModal, completeTrip, cancelTrip, exportTrips } from './pages/trips.js';
import { renderMaintenance, showAddMaintenanceModal, saveMaintenance, closeMaintenance } from './pages/maintenance.js';
import { renderFuelExpenses, switchFuelTab, showAddFuelModal, saveFuel, showAddExpenseModal, saveExpense } from './pages/fuel.js';
import { renderReports, initReportCharts, exportReportCSV, exportReportPDF } from './pages/reports.js';
import { renderSettings, showAddUserModal, saveUser, deleteUserRecord } from './pages/settings.js';

store.init();

/* Theme Management */
function getTheme() {
  return localStorage.getItem('transitops_theme') || 'dark';
}
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('transitops_theme', theme);
}
applyTheme(getTheme());

const NAV_ITEMS = [
  { id: 'dashboard', icon: 'dashboard', label: 'Dashboard', section: 'Main' },
  { id: 'vehicles', icon: 'directions_car', label: 'Vehicles', section: 'Main' },
  { id: 'drivers', icon: 'badge', label: 'Drivers', section: 'Main' },
  { id: 'trips', icon: 'local_shipping', label: 'Trips', section: 'Operations' },
  { id: 'maintenance', icon: 'build', label: 'Maintenance', section: 'Operations' },
  { id: 'fuel', icon: 'local_gas_station', label: 'Fuel & Expenses', section: 'Finance' },
  { id: 'reports', icon: 'bar_chart', label: 'Reports', section: 'Finance' },
  { id: 'settings', icon: 'settings', label: 'Settings', section: 'System' },
];

let currentPage = 'dashboard';

function renderLogin() {
  return `
    <div class="login-page">
      <div class="login-left">
        <div class="login-logo">
          <div class="login-logo-icon"><span class="material-icons-round">local_shipping</span></div>
          <div><h1>TransitOps</h1><span>Smart Transport Operations</span></div>
        </div>
        <ul class="login-features">
          <li><span class="material-icons-round">check_circle</span> Fleet Management & Vehicle Lifecycle</li>
          <li><span class="material-icons-round">check_circle</span> Driver Safety & Compliance</li>
          <li><span class="material-icons-round">check_circle</span> Trip Dispatch & Tracking</li>
          <li><span class="material-icons-round">check_circle</span> Maintenance Workflows</li>
          <li><span class="material-icons-round">check_circle</span> Financial Analytics & ROI</li>
        </ul>
        <div class="login-credentials">
          <strong>Demo Credentials:</strong><br/>
          Fleet Manager → admin@transitops.com / admin123<br/>
          Driver → driver@transitops.com / driver123<br/>
          Safety → safety@transitops.com / safety123<br/>
          Finance → finance@transitops.com / finance123
        </div>
      </div>
      <div class="login-right">
        <div class="login-form-container">
          <h2>Sign in to your account</h2>
          <p>Enter your credentials to access the platform</p>
          <div class="form-error" id="login-error"><span class="material-icons-round">error</span><span id="login-error-msg"></span></div>
          <div class="form-group"><label>Email Address</label><input type="email" id="login-email" placeholder="admin@transitops.com" /></div>
          <div class="form-group"><label>Password</label><input type="password" id="login-password" placeholder="••••••••" /></div>
          <button class="btn btn-primary btn-lg" onclick="window.app.handleLogin()"><span class="material-icons-round">login</span> Sign In</button>
        </div>
      </div>
    </div>
  `;
}

function renderAppShell(content) {
  const user = store.getCurrentUser();
  const trips = store.getTrips();
  const activeBadge = trips.filter(t => t.status === 'Dispatched').length;

  const sections = {};
  NAV_ITEMS.forEach(item => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return `
    <div class="app-layout">
      <aside class="sidebar" id="sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo"><span class="material-icons-round">local_shipping</span></div>
          <div><h2>TransitOps</h2><span>Fleet Operations</span></div>
        </div>
        <nav class="sidebar-nav">
          ${Object.entries(sections).map(([section, items]) => {
            const visibleItems = items.filter(item => store.canAccess(item.id));
            if (visibleItems.length === 0) return '';
            return `
            <div class="nav-section">
              <div class="nav-section-title">${section}</div>
              ${visibleItems.map(item => `
                <div class="nav-item ${currentPage === item.id ? 'active' : ''}" onclick="window.app.navigate('${item.id}')">
                  <span class="material-icons-round">${item.icon}</span>
                  ${item.label}
                  ${item.id === 'trips' && activeBadge > 0 ? `<span class="nav-badge">${activeBadge}</span>` : ''}
                </div>
              `).join('')}
            </div>
          `; }).join('')}
        </nav>
        <div class="sidebar-footer">
          <div class="sidebar-user">
            <div class="sidebar-avatar">${user?.avatar || 'U'}</div>
            <div class="sidebar-user-info">
              <div class="name">${user?.name || 'User'}</div>
              <div class="role">${user?.role || 'Unknown'}</div>
            </div>
            <button class="header-icon-btn" onclick="window.app.handleLogout()" title="Logout" style="margin-left:auto">
              <span class="material-icons-round" style="font-size:1.1rem">logout</span>
            </button>
          </div>
        </div>
      </aside>
      <div class="main-content">
        <header class="top-header">
          <button class="header-icon-btn" onclick="document.getElementById('sidebar').classList.toggle('open')" style="display:none" id="mobile-menu">
            <span class="material-icons-round">menu</span>
          </button>
          <div class="header-search" id="search-wrapper">
            <span class="material-icons-round">search</span>
            <input type="text" placeholder="Search vehicles, drivers, trips..." id="global-search"
              oninput="window.app.globalSearch(this.value)"
              onkeydown="if(event.key==='Escape')window.app.closeSearch()" />
            <div class="search-dropdown" id="search-dropdown" style="display:none"></div>
          </div>
          <div class="header-actions">
            <button class="header-icon-btn theme-toggle" onclick="window.app.toggleTheme()" title="Toggle theme">
              <span class="material-icons-round">${getTheme() === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button class="header-icon-btn" onclick="window.app.openNotifications()" title="Notifications" id="notif-btn" style="position:relative">
              <span class="material-icons-round">notifications</span>
              ${activeBadge > 0 ? '<div class="badge-dot"></div>' : ''}
            </button>
            <div style="font-size:.78rem;color:var(--text-muted)">${user?.role || ''}</div>
          </div>
        </header>
        <div class="page-content" id="page-content">
          ${content}
        </div>
      </div>
    </div>
  `;
}

function renderAccessDenied() {
  return `
    <div class="access-denied">
      <div class="access-denied-card">
        <span class="material-icons-round" style="font-size:3rem;color:var(--accent-red);margin-bottom:1rem">lock</span>
        <h2>Access Denied</h2>
        <p>Your role does not have permission to view this page.</p>
        <button class="btn btn-primary" onclick="window.app.navigate('dashboard')" style="margin-top:1rem">
          <span class="material-icons-round">arrow_back</span> Back to Dashboard
        </button>
      </div>
    </div>
  `;
}

function getPageContent(page) {
  if (!store.canAccess(page)) return renderAccessDenied();
  switch (page) {
    case 'dashboard': return renderDashboard();
    case 'vehicles': return renderVehicles();
    case 'drivers': return renderDrivers();
    case 'trips': return renderTrips();
    case 'maintenance': return renderMaintenance();
    case 'fuel': return renderFuelExpenses();
    case 'reports': return renderReports();
    case 'settings': return renderSettings();
    default: return renderDashboard();
  }
}

function render() {
  const app = document.getElementById('app');
  const user = store.getCurrentUser();
  if (!user) {
    app.innerHTML = renderLogin();
    setTimeout(() => {
      const passInput = document.getElementById('login-password');
      if (passInput) passInput.addEventListener('keydown', e => { if (e.key === 'Enter') window.app.handleLogin(); });
    }, 50);
  } else {
    app.innerHTML = renderAppShell(getPageContent(currentPage));
    setTimeout(() => {
      if (currentPage === 'dashboard') initDashboardCharts();
      if (currentPage === 'reports') initReportCharts();
      if (window.innerWidth <= 768) document.getElementById('mobile-menu').style.display = 'flex';
      // Wire up global search
      const searchInput = document.getElementById('global-search');
      if (searchInput) searchInput.addEventListener('input', e => window.app.globalSearch(e.target.value));
    }, 50);
  }
}

/* ===== Global App API ===== */
window.app = {
  navigate(page) {
    currentPage = page;
    const content = document.getElementById('page-content');
    if (content) {
      content.innerHTML = getPageContent(page);
      document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.onclick?.toString().includes(`'${page}'`));
      });
      setTimeout(() => {
        if (page === 'dashboard') initDashboardCharts();
        if (page === 'reports') initReportCharts();
        const searchInput = document.getElementById('global-search');
        if (searchInput) searchInput.addEventListener('input', e => window.app.globalSearch(e.target.value));
      }, 50);
    } else {
      render();
    }
  },

  handleLogin() {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) {
      document.getElementById('login-error-msg').textContent = 'Please enter email and password';
      document.getElementById('login-error').classList.add('visible');
      return;
    }
    const result = store.login(email, password);
    if (result.success) {
      showToast(`Welcome back, ${result.user.name}!`);
      render();
    } else {
      document.getElementById('login-error-msg').textContent = result.error;
      document.getElementById('login-error').classList.add('visible');
    }
  },

  handleLogout() {
    store.logout();
    currentPage = 'dashboard';
    render();
    showToast('Logged out successfully', 'info');
  },

  filterDashboard() {
    const type = document.getElementById('dash-filter-type')?.value || '';
    const status = document.getElementById('dash-filter-status')?.value || '';
    const region = document.getElementById('dash-filter-region')?.value || '';
    const content = document.getElementById('page-content');
    if (content) {
      content.innerHTML = renderDashboard({ type, status, region });
      setTimeout(() => initDashboardCharts(), 50);
    }
  },

  // Vehicles
  showAddVehicle() { showAddVehicleModal(); },
  editVehicle(id) { showAddVehicleModal(store.getVehicleById(id)); },
  saveVehicle(id) { saveVehicle(id); },
  deleteVehicle(id) { deleteVehicle(id); },
  exportVehicles() { exportVehicles(); },

  // Drivers
  showAddDriver() { showAddDriverModal(); },
  editDriver(id) { showAddDriverModal(store.getDriverById(id)); },
  saveDriver(id) { saveDriver(id); },
  deleteDriver(id) { deleteDriver(id); },
  exportDrivers() { exportDrivers(); },

  // Trips
  showAddTrip() { showAddTripModal(); },
  saveTrip() { saveTrip(); },
  dispatchTrip(id) { dispatchTrip(id); },
  showCompleteTrip(id) { showCompleteTripModal(id); },
  completeTrip(id) { completeTrip(id); },
  cancelTrip(id) { cancelTrip(id); },
  exportTrips() { exportTrips(); },

  // Maintenance
  showAddMaintenance() { showAddMaintenanceModal(); },
  saveMaintenance() { saveMaintenance(); },
  closeMaintenance(id) { closeMaintenance(id); },

  // Fuel & Expenses
  switchFuelTab(tab) { switchFuelTab(tab); },
  showAddFuel() { showAddFuelModal(); },
  saveFuel() { saveFuel(); },
  showAddExpense() { showAddExpenseModal(); },
  saveExpense() { saveExpense(); },

  // Reports
  exportReportCSV() { exportReportCSV(); },
  exportReportPDF() { exportReportPDF(); },

  // Settings
  showAddUser() { showAddUserModal(); },
  editUser(id) { const users = store.getUsers(); showAddUserModal(users.find(u => u.id === id)); },
  saveUser(id) { saveUser(id); },
  deleteUserRecord(id) { deleteUserRecord(id); },

  toggleTheme() {
    const newTheme = getTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    const icon = document.querySelector('.theme-toggle .material-icons-round');
    if (icon) icon.textContent = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
  },

  globalSearch(query) {
    const dropdown = document.getElementById('search-dropdown');
    if (!dropdown) return;
    if (!query || query.length < 2) { dropdown.style.display = 'none'; return; }

    const q = query.toLowerCase();
    const vehicles = store.getVehicles().filter(v =>
      v.regNumber.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
    ).slice(0, 4);
    const drivers = store.getDrivers().filter(d =>
      d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q)
    ).slice(0, 4);
    const trips = store.getTrips().filter(t =>
      t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)
    ).slice(0, 4);

    const total = vehicles.length + drivers.length + trips.length;
    if (total === 0) {
      dropdown.innerHTML = '<div class="search-no-results"><span class="material-icons-round">search_off</span> No results found</div>';
      dropdown.style.display = 'block';
      return;
    }

    let html = '';
    if (vehicles.length) {
      html += `<div class="search-group-label"><span class="material-icons-round">directions_car</span> Vehicles</div>`;
      html += vehicles.map(v => `
        <div class="search-item" onclick="window.app.closeSearch();window.app.navigate('vehicles')">
          <span class="search-item-main">${v.regNumber} — ${v.name}</span>
          <span class="search-item-sub">${v.type} · ${v.status}</span>
        </div>`).join('');
    }
    if (drivers.length) {
      html += `<div class="search-group-label"><span class="material-icons-round">badge</span> Drivers</div>`;
      html += drivers.map(d => `
        <div class="search-item" onclick="window.app.closeSearch();window.app.navigate('drivers')">
          <span class="search-item-main">${d.name}</span>
          <span class="search-item-sub">${d.licenseCategory} · ${d.status}</span>
        </div>`).join('');
    }
    if (trips.length) {
      html += `<div class="search-group-label"><span class="material-icons-round">local_shipping</span> Trips</div>`;
      html += trips.map(t => `
        <div class="search-item" onclick="window.app.closeSearch();window.app.navigate('trips')">
          <span class="search-item-main">${t.source} → ${t.destination}</span>
          <span class="search-item-sub">${t.status}</span>
        </div>`).join('');
    }

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
  },

  closeSearch() {
    const d = document.getElementById('search-dropdown');
    const i = document.getElementById('global-search');
    if (d) d.style.display = 'none';
    if (i) i.value = '';
  },

  openNotifications() {
    // Remove any existing panel
    document.getElementById('notif-panel')?.remove();

    const drivers = store.getDrivers();
    const maintenance = store.getMaintenanceLogs();
    const trips = store.getTrips();
    const today = new Date();
    const soon = new Date(); soon.setDate(today.getDate() + 30);

    const alerts = [];

    // Expiring / expired licenses
    drivers.forEach(d => {
      const exp = new Date(d.licenseExpiry);
      if (exp < today) {
        alerts.push({ icon: 'error', color: 'var(--accent-red)', text: `${d.name}'s license has <strong>expired</strong>`, page: 'drivers' });
      } else if (exp <= soon) {
        alerts.push({ icon: 'warning', color: 'var(--accent-orange)', text: `${d.name}'s license expires on <strong>${d.licenseExpiry}</strong>`, page: 'drivers' });
      }
    });

    // Active maintenance
    maintenance.filter(m => m.status === 'Active').forEach(m => {
      const v = store.getVehicleById(m.vehicleId);
      alerts.push({ icon: 'build', color: 'var(--accent-orange)', text: `<strong>${v?.regNumber || 'Vehicle'}</strong> is in maintenance: ${m.type}`, page: 'maintenance' });
    });

    // Dispatched trips
    trips.filter(t => t.status === 'Dispatched').forEach(t => {
      alerts.push({ icon: 'local_shipping', color: 'var(--accent-blue)', text: `Active trip: <strong>${t.source} → ${t.destination}</strong>`, page: 'trips' });
    });

    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.className = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-header">
        <span>Notifications</span>
        <button class="modal-close" onclick="document.getElementById('notif-panel').remove()">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="notif-body">
        ${alerts.length === 0
          ? '<div class="notif-empty"><span class="material-icons-round">check_circle</span><p>All good! No alerts.</p></div>'
          : alerts.map(a => `
            <div class="notif-item" onclick="window.app.navigate('${a.page}');document.getElementById('notif-panel')?.remove()">
              <span class="material-icons-round" style="color:${a.color}">${a.icon}</span>
              <span>${a.text}</span>
            </div>`).join('')
        }
      </div>
    `;
    document.body.appendChild(panel);

    // Close on outside click
    setTimeout(() => {
      document.addEventListener('click', function handler(e) {
        if (!panel.contains(e.target) && e.target.id !== 'notif-btn') {
          panel.remove();
          document.removeEventListener('click', handler);
        }
      });
    }, 10);
  },

  resetData() {
    if (confirm('Reset ALL data to defaults? This cannot be undone.')) {
      store.resetAll();
      showToast('All data reset to defaults', 'info');
      this.navigate(currentPage);
    }
  },
};

// Initial render
render();
