import { store } from "../store.js";
import {
  showToast,
  formatCurrency,
  statusBadge,
  createModal,
  closeModal,
  exportCSV,
} from "../utils.js";
import { sortData, renderSortIcon } from "../sorting.js";

const currentFilters = { type: "", status: "", search: "" };

export function renderVehicles() {
  const typeEl = document.getElementById("veh-filter-type");
  const statusEl = document.getElementById("veh-filter-status");
  const searchEl = document.getElementById("veh-search");

  if (typeEl) currentFilters.type = typeEl.value;
  if (statusEl) currentFilters.status = statusEl.value;
  if (searchEl !== null) currentFilters.search = searchEl.value;

  const filterType = currentFilters.type;
  const filterStatus = currentFilters.status;
  const filterSearch = currentFilters.search.toLowerCase();
  let vehicles = store.getVehicles();
  if (filterType) vehicles = vehicles.filter((v) => v.type === filterType);
  if (filterStatus) vehicles = vehicles.filter((v) => v.status === filterStatus);
  if (filterSearch) vehicles = vehicles.filter((v) =>
    v.regNumber.toLowerCase().includes(filterSearch) ||
    v.name.toLowerCase().includes(filterSearch) ||
    (v.region || "").toLowerCase().includes(filterSearch)
  );
  vehicles = sortData(vehicles, 'vehicles');
  const canEdit = store.hasFullAccess("vehicles");

  return `
    <div class="page-header">
      <div><h1>Vehicle Registry</h1><p>Manage your fleet vehicles</p></div>
      <div class="page-actions">
        <button class="btn btn-ghost btn-sm" onclick="window.app.exportVehicles()">
          <span class="material-icons-round">download</span> Export CSV
        </button>
        ${
          canEdit
            ? `<button class="btn btn-primary" onclick="window.app.showAddVehicle()">
          <span class="material-icons-round">add</span> Add Vehicle
        </button>`
            : ""
        }
      </div>
    </div>

    <div class="filter-bar">
      <input type="text" id="veh-search" placeholder="Search reg number, model, region…"
        value="${currentFilters.search}"
        oninput="window.app.navigate('vehicles')" style="min-width:220px" />
      <select id="veh-filter-type" onchange="window.app.navigate('vehicles')">
        <option value="">All Types</option>
        <option value="Van" ${filterType === "Van" ? "selected" : ""}>Van</option>
        <option value="Truck" ${filterType === "Truck" ? "selected" : ""}>Truck</option>
        <option value="Sedan" ${filterType === "Sedan" ? "selected" : ""}>Sedan</option>
      </select>
      <select id="veh-filter-status" onchange="window.app.navigate('vehicles')">
        <option value="">All Status</option>
        <option value="Available" ${filterStatus === "Available" ? "selected" : ""}>Available</option>
        <option value="On Trip" ${filterStatus === "On Trip" ? "selected" : ""}>On Trip</option>
        <option value="In Shop" ${filterStatus === "In Shop" ? "selected" : ""}>In Shop</option>
        <option value="Retired" ${filterStatus === "Retired" ? "selected" : ""}>Retired</option>
      </select>
    </div>
    ${!canEdit ? '<div class="view-only-banner"><span class="material-icons-round">visibility</span> You have view-only access to this page</div>' : ""}

    <div class="table-container">
      <table class="data-table" id="vehicles-table">
        <thead>
          <tr>
            <th onclick="window.app.sortBy('vehicles', 'regNumber')" style="cursor:pointer">Reg Number ${renderSortIcon('vehicles', 'regNumber')}</th>
            <th onclick="window.app.sortBy('vehicles', 'name')" style="cursor:pointer">Model ${renderSortIcon('vehicles', 'name')}</th>
            <th onclick="window.app.sortBy('vehicles', 'type')" style="cursor:pointer">Type ${renderSortIcon('vehicles', 'type')}</th>
            <th onclick="window.app.sortBy('vehicles', 'maxLoad')" style="cursor:pointer">Max Load ${renderSortIcon('vehicles', 'maxLoad')}</th>
            <th onclick="window.app.sortBy('vehicles', 'odometer')" style="cursor:pointer">Odometer ${renderSortIcon('vehicles', 'odometer')}</th>
            <th onclick="window.app.sortBy('vehicles', 'acquisitionCost')" style="cursor:pointer">Acq. Cost ${renderSortIcon('vehicles', 'acquisitionCost')}</th>
            <th onclick="window.app.sortBy('vehicles', 'status')" style="cursor:pointer">Status ${renderSortIcon('vehicles', 'status')}</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${vehicles
            .map(
              (v) => `
            <tr>
              <td style="font-weight:600">${v.regNumber}</td>
              <td>${v.name}</td>
              <td>${v.type}</td>
              <td>${v.maxLoad} kg</td>
              <td>${v.odometer.toLocaleString()} km</td>
              <td>${formatCurrency(v.acquisitionCost)}</td>
              <td>${statusBadge(v.status)}</td>
              <td class="table-actions">
                ${
                  canEdit
                    ? `
                <button class="btn btn-ghost btn-sm" onclick="window.app.editVehicle('${v.id}')">
                  <span class="material-icons-round">edit</span>
                </button>
                <button class="btn btn-ghost btn-sm" onclick="window.app.deleteVehicle('${v.id}')">
                  <span class="material-icons-round">delete</span>
                </button>
                `
                    : ""
                }
              </td>
            </tr>
          `,
            )
            .join("")}
          ${vehicles.length === 0 ? '<tr><td colspan="8"><div class="empty-state"><span class="material-icons-round">directions_car</span><h3>No vehicles registered</h3></div></td></tr>' : ""}
        </tbody>
      </table>
    </div>
  `;
}

export function showAddVehicleModal(editData = null) {
  const title = editData ? "Edit Vehicle" : "Add New Vehicle";
  const body = `
    <div class="form-error" id="vehicle-form-error"><span class="material-icons-round">error</span><span id="vehicle-error-msg"></span></div>
    <div class="form-row">
      <div class="form-group">
        <label>Registration Number</label>
        <input type="text" id="veh-reg" placeholder="e.g. VAN-05" value="${editData?.regNumber || ""}" ${editData ? 'readonly style="opacity:.6"' : ""} />
      </div>
      <div class="form-group">
        <label>Vehicle Name/Model</label>
        <input type="text" id="veh-name" placeholder="e.g. Ford Transit" value="${editData?.name || ""}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Type</label>
        <select id="veh-type">
          <option value="Van" ${editData?.type === "Van" ? "selected" : ""}>Van</option>
          <option value="Truck" ${editData?.type === "Truck" ? "selected" : ""}>Truck</option>
          <option value="Sedan" ${editData?.type === "Sedan" ? "selected" : ""}>Sedan</option>
          <option value="Bus" ${editData?.type === "Bus" ? "selected" : ""}>Bus</option>
        </select>
      </div>
      <div class="form-group">
        <label>Max Load Capacity (kg)</label>
        <input type="number" id="veh-maxload" placeholder="e.g. 500" value="${editData?.maxLoad || ""}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Odometer (km)</label>
        <input type="number" id="veh-odometer" placeholder="e.g. 10000" value="${editData?.odometer || 0}" />
      </div>
      <div class="form-group">
        <label>Acquisition Cost ($)</label>
        <input type="number" id="veh-cost" placeholder="e.g. 35000" value="${editData?.acquisitionCost || ""}" />
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label>Region</label>
        <select id="veh-region">
          <option value="North" ${editData?.region === "North" ? "selected" : ""}>North</option>
          <option value="South" ${editData?.region === "South" ? "selected" : ""}>South</option>
          <option value="East" ${editData?.region === "East" ? "selected" : ""}>East</option>
          <option value="West" ${editData?.region === "West" ? "selected" : ""}>West</option>
        </select>
      </div>
      <div class="form-group">
        <label>Status</label>
        <select id="veh-status">
          <option value="Available" ${editData?.status === "Available" ? "selected" : ""}>Available</option>
          <option value="On Trip" ${editData?.status === "On Trip" ? "selected" : ""}>On Trip</option>
          <option value="In Shop" ${editData?.status === "In Shop" ? "selected" : ""}>In Shop</option>
          <option value="Retired" ${editData?.status === "Retired" ? "selected" : ""}>Retired</option>
        </select>
      </div>
    </div>
  `;
  const footer = `
    <button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Cancel</button>
    <button class="btn btn-primary" onclick="window.app.saveVehicle('${editData?.id || ""}')">${editData ? "Update" : "Add Vehicle"}</button>
  `;
  document.body.insertAdjacentHTML(
    "beforeend",
    createModal(title, body, footer),
  );
}

export function saveVehicle(editId) {
  const data = {
    regNumber: document.getElementById("veh-reg").value.trim(),
    name: document.getElementById("veh-name").value.trim(),
    type: document.getElementById("veh-type").value,
    maxLoad: parseInt(document.getElementById("veh-maxload").value) || 0,
    odometer: parseInt(document.getElementById("veh-odometer").value) || 0,
    acquisitionCost: parseInt(document.getElementById("veh-cost").value) || 0,
    region: document.getElementById("veh-region").value,
    status: document.getElementById("veh-status").value,
  };

  if (!data.regNumber || !data.name || !data.maxLoad) {
    const errEl = document.getElementById("vehicle-form-error");
    document.getElementById("vehicle-error-msg").textContent =
      "Please fill all required fields";
    errEl.classList.add("visible");
    return;
  }

  let result;
  if (editId) {
    result = store.updateVehicle(editId, data);
  } else {
    result = store.addVehicle(data);
  }

  if (result.success) {
    closeModal();
    showToast(
      editId ? "Vehicle updated successfully" : "Vehicle added successfully",
    );
    window.app.navigate("vehicles");
  } else {
    const errEl = document.getElementById("vehicle-form-error");
    document.getElementById("vehicle-error-msg").textContent = result.error;
    errEl.classList.add("visible");
  }
}

export function deleteVehicle(id) {
  if (confirm("Are you sure you want to delete this vehicle?")) {
    store.deleteVehicle(id);
    showToast("Vehicle deleted", "info");
    window.app.navigate("vehicles");
  }
}

export function exportVehicles() {
  const vehicles = store.getVehicles();
  const headers = [
    "Reg Number",
    "Model",
    "Type",
    "Max Load",
    "Odometer",
    "Acq. Cost",
    "Status",
    "Region",
  ];
  const rows = vehicles.map((v) => [
    v.regNumber,
    v.name,
    v.type,
    v.maxLoad,
    v.odometer,
    v.acquisitionCost,
    v.status,
    v.region,
  ]);
  exportCSV(headers, rows, "vehicles_export.csv");
}
