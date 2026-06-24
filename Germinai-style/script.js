/* ==========================================================
   SETEC ADMIN — SCRIPT ENGINE v2.0
   ========================================================== */

// ─── 0. AUTH GUARD ──────────────────────────────────────────
(function checkAuthentication() {
    const publicPages = [
        'login.html', 'register.html', 'auth.html', 'loginpage.html',
        'settings.html', 'appearance.html', 'notifications.html'
    ];
    const currentPage = window.location.pathname.split('/').pop().toLowerCase();
    const activeSession = localStorage.getItem('session_active_user');
    if (!activeSession && !publicPages.includes(currentPage) && currentPage !== '') {
        window.location.href = 'login.html';
    }
})();


// ─── 1. TOAST NOTIFICATION SYSTEM ───────────────────────────
(function createToastSystem() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);

    const icons = {
        success: 'fa-circle-check',
        error:   'fa-circle-xmark',
        info:    'fa-circle-info',
        warning: 'fa-triangle-exclamation'
    };

    window.showToast = function(message, type = 'success', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${icons[type]} toast-icon"></i>
            <span>${message}</span>
            <div class="toast-progress" style="animation-duration:${duration}ms"></div>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('hiding');
            toast.addEventListener('animationend', () => toast.remove(), { once: true });
        }, duration);
    };
})();


// ─── 2. COUNT-UP ANIMATION ───────────────────────────────────
function animateCount(el, target, duration = 900) {
    const start = parseInt(el.innerText) || 0;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // ease-out quad
        const eased = 1 - (1 - progress) * (1 - progress);
        el.innerText = Math.floor(start + diff * eased);
        if (progress < 1) requestAnimationFrame(step);
        else el.innerText = target;
    }
    requestAnimationFrame(step);
}


// ─── 3. MAIN DOM-READY ENGINE ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

    const activeSession = localStorage.getItem('session_active_user');
    const currentFile = window.location.pathname.split('/').pop().toLowerCase();

    // --- Init localStorage defaults ---
    if (!localStorage.getItem('db_users')) {
        localStorage.setItem('db_users', JSON.stringify([
            { id: 1, name: "Demo User",    email: "demo@example.com",      role: "Admin",   status: "Active", phone: "555-1234" },
            { id: 2, name: "Seng Dara",    email: "seng122006@gmail.com",  role: "User",    status: "Active", phone: "-" },
            { id: 3, name: "Chan Sophea",  email: "seng2006@gmail.com",    role: "Manager", status: "Active", phone: "-" }
        ]));
    }
    if (!localStorage.getItem('db_products'))   localStorage.setItem('db_products',   JSON.stringify([]));
    if (!localStorage.getItem('db_categories')) localStorage.setItem('db_categories', JSON.stringify([]));
    if (!localStorage.getItem('db_orders'))     localStorage.setItem('db_orders',     JSON.stringify([]));

    function syncDB() {
        return {
            users:      JSON.parse(localStorage.getItem('db_users'))      || [],
            products:   JSON.parse(localStorage.getItem('db_products'))   || [],
            categories: JSON.parse(localStorage.getItem('db_categories')) || [],
            orders:     JSON.parse(localStorage.getItem('db_orders'))     || []
        };
    }
    let db = syncDB();

    window.saveDB = function(key, data) {
        localStorage.setItem(`db_${key}`, JSON.stringify(data));
        db = syncDB();
        updateDashboardCounters();
    };


    // --- Profile name injection ---
    if (activeSession) {
        const user = JSON.parse(activeSession);
        document.querySelectorAll('.profile-name').forEach(el => el.innerText = user.name);
        const welcomeText = document.querySelector('.welcome-msg p');
        if (welcomeText && (currentFile === 'index.html' || currentFile === '')) {
            welcomeText.innerText = `Welcome back, ${user.name}`;
        }
    }


    // --- Sidebar toggle (with memory) ---
    const toggleBtn = document.getElementById('toggle-btn');
    const sidebar   = document.getElementById('sidebar');

    if (toggleBtn && sidebar) {
        if (localStorage.getItem('sidebar-collapsed') === 'true') {
            sidebar.classList.add('collapsed');
        }
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebar-collapsed', sidebar.classList.contains('collapsed'));
        });
    }


    // --- Active nav item auto-highlight ---
    document.querySelectorAll('.menu-item').forEach(item => {
        const href = item.getAttribute('href');
        if (href && (currentFile === href || (currentFile === '' && href === 'index.html'))) {
            item.classList.add('active');
        }
    });


    // --- Profile dropdown ---
    const profileTrigger  = document.getElementById('profileTrigger');
    const profileDropdown = document.getElementById('profileDropdown');

    if (profileTrigger && profileDropdown) {
        profileTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = profileDropdown.classList.toggle('show');
            profileTrigger.classList.toggle('active', isOpen);
        });
        document.addEventListener('click', (e) => {
            if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
                profileTrigger.classList.remove('active');
            }
        });
    }


    // --- Logout ---
    const logoutBtn = document.getElementById('logoutTriggerBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Sign out of your admin session?')) {
                localStorage.removeItem('session_active_user');
                window.location.href = 'login.html';
            }
        });
    }
    window.handleLogout = function() {
        localStorage.removeItem('session_active_user');
        window.location.href = 'login.html';
    };


    // ─── STAT COUNTER UPDATE ─────────────────────────────────
    function updateDashboardCounters() {
        const pCount = document.getElementById('count-products');
        const oCount = document.getElementById('count-orders');
        const cCount = document.getElementById('count-categories');
        const uCount = document.getElementById('count-users');
        if (pCount) animateCount(pCount, (JSON.parse(localStorage.getItem('db_products'))   || []).length);
        if (oCount) animateCount(oCount, (JSON.parse(localStorage.getItem('db_orders'))     || []).length);
        if (cCount) animateCount(cCount, (JSON.parse(localStorage.getItem('db_categories')) || []).length);
        if (uCount) animateCount(uCount, (JSON.parse(localStorage.getItem('db_users'))      || []).length);
    }
    updateDashboardCounters();


    // ─── DASHBOARD TABLES ────────────────────────────────────
    function renderDashboard() {
        db = syncDB();

        const catBody = document.getElementById('dash-categories-body');
        if (catBody) {
            catBody.innerHTML = db.categories.length === 0
                ? '<tr class="empty-row"><td colspan="3">No categories yet</td></tr>'
                : db.categories.slice(0, 5).map((c, i) =>
                    `<tr><td>${i + 1}</td><td><strong>${c.name}</strong></td><td style="text-align:right;">0</td></tr>`
                ).join('');
        }

        const ordBody = document.getElementById('dash-orders-body');
        if (ordBody) {
            ordBody.innerHTML = db.orders.length === 0
                ? '<tr class="empty-row"><td colspan="4">No orders yet</td></tr>'
                : db.orders.slice(0, 5).map(o =>
                    `<tr><td>#${o.id}</td><td><strong>${o.name}</strong></td><td>${o.qty}</td><td>${o.date}</td></tr>`
                ).join('');
        }

        const userBody = document.getElementById('dash-users-body');
        if (userBody) {
            userBody.innerHTML = db.users.slice(0, 5).map(u => `
                <tr>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="badge-role ${u.role.toLowerCase()}">${u.role}</span></td>
                    <td><span class="badge-status active">${u.status}</span></td>
                </tr>
            `).join('');
        }
    }
    renderDashboard();


    // ─── THEME COLOR SYSTEM ───────────────────────────────────
    const swatches = document.querySelectorAll('.color-swatch');
    const savedColor = localStorage.getItem('sys_theme_color') || '#0d9488';
    applyThemeColor(savedColor);

    swatches.forEach(swatch => {
        if (swatch.getAttribute('data-color') === savedColor) swatch.classList.add('active');
        swatch.addEventListener('click', () => {
            swatches.forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            const color = swatch.getAttribute('data-color');
            localStorage.setItem('sys_theme_color', color);
            applyThemeColor(color);
            showToast('Theme color updated!', 'success');
        });
    });

    function applyThemeColor(color) {
        document.documentElement.style.setProperty('--primary', color);
        // Darken by ~10% for dark variant
        document.documentElement.style.setProperty('--primary-dark', shadeColor(color, -12));
        document.documentElement.style.setProperty('--primary-glow', hexToRgba(color, 0.18));
        document.documentElement.style.setProperty('--primary-light', hexToRgba(color, 0.1));
    }

    function shadeColor(hex, pct) {
        const num = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.max(0, (num >> 16) + pct));
        const g = Math.min(255, Math.max(0, ((num >> 8) & 0xFF) + pct));
        const b = Math.min(255, Math.max(0, (num & 0xFF) + pct));
        return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
    }
    function hexToRgba(hex, alpha) {
        const num = parseInt(hex.slice(1), 16);
        return `rgba(${num >> 16},${(num >> 8) & 0xFF},${num & 0xFF},${alpha})`;
    }


    // ─── DARK MODE ────────────────────────────────────────────
    const darkToggle = document.getElementById('toggleDarkMode');
    if (darkToggle) {
        darkToggle.checked = localStorage.getItem('dark-mode') === 'true';
        document.body.classList.toggle('dark-mode', darkToggle.checked);

        darkToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode', darkToggle.checked);
            localStorage.setItem('dark-mode', darkToggle.checked);
            showToast(darkToggle.checked ? 'Dark mode enabled' : 'Light mode enabled', 'info');
        });
    } else {
        // Persist dark mode across all pages
        if (localStorage.getItem('dark-mode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }

    // Compact mode
    const compactToggle = document.getElementById('toggleCompactMode');
    if (compactToggle) {
        compactToggle.checked = localStorage.getItem('compact-mode') === 'true';
        if (compactToggle.checked) document.body.classList.add('compact-mode');

        compactToggle.addEventListener('change', () => {
            document.body.classList.toggle('compact-mode', compactToggle.checked);
            localStorage.setItem('compact-mode', compactToggle.checked);
            showToast(compactToggle.checked ? 'Compact mode on' : 'Compact mode off', 'info');
        });
    }


    // ─── SETTINGS FORM SAVE ───────────────────────────────────
    const systemSettingsForm = document.getElementById('systemSettingsForm');
    if (systemSettingsForm) {
        const saveBtn   = document.getElementById('saveChangesBtn');
        const resetBtn  = document.getElementById('resetSettingsBtn');

        if (saveBtn) {
            systemSettingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Saving…';
                saveBtn.disabled = true;
                setTimeout(() => {
                    saveBtn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
                    showToast('Appearance settings saved!', 'success');
                    setTimeout(() => {
                        saveBtn.innerHTML = 'Save Changes';
                        saveBtn.disabled = false;
                    }, 1800);
                }, 900);
            });
        }

        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                // Reset swatches to default teal
                swatches.forEach(s => {
                    s.classList.toggle('active', s.getAttribute('data-color') === '#0d9488');
                });
                applyThemeColor('#0d9488');
                localStorage.setItem('sys_theme_color', '#0d9488');
                if (darkToggle) { darkToggle.checked = false; document.body.classList.remove('dark-mode'); }
                showToast('Settings reset to defaults', 'info');
            });
        }
    }


    // ─── LOGO / FAVICON UPLOAD PREVIEW ───────────────────────
    const logoInput   = document.getElementById('logoFileInput');
    const faviconInput = document.getElementById('faviconFileInput');

    if (logoInput) {
        logoInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-logo-img').src = e.target.result;
                document.getElementById('main-sidebar-logo') && (document.getElementById('main-sidebar-logo').src = e.target.result);
                showToast('Logo updated', 'success');
            };
            reader.readAsDataURL(file);
        });
    }
    if (faviconInput) {
        faviconInput.addEventListener('change', function() {
            const file = this.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (e) => {
                document.getElementById('preview-favicon-img').src = e.target.result;
                showToast('Favicon updated', 'success');
            };
            reader.readAsDataURL(file);
        });
    }


    // ─── SEARCH FILTERING ────────────────────────────────────
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const q = searchInput.value.toLowerCase();
            document.querySelectorAll('.data-table tbody tr:not(.empty-row)').forEach(row => {
                row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }


    // ─── USERS TABLE ─────────────────────────────────────────
    if (document.getElementById('users-table-body')) {
        const uBody = document.getElementById('users-table-body');

        function renderUsers() {
            const list = JSON.parse(localStorage.getItem('db_users')) || [];
            if (list.length === 0) {
                uBody.innerHTML = '<tr class="empty-row"><td colspan="7">No users found</td></tr>';
                return;
            }
            uBody.innerHTML = list.map(u => `
                <tr>
                    <td>${u.id}</td>
                    <td><strong>${u.name}</strong></td>
                    <td>${u.email}</td>
                    <td><span class="badge-role ${u.role.toLowerCase()}">${u.role}</span></td>
                    <td><span class="badge-status ${u.status.toLowerCase()}">${u.status}</span></td>
                    <td>${u.phone}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.openUserModal(${u.id})" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                            <button class="btn-icon delete" onclick="window.deleteUser(${u.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        window.renderUsersTable = renderUsers;
        renderUsers();

        window.deleteUser = function(id) {
            if (!confirm('Remove this user permanently?')) return;
            let list = JSON.parse(localStorage.getItem('db_users')) || [];
            list = list.filter(u => u.id !== id);
            window.saveDB('users', list);
            renderUsers();
            showToast('User deleted', 'error');
        };
    }

    const uForm = document.getElementById('modalUserForm');
    if (uForm) {
        uForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors('#modalUserForm');
            const fName  = v('modalFirstName');
            const lName  = v('modalLastName');
            const email  = v('modalEmail');
            const role   = v('modalRole');
            const status = v('modalStatus');
            const phone  = v('modalPhone');
            let valid = true;

            if (!fName) { markError('modalFirstName'); valid = false; }
            if (!lName) { markError('modalLastName');  valid = false; }
            if (!email || !email.includes('@')) { markError('modalEmail'); valid = false; }
            if (!phone) { markError('modalPhone');     valid = false; }
            if (!valid) return;

            let list = JSON.parse(localStorage.getItem('db_users')) || [];
            const fullName = `${fName} ${lName}`;

            if (currentEditingUserId) {
                list = list.map(u => u.id === parseInt(currentEditingUserId)
                    ? { ...u, name: fullName, email, role, status, phone: phone || '-' } : u);
                showToast('User updated successfully', 'success');
            } else {
                const nextId = list.length ? Math.max(...list.map(u => u.id)) + 1 : 1;
                list.push({ id: nextId, name: fullName, email, role, status, phone: phone || '-' });
                showToast('User added successfully', 'success');
            }
            window.saveDB('users', list);
            window.closeUserModal();
            if (typeof window.renderUsersTable === 'function') window.renderUsersTable();
        });
    }


    // ─── PRODUCTS TABLE ──────────────────────────────────────
    if (document.getElementById('products-table-body')) {
        const pBody = document.getElementById('products-table-body');

        function renderProducts() {
            const list = JSON.parse(localStorage.getItem('db_products')) || [];
            if (list.length === 0) {
                pBody.innerHTML = '<tr class="empty-row"><td colspan="7">No products found</td></tr>';
                return;
            }
            pBody.innerHTML = list.map(p => `
                <tr>
                    <td>${p.id}</td>
                    <td><strong>${p.name}</strong></td>
                    <td>${p.category}</td>
                    <td>$${parseFloat(p.price).toFixed(2)}</td>
                    <td>${p.stock}</td>
                    <td title="${p.desc}">${p.desc && p.desc.length > 40 ? p.desc.slice(0, 40) + '…' : p.desc || '-'}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.openProductModal(${p.id})" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                            <button class="btn-icon delete" onclick="window.deleteProduct(${p.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        window.renderProductsTable = renderProducts;

        const addBtn = document.getElementById('btn-add-product');
        if (addBtn) addBtn.addEventListener('click', () => window.openProductModal());

        window.deleteProduct = function(id) {
            if (!confirm('Delete this product?')) return;
            let list = JSON.parse(localStorage.getItem('db_products')) || [];
            list = list.filter(p => p.id !== id);
            window.saveDB('products', list);
            renderProducts();
            showToast('Product deleted', 'error');
        };
        renderProducts();
    }

    const pForm = document.getElementById('modalProductForm');
    if (pForm) {
        pForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors('#modalProductForm');
            const name     = v('modalProdName');
            const category = v('modalProdCategory');
            const price    = v('modalProdPrice');
            const stock    = v('modalProdStock');
            const desc     = v('modalProdDesc');
            let valid = true;

            if (!name)                               { markError('modalProdName');  valid = false; }
            if (!price || parseFloat(price) <= 0)    { markError('modalProdPrice'); valid = false; }
            if (!stock || parseInt(stock) < 0)       { markError('modalProdStock'); valid = false; }
            if (!valid) return;

            let list = JSON.parse(localStorage.getItem('db_products')) || [];
            if (currentEditingProductId) {
                list = list.map(p => p.id === parseInt(currentEditingProductId)
                    ? { ...p, name, category, price: parseFloat(price).toFixed(2), stock: parseInt(stock), desc: desc || '-' } : p);
                showToast('Product updated', 'success');
            } else {
                const nextId = list.length ? Math.max(...list.map(p => p.id)) + 1 : 1;
                list.push({ id: nextId, name, category, price: parseFloat(price).toFixed(2), stock: parseInt(stock), desc: desc || '-' });
                showToast('Product added', 'success');
            }
            window.saveDB('products', list);
            window.closeProductModal();
            if (typeof window.renderProductsTable === 'function') window.renderProductsTable();
        });
    }


    // ─── CATEGORIES TABLE ────────────────────────────────────
    if (document.getElementById('categories-table-body')) {
        const cBody = document.getElementById('categories-table-body');

        function renderCategories() {
            const list = JSON.parse(localStorage.getItem('db_categories')) || [];
            if (list.length === 0) {
                cBody.innerHTML = '<tr class="empty-row"><td colspan="4">No categories found</td></tr>';
                return;
            }
            cBody.innerHTML = list.map(c => `
                <tr>
                    <td>${c.id}</td>
                    <td><strong>${c.name}</strong></td>
                    <td>0 Items</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.openCategoryModal(${c.id})" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                            <button class="btn-icon delete" onclick="window.deleteCategory(${c.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        window.renderCategoriesTable = renderCategories;

        const addBtn = document.getElementById('btn-add-category');
        if (addBtn) addBtn.addEventListener('click', () => window.openCategoryModal());

        window.deleteCategory = function(id) {
            if (!confirm('Delete this category?')) return;
            let list = JSON.parse(localStorage.getItem('db_categories')) || [];
            list = list.filter(c => c.id !== id);
            window.saveDB('categories', list);
            renderCategories();
            showToast('Category deleted', 'error');
        };
        renderCategories();
    }

    const cForm = document.getElementById('modalCategoryForm');
    if (cForm) {
        cForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors('#modalCategoryForm');
            const name = v('modalCatName');
            if (!name) { markError('modalCatName'); return; }

            let list = JSON.parse(localStorage.getItem('db_categories')) || [];
            if (currentEditingCategoryId) {
                list = list.map(c => c.id === parseInt(currentEditingCategoryId) ? { ...c, name } : c);
                showToast('Category updated', 'success');
            } else {
                const nextId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
                list.push({ id: nextId, name });
                showToast('Category added', 'success');
            }
            window.saveDB('categories', list);
            window.closeCategoryModal();
            if (typeof window.renderCategoriesTable === 'function') window.renderCategoriesTable();
        });
    }


    // ─── ORDERS TABLE ─────────────────────────────────────────
    if (document.getElementById('orders-table-body')) {
        const oBody  = document.getElementById('orders-table-body');
        const addBtn = document.getElementById('btn-add-order');

        function renderOrders() {
            const list = JSON.parse(localStorage.getItem('db_orders')) || [];
            if (list.length === 0) {
                oBody.innerHTML = '<tr class="empty-row"><td colspan="5">No orders found</td></tr>';
                return;
            }
            oBody.innerHTML = list.map(o => `
                <tr>
                    <td>#${o.id}</td>
                    <td><strong>${o.name}</strong></td>
                    <td>${o.qty} Units</td>
                    <td>${o.date}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon edit" onclick="window.openOrderModal(${o.id})" title="Edit"><i class="fa-solid fa-pencil"></i></button>
                            <button class="btn-icon delete" onclick="window.deleteOrder(${o.id})" title="Delete"><i class="fa-solid fa-trash-can"></i></button>
                        </div>
                    </td>
                </tr>
            `).join('');
        }
        window.renderOrdersTable = renderOrders;
        if (addBtn) addBtn.addEventListener('click', () => window.openOrderModal());

        window.deleteOrder = function(id) {
            if (!confirm('Remove this order?')) return;
            let list = JSON.parse(localStorage.getItem('db_orders')) || [];
            list = list.filter(o => o.id !== id);
            window.saveDB('orders', list);
            renderOrders();
            showToast('Order deleted', 'error');
        };
        renderOrders();
    }

    const oForm = document.getElementById('modalOrderForm');
    if (oForm) {
        oForm.addEventListener('submit', function(e) {
            e.preventDefault();
            clearErrors('#modalOrderForm');
            const name = v('modalOrderName');
            const qty  = v('modalOrderQty');
            let valid = true;
            if (!name)                           { markError('modalOrderName'); valid = false; }
            if (!qty || parseInt(qty) <= 0)      { markError('modalOrderQty');  valid = false; }
            if (!valid) return;

            let list = JSON.parse(localStorage.getItem('db_orders')) || [];
            if (currentEditingOrderId) {
                list = list.map(o => o.id === parseInt(currentEditingOrderId)
                    ? { ...o, name, qty: parseInt(qty) } : o);
                showToast('Order updated', 'success');
            } else {
                const nextId  = list.length ? Math.max(...list.map(o => o.id)) + 1 : 1;
                const date    = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
                list.push({ id: nextId, name, qty: parseInt(qty), date });
                showToast('Order added', 'success');
            }
            window.saveDB('orders', list);
            window.closeOrderModal();
            if (typeof window.renderOrdersTable === 'function') window.renderOrdersTable();
        });
    }


    // ─── SETTINGS FORMS (general + notifications) ─────────────
    document.querySelectorAll('form[onsubmit]').forEach(form => {
        if (form.id === 'systemSettingsForm') return; // handled above
        form.removeAttribute('onsubmit');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = form.querySelector('[type="submit"]');
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = '<i class="fa-solid fa-check"></i> Saved!';
                btn.disabled = true;
                showToast('Settings saved successfully!', 'success');
                setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
            }
        });
    });


    // ─── UTILITY HELPERS ──────────────────────────────────────
    function v(id) {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    }
    function markError(id) {
        const el = document.getElementById(id);
        if (el && el.parentElement) el.parentElement.classList.add('input-error');
    }
    function clearErrors(scope) {
        document.querySelectorAll(`${scope} .modal-group`).forEach(g => g.classList.remove('input-error'));
    }

}); // end DOMContentLoaded


// ─── 4. GLOBAL MODAL MANAGERS ────────────────────────────────
let currentEditingUserId     = null;
let currentEditingProductId  = null;
let currentEditingCategoryId = null;
let currentEditingOrderId    = null;

/* ── USER MODAL ── */
window.openUserModal = function(userId = null) {
    const modal = document.getElementById('userModalOverlay');
    const form  = document.getElementById('modalUserForm');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#modalUserForm .modal-group').forEach(g => g.classList.remove('input-error'));
    currentEditingUserId = userId;

    if (userId) {
        document.getElementById('modalFormTitle').innerText = 'Edit User';
        const u = (JSON.parse(localStorage.getItem('db_users')) || []).find(u => u.id === parseInt(userId));
        if (u) {
            const parts = u.name.split(' ');
            document.getElementById('modalFirstName').value = parts[0]            || '';
            document.getElementById('modalLastName').value  = parts.slice(1).join(' ') || '';
            document.getElementById('modalEmail').value     = u.email;
            document.getElementById('modalRole').value      = u.role;
            document.getElementById('modalStatus').value    = u.status;
            document.getElementById('modalPhone').value     = u.phone === '-' ? '' : u.phone;
        }
    } else {
        document.getElementById('modalFormTitle').innerText = 'Add User';
    }
    modal.classList.add('modal-visible');
};

window.closeUserModal = function() {
    const modal = document.getElementById('userModalOverlay');
    if (modal) modal.classList.remove('modal-visible');
    currentEditingUserId = null;
};

/* ── PRODUCT MODAL ── */
window.openProductModal = function(productId = null) {
    const modal = document.getElementById('productModalOverlay');
    const form  = document.getElementById('modalProductForm');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#modalProductForm .modal-group').forEach(g => g.classList.remove('input-error'));
    currentEditingProductId = productId;

    if (productId) {
        document.getElementById('productModalTitle').innerText = 'Edit Product';
        const p = (JSON.parse(localStorage.getItem('db_products')) || []).find(p => p.id === parseInt(productId));
        if (p) {
            document.getElementById('modalProdName').value     = p.name;
            document.getElementById('modalProdCategory').value = p.category;
            document.getElementById('modalProdPrice').value    = p.price;
            document.getElementById('modalProdStock').value    = p.stock;
            document.getElementById('modalProdDesc').value     = p.desc === '-' ? '' : p.desc;
        }
    } else {
        document.getElementById('productModalTitle').innerText = 'Add New Product';
    }
    modal.classList.add('modal-visible');
};

window.closeProductModal = function() {
    const modal = document.getElementById('productModalOverlay');
    if (modal) modal.classList.remove('modal-visible');
    currentEditingProductId = null;
};

/* ── CATEGORY MODAL ── */
window.openCategoryModal = function(catId = null) {
    const modal = document.getElementById('categoryModalOverlay');
    const form  = document.getElementById('modalCategoryForm');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#modalCategoryForm .modal-group').forEach(g => g.classList.remove('input-error'));
    currentEditingCategoryId = catId;

    if (catId) {
        document.getElementById('categoryModalTitle').innerText = 'Edit Category';
        const c = (JSON.parse(localStorage.getItem('db_categories')) || []).find(c => c.id === parseInt(catId));
        if (c) document.getElementById('modalCatName').value = c.name;
    } else {
        document.getElementById('categoryModalTitle').innerText = 'Add New Category';
    }
    modal.classList.add('modal-visible');
};

window.closeCategoryModal = function() {
    const modal = document.getElementById('categoryModalOverlay');
    if (modal) modal.classList.remove('modal-visible');
    currentEditingCategoryId = null;
};

/* ── ORDER MODAL ── */
window.openOrderModal = function(orderId = null) {
    const modal = document.getElementById('orderModalOverlay');
    const form  = document.getElementById('modalOrderForm');
    if (!modal || !form) return;

    form.reset();
    document.querySelectorAll('#modalOrderForm .modal-group').forEach(g => g.classList.remove('input-error'));
    currentEditingOrderId = orderId;

    if (orderId) {
        document.getElementById('orderModalTitle').innerText = 'Edit Order';
        const o = (JSON.parse(localStorage.getItem('db_orders')) || []).find(o => o.id === parseInt(orderId));
        if (o) {
            document.getElementById('modalOrderName').value = o.name;
            document.getElementById('modalOrderQty').value  = o.qty;
        }
    } else {
        document.getElementById('orderModalTitle').innerText = 'Add Order';
    }
    modal.classList.add('modal-visible');
};

window.closeOrderModal = function() {
    const modal = document.getElementById('orderModalOverlay');
    if (modal) modal.classList.remove('modal-visible');
    currentEditingOrderId = null;
};

/* ── CLOSE MODALS ON BACKDROP CLICK ── */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('custom-modal-overlay')) {
        e.target.classList.remove('modal-visible');
    }
});

/* ── CLOSE MODALS ON ESC ── */
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.modal-visible, .custom-modal-overlay.modal-visible')
            .forEach(m => m.classList.remove('modal-visible'));
    }
});