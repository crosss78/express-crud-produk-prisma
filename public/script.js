const API_URL = '/api/products';

const form = document.getElementById('product-form');
const formTitle = document.getElementById('form-title');
const idInput = document.getElementById('product-id');
const nameInput = document.getElementById('name');
const categoryInput = document.getElementById('category');
const priceInput = document.getElementById('price');
const stockInput = document.getElementById('stock');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const tbody = document.getElementById('product-body');
const emptyText = document.getElementById('empty');
const countPill = document.getElementById('count');
const searchInput = document.getElementById('search');
const logList = document.getElementById('log-list');
const toast = document.getElementById('toast');

const rupiah = (n) => 'Rp' + Number(n).toLocaleString('id-ID');

// Helper fetch: mengirim request, mencatat log, dan mengembalikan data JSON
async function request(method, url, body) {
  const options = { method, headers: {} };
  if (body !== undefined) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }
  const res = await fetch(url, options);
  const data = await res.json().catch(() => null);
  addLog(method, url, res.status);
  if (!res.ok) throw new Error((data && data.message) || `Request gagal (${res.status})`);
  return data;
}

function addLog(method, url, status) {
  if (logList.querySelector('.muted')) logList.innerHTML = '';
  const li = document.createElement('li');
  li.innerHTML = `<span class="method ${method}">${method}</span><span>${url}</span><span class="status">${status}</span>`;
  logList.prepend(li);
  while (logList.children.length > 6) logList.lastChild.remove();
}

function showToast(message, isError = false) {
  toast.textContent = message;
  toast.classList.toggle('error', isError);
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 2600);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// GET: tampilkan seluruh data
async function loadProducts(highlightId) {
  const q = searchInput.value.trim();
  const url = q ? `${API_URL}?q=${encodeURIComponent(q)}` : API_URL;
  try {
    const products = await request('GET', url);
    renderTable(products, highlightId);
  } catch (err) {
    showToast(err.message, true);
  }
}

function renderTable(products, highlightId) {
  countPill.textContent = products.length;
  emptyText.hidden = products.length > 0;
  tbody.innerHTML = products
    .map(
      (p) => `
      <tr data-id="${p.id}" class="${p.id === highlightId ? 'flash' : ''}">
        <td>${p.id}</td>
        <td>${escapeHtml(p.name)}</td>
        <td><span class="tag">${escapeHtml(p.category)}</span></td>
        <td class="num">${rupiah(p.price)}</td>
        <td class="num">${p.stock}</td>
        <td class="aksi">
          <button class="btn sm edit" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="btn sm del" data-action="delete" data-id="${p.id}">Hapus</button>
        </td>
      </tr>`
    )
    .join('');
}

function readForm() {
  return {
    name: nameInput.value,
    category: categoryInput.value,
    price: Number(priceInput.value),
    stock: Number(stockInput.value),
  };
}

function resetForm() {
  form.reset();
  idInput.value = '';
  formTitle.textContent = 'Tambah Produk';
  submitBtn.textContent = 'Tambah (POST)';
  submitBtn.classList.remove('editing');
  cancelBtn.hidden = true;
}

// Masuk mode edit: isi form dengan data produk dari GET /api/products/:id
async function startEdit(id) {
  try {
    const p = await request('GET', `${API_URL}/${id}`);
    idInput.value = p.id;
    nameInput.value = p.name;
    categoryInput.value = p.category;
    priceInput.value = p.price;
    stockInput.value = p.stock;
    formTitle.textContent = `Edit Produk #${p.id}`;
    submitBtn.textContent = 'Simpan Perubahan (PUT)';
    submitBtn.classList.add('editing');
    cancelBtn.hidden = false;
    nameInput.focus();
  } catch (err) {
    showToast(err.message, true);
  }
}

// POST (tambah) atau PUT (ubah) tergantung mode form
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = idInput.value;
  try {
    if (id) {
      const updated = await request('PUT', `${API_URL}/${id}`, readForm());
      showToast(`Produk "${updated.name}" berhasil diubah`);
      resetForm();
      loadProducts(updated.id);
    } else {
      const created = await request('POST', API_URL, readForm());
      showToast(`Produk "${created.name}" berhasil ditambahkan`);
      resetForm();
      loadProducts(created.id);
    }
  } catch (err) {
    showToast(err.message, true);
  }
});

cancelBtn.addEventListener('click', resetForm);

// DELETE: hapus lewat tombol Hapus
tbody.addEventListener('click', async (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const id = Number(btn.dataset.id);

  if (btn.dataset.action === 'edit') {
    startEdit(id);
    return;
  }

  const name = btn.closest('tr').children[1].textContent;
  if (!confirm(`Hapus produk "${name}"?`)) return;
  try {
    const result = await request('DELETE', `${API_URL}/${id}`);
    showToast(result.message);
    if (Number(idInput.value) === id) resetForm();
    loadProducts();
  } catch (err) {
    showToast(err.message, true);
  }
});

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => loadProducts(), 300);
});

loadProducts();
