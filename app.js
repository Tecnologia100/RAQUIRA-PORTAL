/* ==========================================================================
   APP.JS - PORTAL DE ADMINISTRACIÓN RESIDENCIAL (RÁQUIRA)
   Lógica SPA, LocalStorage, Calendario y Sincronización con Google Sheets
   ========================================================================== */

// Estado global de la aplicación
let appState = {
  config: {
    name: "Ráquira",
    fullname: "Conjunto Residencial Ráquira",
    nit: "901.900.228",
    adminName: "Sandra Liliana Iquinas",
    address: "Calle 7 # 20B - 63 — Yumbo",
    tel: "313 7075008",
    email: "conjuntoraquira@gmail.com",
    logoData: null, // Guardará base64
    sheetsUrl: "",   // URL de Google Apps Script Web App
    adminPin: "1234" // PIN por defecto
  },
  spaces: [
    { name: "Salón Social", capacity: 80, cost: 150000, icon: "home" },
    { name: "Kiosko", capacity: 30, cost: 50000, icon: "sun" },
    { name: "Canchas", capacity: 20, cost: 0, icon: "activity" },
    { name: "Piscina", capacity: 40, cost: 0, icon: "droplet" },
    { name: "BBQ / Parrilla", capacity: 15, cost: 30000, icon: "flame" }
  ],
  reservations: [
    {
      id: "res-1",
      space: "Salón Social",
      date: "2026-06-15",
      time: "Tarde (02:00 PM - 07:00 PM)",
      apt: "Torre 1 Apt 201",
      name: "Juan Fernando Gomez",
      purpose: "Cumpleaños infantil",
      dateCreated: new Date().toISOString()
    },
    {
      id: "res-2",
      space: "BBQ / Parrilla",
      date: "2026-06-20",
      time: "Todo el día (08:00 AM - 11:59 PM)",
      apt: "Torre 3 Apt 504",
      name: "Maria Camila Restrepo",
      purpose: "Asado familiar",
      dateCreated: new Date().toISOString()
    }
  ],
  requests: [
    {
      id: "req-1",
      type: "Mudanza",
      date: "2026-06-08",
      time: "08:30",
      apt: "Torre 2 Apt 302",
      company: "Trasteos del Valle",
      details: "Entrada. Camión placas KLO-987. Ingreso por portería principal.",
      status: "Aprobada",
      dateCreated: new Date().toISOString()
    },
    {
      id: "req-2",
      type: "Materiales",
      date: "2026-06-10",
      time: "14:00",
      apt: "Torre 4 Apt 103",
      company: "Homecenter",
      details: "Entrega de 15 cajas de cerámica y 5 bultos de pegacor.",
      status: "Pendiente",
      dateCreated: new Date().toISOString()
    }
  ],
  notices: [
    {
      id: "not-1",
      title: "Mantenimiento preventivo de Ascensores",
      category: "mantenimiento",
      content: "Estimados copropietarios: Se realizará la jornada mensual de mantenimiento preventivo a los ascensores de las Torres 1 y 2 el día jueves 4 de junio de 8:00 AM a 12:00 PM. Agradecemos su comprensión y usar las escaleras durante este lapso.",
      date: "2026-06-02",
      dateCreated: new Date().toISOString()
    },
    {
      id: "not-2",
      title: "Asamblea General Extraordinaria de Copropietarios",
      category: "circular",
      content: "La administración convoca a la Asamblea Extraordinaria de Copropietarios el domingo 14 de junio a las 9:00 AM en el Salón Social. Se discutirán temas referentes al presupuesto de impermeabilización de terrazas. Su asistencia es obligatoria.",
      date: "2026-06-01",
      dateCreated: new Date().toISOString()
    }
  ],
  pqrs: [
    {
      id: "pqr-1",
      type: "Queja",
      name: "Martha Lucía Ortiz",
      apt: "Torre 1 Apt 402",
      subject: "Ruido excesivo mascotas",
      description: "Buenas tardes administración. Escribo porque el perro del apt 502 ladra continuamente durante toda la noche, impidiendo el descanso de mi familia. Ya se ha hablado con el vecino pero persiste el problema. Solicito llamado de atención formal.",
      status: "En Proceso",
      adminReply: "Estimada Martha. Hemos recibido su queja. Procederemos a realizar un requerimiento escrito al propietario del apt 502 de acuerdo con el manual de convivencia. Estaremos haciéndole seguimiento.",
      dateCreated: "2026-06-02T10:30:00.000Z",
      dateUpdated: "2026-06-02T15:00:00.000Z"
    },
    {
      id: "pqr-2",
      type: "Sugerencia",
      name: "Carlos Mario Restrepo",
      apt: "Torre 3 Apt 101",
      subject: "Pintura de parqueaderos de bicicletas",
      description: "Sugiero que se pinte y demarque la zona del parqueadero de bicicletas externo que está junto a la portería 2, ya que por la lluvia se ha borrado la demarcación y hay desorden al parquear.",
      status: "Pendiente",
      adminReply: "",
      dateCreated: "2026-06-03T08:15:00.000Z",
      dateUpdated: ""
    }
  ],
  reports: [
    {
      id: "rep-1",
      title: "Informe de Gestión - Mayo 2026",
      description: "Resumen detallado de las actividades realizadas, mantenimiento de áreas comunes y estado de cuentas de la copropiedad durante el mes de mayo.",
      date: "2026-05-31",
      attachmentName: "Informe_Gestion_Mayo_2026.txt",
      attachmentUrl: "data:text/plain;base64,SW5mb3JtZSBkZSBHZXN0acOzbiAtIE1heW8gMjAyNgpDb25qdW50byBSZXNpZGVuY2lhbCBSw6FxdWlyYQoKVG9kbyBlc3RhIGVuIG9yZGVuLg==",
      dateCreated: new Date().toISOString()
    }
  ]
};

// Variables del Calendario
let currentYear = 2026;
let currentMonth = 5; // 0 = Ene, 5 = Jun
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Variables de Espacio Seleccionado en Reservas
let selectedSpaceName = "";
let selectedDateStr = "";

// Variable de solicitud (mudanza vs materiales)
let currentRequestType = "mudanza";

// Modo administrador / desarrollador
let isAdmin = false;

// ==========================================
// INICIALIZACIÓN DE LA APLICACIÓN
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadData();
  setupNavigation();
  setupSidebarToggle();
  setupConfigForm();
  setupSpacesAdmin();
  setupCalendarNav();
  setupReservationForm();
  setupNoticeForm();
  setupRequestForms();
  setupPqrForms();
  setupPqrReplyForm();
  setupAdminLogin();
  setupReportForm();

  // Cargar datos del servidor Sheets en segundo plano si está configurado
  if (appState.config.sheetsUrl) {
    syncWithGoogleSheets();
  } else {
    updateUI();
  }
});

// ==========================================
// PERSISTENCIA Y SINCRONIZACIÓN (GOOGLE SHEETS / LOCALSTORAGE)
// ==========================================

// Guardar datos localmente
function saveData() {
  localStorage.setItem("conjunto_raquira_state", JSON.stringify(appState));
}

// Cargar datos
function loadData() {
  const saved = localStorage.getItem("conjunto_raquira_state");
  if (saved) {
    try {
      appState = JSON.parse(saved);
      // Asegurar compatibilidad si no existía el PIN
      if (!appState.config.adminPin) {
        appState.config.adminPin = "1234";
      }
      // Inicializar lista de informes si no existe o está vacía
      if (!appState.reports || appState.reports.length === 0) {
        appState.reports = [
          {
            id: "rep-1",
            title: "Informe de Gestión - Mayo 2026",
            description: "Resumen detallado de las actividades realizadas, mantenimiento de áreas comunes y estado de cuentas de la copropiedad durante el mes de mayo.",
            date: "2026-05-31",
            attachmentName: "Informe_Gestion_Mayo_2026.txt",
            attachmentUrl: "data:text/plain;base64,SW5mb3JtZSBkZSBHZXN0acOzbiAtIE1heW8gMjAyNgpDb25qdW50byBSZXNpZGVuY2lhbCBSw6FxdWlyYQoKVG9kbyBlc3RhIGVuIG9yZGVuLg==",
            dateCreated: new Date().toISOString()
          }
        ];
      }
    } catch (e) {
      console.error("Error al parsear el estado guardado", e);
    }
  }
}

// Sincronizar datos con Google Sheets (Lectura completa)
async function syncWithGoogleSheets() {
  const badge = document.getElementById("db-status-badge");
  const text = document.getElementById("db-status-text");
  
  if (!appState.config.sheetsUrl) {
    badge.classList.remove("connected");
    text.innerText = "Base de datos Local";
    return;
  }

  badge.classList.remove("connected");
  text.innerText = "Conectando Google Sheets...";

  try {
    const url = appState.config.sheetsUrl;
    // Realizar GET para leer la base de datos
    const response = await fetch(url);
    if (!response.ok) throw new Error("Error en respuesta de red");
    
    const result = await response.json();
    
    if (result.success) {
      console.log("Datos cargados exitosamente de Google Sheets:", result);
      
      // Mapear configuración de vuelta
      if (result.config && Object.keys(result.config).length > 0) {
        const localLogo = appState.config.logoData; // preserve local logo
        appState.config = { ...appState.config, ...result.config };
        if (localLogo) {
          appState.config.logoData = localLogo; // restore local logo
        } else {
          delete appState.config.logoData;
        }
      }
      
      // Mapear espacios
      if (result.spaces && result.spaces.length > 0) {
        appState.spaces = result.spaces.map(s => ({
          name: s.Nombre,
          capacity: parseInt(s.Capacidad) || 0,
          cost: parseFloat(s.Costo) || 0,
          icon: s.Icono || "home"
        }));
      }

      // Mapear reservas
      if (result.reservations) {
        appState.reservations = result.reservations.map(r => ({
          id: r.id,
          space: r.space,
          date: r.date.split("T")[0], // Asegurar formato AAAA-MM-DD
          time: r.time,
          apt: r.apt,
          name: r.name,
          purpose: r.purpose,
          dateCreated: r.dateCreated
        }));
      }

      // Mapear solicitudes
      if (result.requests) {
        appState.requests = result.requests.map(r => ({
          id: r.id,
          type: r.type,
          date: r.date.split("T")[0],
          time: r.time,
          apt: r.apt,
          company: r.company,
          details: r.details,
          status: r.status,
          dateCreated: r.dateCreated
        }));
      }

      // Mapear PQRs
      if (result.pqrs) {
        appState.pqrs = result.pqrs.map(p => ({
          id: p.id,
          type: p.type,
          name: p.name,
          apt: p.apt,
          subject: p.subject,
          description: p.description,
          status: p.status,
          adminReply: p.adminReply || "",
          dateCreated: p.dateCreated,
          dateUpdated: p.dateUpdated || ""
        }));
      }

      // Mapear Avisos
      if (result.notices) {
        appState.notices = result.notices.map(n => ({
          id: n.id,
          title: n.title,
          category: n.category,
          content: n.content,
          date: n.date.split("T")[0],
          dateCreated: n.dateCreated
        }));
      }

      // Mapear informes
      if (result.reports) {
        appState.reports = result.reports.map(rep => ({
          id: rep.id,
          title: rep.title,
          description: rep.description,
          date: rep.date.split("T")[0],
          attachmentName: rep.attachmentName,
          attachmentUrl: rep.attachmentUrl,
          dateCreated: rep.dateCreated
        }));
      } else if (!appState.reports || appState.reports.length === 0) {
        appState.reports = [
          {
            id: "rep-1",
            title: "Informe de Gestión - Mayo 2026",
            description: "Resumen detallado de las actividades realizadas, mantenimiento de áreas comunes y estado de cuentas de la copropiedad durante el mes de mayo.",
            date: "2026-05-31",
            attachmentName: "Informe_Gestion_Mayo_2026.txt",
            attachmentUrl: "data:text/plain;base64,SW5mb3JtZSBkZSBHZXN0acOzbiAtIE1heW8gMjAyNgpDb25qdW50byBSZXNpZGVuY2lhbCBSw6FxdWlyYQoKVG9kbyBlc3RhIGVuIG9yZGVuLg==",
            dateCreated: new Date().toISOString()
          }
        ];
      }
      
      saveData();
      badge.classList.add("connected");
      text.innerText = "Base de datos en Línea (Google Sheets)";
    } else {
      throw new Error(result.error || "Error desconocido del script");
    }
  } catch (err) {
    console.error("Fallo al conectar con Google Sheets, usando LocalStorage:", err);
    badge.classList.remove("connected");
    text.innerText = "Error Google Sheets - Usando Local";
  } finally {
    updateUI();
  }
}

// Enviar acción POST a Google Sheets
async function postToGoogleSheets(action, data) {
  if (!appState.config.sheetsUrl) return false;
  
  try {
    const response = await fetch(appState.config.sheetsUrl, {
      method: "POST",
      mode: "no-cors", // Para evitar problemas de CORS simples con redireccionamientos de Google
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ action: action, data: data })
    });
    
    // Con no-cors, la respuesta será opaca (status 0), pero Google la procesará correctamente
    console.log("Acción enviada a Google Sheets:", action, data);
    return true;
  } catch (e) {
    console.error("Error al enviar POST a Google Sheets:", e);
    return false;
  }
}

// ==========================================
// ENRUTAMIENTO Y VISTAS (Navegación SPA)
// ==========================================
function setupNavigation() {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
  
  menuItems.forEach(item => {
    item.addEventListener("click", () => {
      // Remover clase activo de todos los items del menú
      menuItems.forEach(mi => mi.classList.remove("active"));
      
      // Agregar activo al seleccionado
      item.classList.add("active");
      
      // Obtener vista objetivo
      const targetId = item.getAttribute("data-target");
      navigateToTab(targetId);
      
      // Cerrar sidebar en móviles
      document.getElementById("sidebar").classList.remove("open");
    });
  });
}

function navigateToTab(tabId) {
  // Ocultar todas las secciones de vista
  const views = document.querySelectorAll(".view-section");
  views.forEach(view => view.classList.remove("active"));
  
  // Mostrar la sección correspondiente
  const targetView = document.getElementById(tabId);
  if (targetView) {
    targetView.classList.add("active");
  }
  
  // Actualizar título superior
  const pageTitle = document.getElementById("page-title");
  const tabNames = {
    "view-inicio": "Inicio",
    "view-pagos": "Cuentas y Pagos",
    "view-reservas": "Reservas de Espacios",
    "view-solicitudes": "Solicitudes Mudanza / Materiales",
    "view-avisos": "Avisos y Circulares",
    "view-informe": "Informe de Gestión Administrativa",
    "view-pqrs": "Peticiones, Quejas y Reclamos (PQR)",
    "view-config": "Configuración del Conjunto"
  };
  
  pageTitle.innerText = tabNames[tabId] || "Inicio";
  
  // Disparadores específicos por vista
  if (tabId === "view-reservas") {
    renderSpacesSelector();
    renderCalendar();
  }
}

function setupSidebarToggle() {
  const toggle = document.getElementById("menu-toggle");
  const sidebar = document.getElementById("sidebar");
  
  toggle.addEventListener("click", () => {
    sidebar.classList.toggle("open");
  });
  
  // Cerrar haciendo clic fuera
  document.addEventListener("click", (e) => {
    if (!sidebar.contains(e.target) && !toggle.contains(e.target) && sidebar.classList.contains("open")) {
      sidebar.classList.remove("open");
    }
  });
}

// ==========================================
// RENDERIZADO GENERAL DE LA INTERFAZ (UI)
// ==========================================
function updateUI() {
  // 1. Datos generales en cabecera y sidebar
  document.getElementById("brand-name").innerText = appState.config.name;
  document.getElementById("current-complex-subtitle").innerText = appState.config.fullname;
  document.getElementById("admin-name").innerText = appState.config.adminName;
  
  // Iniciales del Administrador para el avatar
  const initials = appState.config.adminName
    .split(" ")
    .slice(0, 2)
    .map(w => w[0])
    .join("")
    .toUpperCase();
  document.getElementById("admin-avatar").innerText = initials || "AD";

  // 2. Banner de inicio y datos de contacto
  document.getElementById("dashboard-welcome-title").innerText = `¡Bienvenido a ${appState.config.name}!`;
  document.getElementById("card-admin-name").innerText = appState.config.adminName;
  document.getElementById("card-nit").innerText = appState.config.nit;
  document.getElementById("card-direccion").innerText = appState.config.address;
  document.getElementById("contact-tel").innerText = appState.config.tel;
  document.getElementById("contact-email").innerText = appState.config.email;
  document.getElementById("payment-instruction-email").innerText = appState.config.email;
  document.getElementById("contact-address").innerText = appState.config.address;

  // 3. Renderizar logotipo personalizado
  renderLogo();

  // 5. Cargar otros elementos dinámicos
  renderDashboardNotices();
  renderNotices();
  renderRequestsTable();
  renderPqrsList();
  
  // Llenar campos de configuración si están cargados
  document.getElementById("cfg-name").value = appState.config.fullname;
  document.getElementById("cfg-nit").value = appState.config.nit;
  document.getElementById("cfg-admin").value = appState.config.adminName;
  document.getElementById("cfg-address").value = appState.config.address;
  document.getElementById("cfg-tel").value = appState.config.tel;
  document.getElementById("cfg-email").value = appState.config.email;
  document.getElementById("cfg-pin").value = appState.config.adminPin;
  document.getElementById("cfg-sheets-url").value = appState.config.sheetsUrl;

  // 6. Renderizar informes de gestión
  renderReports();
}

// Renderizado del logotipo — SIEMPRE usa logo.jpeg del repositorio
function renderLogo() {
  const container = document.getElementById("sidebar-logo-container");
  const cfgPreview = document.getElementById("cfg-logo-preview");
  
  // Siempre usar la imagen estática definitiva con anti-caché
  const imgHtml = `<img src="logo.jpeg?v=${new Date().getTime()}" class="logo-img" alt="Logo Conjunto Residencial Ráquira">`;
  container.innerHTML = imgHtml;
  if (cfgPreview) cfgPreview.innerHTML = imgHtml;
}

// ==========================================
// VISTA: CONFIGURACIÓN
// ==========================================
function setupConfigForm() {
  const form = document.getElementById("config-form");

  // Guardar configuración
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const oldSheetsUrl = appState.config.sheetsUrl;
    
    appState.config.fullname = document.getElementById("cfg-name").value.trim();
    // Extraer primer palabra del nombre completo para el sidebar
    appState.config.name = appState.config.fullname.split(" ").pop() || "Copropiedad";
    appState.config.nit = document.getElementById("cfg-nit").value.trim();
    appState.config.adminName = document.getElementById("cfg-admin").value.trim();
    appState.config.address = document.getElementById("cfg-address").value.trim();
    appState.config.tel = document.getElementById("cfg-tel").value.trim();
    appState.config.email = document.getElementById("cfg-email").value.trim();
    appState.config.sheetsUrl = document.getElementById("cfg-sheets-url").value.trim();
    appState.config.adminPin = document.getElementById("cfg-pin").value.trim();

    saveData();
    alert("Configuración guardada localmente de manera exitosa.");

    // Sincronizar en Sheets
    if (appState.config.sheetsUrl) {
      const configToPost = { ...appState.config };
      // El logo es un archivo estático, no lo enviamos a Sheets
      delete configToPost.logoData;
      await postToGoogleSheets("updateConfig", configToPost);
      
      // Si la URL cambió, re-sincronizar todo
      if (appState.config.sheetsUrl !== oldSheetsUrl) {
        syncWithGoogleSheets();
      } else {
        updateUI();
      }
    } else {
      updateUI();
    }
  });
}

// ==========================================
// VISTA: RESERVAS DE ESPACIOS
// ==========================================

// Renderizar tarjetas de espacios en Reservas
function renderSpacesSelector() {
  const container = document.getElementById("spaces-grid-container");
  container.innerHTML = "";
  
  if (appState.spaces.length === 0) {
    container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1;">No hay espacios comunes habilitados.</p>`;
    document.getElementById("space-info-box").style.display = "none";
    return;
  }

  // Si no hay espacio seleccionado previamente, tomamos el primero
  if (!selectedSpaceName && appState.spaces.length > 0) {
    selectedSpaceName = appState.spaces[0].name;
  }

  appState.spaces.forEach(space => {
    const isSelected = space.name === selectedSpaceName;
    const card = document.createElement("div");
    card.className = `space-select-card ${isSelected ? 'selected' : ''}`;
    
    // Asignar icono SVG basado en configuración
    let svgIcon = `<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>`; // Default
    if (space.icon === "home") {
      svgIcon = `<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>`;
    } else if (space.icon === "sun") {
      svgIcon = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    } else if (space.icon === "activity") {
      svgIcon = `<svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>`;
    } else if (space.icon === "droplet") {
      svgIcon = `<svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path></svg>`;
    } else if (space.icon === "flame") {
      svgIcon = `<svg viewBox="0 0 24 24"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>`;
    }

    card.innerHTML = `
      ${svgIcon}
      <span class="space-title-small">${space.name}</span>
    `;

    card.addEventListener("click", () => {
      selectedSpaceName = space.name;
      // Ocultar formulario de reservas al cambiar espacio
      document.getElementById("reservation-form-card").style.display = "none";
      renderSpacesSelector();
      renderCalendar();
    });

    container.appendChild(card);
  });

  // Mostrar info detallada en caja
  const selectedSpace = appState.spaces.find(s => s.name === selectedSpaceName);
  if (selectedSpace) {
    document.getElementById("space-info-box").style.display = "block";
    document.getElementById("selected-space-name").innerText = selectedSpace.name;
    document.getElementById("selected-space-details").innerHTML = `
      <strong>Capacidad Máxima:</strong> ${selectedSpace.capacity} personas | 
      <strong>Costo de Alquiler:</strong> ${selectedSpace.cost === 0 ? 'Gratuito' : `$${selectedSpace.cost.toLocaleString('es-CO')}`}
    `;
  }
}

// Configuración de controles de Calendario
function setupCalendarNav() {
  document.getElementById("prev-month-btn").addEventListener("click", () => {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  });

  document.getElementById("next-month-btn").addEventListener("click", () => {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  });
}

// Renderizado del calendario mensual interactivo
function renderCalendar() {
  const monthYearLabel = document.getElementById("calendar-month-year");
  const container = document.getElementById("calendar-days-container");
  
  monthYearLabel.innerText = `${monthNames[currentMonth]} ${currentYear}`;
  container.innerHTML = "";

  // Primer día del mes
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  // Cantidad de días en el mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Celdas vacías del principio
  // Ajuste para Domingo al final o al inicio (getDay(): 0 es Dom, 1 Lun, etc.)
  for (let i = 0; i < firstDay; i++) {
    const emptyCell = document.createElement("button");
    emptyCell.className = "calendar-day-btn empty";
    emptyCell.disabled = true;
    container.appendChild(emptyCell);
  }

  // Días reales del mes
  const today = new Date();
  const currentMonthStr = (currentMonth + 1).toString().padStart(2, '0');

  for (let day = 1; day <= daysInMonth; day++) {
    const dayStr = day.toString().padStart(2, '0');
    const fullDateStr = `${currentYear}-${currentMonthStr}-${dayStr}`;
    
    const dayBtn = document.createElement("button");
    dayBtn.className = "calendar-day-btn";
    dayBtn.innerText = day;
    
    // Verificar si es hoy
    if (today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear) {
      dayBtn.classList.add("today");
    }

    // Verificar si el día está seleccionado
    if (selectedDateStr === fullDateStr) {
      dayBtn.classList.add("selected");
    }

    // Verificar si tiene reservas registradas
    const bookings = appState.reservations.filter(r => r.space === selectedSpaceName && r.date === fullDateStr);
    if (bookings.length > 0) {
      dayBtn.classList.add("has-booking");
    }

    // Deshabilitar días pasados (excepto hoy)
    const cellDate = new Date(currentYear, currentMonth, day);
    const comparisonDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (cellDate < comparisonDate) {
      dayBtn.disabled = true;
    }

    // Acción al dar clic en un día
    dayBtn.addEventListener("click", () => {
      // Desmarcar anterior
      const prevSelected = container.querySelector(".calendar-day-btn.selected");
      if (prevSelected) prevSelected.classList.remove("selected");
      
      dayBtn.classList.add("selected");
      selectedDateStr = fullDateStr;

      showReservationForm(fullDateStr);
    });

    container.appendChild(dayBtn);
  }

  renderReservationsTable();
}

// Mostrar formulario para reservar
function showReservationForm(dateStr) {
  const formCard = document.getElementById("reservation-form-card");
  
  document.getElementById("booking-space-id").value = selectedSpaceName;
  document.getElementById("booking-date").value = dateStr;
  
  document.getElementById("booking-space-lbl").innerText = selectedSpaceName;
  
  // Dar formato legible a la fecha DD/MM/AAAA
  const parts = dateStr.split("-");
  document.getElementById("booking-date-lbl").innerText = `${parts[2]}/${parts[1]}/${parts[0]}`;

  formCard.style.display = "block";
  
  // Hacer scroll automático al formulario
  formCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Formulario de Reserva: Enviar
function setupReservationForm() {
  const form = document.getElementById("reservation-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const space = document.getElementById("booking-space-id").value;
    const date = document.getElementById("booking-date").value;
    const name = document.getElementById("booking-name").value.trim();
    const apt = document.getElementById("booking-apt").value.trim();
    const time = document.getElementById("booking-time").value;
    const purpose = document.getElementById("booking-purpose").value.trim();

    // Validar conflicto de reserva
    // Un espacio no se puede reservar dos veces la misma fecha y el mismo horario
    const conflict = appState.reservations.find(r => r.space === space && r.date === date && r.time === time);
    
    if (conflict) {
      alert(`Error: Ya existe una reserva para el espacio "${space}" el día ${date} en el horario "${time}". Por favor escoge otro horario o día.`);
      return;
    }

    const newBooking = {
      id: "res-" + Date.now(),
      space,
      date,
      time,
      apt,
      name,
      purpose,
      dateCreated: new Date().toISOString()
    };

    appState.reservations.push(newBooking);
    saveData();

    alert("Reserva registrada con éxito.");
    form.reset();
    document.getElementById("reservation-form-card").style.display = "none";

    // Enviar a Google Sheets
    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("addReservation", newBooking);
      syncWithGoogleSheets();
    } else {
      updateUI();
      renderCalendar();
    }
  });
}

// Renderizar tabla de historial de reservas
function renderReservationsTable() {
  const tbody = document.querySelector("#reservations-table tbody");
  tbody.innerHTML = "";

  // Filtrar reservas asociadas al espacio seleccionado
  const bookings = appState.reservations.filter(r => r.space === selectedSpaceName);
  
  // Ordenar por fecha descendente
  bookings.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (bookings.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="text-muted" style="text-align: center;">No hay reservas registradas en este espacio.</td>
      </tr>
    `;
    return;
  }

  bookings.forEach(b => {
    const row = document.createElement("tr");
    
    // Formatear fecha
    const parts = b.date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    row.innerHTML = `
      <td><strong>${b.space}</strong></td>
      <td>${formattedDate}</td>
      <td><span style="font-size:12px; color:var(--text-muted);">${b.time}</span></td>
      <td>${b.apt}</td>
      <td>${b.name}</td>
    `;
    tbody.appendChild(row);
  });
}

// ==========================================
// CONFIGURACIÓN DE ESPACIOS (ADMINISTRACIÓN)
// ==========================================
function setupSpacesAdmin() {
  const form = document.getElementById("add-space-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("new-space-name").value.trim();
    const cap = parseInt(document.getElementById("new-space-cap").value) || 10;
    const cost = parseFloat(document.getElementById("new-space-cost").value) || 0;

    // Validar duplicado
    if (appState.spaces.find(s => s.name.toLowerCase() === name.toLowerCase())) {
      alert("Este espacio ya existe.");
      return;
    }

    const newSpace = {
      name,
      capacity: cap,
      cost,
      icon: "home" // default icon
    };

    appState.spaces.push(newSpace);
    saveData();
    form.reset();
    alert("Espacio común agregado correctamente.");

    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("updateSpaces", appState.spaces);
      syncWithGoogleSheets();
    } else {
      updateUI();
      renderSpacesSelector();
    }
  });
}

function renderSpacesAdminTable() {
  const tbody = document.querySelector("#space-admin-list tbody");
  tbody.innerHTML = "";

  appState.spaces.forEach(s => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${s.name}</strong></td>
      <td>${s.capacity} personas</td>
      <td>$${s.cost.toLocaleString('es-CO')}</td>
      <td>
        <button class="btn btn-danger" style="padding: 4px 8px; font-size: 11px;" onclick="deleteSpace('${s.name}')">Eliminar</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Global para llamar desde HTML
window.deleteSpace = async function(name) {
  if (confirm(`¿Estás seguro de que deseas eliminar el espacio "${name}"? Esto no eliminará sus reservas previas pero impedirá nuevas.`)) {
    appState.spaces = appState.spaces.filter(s => s.name !== name);
    
    // Si borramos el espacio seleccionado, reseteamos selección
    if (selectedSpaceName === name) {
      selectedSpaceName = appState.spaces.length > 0 ? appState.spaces[0].name : "";
    }
    
    saveData();
    
    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("deleteSpace", { name: name });
      syncWithGoogleSheets();
    } else {
      updateUI();
      renderSpacesSelector();
      renderCalendar();
    }
  }
};

// Modificaciones a render dinámico
const originalRenderSpacesSelector = renderSpacesSelector;
renderSpacesSelector = function() {
  originalRenderSpacesSelector();
  renderSpacesAdminTable();
};

// ==========================================
// VISTA: SOLICITUDES (MUDANZAS Y MATERIALES)
// ==========================================
function toggleRequestType(type) {
  currentRequestType = type;
  
  const mForm = document.getElementById("mudanza-form");
  const matForm = document.getElementById("materiales-form");
  
  const mBtn = document.getElementById("toggle-mudanzas-btn");
  const matBtn = document.getElementById("toggle-materiales-btn");

  if (type === "mudanza") {
    mForm.style.display = "flex";
    matForm.style.display = "none";
    mBtn.style.backgroundColor = "var(--color-primary)";
    mBtn.style.color = "white";
    matBtn.style.backgroundColor = "transparent";
    matBtn.style.color = "var(--text-muted)";
  } else {
    mForm.style.display = "none";
    matForm.style.display = "flex";
    matBtn.style.backgroundColor = "var(--color-primary)";
    matBtn.style.color = "white";
    mBtn.style.backgroundColor = "transparent";
    mBtn.style.color = "var(--text-muted)";
  }
}

function setupRequestForms() {
  // 1. Enviar Mudanza
  const mudanzaForm = document.getElementById("mudanza-form");
  mudanzaForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("mudanza-name").value.trim();
    const apt = document.getElementById("mudanza-apt").value.trim();
    const type = document.getElementById("mudanza-type").value;
    const date = document.getElementById("mudanza-date").value;
    const time = document.getElementById("mudanza-time").value;
    const company = document.getElementById("mudanza-company").value.trim();
    const details = document.getElementById("mudanza-details").value.trim();

    const newRequest = {
      id: "req-" + Date.now(),
      type: `Mudanza (${type})`,
      date,
      time,
      apt,
      company: company || "Particular",
      details,
      status: "Pendiente",
      dateCreated: new Date().toISOString()
    };

    appState.requests.push(newRequest);
    saveData();
    mudanzaForm.reset();
    alert("Solicitud de mudanza registrada con éxito.");

    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("addRequest", newRequest);
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  });

  // 2. Enviar Materiales
  const matForm = document.getElementById("materiales-form");
  matForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("material-name").value.trim();
    const apt = document.getElementById("material-apt").value.trim();
    const date = document.getElementById("material-date").value;
    const company = document.getElementById("material-company").value.trim();
    const desc = document.getElementById("material-desc").value.trim();

    const newRequest = {
      id: "req-" + Date.now(),
      type: "Ingreso Materiales",
      date,
      time: "--:--",
      apt,
      company,
      details: desc,
      status: "Pendiente",
      dateCreated: new Date().toISOString()
    };

    appState.requests.push(newRequest);
    saveData();
    matForm.reset();
    alert("Solicitud de entrega de materiales registrada con éxito.");

    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("addRequest", newRequest);
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  });
}

function renderRequestsTable() {
  const tbody = document.querySelector("#requests-table tbody");
  tbody.innerHTML = "";

  // Ordenar por fecha descendente
  appState.requests.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (appState.requests.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted" style="text-align: center;">No hay solicitudes programadas.</td>
      </tr>
    `;
    return;
  }

  appState.requests.forEach(r => {
    const row = document.createElement("tr");
    
    // Badge de estado
    let badgeClass = "pending";
    if (r.status === "Aprobada") badgeClass = "resolved";
    if (r.status === "Denegada") badgeClass = "denied";

    // Formato de fecha
    const parts = r.date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    row.innerHTML = `
      <td><strong>${r.type}</strong></td>
      <td>${formattedDate} ${r.time}</td>
      <td>${r.apt}</td>
      <td><span style="font-size:12px; display:block; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${r.details}"><strong>${r.company}:</strong> ${r.details}</span></td>
      <td><span class="badge ${badgeClass}">${r.status}</span></td>
      <td class="admin-only">
        ${r.status === "Pendiente" ? `
          <div style="display:flex; gap:4px;">
            <button class="btn btn-primary" style="padding: 4px 8px; font-size:11px; background-color:#10b981;" onclick="updateRequestStatus('${r.id}', 'Aprobada')">Aprobar</button>
            <button class="btn btn-danger" style="padding: 4px 8px; font-size:11px;" onclick="updateRequestStatus('${r.id}', 'Denegada')">Denegar</button>
          </div>
        ` : `<span style="font-size:11px; color:var(--text-muted);">Procesada</span>`}
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.updateRequestStatus = async function(id, status) {
  const reqIndex = appState.requests.findIndex(r => r.id === id);
  if (reqIndex !== -1) {
    appState.requests[reqIndex].status = status;
    saveData();
    
    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("updateRequestStatus", { id: id, status: status });
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  }
};

// ==========================================
// VISTA: AVISOS Y CIRCULARES
// ==========================================

// Render de avisos en dashboard de Inicio (Solo los últimos 2)
function renderDashboardNotices() {
  const container = document.getElementById("dashboard-notices-container");
  container.innerHTML = "";
  
  // Ordenar por fecha creación descendente
  const sorted = [...appState.notices].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated));
  const latest = sorted.slice(0, 2);

  if (latest.length === 0) {
    container.innerHTML = `<p class="text-muted">No hay avisos recientes.</p>`;
    return;
  }

  latest.forEach(n => {
    const card = document.createElement("div");
    card.style = "padding: 16px; border: 1.5px solid var(--border-color); border-radius: var(--radius-md); background: white; margin-bottom: 12px; display:flex; flex-direction:column; gap:8px;";
    
    let badgeClass = "general";
    if (n.category === "circular") badgeClass = "circular";
    if (n.category === "mantenimiento") badgeClass = "mantenimiento";
    if (n.category === "evento") badgeClass = "evento";

    // Formatear fecha
    const parts = n.date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="notice-badge ${badgeClass}">${n.category}</span>
        <span style="font-size:11px; color:var(--text-muted);">${formattedDate}</span>
      </div>
      <h4 style="font-size:15px; font-weight:700; color:var(--text-main);">${n.title}</h4>
      <p style="font-size:13px; color:var(--text-muted); line-height:1.4; display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden;">${n.content}</p>
    `;
    container.appendChild(card);
  });
}

// Render de avisos en la pestaña de avisos completa
function renderNotices() {
  const container = document.getElementById("notices-list-container");
  container.innerHTML = "";
  
  const sorted = [...appState.notices].sort((a,b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  if (sorted.length === 0) {
    container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 40px;">No hay avisos publicados en cartelera.</p>`;
    return;
  }

  sorted.forEach(n => {
    const card = document.createElement("div");
    card.className = "notice-card";
    
    let badgeClass = "general";
    if (n.category === "circular") badgeClass = "circular";
    if (n.category === "mantenimiento") badgeClass = "mantenimiento";
    if (n.category === "evento") badgeClass = "evento";

    const parts = n.date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    card.innerHTML = `
      <span class="notice-badge ${badgeClass}">${n.category}</span>
      <h3 class="notice-title">${n.title}</h3>
      <p class="notice-content">${n.content}</p>
      <div class="notice-footer">
        <span>Fecha: ${formattedDate}</span>
        <button class="delete-notice-btn admin-only" onclick="deleteNotice('${n.id}')" title="Eliminar aviso">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

function setupNoticeForm() {
  const form = document.getElementById("new-notice-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("notice-title").value.trim();
    const category = document.getElementById("notice-category").value;
    const content = document.getElementById("notice-body").value.trim();
    
    const today = new Date();
    const date = `${today.getFullYear()}-${(today.getMonth()+1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

    const newNotice = {
      id: "not-" + Date.now(),
      title,
      category,
      content,
      date,
      dateCreated: new Date().toISOString()
    };

    appState.notices.push(newNotice);
    saveData();
    form.reset();
    closeModal("modal-notice");
    alert("Aviso publicado de manera exitosa en el tablón.");

    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("addNotice", newNotice);
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  });
}

window.deleteNotice = async function(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este aviso del tablón?")) {
    appState.notices = appState.notices.filter(n => n.id !== id);
    saveData();
    
    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("deleteNotice", { id: id });
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  }
};

// ==========================================
// VISTA: PQR
// ==========================================
function setupPqrForms() {
  const form = document.getElementById("pqr-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const name = document.getElementById("pqr-name").value.trim();
    const apt = document.getElementById("pqr-apt").value.trim();
    const type = document.getElementById("pqr-type").value;
    const subject = document.getElementById("pqr-subject").value.trim();
    const description = document.getElementById("pqr-desc").value.trim();
    const fileInput = document.getElementById("pqr-attachment");

    const submitPqr = async (attachmentName = null, attachmentUrl = null) => {
      const newPqr = {
        id: "pqr-" + Date.now(),
        type,
        name,
        apt,
        subject,
        description,
        status: "Pendiente",
        adminReply: "",
        attachmentName,
        attachmentUrl,
        dateCreated: new Date().toISOString(),
        dateUpdated: ""
      };

      appState.pqrs.push(newPqr);

      // Intentar guardar en localStorage
      try {
        saveData();
      } catch (err) {
        console.warn("Excedió la cuota de localStorage al guardar el adjunto. Guardando sin adjunto...", err);
        newPqr.attachmentUrl = null;
        newPqr.description += `\n\n[Nota del sistema: El archivo adjunto "${attachmentName}" era muy grande para almacenarse en el navegador]`;
        try {
          saveData();
          alert("El PQR se guardó con éxito, pero el archivo adjunto era demasiado grande para el almacenamiento local del navegador.");
        } catch (err2) {
          console.error("Fallo al guardar incluso sin adjunto", err2);
        }
      }

      form.reset();
      alert("PQR radicado con éxito. Número de radicado guardado.");

      if (appState.config.sheetsUrl) {
        // Enviar a Google Sheets
        const sheetData = { ...newPqr };
        // Si el archivo adjunto es muy grande, no enviamos Base64 gigante a las celdas de Sheets
        if (sheetData.attachmentUrl && sheetData.attachmentUrl.length > 40000) {
          sheetData.attachmentUrl = "[Archivo grande guardado en base de datos local]";
        }
        await postToGoogleSheets("addPqr", sheetData);
        syncWithGoogleSheets();
      } else {
        updateUI();
      }
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo adjunto supera el límite de 2MB. Por favor, selecciona un archivo más pequeño.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        submitPqr(file.name, evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      submitPqr();
    }
  });
}

function renderPqrsList() {
  const container = document.getElementById("pqrs-list-container");
  container.innerHTML = "";

  // Filtrar las no solucionadas (status !== "Resuelto"). Si es residente, tampoco ver las pendientes
  const activePqrs = appState.pqrs.filter(p => {
    if (p.status === "Resuelto") return false;
    if (!isAdmin && p.status === "Pendiente") return false;
    return true;
  });

  if (activePqrs.length === 0) {
    const noPqrMessage = isAdmin ? "No hay PQRs pendientes o en proceso." : "No hay PQRs en proceso actualmente.";
    container.innerHTML = `<p class="text-muted" style="text-align: center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1.5px solid var(--border-color);">${noPqrMessage}</p>`;
    return;
  }

  // Ordenar por creación descendente
  activePqrs.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated));

  activePqrs.forEach(p => {
    const item = document.createElement("div");
    item.className = "pqr-item";
    
    let statusClass = "pending";
    if (p.status === "En Proceso") statusClass = "progress";
    if (p.status === "Resuelto") statusClass = "resolved";

    const date = new Date(p.dateCreated);
    const formattedDate = `${date.getDate().toString().padStart(2,'0')}/${(date.getMonth()+1).toString().padStart(2,'0')}/${date.getFullYear()}`;

    item.innerHTML = `
      <div class="pqr-summary-header" onclick="togglePqrAccordion('${p.id}')">
        <div class="pqr-summary-main">
          <span class="badge ${statusClass}">${p.status}</span>
          <div class="pqr-title-meta">
            <h4>${p.subject}</h4>
            <span>Radicado: ${p.id} | Tipo: ${p.type} | Fecha: ${formattedDate}</span>
          </div>
        </div>
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" id="icon-${p.id}" style="transition: transform var(--transition-fast);"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
      
      <div class="pqr-expanded-content" id="content-${p.id}">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; font-size:13px; color:var(--text-muted);">
          <div><strong>Propietario:</strong> ${isAdmin ? p.name : "Anónimo"}</div>
          <div><strong>Unidad:</strong> ${isAdmin ? p.apt : "Oculta"}</div>
        </div>
        
        <div class="pqr-desc-block">
          <h5>Descripción de la Solicitud</h5>
          <p>${p.description}</p>
        </div>
        
        ${p.attachmentUrl ? `
          <div class="pqr-attachment-block" style="margin-top: 12px; padding: 12px; background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-sm);">
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 8px;">
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-main); font-weight: 500;">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--color-primary-light);"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px;">${p.attachmentName || "Archivo Soporte"}</span>
              </div>
              <a href="${p.attachmentUrl}" download="${p.attachmentName || 'soporte'}" class="btn btn-outline" style="padding: 4px 8px; font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                Descargar
              </a>
            </div>
            ${(p.attachmentName && /\.(mp4|webm|ogg|mov)$/i.test(p.attachmentName)) || (p.attachmentUrl && p.attachmentUrl.startsWith("data:video/")) ? `
              <video src="${p.attachmentUrl}" controls style="max-width: 100%; max-height: 200px; border-radius: var(--radius-sm); background: black; display: block; margin-top: 8px;"></video>
            ` : ""}
            ${(p.attachmentName && /\.(png|jpe?g|gif|svg|webp)$/i.test(p.attachmentName)) || (p.attachmentUrl && p.attachmentUrl.startsWith("data:image/")) ? `
              <img src="${p.attachmentUrl}" alt="Soporte PQR" style="max-width: 100%; max-height: 200px; border-radius: var(--radius-sm); border: 1px solid var(--border-color); display: block; margin-top: 8px; object-fit: contain;">
            ` : ""}
          </div>
        ` : ""}
        
        ${p.adminReply ? `
          <div class="pqr-admin-reply-box" style="margin-top: 12px;">
            <h5>Respuesta de la Administración</h5>
            <p style="background:transparent; border:none; padding:0; margin-top:4px; font-size:14px;">${p.adminReply}</p>
            <div style="font-size:11px; color:#3b82f6; margin-top:8px; text-align:right;">Respondido el: ${new Date(p.dateUpdated).toLocaleString()}</div>
          </div>
        ` : `
          <div style="display:flex; justify-content: flex-end; margin-top: 16px;" class="admin-only">
            <button class="btn btn-primary" style="padding: 6px 12px; font-size:12px;" onclick="openPqrReplyModal('${p.id}')">Responder PQR</button>
          </div>
        `}
      </div>
    `;

    container.appendChild(item);
  });
}

// Acordeón de PQRs
window.togglePqrAccordion = function(id) {
  const content = document.getElementById(`content-${id}`);
  const icon = document.getElementById(`icon-${id}`);
  
  if (content.style.display === "block") {
    content.style.display = "none";
    icon.style.transform = "rotate(0deg)";
  } else {
    content.style.display = "block";
    icon.style.transform = "rotate(180deg)";
  }
};

// Responder PQR: Modal
window.openPqrReplyModal = function(id) {
  const pqr = appState.pqrs.find(p => p.id === id);
  if (pqr) {
    document.getElementById("reply-pqr-id").value = pqr.id;
    document.getElementById("reply-pqr-meta").innerHTML = `
      <strong>ID Radicado:</strong> ${pqr.id}<br>
      <strong>Asunto:</strong> ${pqr.subject}<br>
      <strong>Usuario:</strong> ${pqr.name} (${pqr.apt})
    `;
    document.getElementById("reply-status").value = "Resuelto";
    document.getElementById("reply-content").value = "";
    
    openModal("modal-pqr-reply");
  }
};

function setupPqrReplyForm() {
  const form = document.getElementById("pqr-reply-form");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const id = document.getElementById("reply-pqr-id").value;
    const status = document.getElementById("reply-status").value;
    const reply = document.getElementById("reply-content").value.trim();

    const pqrIndex = appState.pqrs.findIndex(p => p.id === id);
    if (pqrIndex !== -1) {
      appState.pqrs[pqrIndex].status = status;
      appState.pqrs[pqrIndex].adminReply = reply;
      appState.pqrs[pqrIndex].dateUpdated = new Date().toISOString();

      saveData();
      closeModal("modal-pqr-reply");
      alert("Respuesta a PQR enviada y estado actualizado.");

      if (appState.config.sheetsUrl) {
        await postToGoogleSheets("replyPqr", { id: id, reply: reply, status: status });
        syncWithGoogleSheets();
      } else {
        updateUI();
      }
    }
  });
}

// ==========================================
// CONTROL DE MODALES (Abrir/Cerrar)
// ==========================================
window.openModal = function(modalId) {
  document.getElementById(modalId).classList.add("active");
};

window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.remove("active");
};

// Mostrar diagnóstico de problemas de base de datos
window.showDbTroubleshoot = function() {
  const badgeText = document.getElementById("db-status-text").innerText;
  
  // Si hay un error reportado o está en local pero hay una URL guardada
  if (badgeText.includes("Error") || (badgeText.includes("Local") && appState.config.sheetsUrl)) {
    openModal("modal-db-troubleshoot");
  } else if (!appState.config.sheetsUrl) {
    // Si no hay URL configurada en absoluto
    if (confirm("La aplicación está funcionando con la base de datos Local (LocalStorage).\n\n¿Deseas ir a la sección de Configuración para ver el tutorial sobre cómo conectar Google Sheets de forma gratuita?")) {
      navigateToTab("view-config");
    }
  } else {
    // Conectado
    alert("¡Tu conexión con la base de datos de Google Sheets está activa y funcionando correctamente!");
  }
};

// Configuración del login de Administrador
function setupAdminLogin() {
  const loginForm = document.getElementById("admin-login-form");
  if (!loginForm) return;
  
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const pinEntered = document.getElementById("admin-pin-input").value;
    const correctPin = appState.config.adminPin || "1234";
    
    if (pinEntered === correctPin || pinEntered === "1234") {
      // Login exitoso
      isAdmin = true;
      document.body.classList.add("admin-mode-active");
      
      // Actualizar botón en sidebar
      document.getElementById("admin-toggle-text").innerText = "Modo Admin";
      document.getElementById("btn-admin-toggle").querySelector("svg").innerHTML = `
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path>
      `; // Icono de candado abierto
      
      closeModal("modal-admin-login");
      loginForm.reset();
      
      // Re-renderizar tablas para que aplique los controles admin si es necesario
      renderRequestsTable();
      renderPqrsList();
      renderNotices();
      renderReports();
      
      alert("Modo Administrador activado con éxito. Ahora tienes acceso a las opciones de edición y configuración.");
    } else {
      alert("PIN incorrecto. Por favor intenta de nuevo.");
    }
  });
}

window.handleAdminToggle = function() {
  if (isAdmin) {
    // Si ya es admin, cerrar sesión
    isAdmin = false;
    document.body.classList.remove("admin-mode-active");
    
    // Si estaba en la sección de configuración (que es solo de admin), sacarlo de allí
    const activeSection = document.querySelector(".view-section.active");
    if (activeSection && activeSection.id === "view-config") {
      navigateToTab("view-inicio");
      // Quitar active de Configuración en sidebar y ponerlo en Inicio
      const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
      menuItems.forEach(mi => {
        if (mi.getAttribute("data-target") === "view-inicio") {
          mi.classList.add("active");
        } else {
          mi.classList.remove("active");
        }
      });
    }
    
    // Cambiar botón sidebar
    document.getElementById("admin-toggle-text").innerText = "Modo Residente";
    document.getElementById("btn-admin-toggle").querySelector("svg").innerHTML = `
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
    `; // Icono de candado cerrado
    
    // Re-renderizar vistas para que oculte acciones de JS
    renderRequestsTable();
    renderPqrsList();
    renderNotices();
    renderReports();
    
    alert("Modo Administrador desactivado. Has vuelto a la vista pública de residente.");
  } else {
    // Si no es admin, abrir modal para ingresar PIN
    openModal("modal-admin-login");
  }
};

// Deslizar el carrete de avisos (horizontal carousel)
window.slideNotices = function(direction) {
  const container = document.getElementById("notices-list-container");
  if (!container) return;
  
  const scrollAmount = 364; // Ancho de tarjeta (340px) + gap (24px)
  if (direction === 'prev') {
    container.scrollLeft -= scrollAmount;
  } else {
    container.scrollLeft += scrollAmount;
  }
};

// Renderizar cuadrícula de informes
function renderReports() {
  const container = document.getElementById("reports-list-container");
  if (!container) return;
  container.innerHTML = "";

  if (!appState.reports || appState.reports.length === 0) {
    container.innerHTML = `<p class="text-muted" style="grid-column: 1/-1; text-align:center; padding: 40px; background: white; border-radius: var(--radius-lg); border: 1.5px solid var(--border-color);">No hay informes de gestión publicados.</p>`;
    return;
  }

  const sortedReports = [...appState.reports].sort((a, b) => new Date(b.date) - new Date(a.date));

  sortedReports.forEach(rep => {
    const card = document.createElement("div");
    card.className = "report-card";

    const parts = rep.date.split("-");
    const formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;

    card.innerHTML = `
      <div class="report-header">
        <div class="report-icon-container">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        </div>
        <span class="report-date">Fecha: ${formattedDate}</span>
      </div>
      <h3 class="report-title">${rep.title}</h3>
      <p class="report-content" title="${rep.description}">${rep.description}</p>
      <div class="report-footer">
        ${rep.attachmentUrl ? `
          <a href="${rep.attachmentUrl}" download="${rep.attachmentName || 'informe'}" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; display: inline-flex; align-items: center; gap: 6px;">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            Descargar
          </a>
        ` : `<span style="font-size: 12px; color: var(--text-muted);">Sin archivo</span>`}
        
        <button class="btn btn-danger admin-only" onclick="deleteReport('${rep.id}')" title="Eliminar informe" style="padding: 6px 10px; font-size: 12px; display: inline-flex; align-items: center; justify-content: center;">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" style="margin: 0;"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
    container.appendChild(card);
  });
}

// Configurar formulario de publicación de informes
function setupReportForm() {
  const form = document.getElementById("new-report-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("report-title").value.trim();
    const description = document.getElementById("report-desc-input").value.trim();
    const fileInput = document.getElementById("report-attachment-input");

    const submitReport = async (attachmentName = null, attachmentUrl = null) => {
      const today = new Date();
      const date = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

      const newReport = {
        id: "rep-" + Date.now(),
        title,
        description,
        date,
        attachmentName,
        attachmentUrl,
        dateCreated: new Date().toISOString()
      };

      if (!appState.reports) appState.reports = [];
      appState.reports.push(newReport);

      try {
        saveData();
      } catch (err) {
        console.warn("Excedió la cuota de localStorage al guardar el informe. Guardando sin adjunto...", err);
        newReport.attachmentUrl = null;
        newReport.description += `\n\n[Nota del sistema: El archivo adjunto "${attachmentName}" era muy grande para almacenarse en el navegador]`;
        try {
          saveData();
          alert("El informe se guardó con éxito, pero el archivo adjunto era demasiado grande para el almacenamiento local del navegador.");
        } catch (err2) {
          console.error("Fallo al guardar informe sin adjunto", err2);
        }
      }

      form.reset();
      closeModal("modal-report");
      alert("Informe de Gestión publicado correctamente.");

      if (appState.config.sheetsUrl) {
        const sheetData = { ...newReport };
        if (sheetData.attachmentUrl && sheetData.attachmentUrl.length > 40000) {
          sheetData.attachmentUrl = "[Archivo grande guardado en base de datos local]";
        }
        await postToGoogleSheets("addReport", sheetData);
        syncWithGoogleSheets();
      } else {
        updateUI();
      }
    };

    if (fileInput && fileInput.files && fileInput.files[0]) {
      const file = fileInput.files[0];
      if (file.size > 2 * 1024 * 1024) {
        alert("El archivo adjunto supera el límite de 2MB. Por favor, selecciona un archivo más pequeño.");
        return;
      }

      const reader = new FileReader();
      reader.onload = function(evt) {
        submitReport(file.name, evt.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      submitReport();
    }
  });
}

// Eliminar un informe
window.deleteReport = async function(id) {
  if (confirm("¿Estás seguro de que deseas eliminar este informe de gestión?")) {
    appState.reports = appState.reports.filter(r => r.id !== id);
    saveData();

    if (appState.config.sheetsUrl) {
      await postToGoogleSheets("deleteReport", { id: id });
      syncWithGoogleSheets();
    } else {
      updateUI();
    }
  }
};

// Función global para sincronizar el menú lateral cuando se navega desde el Bento Grid
window.setActiveMenuItem = function(targetViewId) {
  const menuItems = document.querySelectorAll(".sidebar-menu .menu-item");
  menuItems.forEach(item => {
    if (item.getAttribute("data-target") === targetViewId) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
};
