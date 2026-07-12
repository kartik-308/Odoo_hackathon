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
          ${Object.entries(sections).map(([section, items]) => `
            <div class="nav-section">
              <div class="nav-section-title">${section}</div>
              ${items.map(item => `
                <div class="nav-item ${currentPage === item.id ? 'active' : ''}" onclick="window.app.navigate('${item.id}')">
                  <span class="material-icons-round">${item.icon}</span>
                  ${item.label}
                  ${item.id === 'trips' && activeBadge > 0 ? `<span class="nav-badge">${activeBadge}</span>` : ''}
                </div>
              `).join('')}
            </div>
          `).join('')}
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
          <div class="header-search">
            <span class="material-icons-round">search</span>
            <input type="text" placeholder="Search vehicles, drivers, trips..." id="global-search" />
          </div>
          <div class="header-actions">
            <button class="header-icon-btn theme-toggle" onclick="window.app.toggleTheme()" title="Toggle theme">
              <span class="material-icons-round">${getTheme() === 'dark' ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <div class="header-icon-btn">
              <span class="material-icons-round">notifications</span>
              ${activeBadge > 0 ? '<div class="badge-dot"></div>' : ''}
            </div>
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

function getPageContent(page) {
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
    if (!query || query.length < 2) return;
    const q = query.toLowerCase();
    const vehicles = store.getVehicles().filter(v =>
      v.regNumber.toLowerCase().includes(q) || v.name.toLowerCase().includes(q)
    );
    const drivers = store.getDrivers().filter(d =>
      d.name.toLowerCase().includes(q) || d.licenseNumber.toLowerCase().includes(q)
    );
    const trips = store.getTrips().filter(t =>
      t.source.toLowerCase().includes(q) || t.destination.toLowerCase().includes(q)
    );
    if (vehicles.length > 0) this.navigate('vehicles');
    else if (drivers.length > 0) this.navigate('drivers');
    else if (trips.length > 0) this.navigate('trips');
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
