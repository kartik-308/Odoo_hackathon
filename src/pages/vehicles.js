import { store } from "../store.js";
import {
  showToast,
  formatCurrency,
  formatDate,
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
                <button class="btn btn-ghost btn-sm" onclick="window.app.showVehicleDocs('${v.id}')" title="Documents">
                  <span class="material-icons-round">description</span>
                </button>
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

/* ===== Vehicle Document Management ===== */

function getFileIcon(fileName, docType) {
  if (!fileName) {
    return docType === 'Insurance' ? 'shield' : docType === 'Registration' ? 'badge' : docType === 'Inspection' ? 'verified' : 'article';
  }
  const ext = fileName.split('.').pop().toLowerCase();
  if (ext === 'pdf') return 'picture_as_pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['doc', 'docx'].includes(ext)) return 'description';
  return 'insert_drive_file';
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

export function showVehicleDocsModal(vehicleId) {
  const vehicle = store.getVehicleById(vehicleId);
  if (!vehicle) return;
  const docs = store.getVehicleDocs(vehicleId);
  const canEdit = store.hasFullAccess('vehicles');
  const today = new Date().toISOString().split('T')[0];

  const docRows = docs.length > 0 ? docs.map(d => {
    const expired = d.expiryDate && d.expiryDate < today;
    const expSoon = d.expiryDate && !expired && d.expiryDate <= new Date(Date.now() + 30*86400000).toISOString().split('T')[0];
    const hasFile = !!d.fileData;
    const icon = getFileIcon(d.fileName, d.type);
    return `
      <div class="doc-item">
        <div class="doc-icon ${hasFile ? 'has-file' : ''}">
          <span class="material-icons-round">${icon}</span>
        </div>
        <div class="doc-info">
          <div class="doc-name">${d.name}</div>
          <div class="doc-meta">
            <span class="badge badge-${d.type === 'Insurance' ? 'on-trip' : d.type === 'Registration' ? 'draft' : d.type === 'Inspection' ? 'available' : 'in-shop'}">${d.type}</span>
            ${d.fileName ? `<span style="font-size:.68rem;color:var(--text-faint)">${d.fileName} · ${formatFileSize(d.fileSize)}</span>` : '<span style="font-size:.68rem;color:var(--text-faint)">No file attached</span>'}
            ${d.expiryDate ? `<span style="font-size:.72rem;color:${expired ? 'var(--accent-red)' : expSoon ? 'var(--accent-orange)' : 'var(--text-muted)'}">Exp: ${formatDate(d.expiryDate)}${expired ? ' ⚠ EXPIRED' : expSoon ? ' ⚠ Soon' : ''}</span>` : ''}
          </div>
          ${d.notes ? `<div class="doc-notes">${d.notes}</div>` : ''}
        </div>
        <div class="doc-actions">
          ${hasFile ? `<button class="btn btn-ghost btn-sm" onclick="window.app.previewVehicleDoc('${d.id}')" title="Preview">
            <span class="material-icons-round" style="color:var(--accent-blue)">visibility</span>
          </button>
          <button class="btn btn-ghost btn-sm" onclick="window.app.downloadVehicleDoc('${d.id}')" title="Download">
            <span class="material-icons-round" style="color:var(--accent-green)">download</span>
          </button>` : ''}
          ${canEdit ? `<button class="btn btn-ghost btn-sm" onclick="window.app.deleteVehicleDoc('${d.id}', '${vehicleId}')" title="Delete">
            <span class="material-icons-round" style="color:var(--accent-red)">delete</span>
          </button>` : ''}
        </div>
      </div>
    `;
  }).join('') : '<div class="doc-empty"><span class="material-icons-round">folder_open</span><p>No documents attached</p></div>';

  const body = `
    <div class="doc-list">
      ${docRows}
    </div>
    ${canEdit ? `
    <div style="border-top:1px solid var(--border);margin-top:1rem;padding-top:1rem">
      <h4 style="font-size:.78rem;text-transform:uppercase;letter-spacing:.6px;color:var(--text-muted);margin-bottom:.75rem;font-weight:600">Add New Document</h4>
      <div class="form-row">
        <div class="form-group">
          <label>Document Name</label>
          <input type="text" id="doc-name" placeholder="e.g. Insurance Certificate" />
        </div>
        <div class="form-group">
          <label>Type</label>
          <select id="doc-type">
            <option value="Insurance">Insurance</option>
            <option value="Registration">Registration</option>
            <option value="Inspection">Inspection</option>
            <option value="Permit">Permit</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Expiry Date</label>
          <input type="date" id="doc-expiry" />
        </div>
        <div class="form-group">
          <label>Notes</label>
          <input type="text" id="doc-notes" placeholder="Optional notes" />
        </div>
      </div>
      <div class="form-group">
        <label>Upload File <span style="font-weight:400;color:var(--text-faint)">(PDF, images — max 2 MB)</span></label>
        <div class="file-upload-area" id="file-upload-area" onclick="document.getElementById('doc-file').click()">
          <span class="material-icons-round" style="font-size:1.8rem;color:var(--brand);margin-bottom:.35rem">cloud_upload</span>
          <span class="file-upload-text" id="file-upload-text">Click to choose a file or drag & drop</span>
          <span style="font-size:.68rem;color:var(--text-faint);margin-top:.2rem">Supported: PDF, JPG, PNG, GIF, WEBP, DOC</span>
          <input type="file" id="doc-file" accept=".pdf,.jpg,.jpeg,.png,.gif,.webp,.svg,.doc,.docx" style="display:none" onchange="window.app.onDocFileSelected(this)" />
        </div>
      </div>
    </div>
    ` : ''}
  `;

  const footer = canEdit
    ? `<button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Close</button>
       <button class="btn btn-primary" onclick="window.app.addVehicleDoc('${vehicleId}')"><span class="material-icons-round">add</span> Add Document</button>`
    : `<button class="btn btn-ghost" onclick="document.getElementById('modal-overlay').remove()">Close</button>`;

  document.body.insertAdjacentHTML('beforeend', createModal(`Documents — ${vehicle.regNumber}`, body, footer));

  // Wire up drag & drop
  setTimeout(() => {
    const dropArea = document.getElementById('file-upload-area');
    if (!dropArea) return;
    ['dragenter', 'dragover'].forEach(evt => dropArea.addEventListener(evt, (e) => { e.preventDefault(); dropArea.classList.add('drag-over'); }));
    ['dragleave', 'drop'].forEach(evt => dropArea.addEventListener(evt, (e) => { e.preventDefault(); dropArea.classList.remove('drag-over'); }));
    dropArea.addEventListener('drop', (e) => {
      const file = e.dataTransfer?.files?.[0];
      if (file) {
        const fileInput = document.getElementById('doc-file');
        const dt = new DataTransfer();
        dt.items.add(file);
        fileInput.files = dt.files;
        window.app.onDocFileSelected(fileInput);
      }
    });
  }, 50);
}

// Temporarily store file data for the current upload session
let pendingFileData = null;

export function onDocFileSelected(input) {
  const file = input.files?.[0];
  const textEl = document.getElementById('file-upload-text');
  const areaEl = document.getElementById('file-upload-area');
  if (!file) {
    pendingFileData = null;
    if (textEl) textEl.textContent = 'Click to choose a file or drag & drop';
    if (areaEl) areaEl.classList.remove('file-selected');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('File is too large. Maximum size is 2 MB.', 'error');
    input.value = '';
    pendingFileData = null;
    return;
  }

  if (textEl) textEl.textContent = `${file.name} (${formatFileSize(file.size)})`;
  if (areaEl) areaEl.classList.add('file-selected');

  const reader = new FileReader();
  reader.onload = (e) => {
    pendingFileData = {
      data: e.target.result,
      name: file.name,
      size: file.size,
      mimeType: file.type,
    };
  };
  reader.readAsDataURL(file);
}

export function addVehicleDoc(vehicleId) {
  const name = document.getElementById('doc-name')?.value.trim();
  const type = document.getElementById('doc-type')?.value;
  const expiryDate = document.getElementById('doc-expiry')?.value;
  const notes = document.getElementById('doc-notes')?.value.trim();

  if (!name) {
    showToast('Please enter a document name', 'error');
    return;
  }

  const docData = {
    vehicleId,
    name,
    type,
    expiryDate: expiryDate || null,
    notes: notes || '',
    fileData: pendingFileData?.data || null,
    fileName: pendingFileData?.name || null,
    fileSize: pendingFileData?.size || null,
    fileMimeType: pendingFileData?.mimeType || null,
  };

  try {
    const result = store.addVehicleDoc(docData);
    if (result.success) {
      pendingFileData = null;
      closeModal();
      showToast('Document added successfully');
      showVehicleDocsModal(vehicleId);
    }
  } catch (e) {
    if (e.name === 'QuotaExceededError' || e.message?.includes('quota')) {
      showToast('Storage full! Try a smaller file or delete old documents.', 'error');
    } else {
      showToast('Failed to save document: ' + e.message, 'error');
    }
  }
}

export function previewVehicleDoc(docId) {
  const allDocs = store.getAllVehicleDocs();
  const doc = allDocs.find(d => d.id === docId);
  if (!doc || !doc.fileData) {
    showToast('No file attached to preview', 'error');
    return;
  }

  const isImage = doc.fileMimeType?.startsWith('image/');

  if (isImage) {
    const previewHtml = `
      <div class="modal-overlay" id="preview-overlay" onclick="if(event.target===this)this.remove()" style="z-index:1100">
        <div class="modal" style="max-width:720px">
          <div class="modal-header">
            <h3>${doc.name}</h3>
            <button class="modal-close" onclick="document.getElementById('preview-overlay').remove()">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <div class="modal-body" style="padding:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.15);border-radius:0 0 var(--radius-xl) var(--radius-xl)">
            <img src="${doc.fileData}" alt="${doc.name}" style="max-width:100%;max-height:70vh;object-fit:contain;border-radius:0 0 var(--radius-xl) var(--radius-xl)" />
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', previewHtml);
  } else {
    const newTab = window.open();
    if (newTab) {
      newTab.document.write(`
        <html><head><title>${doc.name}</title></head>
        <body style="margin:0;background:#1a1a1a;display:flex;align-items:center;justify-content:center;min-height:100vh">
          <embed src="${doc.fileData}" type="${doc.fileMimeType || 'application/pdf'}" width="100%" height="100%" style="position:fixed;inset:0" />
        </body></html>
      `);
      newTab.document.close();
    } else {
      showToast('Pop-up blocked. Please allow pop-ups to preview documents.', 'error');
    }
  }
}

export function downloadVehicleDoc(docId) {
  const allDocs = store.getAllVehicleDocs();
  const doc = allDocs.find(d => d.id === docId);
  if (!doc || !doc.fileData) {
    showToast('No file to download', 'error');
    return;
  }
  const link = document.createElement('a');
  link.href = doc.fileData;
  link.download = doc.fileName || doc.name;
  link.click();
}

export function deleteVehicleDoc(docId, vehicleId) {
  if (confirm('Delete this document?')) {
    store.deleteVehicleDoc(docId);
    closeModal();
    showToast('Document removed', 'info');
    showVehicleDocsModal(vehicleId);
  }
}

