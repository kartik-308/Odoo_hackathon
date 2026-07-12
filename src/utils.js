/* ===== TransitOps Utility Helpers ===== */

/** Show a toast notification */
export function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  const icon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
  toast.innerHTML = `<span class="material-icons-round">${icon}</span>${message}`;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translateX(100px)'; setTimeout(() => toast.remove(), 300); }, 3000);
}

/** Format date string */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** Format currency */
export function formatCurrency(amount) {
  return '$' + Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

/** Get badge class from status */
export function statusBadge(status) {
  const cls = status.toLowerCase().replace(/\s+/g, '-');
  return `<span class="badge badge-${cls}">${status}</span>`;
}

/** Create modal HTML */
export function createModal(title, bodyHtml, footerHtml = '') {
  return `
    <div class="modal-overlay" id="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>${title}</h3>
          <button class="modal-close" onclick="document.getElementById('modal-overlay').remove()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>
    </div>
  `;
}

/** Close any open modal */
export function closeModal() {
  const m = document.getElementById('modal-overlay');
  if (m) m.remove();
}

/** Export data as CSV */
export function exportCSV(headers, rows, filename) {
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
  ].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
  showToast(`Exported ${filename}`);
}

/** Check if license is expired */
export function isLicenseExpired(expiryDate) {
  return new Date(expiryDate) < new Date();
}

/** Check if license expires within N days */
export function licenseExpiresSoon(expiryDate, days = 30) {
  const expiry = new Date(expiryDate);
  const soon = new Date();
  soon.setDate(soon.getDate() + days);
  return expiry <= soon && expiry >= new Date();
}

/** Debounce utility */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}
