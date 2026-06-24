/* ═══════════════════════════════════════════
   DATA LAYER — localStorage backed
═══════════════════════════════════════════ */
const KEYS = { products:'nx_products', categories:'nx_categories', users:'nx_users', orders:'nx_orders', settings:'nx_settings' };

function load(k) {
  try { return JSON.parse(localStorage.getItem(k)) || null; } catch { return null; }
}
function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

/* Seed default data if empty */
function seedData() {
  if (!load(KEYS.categories)) {
    save(KEYS.categories, [
      { id:1, name:'Electronics', icon:'💻', desc:'Gadgets and devices' },
      { id:2, name:'Clothing', icon:'👗', desc:'Fashion and apparel' },
      { id:3, name:'Books', icon:'📚', desc:'Books and media' },
      { id:4, name:'Home & Garden', icon:'🏡', desc:'Home essentials' },
    ]);
  }
  if (!load(KEYS.products)) {
    save(KEYS.products, [
      { id:1, name:'Wireless Headphones', category:'Electronics', price:89.99, stock:42, status:'Active', desc:'Premium sound quality' },
      { id:2, name:'Smart Watch Pro', category:'Electronics', price:249.00, stock:18, status:'Active', desc:'Track your fitness' },
      { id:3, name:'Running Shoes', category:'Clothing', price:59.99, stock:0, status:'Out of Stock', desc:'Lightweight design' },
      { id:4, name:'JavaScript Mastery', category:'Books', price:34.95, stock:100, status:'Active', desc:'Complete JS guide' },
      { id:5, name:'Garden Tool Set', category:'Home & Garden', price:45.00, stock:30, status:'Draft', desc:'Everything you need' },
    ]);
  }
  if (!load(KEYS.users)) {
    save(KEYS.users, [
      { id:1, name:'Alice Chen', email:'alice@example.com', role:'Admin', status:'Active', joined:'2024-01-15' },
      { id:2, name:'Bob Smith', email:'bob@example.com', role:'Customer', status:'Active', joined:'2024-03-22' },
      { id:3, name:'Carol Ray', email:'carol@example.com', role:'Editor', status:'Active', joined:'2024-05-10' },
      { id:4, name:'David Kim', email:'david@example.com', role:'Customer', status:'Inactive', joined:'2024-06-01' },
    ]);
  }
  if (!load(KEYS.orders)) {
    save(KEYS.orders, [
      { id:1001, customer:'Alice Chen', items:2, total:338.99, status:'Delivered', date:'2024-06-10' },
      { id:1002, customer:'Bob Smith', items:1, total:59.99, status:'Shipped', date:'2024-06-12' },
      { id:1003, customer:'Carol Ray', items:3, total:159.94, status:'Processing', date:'2024-06-15' },
      { id:1004, customer:'David Kim', items:1, total:34.95, status:'Pending', date:'2024-06-18' },
      { id:1005, customer:'Eve Johnson', items:2, total:294.00, status:'Cancelled', date:'2024-06-08' },
    ]);
  }
  if (!load(KEYS.settings)) {
    save(KEYS.settings, { name:'Admin', store:'NexusStore', currency:'USD' });
  }
}
seedData();

let products, categories, users, orders, settings;
function reloadData() {
  products   = load(KEYS.products)   || [];
  categories = load(KEYS.categories) || [];
  users      = load(KEYS.users)      || [];
  orders     = load(KEYS.orders)     || [];
  settings   = load(KEYS.settings)   || {};
}
reloadData();

/* ═══════════════════════════════════════════
   UTILS
═══════════════════════════════════════════ */
let nextId = () => Date.now();

function fmt(n) { return '$' + Number(n).toFixed(2); }
function fmtDate(d) { return new Date(d).toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}); }

function statusBadge(s) {
  const map = {
    'Active':'green','Draft':'blue','Out of Stock':'red',
    'Delivered':'green','Shipped':'blue','Processing':'yellow','Pending':'purple','Cancelled':'red',
    'Inactive':'yellow','Suspended':'red','Customer':'blue','Editor':'purple','Admin':'green'
  };
  return `<span class="badge badge-${map[s]||'blue'}">${s}</span>`;
}

function catEmoji(catName) {
  const c = categories.find(c=>c.name===catName);
  return c ? c.icon : '📦';
}

/* ═══════════════════════════════════════════
   TOAST
═══════════════════════════════════════════ */
function toast(msg, type='info') {
  const icons = { success:'fa-check-circle', error:'fa-times-circle', warning:'fa-exclamation-circle', info:'fa-info-circle' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<i class="fas ${icons[type]||icons.info} toast-icon"></i><span>${msg}</span>`;
  document.getElementById('toastContainer').appendChild(el);
  setTimeout(() => { el.style.opacity='0'; el.style.transform='translateX(40px)'; el.style.transition='.3s'; setTimeout(()=>el.remove(), 300); }, 3000);
}

/* ═══════════════════════════════════════════
   CONFIRM DIALOG
═══════════════════════════════════════════ */
let _confirmCb = null;
function confirm(title, msg, cb) {
  document.getElementById('confirmTitle').textContent = title;
  document.getElementById('confirmMsg').textContent = msg;
  document.getElementById('confirmOverlay').classList.add('open');
  _confirmCb = cb;
  document.getElementById('confirmBtn').onclick = () => { closeConfirm(); cb(); };
}
function closeConfirm() { document.getElementById('confirmOverlay').classList.remove('open'); }

/* ═══════════════════════════════════════════
   MODAL HELPERS
═══════════════════════════════════════════ */
function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.querySelectorAll('.modal-overlay').forEach(m => {
  m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
});

/* ═══════════════════════════════════════════
   SIDEBAR
═══════════════════════════════════════════ */
const sidebar = document.getElementById('sidebar');
const mainEl  = document.getElementById('main');
let collapsed = false;

document.getElementById('sidebarToggle').addEventListener('click', () => {
  collapsed = !collapsed;
  sidebar.classList.toggle('collapsed', collapsed);
  mainEl.classList.toggle('shifted', collapsed);
  document.getElementById('toggleIcon').className = collapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left';
});

/* ═══════════════════════════════════════════
   PAGE SWITCHING
═══════════════════════════════════════════ */
const titles = { dashboard:'Dashboard', products:'Products', categories:'Categories', orders:'Orders', users:'Users', settings:'Settings' };
let currentPage = 'dashboard';

function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelector(`[data-page="${page}"]`).classList.add('active');
  document.getElementById('headerTitle').textContent = titles[page];
  currentPage = page;
  if (page === 'products') { renderProducts(); populateCatFilter(); }
  if (page === 'categories') renderCats();
  if (page === 'orders') renderOrders();
  if (page === 'users') renderUsers();
  if (page === 'dashboard') renderDashboard();
  if (page === 'settings') loadSettings();
}

document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => switchPage(item.dataset.page));
});

/* ═══════════════════════════════════════════
   HEADER
═══════════════════════════════════════════ */
// Greeting
function updateGreeting() {
  const h = new Date().getHours();
  const greet = h<12 ? 'Good morning' : h<18 ? 'Good afternoon' : 'Good evening';
  const icon  = h<12 ? 'fa-sun' : h<18 ? 'fa-cloud-sun' : 'fa-moon';
  document.getElementById('greetingText').textContent = greet;
  document.querySelector('.welcome-chip i').className = `fas ${icon}`;
}
updateGreeting();

// Profile dropdown
const profileBtn = document.getElementById('profileBtn');
const profileDd  = document.getElementById('profileDropdown');
profileBtn.addEventListener('click', e => { e.stopPropagation(); profileDd.classList.toggle('open'); });
document.addEventListener('click', () => profileDd.classList.remove('open'));

/* ═══════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════ */
function renderDashboard() {
  reloadData();
  const revenue = orders.reduce((s,o) => s + (o.status !== 'Cancelled' ? Number(o.total) : 0), 0);
  document.getElementById('statRevenue').textContent  = '$' + revenue.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  document.getElementById('statProducts').textContent = products.length;
  document.getElementById('statOrders').textContent   = orders.length;
  document.getElementById('statUsers').textContent    = users.length;
  document.getElementById('badge-products').textContent = products.length;
  document.getElementById('badge-orders').textContent   = orders.filter(o=>o.status==='Pending').length;

  // Greeting name from settings
  const sn = load(KEYS.settings);
  if (sn) {
    document.getElementById('greetingName').textContent = sn.name || 'Admin';
    document.getElementById('profileName').textContent  = sn.name || 'Admin';
    document.getElementById('avatarEl').textContent     = (sn.name||'A')[0].toUpperCase();
  }

  // Recent products
  const rp = document.getElementById('dashRecentProducts');
  if (!products.length) { rp.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-box"></i><p>No products yet</p></div></td></tr>`; }
  else { rp.innerHTML = products.slice(-5).reverse().map(p=>`
    <tr>
      <td><div class="prod-thumb">${catEmoji(p.category)}</div></td>
      <td>${p.name}</td>
      <td>${fmt(p.price)}</td>
      <td>${statusBadge(p.status)}</td>
    </tr>`).join(''); }

  // Recent orders
  const ro = document.getElementById('dashRecentOrders');
  if (!orders.length) { ro.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders yet</p></div></td></tr>`; }
  else { ro.innerHTML = orders.slice(-5).reverse().map(o=>`
    <tr>
      <td>#${o.id}</td>
      <td>${o.customer}</td>
      <td>${fmt(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
    </tr>`).join(''); }

  // Recent users
  const ru = document.getElementById('dashRecentUsers');
  if (!users.length) { ru.innerHTML = `<tr><td colspan="5"><div class="empty-state"><i class="fas fa-users"></i><p>No users yet</p></div></td></tr>`; }
  else { ru.innerHTML = users.slice(-5).reverse().map(u=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:28px;height:28px;font-size:.75rem">${u.name[0].toUpperCase()}</div>
        <span>${u.name}</span>
      </div></td>
      <td style="color:var(--muted)">${u.email}</td>
      <td>${statusBadge(u.role)}</td>
      <td>${statusBadge(u.status)}</td>
      <td style="color:var(--muted)">${fmtDate(u.joined)}</td>
    </tr>`).join(''); }
}

/* ═══════════════════════════════════════════
   PRODUCTS
═══════════════════════════════════════════ */
let productPage = 1;
const PER_PAGE  = 6;

function populateCatFilter() {
  reloadData();
  const sel = document.getElementById('productCatFilter');
  const cur = sel.value;
  sel.innerHTML = '<option value="">All Categories</option>' +
    categories.map(c=>`<option${cur===c.name?' selected':''}>${c.name}</option>`).join('');
}

function renderProducts() {
  reloadData();
  const q   = (document.getElementById('productSearch').value||'').toLowerCase();
  const cat = document.getElementById('productCatFilter').value;
  let list  = products.filter(p =>
    (!q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)) &&
    (!cat || p.category === cat)
  );
  const total = list.length;
  const pages = Math.ceil(total / PER_PAGE) || 1;
  productPage = Math.min(productPage, pages);
  const slice = list.slice((productPage-1)*PER_PAGE, productPage*PER_PAGE);

  const tb = document.getElementById('productsTableBody');
  if (!slice.length) {
    tb.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-box"></i><p>No products found</p></div></td></tr>`;
  } else {
    tb.innerHTML = slice.map(p=>`
      <tr>
        <td><div class="prod-thumb">${catEmoji(p.category)}</div></td>
        <td><strong>${p.name}</strong><div style="color:var(--muted);font-size:.78rem">${p.desc||''}</div></td>
        <td>${p.category}</td>
        <td>${fmt(p.price)}</td>
        <td>${p.stock}</td>
        <td>${statusBadge(p.status)}</td>
        <td>
          <button class="btn btn-ghost btn-sm" onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
          <button class="btn btn-danger btn-sm" onclick="deleteProduct(${p.id})" style="margin-left:4px"><i class="fas fa-trash"></i></button>
        </td>
      </tr>`).join('');
  }

  // Pagination
  const pag = document.getElementById('productsPagination');
  pag.innerHTML = '';
  for (let i=1; i<=pages; i++) {
    const b = document.createElement('div');
    b.className = 'page-btn' + (i===productPage?' active':'');
    b.textContent = i;
    b.onclick = () => { productPage=i; renderProducts(); };
    pag.appendChild(b);
  }
  populateCatSelects();
}

function populateCatSelects() {
  ['productCategory'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const cur = el.value;
    el.innerHTML = categories.map(c=>`<option${cur===c.name?' selected':''}>${c.name}</option>`).join('');
  });
}

function openProductModal(product) {
  populateCatSelects();
  document.getElementById('productModalTitle').textContent = product ? 'Edit Product' : 'Add Product';
  document.getElementById('productId').value    = product?.id || '';
  document.getElementById('productName').value  = product?.name || '';
  document.getElementById('productCategory').value = product?.category || (categories[0]?.name||'');
  document.getElementById('productPrice').value = product?.price || '';
  document.getElementById('productStock').value = product?.stock ?? '';
  document.getElementById('productStatus').value= product?.status || 'Active';
  document.getElementById('productDesc').value  = product?.desc || '';
  openModal('productModal');
}

function editProduct(id) {
  const p = products.find(p=>p.id===id);
  if (p) openProductModal(p);
}

function saveProduct() {
  const name  = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  if (!name) { toast('Product name is required', 'error'); return; }
  if (isNaN(price)) { toast('Valid price is required', 'error'); return; }
  reloadData();
  const id = document.getElementById('productId').value;
  const obj = {
    id:    id ? parseInt(id) : nextId(),
    name,
    category: document.getElementById('productCategory').value,
    price,
    stock:  parseInt(document.getElementById('productStock').value)||0,
    status: document.getElementById('productStatus').value,
    desc:   document.getElementById('productDesc').value.trim(),
  };
  if (id) { const i=products.findIndex(p=>p.id===parseInt(id)); products[i]=obj; toast('Product updated','success'); }
  else    { products.push(obj); toast('Product added','success'); }
  save(KEYS.products, products);
  closeModal('productModal');
  renderProducts();
  renderDashboard();
}

function deleteProduct(id) {
  confirm('Delete Product','This product will be permanently removed.', () => {
    reloadData();
    products = products.filter(p=>p.id!==id);
    save(KEYS.products, products);
    renderProducts();
    renderDashboard();
    toast('Product deleted','warning');
  });
}

/* ═══════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════ */
function renderCats() {
  reloadData();
  const tb = document.getElementById('catsTableBody');
  if (!categories.length) {
    tb.innerHTML = `<tr><td colspan="4"><div class="empty-state"><i class="fas fa-tags"></i><p>No categories yet</p></div></td></tr>`;
    return;
  }
  tb.innerHTML = categories.map(c=>`
    <tr>
      <td><strong>${c.icon} ${c.name}</strong></td>
      <td style="color:var(--muted)">${c.desc||'—'}</td>
      <td>${products.filter(p=>p.category===c.name).length}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editCat(${c.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteCat(${c.id})" style="margin-left:4px"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function openCatModal(cat) {
  document.getElementById('catModalTitle').textContent = cat ? 'Edit Category' : 'Add Category';
  document.getElementById('catId').value   = cat?.id || '';
  document.getElementById('catName').value = cat?.name || '';
  document.getElementById('catIcon').value = cat?.icon || '📦';
  document.getElementById('catDesc').value = cat?.desc || '';
  openModal('catModal');
}
function editCat(id) { const c=categories.find(c=>c.id===id); if(c) openCatModal(c); }

function saveCat() {
  const name = document.getElementById('catName').value.trim();
  if (!name) { toast('Category name is required','error'); return; }
  reloadData();
  const id = document.getElementById('catId').value;
  const obj = { id: id ? parseInt(id) : nextId(), name, icon: document.getElementById('catIcon').value||'📦', desc: document.getElementById('catDesc').value.trim() };
  if (id) { const i=categories.findIndex(c=>c.id===parseInt(id)); categories[i]=obj; toast('Category updated','success'); }
  else    { categories.push(obj); toast('Category added','success'); }
  save(KEYS.categories, categories);
  closeModal('catModal');
  renderCats();
}

function deleteCat(id) {
  const c = categories.find(c=>c.id===id);
  const inUse = products.some(p=>p.category===c?.name);
  if (inUse) { toast('Cannot delete — category in use by products','error'); return; }
  confirm('Delete Category','This category will be permanently removed.', () => {
    reloadData();
    categories = categories.filter(c=>c.id!==id);
    save(KEYS.categories, categories);
    renderCats();
    toast('Category deleted','warning');
  });
}

/* ═══════════════════════════════════════════
   ORDERS
═══════════════════════════════════════════ */
function renderOrders() {
  reloadData();
  const q   = (document.getElementById('orderSearch').value||'').toLowerCase();
  const st  = document.getElementById('orderStatusFilter').value;
  const list = orders.filter(o =>
    (!q || o.customer.toLowerCase().includes(q) || String(o.id).includes(q)) &&
    (!st || o.status === st)
  );
  const tb = document.getElementById('ordersTableBody');
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="fas fa-shopping-cart"></i><p>No orders found</p></div></td></tr>`;
    return;
  }
  tb.innerHTML = [...list].reverse().map(o=>`
    <tr>
      <td><strong>#${o.id}</strong></td>
      <td>${o.customer}</td>
      <td>${o.items} item${o.items>1?'s':''}</td>
      <td>${fmt(o.total)}</td>
      <td>${statusBadge(o.status)}</td>
      <td style="color:var(--muted)">${fmtDate(o.date)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editOrder(${o.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteOrder(${o.id})" style="margin-left:4px"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function openOrderModal(order) {
  document.getElementById('orderModalTitle').textContent = order ? 'Edit Order' : 'Add Order';
  document.getElementById('orderId').value       = order?.id || '';
  document.getElementById('orderCustomer').value = order?.customer || '';
  document.getElementById('orderItems').value    = order?.items || 1;
  document.getElementById('orderTotal').value    = order?.total || '';
  document.getElementById('orderStatus').value   = order?.status || 'Pending';
  openModal('orderModal');
}
function editOrder(id) { const o=orders.find(o=>o.id===id); if(o) openOrderModal(o); }

function saveOrder() {
  const customer = document.getElementById('orderCustomer').value.trim();
  const total    = parseFloat(document.getElementById('orderTotal').value);
  if (!customer) { toast('Customer name required','error'); return; }
  if (isNaN(total)) { toast('Valid total required','error'); return; }
  reloadData();
  const id = document.getElementById('orderId').value;
  const obj = {
    id:       id ? parseInt(id) : nextId(),
    customer,
    items:    parseInt(document.getElementById('orderItems').value)||1,
    total,
    status:   document.getElementById('orderStatus').value,
    date:     new Date().toISOString().split('T')[0],
  };
  if (id) { const i=orders.findIndex(o=>o.id===parseInt(id)); orders[i]=obj; toast('Order updated','success'); }
  else    { orders.push(obj); toast('Order added','success'); }
  save(KEYS.orders, orders);
  closeModal('orderModal');
  renderOrders();
  renderDashboard();
}

function deleteOrder(id) {
  confirm('Delete Order','This order will be permanently removed.', () => {
    reloadData();
    orders = orders.filter(o=>o.id!==id);
    save(KEYS.orders, orders);
    renderOrders();
    renderDashboard();
    toast('Order deleted','warning');
  });
}

/* ═══════════════════════════════════════════
   USERS
═══════════════════════════════════════════ */
function renderUsers() {
  reloadData();
  const q    = (document.getElementById('userSearch').value||'').toLowerCase();
  const list = users.filter(u => !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
  const tb   = document.getElementById('usersTableBody');
  if (!list.length) {
    tb.innerHTML = `<tr><td colspan="6"><div class="empty-state"><i class="fas fa-users"></i><p>No users found</p></div></td></tr>`;
    return;
  }
  tb.innerHTML = [...list].reverse().map(u=>`
    <tr>
      <td><div style="display:flex;align-items:center;gap:10px">
        <div class="avatar" style="width:30px;height:30px;font-size:.8rem">${u.name[0].toUpperCase()}</div>
        <strong>${u.name}</strong>
      </div></td>
      <td style="color:var(--muted)">${u.email}</td>
      <td>${statusBadge(u.role)}</td>
      <td>${statusBadge(u.status)}</td>
      <td style="color:var(--muted)">${fmtDate(u.joined)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="editUser(${u.id})"><i class="fas fa-edit"></i></button>
        <button class="btn btn-danger btn-sm" onclick="deleteUser(${u.id})" style="margin-left:4px"><i class="fas fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function openUserModal(user) {
  document.getElementById('userModalTitle').textContent = user ? 'Edit User' : 'Add User';
  document.getElementById('userId').value    = user?.id || '';
  document.getElementById('userName').value  = user?.name || '';
  document.getElementById('userEmail').value = user?.email || '';
  document.getElementById('userRole').value  = user?.role || 'Customer';
  document.getElementById('userStatus').value= user?.status || 'Active';
  openModal('userModal');
}
function editUser(id) { const u=users.find(u=>u.id===id); if(u) openUserModal(u); }

function saveUser() {
  const name  = document.getElementById('userName').value.trim();
  const email = document.getElementById('userEmail').value.trim();
  if (!name)  { toast('Name is required','error'); return; }
  if (!email) { toast('Email is required','error'); return; }
  reloadData();
  const id = document.getElementById('userId').value;
  const obj = {
    id:     id ? parseInt(id) : nextId(),
    name,
    email,
    role:   document.getElementById('userRole').value,
    status: document.getElementById('userStatus').value,
    joined: new Date().toISOString().split('T')[0],
  };
  if (id) { const i=users.findIndex(u=>u.id===parseInt(id)); users[i]=obj; toast('User updated','success'); }
  else    { users.push(obj); toast('User added','success'); }
  save(KEYS.users, users);
  closeModal('userModal');
  renderUsers();
  renderDashboard();
}

function deleteUser(id) {
  confirm('Delete User','This user account will be permanently removed.', () => {
    reloadData();
    users = users.filter(u=>u.id!==id);
    save(KEYS.users, users);
    renderUsers();
    renderDashboard();
    toast('User deleted','warning');
  });
}

/* ═══════════════════════════════════════════
   SETTINGS
═══════════════════════════════════════════ */
function loadSettings() {
  const s = load(KEYS.settings) || {};
  document.getElementById('settingName').value  = s.name  || '';
  document.getElementById('settingStore').value = s.store || '';
  document.getElementById('settingCurrency').value = s.currency || 'USD';
}
function saveSettings() {
  const s = { name: document.getElementById('settingName').value.trim(), store: document.getElementById('settingStore').value.trim(), currency: document.getElementById('settingCurrency').value };
  save(KEYS.settings, s);
  toast('Settings saved','success');
  renderDashboard();
}
function exportData() {
  const data = { products, categories, users, orders };
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'nexusadmin-export.json';
  a.click();
  toast('Data exported','success');
}
function clearAllData() {
  confirm('Clear All Data','This will remove ALL products, orders, users, and categories. This cannot be undone.', () => {
    Object.values(KEYS).forEach(k => k !== KEYS.settings && localStorage.removeItem(k));
    seedData();
    reloadData();
    renderDashboard();
    toast('Data cleared and reseeded','info');
  });
}

/* ═══════════════════════════════════════════
   INIT
═══════════════════════════════════════════ */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').style.opacity = '0';
    document.getElementById('loader').style.transition = 'opacity .4s';
    setTimeout(() => document.getElementById('loader').remove(), 400);
    document.getElementById('app').style.opacity = '1';
    renderDashboard();
  }, 1200);
});