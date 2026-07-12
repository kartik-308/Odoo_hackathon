export const sortStates = {
  vehicles: { key: null, order: 'asc' },
  drivers: { key: null, order: 'asc' },
  trips: { key: null, order: 'asc' },
  maintenance: { key: null, order: 'asc' },
};

export function setSort(page, key) {
  if (sortStates[page].key === key) {
    sortStates[page].order = sortStates[page].order === 'asc' ? 'desc' : 'asc';
  } else {
    sortStates[page].key = key;
    sortStates[page].order = 'asc';
  }
}

export function sortData(data, page) {
  const { key, order } = sortStates[page];
  if (!key) return data;

  return data.sort((a, b) => {
    let valA = a[key];
    let valB = b[key];

    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return order === 'asc' ? -1 : 1;
    if (valA > valB) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

export function renderSortIcon(page, key) {
  const { key: currentKey, order } = sortStates[page];
  if (currentKey !== key) {
    return `<span class="material-icons-round" style="font-size: 14px; vertical-align: middle; opacity: 0.3; cursor: pointer;">swap_vert</span>`;
  }
  return `<span class="material-icons-round" style="font-size: 14px; vertical-align: middle; cursor: pointer;">${order === 'asc' ? 'arrow_upward' : 'arrow_downward'}</span>`;
}
