document.addEventListener('DOMContentLoaded', () => {

    /* ========================================================= */
    /* === Lógica para el panel de ADMINISTRADOR (admin.html) === */
    /* ========================================================= */
    const productoForm = document.getElementById('productoForm');
    const listaProductos = document.getElementById('lista-productos');
    const formButton = productoForm ? productoForm.querySelector('button') : null;
    const contentSections = document.querySelectorAll('.dashboard .content-card');
    const navLinks = document.querySelectorAll('.admin-panel aside nav ul li a');
    const logoutLink = document.getElementById('logout-link');
    let productoEnEdicion = null;

    // Funciones para manejar datos en localStorage
    function guardarProductos(productos) {
        localStorage.setItem('productos', JSON.stringify(productos));
    }

    function obtenerProductos() {
        const productosJSON = localStorage.getItem('productos');
        return productosJSON ? JSON.parse(productosJSON) : [];
    }

    function guardarReportes(reportes) {
        localStorage.setItem('reportes', JSON.stringify(reportes));
    }

    function obtenerReportes() {
        const reportesJSON = localStorage.getItem('reportes');
        return reportesJSON ? JSON.parse(reportesJSON) : {};
    }

    function guardarUsuarios(usuarios) {
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
    }

    function obtenerUsuarios() {
        const usuariosJSON = localStorage.getItem('usuarios');
        return usuariosJSON ? JSON.parse(usuariosJSON) : [];
    }

    function guardarUsuarioLogueado(usuario) {
        localStorage.setItem('usuarioLogueado', JSON.stringify(usuario));
    }

    function obtenerUsuarioLogueado() {
        const usuarioJSON = localStorage.getItem('usuarioLogueado');
        return usuarioJSON ? JSON.parse(usuarioJSON) : null;
    }

    const resetButton = document.getElementById('reset-dashboard-btn');

    if (resetButton) {
        resetButton.addEventListener('click', () => {
            if (confirm('¿Estás seguro de que quieres restablecer todos los datos de ventas y reportes? Esta acción no se puede deshacer.')) {
                localStorage.removeItem('reportes');
                localStorage.removeItem('carrito');
                renderizarDashboard();
                alert('Los datos del dashboard han sido restablecidos.');
            }
        });
    }

    function renderizarDashboard() {
        const reportes = obtenerReportes();
        const usuarios = obtenerUsuarios();
        const historialVentas = reportes.historialVentas || [];

        const compradores = new Set(historialVentas.map(orden => orden.usuario));
        compradores.delete('Invitado');

        const productosVendidos = historialVentas.reduce((total, orden) => {
            return total + orden.productos.reduce((sum, p) => sum + p.cantidad, 0);
        }, 0);

        const totalVentas = reportes.ventasTotales || 0;
        document.getElementById('total-ventas').textContent = `$${totalVentas.toFixed(2)}`;
        document.getElementById('clientes-activos').textContent = compradores.size;
        document.getElementById('productos-vendidos').textContent = productosVendidos;
        document.getElementById('total-usuarios').textContent = usuarios.length;
    }

    // Corregida la función para renderizar los productos en el admin panel
    function renderizarProductosAdmin() {
        const productos = obtenerProductos();
        if (listaProductos) {
            listaProductos.innerHTML = '';
            productos.forEach((producto, index) => {
                const nuevaFila = document.createElement('tr');
                nuevaFila.innerHTML = `
                    <td><img src="${producto.imagen}" alt="${producto.nombre}" style="width: 50px;"></td>
                    <td>${producto.nombre}</td>
                    <td>${producto.categoria ? producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1) : ''}</td>
                    <td>$${producto.precio.toFixed(2)}</td>
                    <td>${producto.stock}</td>
                    <td>
                        <button class="edit-btn button-secondary" data-index="${index}">Editar</button>
                        <button class="delete-btn button-danger" data-index="${index}">Eliminar</button>
                    </td>
                `;
                listaProductos.appendChild(nuevaFila);
            });
        }
    }

    if (productoForm) {
        productoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const nombre = document.getElementById('nombre-producto').value;
            const descripcion = document.getElementById('descripcion-producto').value;
            const precio = document.getElementById('precio-producto').value;
            const stock = document.getElementById('stock-producto').value;
            const imagen = document.getElementById('imagen-producto').value;
            const categoria = document.getElementById('categoria-producto').value;
            let productos = obtenerProductos();

            if (productoEnEdicion !== null) {
                productos[productoEnEdicion] = { nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock), imagen, categoria };
                productoEnEdicion = null;
                formButton.textContent = "Guardar Producto";
            } else {
                productos.push({ nombre, descripcion, precio: parseFloat(precio), stock: parseInt(stock), imagen, categoria });
            }
            guardarProductos(productos);
            renderizarProductosAdmin(); // Vuelve a renderizar la tabla después de guardar
            productoForm.reset();
        });
    }

    if (listaProductos) {
        listaProductos.addEventListener('click', (event) => {
            const target = event.target;
            if (target.classList.contains('delete-btn')) {
                const index = target.dataset.index;
                if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                    let productos = obtenerProductos();
                    productos.splice(index, 1);
                    guardarProductos(productos);
                    renderizarProductosAdmin();
                }
            }
            if (target.classList.contains('edit-btn')) {
                const index = target.dataset.index;
                const productos = obtenerProductos();
                const productoParaEditar = productos[index];

                document.getElementById('nombre-producto').value = productoParaEditar.nombre;
                document.getElementById('descripcion-producto').value = productoParaEditar.descripcion || '';
                document.getElementById('precio-producto').value = productoParaEditar.precio;
                document.getElementById('stock-producto').value = productoParaEditar.stock;
                document.getElementById('imagen-producto').value = productoParaEditar.imagen;
                document.getElementById('categoria-producto').value = productoParaEditar.categoria || '';
                
                productoEnEdicion = index;
                formButton.textContent = "Actualizar Producto";
            }
        });
    }

    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(navLink => navLink.classList.remove('active'));
                e.target.classList.add('active');
                contentSections.forEach(section => section.style.display = 'none');
                const targetId = e.target.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    if (targetId === 'dashboard') {
                        renderizarDashboard();
                    } else if (targetId === 'reportes') {
                        generarReportes();
                    } else if (targetId === 'gestion-usuarios') {
                        renderizarUsuariosAdmin();
                    } else if (targetId === 'gestion-productos') {
                        renderizarProductosAdmin();
                    }
                }
            });
        });
    }

    if (logoutLink) {
        logoutLink.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('isAdminLoggedIn');
            localStorage.removeItem('usuarioLogueado');
            window.location.href = 'index.html';
        });
    }
    
    // El resto de funciones de admin (generarReportes, renderizarUsuariosAdmin) se mantienen igual

    /* ========================================================= */
    /* === Lógica de AUTENTICACIÓN (login, register, forgot pass) === */
    /* ========================================================= */
    const openLoginBtn = document.getElementById('open-login-btn');
    const loginModal = document.getElementById('login-modal');
    const closeLoginModalBtn = document.getElementById('close-login-modal-btn');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const showForgotPassLink = document.getElementById('show-forgot-pass');
    const showLoginForgotLink = document.getElementById('show-login-forgot');
    const showRegisterFromMenu = document.getElementById('show-register-from-menu');
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const forgotPassSection = document.getElementById('forgot-pass-section');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPassForm = document.getElementById('forgot-pass-form');

    const profileLink = document.querySelector('.profile-link');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    const searchLink = document.querySelector('.search-link');
    const searchInput = document.getElementById('search-input');
    let searchTimeout;

    if (profileLink) {
        profileLink.addEventListener('click', (e) => {
            e.preventDefault();
            dropdownMenu.classList.toggle('show-dropdown');
        });
    }

    window.addEventListener('click', (e) => {
        if (dropdownMenu && !profileLink.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('show-dropdown');
        }
    });

    if (searchLink) {
        searchLink.addEventListener('click', (e) => {
            e.preventDefault();
            searchInput.classList.toggle('active');
            searchInput.focus();
        });
    }

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = searchInput.value.toLowerCase();
                const productosContainer = document.getElementById('productos-grid') || document.getElementById('productos-grid-tienda');
                const productos = productosContainer ? productosContainer.querySelectorAll('.product-card') : [];
                productos.forEach(card => {
                    const nombre = card.querySelector('h3').textContent.toLowerCase();
                    const isVisible = nombre.includes(query);
                    card.style.display = isVisible ? 'block' : 'none';
                });
            }, 300);
        });
    }

    if (openLoginBtn) {
        openLoginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
            dropdownMenu.classList.remove('show-dropdown');
        });
    }

    if (showRegisterFromMenu) {
        showRegisterFromMenu.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
            forgotPassSection.style.display = 'none';
            dropdownMenu.classList.remove('show-dropdown');
        });
    }

    if (closeLoginModalBtn) {
        closeLoginModalBtn.addEventListener('click', () => {
            loginModal.style.display = 'none';
        });
    }

    if (showRegisterLink) {
        showRegisterLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            registerSection.style.display = 'block';
            forgotPassSection.style.display = 'none';
        });
    }

    if (showLoginLink) {
        showLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'block';
            registerSection.style.display = 'none';
            forgotPassSection.style.display = 'none';
        });
    }

    if (showForgotPassLink) {
        showForgotPassLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'none';
            registerSection.style.display = 'none';
            forgotPassSection.style.display = 'block';
        });
    }

    if (showLoginForgotLink) {
        showLoginForgotLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginSection.style.display = 'block';
            registerSection.style.display = 'none';
            forgotPassSection.style.display = 'none';
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('user-login').value;
            const password = document.getElementById('pass-login').value;

            if (username === 'felipe' && password === 'felipe123') {
                localStorage.setItem('isAdminLoggedIn', 'true');
                window.location.href = 'admin.html';
                return;
            }

            const usuarios = obtenerUsuarios();
            const usuarioExistente = usuarios.find(u => u.usuario === username && u.clave === password);

            if (usuarioExistente) {
                alert('Inicio de sesión exitoso.');
                guardarUsuarioLogueado(usuarioExistente);
                loginModal.style.display = 'none';
            } else {
                alert('Usuario o contraseña incorrectos.');
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUser = document.getElementById('new-user').value;
            const newEmail = document.getElementById('new-email').value;
            const newPass = document.getElementById('new-pass').value;
            const confirmPass = document.getElementById('confirm-pass').value;

            if (newPass !== confirmPass) {
                alert('Las claves no coinciden.');
                return;
            }

            let usuarios = obtenerUsuarios();
            const usuarioExistente = usuarios.find(u => u.usuario === newUser || u.correo === newEmail);

            if (usuarioExistente) {
                alert('El usuario o correo ya están registrados.');
            } else {
                const nuevoUsuarioId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
                usuarios.push({ id: nuevoUsuarioId, usuario: newUser, correo: newEmail, clave: newPass });
                guardarUsuarios(usuarios);
                alert('Cuenta creada con éxito. Ahora puedes iniciar sesión.');
                loginSection.style.display = 'block';
                registerSection.style.display = 'none';
            }
        });
    }

    if (forgotPassForm) {
        forgotPassForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('forgot-email').value;
            const usuarios = obtenerUsuarios();
            const usuario = usuarios.find(u => u.correo === email);

            if (usuario) {
                const tempPassword = 'clave123';
                alert(`Tu contraseña provisoria es: ${tempPassword}`);
            } else {
                alert('Correo no encontrado.');
            }
        });
    }

    /* ========================================================= */
    /* === Lógica para la TIENDA (index.html, tienda.html) === */
    /* ========================================================= */
    const productosGrid = document.getElementById('productos-grid');
    const tiendaProductosGrid = document.getElementById('productos-grid-tienda');
    const cartSidebar = document.getElementById('cart-sidebar');
    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cartCountElement = document.getElementById('cart-count');
    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const closeCheckoutModalBtn = document.getElementById('close-checkout-modal-btn');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const discountCodeInput = document.getElementById('discount-code');
    const applyDiscountBtn = document.getElementById('apply-discount-btn');
    
    // Filtros
    const categoriaFilters = document.querySelectorAll('.categoria-filter');
    const aplicarFiltroBtn = document.getElementById('aplicar-filtro-btn');
    const precioMinInput = document.getElementById('precio-min');
    const precioMaxInput = document.getElementById('precio-max');
    
    let carrito = obtenerCarrito();
    let descuentoAplicado = false;

    function guardarCarrito(items) {
        localStorage.setItem('carrito', JSON.stringify(items));
    }
    
    function obtenerCarrito() {
        const carritoJSON = localStorage.getItem('carrito');
        return carritoJSON ? JSON.parse(carritoJSON) : [];
    }

    function renderizarCarrito() {
        cartItemsContainer.innerHTML = '';
        let total = 0;

        if (carrito.length === 0) {
            emptyCartMessage.style.display = 'block';
            checkoutBtn.disabled = true;
        } else {
            emptyCartMessage.style.display = 'none';
            checkoutBtn.disabled = false;
            carrito.forEach((item, index) => {
                const cartItemElement = document.createElement('div');
                cartItemElement.className = 'cart-item';
                cartItemElement.innerHTML = `
                    <img src="${item.imagen}" alt="${item.nombre}">
                    <div class="item-details">
                        <h4>${item.nombre}</h4>
                        <p>Talla: ${item.talla}</p>
                        <p>${item.cantidad} x $${item.precio.toFixed(2)}</p>
                    </div>
                    <button class="remove-from-cart-btn" data-index="${index}"><span class="material-icons">delete</span></button>
                `;
                cartItemsContainer.appendChild(cartItemElement);
                total += item.precio * item.cantidad;
            });
        }
        
        if (descuentoAplicado) {
            total = total * 0.9;
        }

        cartTotalElement.textContent = `$${total.toFixed(2)}`;
        cartCountElement.textContent = carrito.length;
        guardarCarrito(carrito);
    }
    
    function agregarAlCarrito(productoNombre, talla) {
        const productosDisponibles = obtenerProductos();
        const producto = productosDisponibles.find(p => p.nombre === productoNombre);

        if (producto && producto.stock > 0) {
            const itemExistente = carrito.find(item => item.nombre === productoNombre && item.talla === talla);
            if (itemExistente) {
                itemExistente.cantidad++;
            } else {
                carrito.push({ ...producto, cantidad: 1, talla: talla });
            }
            producto.stock--;
            guardarProductos(productosDisponibles);
            renderizarProductos(productosDisponibles);
            renderizarCarrito();
        } else {
            alert('Producto agotado');
        }
    }

    function eliminarDelCarrito(itemIndex) {
        const itemRemovido = carrito.splice(itemIndex, 1)[0];
        const productosDisponibles = obtenerProductos();
        const productoOriginal = productosDisponibles.find(p => p.nombre === itemRemovido.nombre);
        
        if (productoOriginal) {
            productoOriginal.stock += itemRemovido.cantidad;
            guardarProductos(productosDisponibles);
            renderizarProductos(productosDisponibles);
        }
        renderizarCarrito();
    }
    
    function manejarCompra() {
        const reportes = obtenerReportes();
        const ventasTotales = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0) * (descuentoAplicado ? 0.9 : 1);
        
        reportes.ventasTotales = (reportes.ventasTotales || 0) + ventasTotales;
        reportes.ordenesConcretadas = (reportes.ordenesConcretadas || 0) + 1;

        const usuarioLogueado = obtenerUsuarioLogueado();
        const nombreUsuario = usuarioLogueado ? usuarioLogueado.usuario : 'Invitado';

        carrito.forEach(item => {
            reportes.productosPopulares = reportes.productosPopulares || {};
            reportes.productosPopulares[item.nombre] = (reportes.productosPopulares[item.nombre] || 0) + item.cantidad;
        });

        reportes.historialVentas = reportes.historialVentas || [];
        const nuevoId = reportes.historialVentas.length > 0 ? Math.max(...reportes.historialVentas.map(o => o.id)) + 1 : 1;
        const nuevaOrden = {
            id: nuevoId,
            usuario: nombreUsuario,
            fecha: new Date().toLocaleDateString(),
            productos: carrito.map(p => ({ nombre: p.nombre, cantidad: p.cantidad, talla: p.talla })),
            total: ventasTotales
        };
        reportes.historialVentas.push(nuevaOrden);

        guardarReportes(reportes);
        
        carrito = [];
        descuentoAplicado = false;
        guardarCarrito(carrito);
        renderizarCarrito();
    }

    if (applyDiscountBtn) {
        applyDiscountBtn.addEventListener('click', () => {
            const code = discountCodeInput.value.trim();
            if (code === 'NOVACLUB10') {
                descuentoAplicado = true;
                renderizarCarrito();
                alert('¡Descuento aplicado! 10% de descuento en tu compra.');
            } else {
                descuentoAplicado = false;
                renderizarCarrito();
                alert('Código de descuento no válido.');
            }
        });
    }
    
    // Manejar eventos de clics para agregar al carrito
    if (productosGrid) {
        productosGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const productCard = event.target.closest('.product-card');
                const nombreProducto = event.target.dataset.nombre;
                const tallaSelect = productCard.querySelector('.talla-select');
                const talla = tallaSelect.value;
                agregarAlCarrito(nombreProducto, talla);
            }
        });
    }

    if (tiendaProductosGrid) {
        tiendaProductosGrid.addEventListener('click', (event) => {
            if (event.target.classList.contains('add-to-cart-btn')) {
                const productCard = event.target.closest('.product-card');
                const nombreProducto = event.target.dataset.nombre;
                const tallaSelect = productCard.querySelector('.talla-select');
                const talla = tallaSelect.value;
                agregarAlCarrito(nombreProducto, talla);
            }
        });
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            if (event.target.closest('.remove-from-cart-btn')) {
                const itemIndex = event.target.closest('.remove-from-cart-btn').dataset.index;
                eliminarDelCarrito(itemIndex);
            }
        });
    }

    if (openCartBtn) {
        openCartBtn.addEventListener('click', () => {
            cartSidebar.classList.add('open');
            renderizarCarrito();
        });
    }

    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', () => {
            cartSidebar.classList.remove('open');
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (carrito.length === 0) {
                alert('Tu carrito está vacío. Agrega productos para continuar.');
                return;
            }
            const usuarioLogueado = obtenerUsuarioLogueado();
            if (!usuarioLogueado) {
                alert('Debes iniciar sesión para realizar una compra.');
                loginModal.style.display = 'flex';
                return;
            }
            manejarCompra();
            checkoutModal.style.display = 'flex';
            cartSidebar.classList.remove('open');
        });
    }
    
    if (closeCheckoutModalBtn) {
        closeCheckoutModalBtn.addEventListener('click', () => {
            checkoutModal.style.display = 'none';
        });
    }
    
    // Lógica de filtrado
    function aplicarFiltros() {
        const productos = obtenerProductos();
        
        // CORRECCIÓN: Usar .value para obtener los valores del input de precio
        const precioMin = parseFloat(precioMinInput.value) || 0;
        const precioMax = parseFloat(precioMaxInput.value) || Infinity;
        
        // CORRECCIÓN: Obtener las categorías seleccionadas correctamente
        const categoriasSeleccionadas = Array.from(categoriaFilters)
                                        .filter(checkbox => checkbox.checked)
                                        .map(checkbox => checkbox.value.toLowerCase());
        
        const productosFiltrados = productos.filter(producto => {
            const cumpleCategoria = categoriasSeleccionadas.length === 0 || categoriasSeleccionadas.includes(producto.categoria.toLowerCase());
            const cumplePrecio = producto.precio >= precioMin && producto.precio <= precioMax;
            return cumpleCategoria && cumplePrecio;
        });

        renderizarProductos(productosFiltrados);
    }

    if (aplicarFiltroBtn) {
        aplicarFiltroBtn.addEventListener('click', aplicarFiltros);
    }
    
    function renderizarProductos(productosARenderizar) {
        const gridContainer = document.getElementById('productos-grid') || document.getElementById('productos-grid-tienda');
        if (!gridContainer) return;
        
        gridContainer.innerHTML = '';
        productosARenderizar.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card';
            productCard.innerHTML = `
                <img src="${producto.imagen}" alt="${producto.nombre}">
                <h3>${producto.nombre}</h3>
                <p class="description">${producto.descripcion || ''}</p>
                <p class="price">$${producto.precio.toFixed(2)}</p>
                <div class="product-options">
                    <label for="talla-${producto.nombre.replace(/\s/g, '-')}-">Talla:</label>
                    <select id="talla-${producto.nombre.replace(/\s/g, '-')}-" class="talla-select">
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                    </select>
                </div>
                <p class="stock">Stock: ${producto.stock}</p>
                <button class="add-to-cart-btn button" data-nombre="${producto.nombre}" ${producto.stock === 0 ? 'disabled' : ''}>Agregar al Carrito</button>
            `;
            gridContainer.appendChild(productCard);
        });
    }
    
    // Inicializar la página (con lógica para cada URL)
    if (window.location.pathname.includes('admin.html')) {
        renderizarProductosAdmin();
        renderizarDashboard();
    }
    
    if (window.location.pathname.includes('index.html')) {
        const productos = obtenerProductos();
        renderizarProductos(productos.slice(0, 8)); // Muestra los primeros 8 productos en el inicio
        renderizarCarrito();
    }
    
    if (window.location.pathname.includes('tienda.html')) {
        const productos = obtenerProductos();
        renderizarProductos(productos);
        renderizarCarrito();
    }
});