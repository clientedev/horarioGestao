/**
 * SISTEMA DE GESTÃO DE ESCALAS & PRESENÇA EM TEMPO REAL
 * Lógica Completa de Aplicação, Renderização e Persistência
 */

// Chaves de armazenamento LocalStorage
const STORAGE_KEY = "gestao_colaboradores_v1";
const THEME_KEY = "gestao_theme_preference";

// Estado Global da Aplicação
const state = {
  collaborators: [],
  searchQuery: "",
  statusFilter: "all", // "all", "working", "offline", "offday"
  cfpFilter: "all",    // "all", "103", "108"
  currentView: "cards", // "cards", "table", "timeline"
  
  // Modo Simulação
  isSimulating: false,
  simulatedDay: 1, // 0-6
  simulatedTime: "10:00", // HH:MM

  // Temporizador do relógio
  clockInterval: null
};

// ========================================================
// INICIALIZAÇÃO
// ========================================================
document.addEventListener("DOMContentLoaded", () => {
  loadTheme();
  loadData();
  setupEventListeners();
  startClock();
  render();
});

// Carrega tema (Modo Claro por padrão para máxima facilidade e clareza visual)
function loadTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  if (savedTheme === "dark") {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  }
}

// Alterna tema
function toggleTheme() {
  const isLight = document.body.classList.contains("light-theme");
  if (isLight) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
    localStorage.setItem(THEME_KEY, "dark");
    showToast("Tema Escuro ativado", "info");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
    localStorage.setItem(THEME_KEY, "light");
    showToast("Modo Claro ativado (visualização facilitada)", "info");
  }
}

// Carrega dados do LocalStorage ou base inicial
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state.collaborators = JSON.parse(saved);
    } catch (e) {
      console.error("Erro ao ler localStorage:", e);
      state.collaborators = [...INITIAL_COLLABORATORS];
    }
  } else {
    state.collaborators = JSON.parse(JSON.stringify(INITIAL_COLLABORATORS));
    saveData();
  }
}

// Salva dados no LocalStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.collaborators));
}

// ========================================================
// RELÓGIO & SIMULADOR DE HORÁRIO
// ========================================================
function startClock() {
  updateClockDisplay();
  if (state.clockInterval) clearInterval(state.clockInterval);
  
  let lastMinute = new Date().getMinutes();

  state.clockInterval = setInterval(() => {
    updateClockDisplay();
    
    // Atualiza status e cards somente quando o minuto mudar (e não a cada segundo)
    if (!state.isSimulating) {
      const currentMinute = new Date().getMinutes();
      if (currentMinute !== lastMinute) {
        lastMinute = currentMinute;
        updateStats();
        // Não re-renderiza se o modal estiver aberto para não travar a digitação do usuário
        const modal = document.getElementById("colabModal");
        if (modal && modal.classList.contains("hidden")) {
          updateDynamicElements();
        }
      }
    }
  }, 1000);
}

// Obtém dia e minutos do momento atual (real ou simulado)
function getCurrentMoment() {
  if (state.isSimulating) {
    const [hours, minutes] = state.simulatedTime.split(":").map(Number);
    return {
      dayOfWeek: Number(state.simulatedDay),
      hours,
      minutes,
      totalMinutes: hours * 60 + minutes,
      timeString: state.simulatedTime,
      isReal: false
    };
  } else {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const timeString = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    return {
      dayOfWeek,
      hours,
      minutes,
      seconds,
      totalMinutes: hours * 60 + minutes,
      timeString,
      isReal: true,
      rawDate: now
    };
  }
}

function updateClockDisplay() {
  const clockTimeEl = document.getElementById("clockTime");
  const clockDateEl = document.getElementById("clockDate");
  const clockDot = document.getElementById("clockModeDot");
  const clockLabel = document.getElementById("clockModeLabel");
  const btnSimLabel = document.getElementById("btnSimLabel");

  const moment = getCurrentMoment();

  if (state.isSimulating) {
    clockDot.classList.add("simulating");
    clockLabel.textContent = "Simulação";
    clockLabel.style.color = "var(--color-warning)";
    btnSimLabel.textContent = "Sair Simulação";

    clockTimeEl.textContent = `${state.simulatedTime}:00`;
    const dayObj = WEEK_DAYS.find(d => d.key === Number(state.simulatedDay));
    clockDateEl.textContent = `${dayObj ? dayObj.name : "Dia"} (Simulado)`;
  } else {
    clockDot.classList.remove("simulating");
    clockLabel.textContent = "Tempo Real";
    clockLabel.style.color = "var(--text-secondary)";
    btnSimLabel.textContent = "Simular";

    clockTimeEl.textContent = moment.timeString;
    const dayName = WEEK_DAYS.find(d => d.key === moment.dayOfWeek)?.name || "";
    const dateFormatted = moment.rawDate.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short"
    });
    clockDateEl.textContent = `${dayName}, ${dateFormatted}`;
  }
}

// Converte "HH:MM" para minutos desde 00:00
function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string" || !timeStr.includes(":")) return null;
  const parts = timeStr.trim().split(":");
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

// Formata minutos restantes para texto amigável
function formatMinutesRemaining(totalMin) {
  if (totalMin <= 0) return "0 min";
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

// ========================================================
// CÁLCULO DE STATUS DO COLABORADOR
// ========================================================
function getColaboratorStatus(colab, moment) {
  const daySchedule = colab.schedule[moment.dayOfWeek];

  if (!daySchedule || !daySchedule.active || daySchedule.isOff || !daySchedule.start || !daySchedule.end) {
    return {
      status: "offday",
      label: "Folga Hoje",
      details: "Sem expediente escalado hoje",
      startMin: null,
      endMin: null,
      startFormatted: "",
      endFormatted: "",
      progressPercent: 0,
      todayCfp: daySchedule?.cfp || colab.cpf_cfp
    };
  }

  const startMin = parseTimeToMinutes(daySchedule.start);
  const endMin = parseTimeToMinutes(daySchedule.end);
  const currentMin = moment.totalMinutes;
  const todayCfp = daySchedule.cfp || colab.cpf_cfp;

  if (startMin === null || endMin === null) {
    return {
      status: "offday",
      label: "Sem Horário",
      details: "Horário não configurado",
      todayCfp
    };
  }

  // Está dentro da jornada de trabalho
  if (currentMin >= startMin && currentMin < endMin) {
    const remainingMin = endMin - currentMin;
    const totalShift = endMin - startMin;
    const elapsed = currentMin - startMin;
    const progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalShift) * 100)));

    return {
      status: "working",
      label: "Trabalhando Agora",
      details: `Expediente até às ${daySchedule.end} (restam ${formatMinutesRemaining(remainingMin)})`,
      remainingMin,
      startMin,
      endMin,
      startFormatted: daySchedule.start,
      endFormatted: daySchedule.end,
      progressPercent,
      todayCfp
    };
  }

  // Ainda não começou o expediente
  if (currentMin < startMin) {
    const startsInMin = startMin - currentMin;
    return {
      status: "offline",
      label: "Fora de Turno",
      details: `Inicia hoje às ${daySchedule.start} (em ${formatMinutesRemaining(startsInMin)})`,
      startMin,
      endMin,
      startFormatted: daySchedule.start,
      endFormatted: daySchedule.end,
      progressPercent: 0,
      todayCfp
    };
  }

  // Expediente de hoje já terminou
  return {
    status: "offline",
    label: "Fora de Turno",
    details: `Expediente encerrado hoje às ${daySchedule.end}`,
    startMin,
    endMin,
    startFormatted: daySchedule.start,
    endFormatted: daySchedule.end,
    progressPercent: 100,
    todayCfp
  };
}

// Iniciais do Colaborador para Avatar Fallback
function getInitials(name) {
  if (!name) return "??";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// ========================================================
// FILTROS & PESQUISA
// ========================================================
function getFilteredCollaborators() {
  const moment = getCurrentMoment();
  const query = state.searchQuery.toLowerCase().trim();

  return state.collaborators.filter(colab => {
    // 1. Filtro de Busca por Nome, CFP ou Cargo
    if (query) {
      const matchName = colab.name.toLowerCase().includes(query);
      const matchCfp = colab.cpf_cfp.toLowerCase().includes(query);
      const matchCargo = (colab.cargo || "").toLowerCase().includes(query);
      if (!matchName && !matchCfp && !matchCargo) return false;
    }

    // 2. Filtro de CFP
    if (state.cfpFilter !== "all") {
      const statusInfo = getColaboratorStatus(colab, moment);
      const activeCfp = statusInfo.todayCfp || colab.cpf_cfp;
      if (!activeCfp.includes(state.cfpFilter)) return false;
    }

    // 3. Filtro de Status
    if (state.statusFilter !== "all") {
      const statusInfo = getColaboratorStatus(colab, moment);
      if (statusInfo.status !== state.statusFilter) return false;
    }

    return true;
  });
}

// ========================================================
// RENDERIZAÇÃO PRINCIPAL
// ========================================================
function render() {
  updateStats();
  renderCards();
  renderTable();
  renderTimeline();
  updateFilterBar();
}

// Atualiza contadores numéricos do topo
function updateStats() {
  const moment = getCurrentMoment();
  let working = 0;
  let offline = 0;
  let offday = 0;

  state.collaborators.forEach(colab => {
    const statusInfo = getColaboratorStatus(colab, moment);
    if (statusInfo.status === "working") working++;
    else if (statusInfo.status === "offline") offline++;
    else if (statusInfo.status === "offday") offday++;
  });

  document.getElementById("countWorking").textContent = working;
  document.getElementById("countOffline").textContent = offline;
  document.getElementById("countOffDay").textContent = offday;
  document.getElementById("countTotal").textContent = state.collaborators.length;
}

// Atualiza elementos dinâmicos (tempo restante, progresso) sem recriar toda a árvore DOM
function updateDynamicElements() {
  const moment = getCurrentMoment();
  const list = getFilteredCollaborators();

  // Se a quantidade de cards exibidos mudou ou um status virou de offline para working, recarrega
  renderCards();
  renderTimeline();
}

// ========================================================
// RENDERIZAÇÃO: CARDS GRID
// ========================================================
function renderCards() {
  const container = document.getElementById("cardsGridContainer");
  const emptyState = document.getElementById("emptyState");
  const filtered = getFilteredCollaborators();
  const moment = getCurrentMoment();

  if (filtered.length === 0) {
    container.innerHTML = "";
    emptyState.classList.remove("hidden");
    return;
  }
  emptyState.classList.add("hidden");

  container.innerHTML = filtered.map(colab => {
    const statusInfo = getColaboratorStatus(colab, moment);
    const initials = getInitials(colab.name);

    // Mini Schedule Strip de Segunda a Sábado
    const miniDaysHtml = [1, 2, 3, 4, 5, 6].map(dayKey => {
      const d = colab.schedule[dayKey];
      const isToday = dayKey === moment.dayOfWeek;
      const dayName = WEEK_DAYS.find(w => w.key === dayKey).short;
      
      let badgeText = "Folga";
      let isOff = true;
      if (d && d.active && !d.isOff && d.start) {
        badgeText = `${d.start.split(":")[0]}h-${d.end.split(":")[0]}h`;
        isOff = false;
      }

      return `
        <div class="mini-day ${isToday ? "is-today" : ""}">
          <span class="mini-day-name">${dayName}</span>
          <span class="mini-day-badge ${isOff ? "off" : ""}">${badgeText}</span>
        </div>
      `;
    }).join("");

    // Progresso do expediente se estiver trabalhando
    let progressHtml = "";
    if (statusInfo.status === "working") {
      progressHtml = `
        <div class="shift-progress-wrap">
          <div class="shift-progress-labels">
            <span>Início: ${statusInfo.startFormatted}</span>
            <span>${statusInfo.progressPercent}% cumprido</span>
            <span>Fim: ${statusInfo.endFormatted}</span>
          </div>
          <div class="shift-progress-track">
            <div class="shift-progress-fill" style="width: ${statusInfo.progressPercent}%"></div>
          </div>
        </div>
      `;
    }

    // Avatar HTML
    const avatarHtml = colab.avatarUrl ? `
      <img class="card-avatar-img" src="${colab.avatarUrl}" alt="${colab.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="card-avatar-fallback" style="display:none;">${initials}</div>
    ` : `
      <div class="card-avatar-fallback">${initials}</div>
    `;

    return `
      <div class="colab-card status-${statusInfo.status}" data-id="${colab.id}">
        
        <!-- Header do Card -->
        <div class="card-header">
          <div class="card-avatar-wrap">
            ${avatarHtml}
            <span class="avatar-status-pip ${statusInfo.status}" title="${statusInfo.label}"></span>
          </div>
          <div class="card-title-group">
            <h4 class="card-name" title="${colab.name}">${colab.name}</h4>
            <div class="card-meta">
              <span class="card-cfp-pill ${statusInfo.todayCfp.includes("103") ? "cfp-103" : ""}">
                CFP ${statusInfo.todayCfp}
              </span>
              <span class="card-cargo">${colab.cargo || "Gestão"}</span>
            </div>
          </div>
          <button class="card-btn-edit" onclick="openEditModal('${colab.id}')" title="Editar horários e foto">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
        </div>

        <!-- Banner de Status em Tempo Real -->
        <div class="card-status-banner ${statusInfo.status}">
          <div class="status-indicator-col">
            <span class="status-beacon"></span>
            <div>
              <div class="status-main-text">${statusInfo.label}</div>
              <div class="status-sub-text">${statusInfo.details}</div>
            </div>
          </div>
          ${statusInfo.startFormatted ? `
            <div class="status-hours-badge">
              ${statusInfo.startFormatted} - ${statusInfo.endFormatted}
            </div>
          ` : `
            <div class="status-hours-badge">FOLGA</div>
          `}
        </div>

        ${progressHtml}

        <!-- Mini Escala Semanal -->
        <div class="card-mini-schedule">
          ${miniDaysHtml}
        </div>

      </div>
    `;
  }).join("");
}

// ========================================================
// RENDERIZAÇÃO: TABELA SEMANAL COMPLETA
// ========================================================
function renderTable() {
  const tbody = document.getElementById("tableBody");
  const filtered = getFilteredCollaborators();
  const moment = getCurrentMoment();

  // Destaca a coluna do dia atual no cabeçalho
  document.querySelectorAll(".schedule-table th.th-day").forEach(th => {
    const day = Number(th.dataset.day);
    if (day === moment.dayOfWeek) {
      th.classList.add("th-today");
    } else {
      th.classList.remove("th-today");
    }
  });

  tbody.innerHTML = filtered.map(colab => {
    const statusInfo = getColaboratorStatus(colab, moment);
    const initials = getInitials(colab.name);

    // Células de Segunda a Sábado (dias 1 a 6)
    const daysCellsHtml = [1, 2, 3, 4, 5, 6].map(dayKey => {
      const schedule = colab.schedule[dayKey];
      const isToday = dayKey === moment.dayOfWeek;
      
      let content = "";
      if (schedule && schedule.active && !schedule.isOff && schedule.start) {
        content = `
          <div class="schedule-cell-box">
            <span class="time-range-text">${schedule.start} às ${schedule.end}</span>
            ${schedule.cfp && schedule.cfp !== colab.cpf_cfp ? `<span class="day-cfp-badge">CFP ${schedule.cfp}</span>` : ""}
          </div>
        `;
      } else {
        content = `<span class="time-off-text">${schedule?.isOff ? "Folga" : "—"}</span>`;
      }

      return `<td class="${isToday ? "td-today" : ""}">${content}</td>`;
    }).join("");

    const avatarHtml = colab.avatarUrl ? `
      <img class="table-avatar-img" src="${colab.avatarUrl}" alt="${colab.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
      <div class="table-avatar-fallback" style="display:none;">${initials}</div>
    ` : `
      <div class="table-avatar-fallback">${initials}</div>
    `;

    return `
      <tr>
        <td class="table-user-cell">
          <div class="table-avatar-wrap">
            ${avatarHtml}
          </div>
          <div class="table-user-info">
            <span class="table-user-name">${colab.name}</span>
            <span class="table-user-status">
              <span class="badge-dot ${statusInfo.status}"></span>
              <span style="color: var(--color-${statusInfo.status})">${statusInfo.label}</span>
            </span>
          </div>
        </td>
        <td>
          <span class="card-cfp-pill ${colab.cpf_cfp.includes("103") ? "cfp-103" : ""}">
            ${colab.cpf_cfp}
          </span>
        </td>
        ${daysCellsHtml}
        <td class="td-actions">
          <button class="btn btn-sm btn-outline" onclick="openEditModal('${colab.id}')">
            Editar
          </button>
        </td>
      </tr>
    `;
  }).join("");
}

// ========================================================
// RENDERIZAÇÃO: LINHA DO TEMPO (TIMELINE)
// ========================================================
function renderTimeline() {
  const container = document.getElementById("timelineRows");
  const filtered = getFilteredCollaborators();
  const moment = getCurrentMoment();

  const titleEl = document.getElementById("timelineTitle");
  const dayName = WEEK_DAYS.find(d => d.key === moment.dayOfWeek)?.name || "Hoje";
  titleEl.textContent = `Linha do Tempo de ${dayName}`;

  const nowBadge = document.getElementById("timelineNowBadge");
  const [h, m] = [Math.floor(moment.totalMinutes / 60), moment.totalMinutes % 60];
  nowBadge.innerHTML = `Momento Atual: <strong>${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}</strong>`;

  // Janela da timeline: das 06:00 (360m) às 23:00 (1380m) = total 1020m
  const startDayMin = 6 * 60; // 06:00
  const endDayMin = 23 * 60;  // 23:00
  const totalTimelineMin = endDayMin - startDayMin;

  // Posição do cursor do momento atual
  let cursorPercent = ((moment.totalMinutes - startDayMin) / totalTimelineMin) * 100;
  const showCursor = cursorPercent >= 0 && cursorPercent <= 100;

  container.innerHTML = filtered.map(colab => {
    const statusInfo = getColaboratorStatus(colab, moment);
    const daySchedule = colab.schedule[moment.dayOfWeek];
    const initials = getInitials(colab.name);

    let barHtml = "";
    if (daySchedule && daySchedule.active && !daySchedule.isOff && daySchedule.start && daySchedule.end) {
      const sMin = parseTimeToMinutes(daySchedule.start);
      const eMin = parseTimeToMinutes(daySchedule.end);

      const leftPercent = Math.max(0, ((sMin - startDayMin) / totalTimelineMin) * 100);
      const widthPercent = Math.min(100 - leftPercent, ((eMin - sMin) / totalTimelineMin) * 100);
      const isNow = statusInfo.status === "working";

      barHtml = `
        <div class="timeline-bar-block ${isNow ? "active-now" : ""}" 
             style="left: ${leftPercent}%; width: ${widthPercent}%;"
             title="${colab.name}: ${daySchedule.start} às ${daySchedule.end}">
          ${daySchedule.start} - ${daySchedule.end} ${isNow ? "● TRABALHANDO" : ""}
        </div>
      `;
    } else {
      barHtml = `<span style="font-size: 0.75rem; color: var(--text-muted); padding: 4px 10px; display: inline-block;">Folga / Sem Escala</span>`;
    }

    return `
      <div class="timeline-row">
        <div class="timeline-colab-label">
          <span class="badge-dot ${statusInfo.status}"></span>
          <span title="${colab.name}">${colab.name}</span>
        </div>
        <div class="timeline-track-wrap">
          ${barHtml}
          ${showCursor ? `<div class="timeline-now-cursor" style="left: ${cursorPercent}%;"></div>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

// ========================================================
// BARRA DE STATUS DE FILTRO ATIVO
// ========================================================
function updateFilterBar() {
  const bar = document.getElementById("filterStatusBar");
  const text = document.getElementById("filterSummaryText");
  const parts = [];

  if (state.searchQuery) parts.push(`Busca: "${state.searchQuery}"`);
  if (state.statusFilter !== "all") {
    const map = { working: "Trabalhando Agora", offline: "Fora de Turno", offday: "Folga Hoje" };
    parts.push(`Status: ${map[state.statusFilter] || state.statusFilter}`);
  }
  if (state.cfpFilter !== "all") parts.push(`CFP ${state.cfpFilter}`);

  if (parts.length > 0) {
    text.textContent = parts.join(" | ");
    bar.classList.remove("hidden");
  } else {
    bar.classList.add("hidden");
  }
}

function resetAllFilters() {
  state.searchQuery = "";
  state.statusFilter = "all";
  state.cfpFilter = "all";
  document.getElementById("searchInput").value = "";
  document.getElementById("clearSearchBtn").classList.add("hidden");
  document.getElementById("cfpFilter").value = "all";
  
  // Atualiza pílulas e cards de status
  document.querySelectorAll(".stat-card").forEach(c => c.classList.remove("active-filter"));
  document.querySelectorAll(".filter-pills .pill").forEach(p => {
    p.classList.toggle("active", p.dataset.statusFilter === "all");
  });

  render();
}

// ========================================================
// MODAL DE ADICIONAR / EDITAR COLABORADOR
// ========================================================
const colabModal = document.getElementById("colabModal");
const colabForm = document.getElementById("colabForm");

function openNewColabModal() {
  document.getElementById("modalTitle").textContent = "Adicionar Novo Colaborador";
  document.getElementById("editColabId").value = "";
  document.getElementById("editColabName").value = "";
  document.getElementById("editColabCfp").value = "108";
  document.getElementById("editColabCargo").value = "Gestão Operacional";
  document.getElementById("editAvatarUrl").value = "";
  document.getElementById("btnDeleteColab").classList.add("hidden");

  updateModalAvatarPreview("", "NO");

  // Escala padrão: Segunda a Sexta 08:00 às 17:00, Sáb/Dom folga
  const defaultSchedule = {
    1: { active: true, start: "08:00", end: "17:00", cfp: "" },
    2: { active: true, start: "08:00", end: "17:00", cfp: "" },
    3: { active: true, start: "08:00", end: "17:00", cfp: "" },
    4: { active: true, start: "08:00", end: "17:00", cfp: "" },
    5: { active: true, start: "08:00", end: "17:00", cfp: "" },
    6: { active: false, start: "", end: "", cfp: "" },
    0: { active: false, start: "", end: "", cfp: "" }
  };

  renderModalScheduleInputs(defaultSchedule);
  colabModal.classList.remove("hidden");
  colabModal.style.display = "flex";
  document.getElementById("editColabName").focus();
}

function openEditModal(colabId) {
  try {
    const colab = state.collaborators.find(c => c.id === colabId);
    if (!colab) return;

    document.getElementById("modalTitle").textContent = `Editar: ${colab.name}`;
    document.getElementById("editColabId").value = colab.id;
    document.getElementById("editColabName").value = colab.name || "";
    document.getElementById("editColabCfp").value = colab.cpf_cfp || "";
    document.getElementById("editColabCargo").value = colab.cargo || "Gestão Operacional";
    document.getElementById("editAvatarUrl").value = colab.avatarUrl || "";
    
    const deleteBtn = document.getElementById("btnDeleteColab");
    if (deleteBtn) deleteBtn.classList.remove("hidden");

    updateModalAvatarPreview(colab.avatarUrl, getInitials(colab.name));
    renderModalScheduleInputs(colab.schedule || {});

    colabModal.classList.remove("hidden");
    colabModal.style.display = "flex";
  } catch (err) {
    console.error("Erro ao abrir modal de edição:", err);
  }
}

function closeModal() {
  colabModal.classList.add("hidden");
  colabModal.style.display = "none";
}

function updateModalAvatarPreview(url, fallbackText) {
  const img = document.getElementById("modalAvatarPreview");
  const fallback = document.getElementById("modalAvatarFallback");

  if (!img || !fallback) return;

  fallback.textContent = fallbackText || "??";

  if (url && typeof url === "string" && url.trim().length > 0) {
    img.onload = () => {
      img.classList.remove("hidden");
      fallback.classList.add("hidden");
    };
    img.onerror = () => {
      img.classList.add("hidden");
      fallback.classList.remove("hidden");
    };
    img.src = url.trim();
  } else {
    img.removeAttribute("src");
    img.classList.add("hidden");
    fallback.classList.remove("hidden");
  }
}

function renderModalScheduleInputs(schedule) {
  const container = document.getElementById("scheduleDaysList");
  if (!container) return;
  
  const safeSchedule = schedule || {};
  const orderedDays = [1, 2, 3, 4, 5, 6, 0];

  container.innerHTML = orderedDays.map(dayKey => {
    const day = WEEK_DAYS.find(w => w.key === dayKey);
    const dayData = safeSchedule[dayKey] || { active: false, start: "", end: "", cfp: "" };
    const isOff = !dayData.active || dayData.isOff || !dayData.start;

    return `
      <div class="day-row-item" data-day-key="${dayKey}">
        <span class="day-name-badge">${day ? day.name : "Dia"}</span>
        
        <div class="day-inputs-group">
          <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem;">
            <span>Início:</span>
            <input type="time" class="day-start-input" value="${dayData.start || "08:00"}" ${isOff ? "disabled" : ""}>
          </label>

          <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem;">
            <span>Fim:</span>
            <input type="time" class="day-end-input" value="${dayData.end || "17:00"}" ${isOff ? "disabled" : ""}>
          </label>

          <label style="display:flex; align-items:center; gap:4px; font-size:0.75rem;">
            <span>CFP do dia:</span>
            <input type="text" class="cfp-day-input" placeholder="Padrão" value="${dayData.cfp || ""}" ${isOff ? "disabled" : ""}>
          </label>
        </div>

        <button type="button" class="toggle-off-btn ${isOff ? "is-off" : ""}" onclick="toggleDayOff(${dayKey})">
          ${isOff ? "Folga" : "Trabalha"}
        </button>
      </div>
    `;
  }).join("");
}

// Alternar Folga em um dia no modal
window.toggleDayOff = function(dayKey) {
  const row = document.querySelector(`.day-row-item[data-day-key="${dayKey}"]`);
  if (!row) return;

  const btn = row.querySelector(".toggle-off-btn");
  const isOffNow = btn.classList.toggle("is-off");
  btn.textContent = isOffNow ? "Folga" : "Trabalha";

  const inputs = row.querySelectorAll("input");
  inputs.forEach(inp => {
    inp.disabled = isOffNow;
  });
};

// Salvar Formulário do Colaborador
colabForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const id = document.getElementById("editColabId").value;
  const name = document.getElementById("editColabName").value.trim();
  const cfp = document.getElementById("editColabCfp").value.trim();
  const cargo = document.getElementById("editColabCargo").value.trim();
  const avatarUrl = document.getElementById("editAvatarUrl").value.trim();

  if (!name) {
    showToast("Por favor, digite o nome do colaborador", "warning");
    return;
  }

  // Coleta escala montada
  const updatedSchedule = {};
  document.querySelectorAll(".day-row-item").forEach(row => {
    const dayKey = Number(row.dataset.dayKey);
    const isOff = row.querySelector(".toggle-off-btn").classList.contains("is-off");
    const start = row.querySelector(".day-start-input").value;
    const end = row.querySelector(".day-end-input").value;
    const dayCfp = row.querySelector(".cfp-day-input").value.trim();

    updatedSchedule[dayKey] = {
      active: !isOff,
      isOff: isOff,
      start: isOff ? "" : start,
      end: isOff ? "" : end,
      cfp: dayCfp
    };
  });

  if (id) {
    // Atualização
    const index = state.collaborators.findIndex(c => c.id === id);
    if (index !== -1) {
      state.collaborators[index] = {
        ...state.collaborators[index],
        name,
        cpf_cfp: cfp,
        cargo,
        avatarUrl,
        schedule: updatedSchedule
      };
      showToast(`Colaborador ${name} atualizado com sucesso!`, "success");
    }
  } else {
    // Novo colaborador
    const newColab = {
      id: `colab-${Date.now()}`,
      name,
      cpf_cfp: cfp,
      cargo,
      avatarUrl,
      schedule: updatedSchedule
    };
    state.collaborators.push(newColab);
    showToast(`Colaborador ${name} cadastrado com sucesso!`, "success");
  }

  saveData();
  closeModal();
  render();
});

// Excluir Colaborador
document.getElementById("btnDeleteColab").addEventListener("click", () => {
  const id = document.getElementById("editColabId").value;
  const colab = state.collaborators.find(c => c.id === id);
  if (!colab) return;

  if (confirm(`Tem certeza que deseja remover ${colab.name} da escala de trabalho?`)) {
    state.collaborators = state.collaborators.filter(c => c.id !== id);
    saveData();
    closeModal();
    render();
    showToast(`${colab.name} foi removido(a)`, "info");
  }
});

// ========================================================
// CONFIGURAÇÃO DE EVENTOS
// ========================================================
function setupEventListeners() {
  // Alternador de tema
  document.getElementById("themeToggle").addEventListener("click", toggleTheme);

  // Botão Abrir Novo Colaborador
  document.getElementById("btnOpenNewColab").addEventListener("click", openNewColabModal);

  // Fechar Modal
  document.getElementById("btnCloseModal").addEventListener("click", closeModal);
  document.getElementById("btnCancelModal").addEventListener("click", closeModal);
  colabModal.addEventListener("click", (e) => {
    if (e.target === colabModal) closeModal();
  });

  // Testar URL de foto ao digitar no modal
  const avatarInput = document.getElementById("editAvatarUrl");
  avatarInput.addEventListener("input", () => {
    const name = document.getElementById("editColabName").value;
    updateModalAvatarPreview(avatarInput.value, getInitials(name));
  });

  document.getElementById("btnTestAvatar").addEventListener("click", () => {
    const name = document.getElementById("editColabName").value;
    updateModalAvatarPreview(avatarInput.value, getInitials(name));
  });

// Processa e redimensiona arquivo ou blob de imagem colado
function processImageFile(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Por favor, cole ou selecione um arquivo de imagem válido", "warning");
    return;
  }

  const reader = new FileReader();
  reader.onload = (event) => {
    compressImage(event.target.result, 280, 280, (compressedDataUrl) => {
      const avatarInput = document.getElementById("editAvatarUrl");
      avatarInput.value = compressedDataUrl;
      const name = document.getElementById("editColabName").value;
      updateModalAvatarPreview(compressedDataUrl, getInitials(name));
      showToast("Foto colada com sucesso!", "success");
    });
  };
  reader.readAsDataURL(file);
}

// Redimensiona a imagem usando canvas para manter o tamanho compacto no localStorage
function compressImage(srcDataUrl, maxWidth, maxHeight, callback) {
  const img = new Image();
  img.onload = () => {
    let width = img.width;
    let height = img.height;

    if (width > height) {
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
    } else {
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, width, height);

    // Exporta JPEG com 85% de qualidade (apenas ~15-25KB)
    const resultDataUrl = canvas.toDataURL("image/jpeg", 0.85);
    callback(resultDataUrl);
  };
  img.src = srcDataUrl;
}

  // Chips de fotos rápidas no modal
  document.querySelectorAll(".quick-avatar-chips .chip-btn").forEach(btn => {
    if (btn.id === "btnClearPhoto") return;
    btn.addEventListener("click", () => {
      const url = btn.dataset.url || "";
      avatarInput.value = url;
      const name = document.getElementById("editColabName").value;
      updateModalAvatarPreview(url, getInitials(name));
    });
  });

  // Botão Remover Foto
  const btnClearPhoto = document.getElementById("btnClearPhoto");
  if (btnClearPhoto) {
    btnClearPhoto.addEventListener("click", () => {
      avatarInput.value = "";
      const name = document.getElementById("editColabName").value;
      updateModalAvatarPreview("", getInitials(name));
      showToast("Foto removida. Usando avatar com iniciais.", "info");
    });
  }

  // Colar imagem via clipboard (Ctrl+V) com o modal aberto
  window.addEventListener("paste", (e) => {
    if (colabModal.classList.contains("hidden")) return;
    
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
          processImageFile(blob);
          e.preventDefault();
          break;
        }
      }
    }
  });

  // Dropzone de Colar Imagem e Upload
  const pasteDropzone = document.getElementById("pasteDropzone");
  const fileAvatarInput = document.getElementById("fileAvatarInput");

  if (pasteDropzone && fileAvatarInput) {
    pasteDropzone.addEventListener("click", (e) => {
      if (e.target.closest("#btnPasteClipboard")) return;
      fileAvatarInput.click();
    });

    pasteDropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      pasteDropzone.classList.add("dragover");
    });
    pasteDropzone.addEventListener("dragleave", () => {
      pasteDropzone.classList.remove("dragover");
    });
    pasteDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      pasteDropzone.classList.remove("dragover");
      if (e.dataTransfer?.files?.length > 0) {
        processImageFile(e.dataTransfer.files[0]);
      }
    });

    fileAvatarInput.addEventListener("change", (e) => {
      if (e.target.files?.length > 0) {
        processImageFile(e.target.files[0]);
      }
    });
  }

  // Botão interativo de Colar Imagem
  const btnPasteClipboard = document.getElementById("btnPasteClipboard");
  if (btnPasteClipboard) {
    btnPasteClipboard.addEventListener("click", async () => {
      try {
        if (navigator.clipboard && navigator.clipboard.read) {
          const clipboardItems = await navigator.clipboard.read();
          for (const item of clipboardItems) {
            const imageType = item.types.find(t => t.startsWith("image/"));
            if (imageType) {
              const blob = await item.getType(imageType);
              processImageFile(blob);
              return;
            }
          }
        }
        showToast("Pressione Ctrl+V no teclado para colar a imagem copiada", "info");
      } catch (err) {
        showToast("Pressione Ctrl+V no teclado para colar a imagem copiada", "info");
      }
    });
  }

  // Busca instantânea
  const searchInput = document.getElementById("searchInput");
  const clearBtn = document.getElementById("clearSearchBtn");

  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.length > 0) {
      clearBtn.classList.remove("hidden");
    } else {
      clearBtn.classList.add("hidden");
    }
    render();
  });

  clearBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearBtn.classList.add("hidden");
    searchInput.focus();
    render();
  });

  // Atalho de teclado '/' para focar na pesquisa e 'Esc' para fechar
  window.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== searchInput && !colabModal.contains(document.activeElement)) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === "Escape") {
      if (!colabModal.classList.contains("hidden")) {
        closeModal();
      } else if (state.searchQuery) {
        searchInput.value = "";
        state.searchQuery = "";
        clearBtn.classList.add("hidden");
        render();
      }
    }
  });

  // Filtro de CFP
  document.getElementById("cfpFilter").addEventListener("change", (e) => {
    state.cfpFilter = e.target.value;
    render();
  });

  // Filtro por Pílulas de Status
  document.querySelectorAll(".filter-pills .pill").forEach(pill => {
    pill.addEventListener("click", () => {
      document.querySelectorAll(".filter-pills .pill").forEach(p => p.classList.remove("active"));
      pill.classList.add("active");
      state.statusFilter = pill.dataset.statusFilter;

      // Sincroniza destaque dos cards de resumo
      document.querySelectorAll(".stat-card").forEach(c => {
        c.classList.toggle("active-filter", c.dataset.filter === state.statusFilter);
      });

      render();
    });
  });

  // Clique nos Cards de Estatísticas para filtrar rapidamente
  document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("click", () => {
      const filter = card.dataset.filter;
      state.statusFilter = filter;

      document.querySelectorAll(".stat-card").forEach(c => c.classList.remove("active-filter"));
      card.classList.add("active-filter");

      document.querySelectorAll(".filter-pills .pill").forEach(p => {
        p.classList.toggle("active", p.dataset.statusFilter === filter);
      });

      render();
    });
  });

  // Alternador de Visualização (Cards, Tabela, Timeline)
  const viewBtns = {
    cards: document.getElementById("btnViewCards"),
    table: document.getElementById("btnViewTable"),
    timeline: document.getElementById("btnViewTimeline")
  };

  const viewSections = {
    cards: document.getElementById("cardsView"),
    table: document.getElementById("tableView"),
    timeline: document.getElementById("timelineView")
  };

  function switchView(viewName) {
    state.currentView = viewName;
    Object.keys(viewBtns).forEach(k => {
      viewBtns[k].classList.toggle("active", k === viewName);
      viewSections[k].classList.toggle("active", k === viewName);
    });
  }

  viewBtns.cards.addEventListener("click", () => switchView("cards"));
  viewBtns.table.addEventListener("click", () => switchView("table"));
  viewBtns.timeline.addEventListener("click", () => switchView("timeline"));

  // Limpar todos os filtros
  document.getElementById("btnResetAllFilters").addEventListener("click", resetAllFilters);
  document.getElementById("btnEmptyReset").addEventListener("click", resetAllFilters);

  // Simulação de Horário
  const btnToggleSim = document.getElementById("btnToggleSim");
  const simBar = document.getElementById("simulatorBar");
  const simDaySelect = document.getElementById("simDaySelect");
  const simTimeInput = document.getElementById("simTimeInput");
  const btnResetSim = document.getElementById("btnResetSim");

  btnToggleSim.addEventListener("click", () => {
    state.isSimulating = !state.isSimulating;
    if (state.isSimulating) {
      simBar.classList.remove("hidden");
      const now = new Date();
      simDaySelect.value = String(now.getDay() === 0 ? 1 : now.getDay()); // Segunda a padrão
      simTimeInput.value = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      state.simulatedDay = Number(simDaySelect.value);
      state.simulatedTime = simTimeInput.value;
      showToast("Modo Simulação ativado! Ajuste o dia e a hora para testar.", "warning");
    } else {
      simBar.classList.add("hidden");
      showToast("Voltando para o relógio em tempo real.", "info");
    }
    updateClockDisplay();
    render();
  });

  simDaySelect.addEventListener("change", (e) => {
    state.simulatedDay = Number(e.target.value);
    updateClockDisplay();
    render();
  });

  simTimeInput.addEventListener("input", (e) => {
    state.simulatedTime = e.target.value;
    updateClockDisplay();
    render();
  });

  btnResetSim.addEventListener("click", () => {
    state.isSimulating = false;
    simBar.classList.add("hidden");
    updateClockDisplay();
    render();
    showToast("Relógio sincronizado em tempo real.", "info");
  });

  // Imprimir / Exportar
  document.getElementById("btnExport").addEventListener("click", () => {
    window.print();
  });

  // Restaurar dados originais da tabela fornecida pelo usuário
  document.getElementById("btnResetDefaultData").addEventListener("click", () => {
    if (confirm("Deseja restaurar todos os 16 colaboradores e horários originais da tabela de 09/09/2026? Alterações manuais serão resetadas.")) {
      state.collaborators = JSON.parse(JSON.stringify(INITIAL_COLLABORATORS));
      saveData();
      render();
      showToast("Escala original restaurada com sucesso!", "success");
    }
  });
}

// Toast de Notificação
function showToast(message, type = "info") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Expor função de abrir edição no escopo global para onclicks
window.openEditModal = openEditModal;
