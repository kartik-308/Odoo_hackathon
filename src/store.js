/* ===== TransitOps Data Store =====
   localStorage-backed data management with seed data and business rules.
*/

const STORE_KEYS = {
  USERS: 'transitops_users',
  VEHICLES: 'transitops_vehicles',
  DRIVERS: 'transitops_drivers',
  TRIPS: 'transitops_trips',
  MAINTENANCE: 'transitops_maintenance',
  FUEL_LOGS: 'transitops_fuel_logs',
  EXPENSES: 'transitops_expenses',
  VEHICLE_DOCS: 'transitops_vehicle_docs',
  CURRENT_USER: 'transitops_current_user',
  INITIALIZED: 'transitops_initialized',
};

/* ---- Helpers ---- */
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function get(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function set(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ---- Seed Data ---- */
function seedData() {
  if (localStorage.getItem(STORE_KEYS.INITIALIZED)) return;

  const users = [
    { id: generateId(), name: 'Admin', email: 'admin@transitops.com', password: 'admin123', role: 'Fleet Manager', avatar: 'A' },
    { id: generateId(), name: 'John Dispatcher', email: 'driver@transitops.com', password: 'driver123', role: 'Driver', avatar: 'J' },
    { id: generateId(), name: 'Sarah Safety', email: 'safety@transitops.com', password: 'safety123', role: 'Safety Officer', avatar: 'S' },
    { id: generateId(), name: 'Mike Finance', email: 'finance@transitops.com', password: 'finance123', role: 'Financial Analyst', avatar: 'M' },
  ];

  const vehicles = [
    { id: generateId(), regNumber: 'VAN-01', name: 'Ford Transit', type: 'Van', maxLoad: 800, odometer: 45230, acquisitionCost: 35000, status: 'Available', region: 'North' },
    { id: generateId(), regNumber: 'TRK-02', name: 'Volvo FH16', type: 'Truck', maxLoad: 5000, odometer: 120400, acquisitionCost: 95000, status: 'Available', region: 'South' },
    { id: generateId(), regNumber: 'VAN-03', name: 'Mercedes Sprinter', type: 'Van', maxLoad: 1200, odometer: 32100, acquisitionCost: 42000, status: 'On Trip', region: 'East' },
    { id: generateId(), regNumber: 'TRK-04', name: 'Scania R500', type: 'Truck', maxLoad: 8000, odometer: 89500, acquisitionCost: 110000, status: 'In Shop', region: 'West' },
    { id: generateId(), regNumber: 'SED-05', name: 'Toyota Camry', type: 'Sedan', maxLoad: 300, odometer: 15800, acquisitionCost: 25000, status: 'Available', region: 'North' },
    { id: generateId(), regNumber: 'TRK-06', name: 'MAN TGX', type: 'Truck', maxLoad: 6000, odometer: 67200, acquisitionCost: 85000, status: 'Retired', region: 'South' },
  ];

  const drivers = [
    { id: generateId(), name: 'Alex Johnson', licenseNumber: 'DL-2024-001', licenseCategory: 'Heavy Vehicle', licenseExpiry: '2027-06-15', contact: '+1-555-0101', safetyScore: 92, status: 'Available' },
    { id: generateId(), name: 'Maria Garcia', licenseNumber: 'DL-2024-002', licenseCategory: 'Light Vehicle', licenseExpiry: '2026-12-01', contact: '+1-555-0102', safetyScore: 88, status: 'Available' },
    { id: generateId(), name: 'David Chen', licenseNumber: 'DL-2024-003', licenseCategory: 'Heavy Vehicle', licenseExpiry: '2027-03-20', contact: '+1-555-0103', safetyScore: 95, status: 'On Trip' },
    { id: generateId(), name: 'Lisa Thompson', licenseNumber: 'DL-2024-004', licenseCategory: 'Light Vehicle', licenseExpiry: '2025-08-10', contact: '+1-555-0104', safetyScore: 78, status: 'Off Duty' },
    { id: generateId(), name: 'Robert Wilson', licenseNumber: 'DL-2024-005', licenseCategory: 'Heavy Vehicle', licenseExpiry: '2026-11-30', contact: '+1-555-0105', safetyScore: 45, status: 'Suspended' },
  ];

  const trips = [
    { id: generateId(), source: 'New York', destination: 'Boston', vehicleId: vehicles[2].id, driverId: drivers[2].id, cargoWeight: 800, plannedDistance: 350, status: 'Dispatched', createdAt: '2026-07-10T08:00:00', dispatchedAt: '2026-07-10T09:00:00', completedAt: null, finalOdometer: null, fuelConsumed: null, revenue: 2500 },
    { id: generateId(), source: 'Chicago', destination: 'Detroit', vehicleId: vehicles[0].id, driverId: drivers[0].id, cargoWeight: 500, plannedDistance: 450, status: 'Completed', createdAt: '2026-07-08T10:00:00', dispatchedAt: '2026-07-08T11:00:00', completedAt: '2026-07-09T06:00:00', finalOdometer: 45680, fuelConsumed: 65, revenue: 3200 },
    { id: generateId(), source: 'LA', destination: 'San Francisco', vehicleId: vehicles[1].id, driverId: drivers[1].id, cargoWeight: 2000, plannedDistance: 600, status: 'Completed', createdAt: '2026-07-05T07:00:00', dispatchedAt: '2026-07-05T08:00:00', completedAt: '2026-07-06T04:00:00', finalOdometer: 121000, fuelConsumed: 120, revenue: 5800 },
  ];

  const maintenanceLogs = [
    { id: generateId(), vehicleId: vehicles[3].id, type: 'Engine Repair', description: 'Engine overhaul and timing belt replacement', cost: 4500, startDate: '2026-07-10', endDate: null, status: 'Active' },
    { id: generateId(), vehicleId: vehicles[0].id, type: 'Oil Change', description: 'Regular oil change and filter replacement', cost: 250, startDate: '2026-07-01', endDate: '2026-07-01', status: 'Closed' },
  ];

  const fuelLogs = [
    { id: generateId(), vehicleId: vehicles[0].id, liters: 65, cost: 120, date: '2026-07-09', tripId: trips[1].id },
    { id: generateId(), vehicleId: vehicles[1].id, liters: 120, cost: 225, date: '2026-07-06', tripId: trips[2].id },
    { id: generateId(), vehicleId: vehicles[2].id, liters: 45, cost: 85, date: '2026-07-10', tripId: null },
  ];

  const expenses = [
    { id: generateId(), vehicleId: vehicles[0].id, type: 'Toll', description: 'Highway toll - NY to Boston', amount: 45, date: '2026-07-09', tripId: trips[1].id },
    { id: generateId(), vehicleId: vehicles[1].id, type: 'Toll', description: 'Bridge toll - Bay Area', amount: 12, date: '2026-07-06', tripId: trips[2].id },
    { id: generateId(), vehicleId: vehicles[1].id, type: 'Parking', description: 'Overnight parking SF depot', amount: 35, date: '2026-07-06', tripId: trips[2].id },
  ];

  const vehicleDocs = [
    { id: generateId(), vehicleId: vehicles[0].id, name: 'Insurance Certificate', type: 'Insurance', expiryDate: '2027-03-15', notes: 'Full comprehensive coverage', uploadedAt: '2026-06-01T10:00:00' },
    { id: generateId(), vehicleId: vehicles[0].id, name: 'Registration Card', type: 'Registration', expiryDate: '2028-01-01', notes: 'State registration renewal', uploadedAt: '2026-05-20T14:30:00' },
    { id: generateId(), vehicleId: vehicles[1].id, name: 'Safety Inspection Report', type: 'Inspection', expiryDate: '2027-01-10', notes: 'Annual safety check passed', uploadedAt: '2026-07-01T09:00:00' },
    { id: generateId(), vehicleId: vehicles[2].id, name: 'Insurance Policy', type: 'Insurance', expiryDate: '2026-09-30', notes: 'Third-party liability', uploadedAt: '2026-04-15T11:00:00' },
    { id: generateId(), vehicleId: vehicles[3].id, name: 'Emissions Certificate', type: 'Permit', expiryDate: '2027-06-01', notes: 'Euro 6 emissions compliant', uploadedAt: '2026-06-20T16:00:00' },
  ];

  set(STORE_KEYS.USERS, users);
  set(STORE_KEYS.VEHICLES, vehicles);
  set(STORE_KEYS.DRIVERS, drivers);
  set(STORE_KEYS.TRIPS, trips);
  set(STORE_KEYS.MAINTENANCE, maintenanceLogs);
  set(STORE_KEYS.FUEL_LOGS, fuelLogs);
  set(STORE_KEYS.EXPENSES, expenses);
  set(STORE_KEYS.VEHICLE_DOCS, vehicleDocs);
  localStorage.setItem(STORE_KEYS.INITIALIZED, 'true');
}

/* ---- RBAC Permissions ---- */
const PERMISSIONS = {
  'Fleet Manager': {
    dashboard: 'full', vehicles: 'full', drivers: 'full',
    trips: 'full', maintenance: 'full', fuel: 'full',
    reports: 'full', settings: 'full',
  },
  'Driver': {
    dashboard: 'full', vehicles: 'view', drivers: 'view',
    trips: 'full', maintenance: 'view', fuel: 'full',
    reports: 'view', settings: 'none',
  },
  'Safety Officer': {
    dashboard: 'full', vehicles: 'view', drivers: 'full',
    trips: 'view', maintenance: 'view', fuel: 'view',
    reports: 'full', settings: 'none',
  },
  'Financial Analyst': {
    dashboard: 'full', vehicles: 'view', drivers: 'view',
    trips: 'view', maintenance: 'view', fuel: 'full',
    reports: 'full', settings: 'none',
  },
};

/* ---- Store API ---- */
export const store = {
  init() { seedData(); },

  /* RBAC */
  canAccess(module) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const perms = PERMISSIONS[user.role];
    if (!perms) return false;
    return perms[module] && perms[module] !== 'none';
  },
  hasFullAccess(module) {
    const user = this.getCurrentUser();
    if (!user) return false;
    const perms = PERMISSIONS[user.role];
    if (!perms) return false;
    return perms[module] === 'full';
  },
  getPermissions() { return PERMISSIONS; },

  /* Auth */
  login(email, password) {
    const users = get(STORE_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const { password: _, ...safeUser } = user;
      set(STORE_KEYS.CURRENT_USER, safeUser);
      return { success: true, user: safeUser };
    }
    return { success: false, error: 'Invalid email or password' };
  },
  logout() { localStorage.removeItem(STORE_KEYS.CURRENT_USER); },
  getCurrentUser() {
    try { return JSON.parse(localStorage.getItem(STORE_KEYS.CURRENT_USER)); } catch { return null; }
  },

  /* Users */
  getUsers() { return get(STORE_KEYS.USERS); },
  addUser(user) {
    const users = get(STORE_KEYS.USERS);
    if (users.find(u => u.email === user.email)) return { success: false, error: 'Email already exists' };
    const newUser = { id: generateId(), ...user, avatar: user.name.charAt(0).toUpperCase() };
    users.push(newUser);
    set(STORE_KEYS.USERS, users);
    return { success: true, user: newUser };
  },
  updateUser(id, updates) {
    const users = get(STORE_KEYS.USERS);
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) return { success: false, error: 'User not found' };
    users[idx] = { ...users[idx], ...updates };
    set(STORE_KEYS.USERS, users);
    return { success: true };
  },
  deleteUser(id) {
    const users = get(STORE_KEYS.USERS);
    set(STORE_KEYS.USERS, users.filter(u => u.id !== id));
    return { success: true };
  },

  /* Vehicles */
  getVehicles() { return get(STORE_KEYS.VEHICLES); },
  getVehicleById(id) { return get(STORE_KEYS.VEHICLES).find(v => v.id === id); },
  addVehicle(vehicle) {
    const vehicles = get(STORE_KEYS.VEHICLES);
    if (vehicles.find(v => v.regNumber === vehicle.regNumber)) return { success: false, error: 'Registration number already exists' };
    const newVehicle = { id: generateId(), ...vehicle };
    vehicles.push(newVehicle);
    set(STORE_KEYS.VEHICLES, vehicles);
    return { success: true, vehicle: newVehicle };
  },
  updateVehicle(id, updates) {
    const vehicles = get(STORE_KEYS.VEHICLES);
    const idx = vehicles.findIndex(v => v.id === id);
    if (idx === -1) return { success: false, error: 'Vehicle not found' };
    if (updates.regNumber && updates.regNumber !== vehicles[idx].regNumber) {
      if (vehicles.find(v => v.regNumber === updates.regNumber)) return { success: false, error: 'Registration number already exists' };
    }
    vehicles[idx] = { ...vehicles[idx], ...updates };
    set(STORE_KEYS.VEHICLES, vehicles);
    return { success: true };
  },
  deleteVehicle(id) {
    const vehicles = get(STORE_KEYS.VEHICLES);
    set(STORE_KEYS.VEHICLES, vehicles.filter(v => v.id !== id));
    return { success: true };
  },
  getAvailableVehicles() {
    return get(STORE_KEYS.VEHICLES).filter(v => v.status === 'Available');
  },

  /* Vehicle Documents */
  getVehicleDocs(vehicleId) {
    return get(STORE_KEYS.VEHICLE_DOCS).filter(d => d.vehicleId === vehicleId);
  },
  getAllVehicleDocs() {
    return get(STORE_KEYS.VEHICLE_DOCS);
  },
  addVehicleDoc(doc) {
    const docs = get(STORE_KEYS.VEHICLE_DOCS);
    const newDoc = { id: generateId(), ...doc, uploadedAt: new Date().toISOString() };
    docs.push(newDoc);
    set(STORE_KEYS.VEHICLE_DOCS, docs);
    return { success: true, doc: newDoc };
  },
  deleteVehicleDoc(id) {
    const docs = get(STORE_KEYS.VEHICLE_DOCS);
    set(STORE_KEYS.VEHICLE_DOCS, docs.filter(d => d.id !== id));
    return { success: true };
  },

  /* Drivers */
  getDrivers() { return get(STORE_KEYS.DRIVERS); },
  getDriverById(id) { return get(STORE_KEYS.DRIVERS).find(d => d.id === id); },
  addDriver(driver) {
    const drivers = get(STORE_KEYS.DRIVERS);
    if (drivers.find(d => d.licenseNumber === driver.licenseNumber)) return { success: false, error: 'License number already exists' };
    const newDriver = { id: generateId(), ...driver };
    drivers.push(newDriver);
    set(STORE_KEYS.DRIVERS, drivers);
    return { success: true, driver: newDriver };
  },
  updateDriver(id, updates) {
    const drivers = get(STORE_KEYS.DRIVERS);
    const idx = drivers.findIndex(d => d.id === id);
    if (idx === -1) return { success: false, error: 'Driver not found' };
    drivers[idx] = { ...drivers[idx], ...updates };
    set(STORE_KEYS.DRIVERS, drivers);
    return { success: true };
  },
  deleteDriver(id) {
    const drivers = get(STORE_KEYS.DRIVERS);
    set(STORE_KEYS.DRIVERS, drivers.filter(d => d.id !== id));
    return { success: true };
  },
  getAvailableDrivers() {
    const today = new Date().toISOString().split('T')[0];
    return get(STORE_KEYS.DRIVERS).filter(d =>
      d.status === 'Available' &&
      d.licenseExpiry >= today
    );
  },

  /* Trips */
  getTrips() { return get(STORE_KEYS.TRIPS); },
  getTripById(id) { return get(STORE_KEYS.TRIPS).find(t => t.id === id); },
  addTrip(trip) {
    const trips = get(STORE_KEYS.TRIPS);
    const vehicle = this.getVehicleById(trip.vehicleId);
    const driver = this.getDriverById(trip.driverId);
    
    // Business rule validations
    if (!vehicle) return { success: false, error: 'Vehicle not found' };
    if (!driver) return { success: false, error: 'Driver not found' };
    if (vehicle.status === 'Retired' || vehicle.status === 'In Shop') return { success: false, error: 'Vehicle is not available for dispatch' };
    if (vehicle.status === 'On Trip') return { success: false, error: 'Vehicle is already on a trip' };
    if (driver.status === 'Suspended') return { success: false, error: 'Driver is suspended and cannot be assigned' };
    if (driver.status === 'On Trip') return { success: false, error: 'Driver is already on a trip' };
    
    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiry < today) return { success: false, error: 'Driver\'s license has expired' };
    if (trip.cargoWeight > vehicle.maxLoad) return { success: false, error: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxLoad} kg)` };
    
    const newTrip = { id: generateId(), ...trip, status: 'Draft', createdAt: new Date().toISOString(), dispatchedAt: null, completedAt: null, finalOdometer: null, fuelConsumed: null };
    trips.push(newTrip);
    set(STORE_KEYS.TRIPS, trips);
    return { success: true, trip: newTrip };
  },
  dispatchTrip(id) {
    const trips = get(STORE_KEYS.TRIPS);
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, error: 'Trip not found' };
    if (trips[idx].status !== 'Draft') return { success: false, error: 'Only draft trips can be dispatched' };
    
    const vehicle = this.getVehicleById(trips[idx].vehicleId);
    const driver = this.getDriverById(trips[idx].driverId);
    if (!vehicle || vehicle.status !== 'Available') return { success: false, error: 'Vehicle is not available for dispatch' };
    if (!driver) return { success: false, error: 'Driver not found' };
    if (driver.status === 'Suspended') return { success: false, error: 'Driver is suspended and cannot be dispatched' };
    if (driver.status !== 'Available') return { success: false, error: 'Driver is not available' };

    const today = new Date().toISOString().split('T')[0];
    if (driver.licenseExpiry < today) return { success: false, error: "Driver's license has expired since trip was created" };

    trips[idx].status = 'Dispatched';
    trips[idx].dispatchedAt = new Date().toISOString();
    set(STORE_KEYS.TRIPS, trips);
    
    // Auto-update statuses
    this.updateVehicle(trips[idx].vehicleId, { status: 'On Trip' });
    this.updateDriver(trips[idx].driverId, { status: 'On Trip' });
    
    return { success: true };
  },
  completeTrip(id, finalOdometer, fuelConsumed, revenue) {
    const trips = get(STORE_KEYS.TRIPS);
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, error: 'Trip not found' };
    if (trips[idx].status !== 'Dispatched') return { success: false, error: 'Only dispatched trips can be completed' };
    
    trips[idx].status = 'Completed';
    trips[idx].completedAt = new Date().toISOString();
    trips[idx].finalOdometer = finalOdometer;
    trips[idx].fuelConsumed = fuelConsumed;
    if (revenue !== undefined) trips[idx].revenue = revenue;
    set(STORE_KEYS.TRIPS, trips);
    
    // Auto-update statuses back to Available
    this.updateVehicle(trips[idx].vehicleId, { status: 'Available', odometer: finalOdometer });
    this.updateDriver(trips[idx].driverId, { status: 'Available' });
    
    // Auto-create fuel log
    if (fuelConsumed > 0) {
      this.addFuelLog({
        vehicleId: trips[idx].vehicleId,
        liters: fuelConsumed,
        cost: fuelConsumed * 1.85,
        date: new Date().toISOString().split('T')[0],
        tripId: id
      });
    }
    
    return { success: true };
  },
  cancelTrip(id) {
    const trips = get(STORE_KEYS.TRIPS);
    const idx = trips.findIndex(t => t.id === id);
    if (idx === -1) return { success: false, error: 'Trip not found' };
    if (trips[idx].status !== 'Draft' && trips[idx].status !== 'Dispatched') return { success: false, error: 'Trip cannot be cancelled' };
    
    const wasDispatched = trips[idx].status === 'Dispatched';
    trips[idx].status = 'Cancelled';
    set(STORE_KEYS.TRIPS, trips);
    
    if (wasDispatched) {
      this.updateVehicle(trips[idx].vehicleId, { status: 'Available' });
      this.updateDriver(trips[idx].driverId, { status: 'Available' });
    }
    
    return { success: true };
  },

  /* Maintenance */
  getMaintenanceLogs() { return get(STORE_KEYS.MAINTENANCE); },
  addMaintenanceLog(log) {
    const logs = get(STORE_KEYS.MAINTENANCE);
    const newLog = { id: generateId(), ...log, status: 'Active' };
    logs.push(newLog);
    set(STORE_KEYS.MAINTENANCE, logs);
    // Auto-change vehicle status to In Shop
    this.updateVehicle(log.vehicleId, { status: 'In Shop' });
    return { success: true, log: newLog };
  },
  closeMaintenanceLog(id) {
    const logs = get(STORE_KEYS.MAINTENANCE);
    const idx = logs.findIndex(l => l.id === id);
    if (idx === -1) return { success: false, error: 'Maintenance log not found' };
    logs[idx].status = 'Closed';
    logs[idx].endDate = new Date().toISOString().split('T')[0];
    set(STORE_KEYS.MAINTENANCE, logs);
    
    // Restore vehicle to Available (unless retired)
    const vehicle = this.getVehicleById(logs[idx].vehicleId);
    if (vehicle && vehicle.status !== 'Retired') {
      this.updateVehicle(logs[idx].vehicleId, { status: 'Available' });
    }
    
    // Auto-create expense
    this.addExpense({
      vehicleId: logs[idx].vehicleId,
      type: 'Maintenance',
      description: logs[idx].type + ' - ' + logs[idx].description,
      amount: logs[idx].cost,
      date: logs[idx].endDate,
      tripId: null
    });
    
    return { success: true };
  },

  /* Fuel Logs */
  getFuelLogs() { return get(STORE_KEYS.FUEL_LOGS); },
  addFuelLog(log) {
    const logs = get(STORE_KEYS.FUEL_LOGS);
    const newLog = { id: generateId(), ...log };
    logs.push(newLog);
    set(STORE_KEYS.FUEL_LOGS, logs);
    return { success: true, log: newLog };
  },

  /* Expenses */
  getExpenses() { return get(STORE_KEYS.EXPENSES); },
  addExpense(expense) {
    const expenses = get(STORE_KEYS.EXPENSES);
    const newExpense = { id: generateId(), ...expense };
    expenses.push(newExpense);
    set(STORE_KEYS.EXPENSES, expenses);
    return { success: true, expense: newExpense };
  },

  /* Analytics Helpers */
  getVehicleOperationalCost(vehicleId) {
    const fuelCost = get(STORE_KEYS.FUEL_LOGS)
      .filter(f => f.vehicleId === vehicleId)
      .reduce((sum, f) => sum + f.cost, 0);
    const maintenanceCost = get(STORE_KEYS.MAINTENANCE)
      .filter(m => m.vehicleId === vehicleId)
      .reduce((sum, m) => sum + m.cost, 0);
    const otherExpenses = get(STORE_KEYS.EXPENSES)
      .filter(e => e.vehicleId === vehicleId && e.type !== 'Maintenance')
      .reduce((sum, e) => sum + e.amount, 0);
    return { fuelCost, maintenanceCost, otherExpenses, total: fuelCost + maintenanceCost + otherExpenses };
  },
  getVehicleRevenue(vehicleId) {
    return get(STORE_KEYS.TRIPS)
      .filter(t => t.vehicleId === vehicleId && t.status === 'Completed' && t.revenue)
      .reduce((sum, t) => sum + t.revenue, 0);
  },
  getFuelEfficiency(vehicleId) {
    const trips = get(STORE_KEYS.TRIPS).filter(t => t.vehicleId === vehicleId && t.status === 'Completed' && t.fuelConsumed > 0);
    if (trips.length === 0) return 0;
    const totalDistance = trips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const totalFuel = trips.reduce((sum, t) => sum + t.fuelConsumed, 0);
    return totalFuel > 0 ? (totalDistance / totalFuel).toFixed(2) : 0;
  },

  /* Reset */
  resetAll() {
    Object.values(STORE_KEYS).forEach(key => localStorage.removeItem(key));
    seedData();
  }
};
