// CuteCuan v3 - Logika Tabungan Jelas & Tampilan Bersih

(function() {
  'use strict';

  // --- Kategori Transaksi ---
  const CATEGORIES = {
    income: [
      { id: 'salary', label: '💵 Gaji / Pendapatan' },
      { id: 'allowance', label: '🧧 Uang Saku / Kiriman' },
      { id: 'freelance', label: '📈 Hasil Jualan / Freelance' },
      { id: 'gift', label: '🎁 Hadiah / Bonus' },
      { id: 'other_income', label: '🪙 Pemasukan Lainnya' }
    ],
    expense: [
      { id: 'food', label: '🍰 Makanan & Jajan' },
      { id: 'shopping', label: '🛍️ Belanja & Kebutuhan' },
      { id: 'transport', label: '🛵 Transport & Bensin' },
      { id: 'bills', label: '🏠 Tagihan & Pulsa' },
      { id: 'entertainment', label: '🎮 Hiburan & Main' },
      { id: 'beauty', label: '💄 Skincare & Cantik' },
      { id: 'other_expense', label: '🫧 Pengeluaran Lainnya' }
    ]
  };

  const todayISO = new Date().toISOString().split('T')[0];

  // Data demo bawaan awal yang ramah & mencerminkan tabungan
  const DEFAULT_TRANSACTIONS = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 2500000,
      category: 'allowance',
      categoryLabel: '🧧 Uang Saku / Kiriman',
      notes: 'Uang bulanan tersayang 🥰',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 24
    },
    {
      id: 'tx-2',
      type: 'expense',
      amount: 45000,
      category: 'food',
      categoryLabel: '🍰 Makanan & Jajan',
      notes: 'Beli kopi & cheesecake 🍰',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 5
    }
  ];

  const DEFAULT_GOALS = [
    {
      id: 'goal-1',
      title: 'Beli Sepatu Lucu 👟',
      emoji: '👟',
      targetAmount: 500000,
      currentAmount: 200000,
      createdAt: Date.now()
    }
  ];

  // --- State ---
  let transactions = [];
  let goals = [];
  let currentFilter = 'all';
  let searchQuery = '';
  let activeChartTab = 'summary';
  let financeChartInstance = null;
  let pendingConfirmAction = null;

  // --- DOM Elements ---
  const elCurrentDate = document.getElementById('currentDate');
  const elTotalSavings = document.getElementById('totalSavings');
  const elTotalIncome = document.getElementById('totalIncome');
  const elTotalExpense = document.getElementById('totalExpense');
  const savingsStatusText = document.getElementById('savingsStatusText');

  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const formTx = document.getElementById('transactionForm');
  const inputTxType = document.getElementById('txType');
  const inputTxAmount = document.getElementById('txAmount');
  const selectTxCategory = document.getElementById('txCategory');
  const inputTxNotes = document.getElementById('txNotes');
  const inputTxDate = document.getElementById('txDate');
  const tabIncome = document.getElementById('tabIncome');
  const tabExpense = document.getElementById('tabExpense');

  const goalsContainer = document.getElementById('goalsContainer');
  const btnOpenGoalModal = document.getElementById('btnOpenGoalModal');
  const goalModal = document.getElementById('goalModal');
  const btnCloseGoalModal = document.getElementById('btnCloseGoalModal');
  const btnCancelGoal = document.getElementById('btnCancelGoal');
  const formGoal = document.getElementById('goalForm');
  const inputGoalTitle = document.getElementById('goalTitle');
  const inputGoalEmoji = document.getElementById('goalEmoji');
  const inputGoalTarget = document.getElementById('goalTargetAmount');
  const emojiBtns = document.querySelectorAll('.emoji-btn');

  const depositModal = document.getElementById('depositModal');
  const btnCloseDepositModal = document.getElementById('btnCloseDepositModal');
  const btnCancelDeposit = document.getElementById('btnCancelDeposit');
  const formDeposit = document.getElementById('depositForm');
  const inputDepositGoalId = document.getElementById('depositGoalId');
  const inputDepositAmount = document.getElementById('depositAmount');
  const textDepositGoalTitle = document.getElementById('depositGoalTitle');

  const editTxModal = document.getElementById('editTxModal');
  const btnCloseEditTxModal = document.getElementById('btnCloseEditTxModal');
  const btnCancelEditTx = document.getElementById('btnCancelEditTx');
  const formEditTx = document.getElementById('editTxForm');
  const inputEditTxId = document.getElementById('editTxId');
  const inputEditTxAmount = document.getElementById('editTxAmount');
  const selectEditTxCategory = document.getElementById('editTxCategory');
  const inputEditTxNotes = document.getElementById('editTxNotes');
  const inputEditTxDate = document.getElementById('editTxDate');

  const confirmModal = document.getElementById('confirmModal');
  const confirmTitle = document.getElementById('confirmTitle');
  const confirmMessage = document.getElementById('confirmMessage');
  const confirmCancelBtn = document.getElementById('confirmCancelBtn');
  const confirmOkBtn = document.getElementById('confirmOkBtn');

  const historyFilters = document.querySelectorAll('#historyFilters .filter-btn');
  const inputSearchTx = document.getElementById('searchTx');
  const transactionsList = document.getElementById('transactionsList');
  const emptyTxState = document.getElementById('emptyTxState');

  const chartTabSummary = document.getElementById('chartTabSummary');
  const chartTabCategory = document.getElementById('chartTabCategory');
  const chartCanvas = document.getElementById('financeChart');
  const chartEmptyMessage = document.getElementById('chartEmptyMessage');

  const btnExport = document.getElementById('btnExport');
  const btnImport = document.getElementById('btnImport');
  const importFileInput = document.getElementById('importFileInput');
  const btnExportCsv = document.getElementById('btnExportCsv');
  const btnReset = document.getElementById('btnReset');
  const toastContainer = document.getElementById('toastContainer');

  // --- Utility Helpers ---
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatRupiah(num) {
    if (isNaN(num)) num = 0;
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function parseRupiahInput(value) {
    const raw = String(value).replace(/[^0-9]/g, '');
    return raw ? parseInt(raw, 10) : 0;
  }

  function attachCurrencyMask(inputElement) {
    inputElement.addEventListener('input', function() {
      const val = parseRupiahInput(this.value);
      this.value = val > 0 ? val.toLocaleString('id-ID') : '';
    });
  }

  function triggerCuteConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#38bdf8', '#fbcfe8', '#bae6fd']
      });
    }
  }

  function showToast(message, variant = 'success') {
    const toast = document.createElement('div');
    const styles = {
      success: 'bg-white dark:bg-slate-800 border-pink-200 dark:border-pink-900 text-slate-700 dark:text-slate-100',
      info: 'bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-900 text-slate-700 dark:text-slate-100',
      error: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-200'
    };
    const icon = variant === 'error' ? '🥺' : (variant === 'info' ? '✨' : '🌸');

    toast.className = `pointer-events-auto p-3 rounded-2xl shadow-md border ${styles[variant] || styles.success} flex items-center gap-2 text-xs font-bold toast-enter`;
    toast.innerHTML = `<span class="text-sm">${icon}</span><span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 200);
    }, 2400);
  }

  function showConfirm(title, message, onConfirm) {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    pendingConfirmAction = onConfirm;
    confirmModal.classList.remove('hidden');
    confirmModal.classList.add('open');
  }

  function closeConfirm() {
    confirmModal.classList.add('hidden');
    confirmModal.classList.remove('open');
    pendingConfirmAction = null;
  }

  // --- Theme Mode ---
  function initTheme() {
    const savedTheme = localStorage.getItem('cutecuan_theme');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);

    if (isDark) {
      document.documentElement.classList.add('dark');
      if (themeIcon) themeIcon.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      if (themeIcon) themeIcon.textContent = '🌙';
    }
  }

  function toggleTheme() {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('cutecuan_theme', isDark ? 'dark' : 'light');
    if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙';
    updateChart();
  }

  // --- Local Storage Management ---
  function loadData() {
    try {
      const storedTx = localStorage.getItem('cutecuan_transactions');
      const storedGoals = localStorage.getItem('cutecuan_goals');
      transactions = storedTx ? JSON.parse(storedTx) : DEFAULT_TRANSACTIONS;
      goals = storedGoals ? JSON.parse(storedGoals) : DEFAULT_GOALS;
    } catch (e) {
      console.error('Error loading data', e);
      transactions = DEFAULT_TRANSACTIONS;
      goals = DEFAULT_GOALS;
    }
  }

  function saveData() {
    try {
      localStorage.setItem('cutecuan_transactions', JSON.stringify(transactions));
      localStorage.setItem('cutecuan_goals', JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving data', e);
    }
  }

  // --- Kategori Dropdown ---
  function populateCategorySelect(selectEl, type, selectedValue = null) {
    const list = CATEGORIES[type] || CATEGORIES.income;
    selectEl.innerHTML = '';
    list.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.label;
      selectEl.appendChild(opt);
    });
    if (selectedValue) {
      selectEl.value = selectedValue;
    }
  }

  // --- CORE LOGIC: Tabungan = Pemasukan - Pengeluaran ---
  function updateSummary() {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amt;
      } else if (t.type === 'expense') {
        expense += amt;
      }
    });

    // Pemasukan menambah tabungan, pengeluaran memotong tabungan
    const currentSavings = income - expense;

    elTotalIncome.textContent = formatRupiah(income);
    elTotalExpense.textContent = formatRupiah(expense);
    elTotalSavings.textContent = formatRupiah(currentSavings);

    // Status pesan tabungan
    if (currentSavings > 0) {
      savingsStatusText.textContent = 'Tabungan Sehat 🌸';
    } else if (currentSavings === 0) {
      savingsStatusText.textContent = 'Yuk Mulai Menabung! ✨';
    } else {
      savingsStatusText.textContent = 'Tabungan Minus 🥺';
    }
  }

  // --- Target Celengan Impian ---
  function renderGoals() {
    goalsContainer.innerHTML = '';
    if (goals.length === 0) {
      goalsContainer.innerHTML = `
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-700/60 text-center">
          <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Belum ada target impian.</p>
          <p class="text-[11px] text-pink-500 font-semibold mt-0.5">Klik "+ Tambah" untuk bikin target impianmu!</p>
        </div>
      `;
      return;
    }

    goals.forEach(goal => {
      const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
      const isReached = goal.currentAmount >= goal.targetAmount;

      const card = document.createElement('div');
      card.className = 'p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 transition-all';
      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-1.5">
          <div class="flex items-center gap-2 min-w-0">
            <span class="text-xl shrink-0">${escapeHtml(goal.emoji || '🎁')}</span>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1">
                <span>${escapeHtml(goal.title)}</span>
                ${isReached ? '<span class="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 font-bold px-1.5 py-0.2 rounded-md">Tercapai! 🎉</span>' : ''}
              </h4>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">
                ${formatRupiah(goal.currentAmount)} / ${formatRupiah(goal.targetAmount)}
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="btn-deposit-goal px-2 py-1 bg-pink-500 hover:bg-pink-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer" data-id="${escapeHtml(goal.id)}">
              Sisihkan
            </button>
            <button class="btn-delete-goal p-1 text-slate-300 hover:text-rose-400 rounded-lg text-xs transition-colors cursor-pointer" data-id="${escapeHtml(goal.id)}" title="Hapus target">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

        <div class="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-pink-400 to-sky-400 h-full rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
        </div>
        <div class="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
          <span>Progres</span>
          <span class="text-pink-500 font-semibold">${percentage}%</span>
        </div>
      `;
      goalsContainer.appendChild(card);
    });

    goalsContainer.querySelectorAll('.btn-deposit-goal').forEach(btn => {
      btn.addEventListener('click', () => openDepositModal(btn.getAttribute('data-id')));
    });

    goalsContainer.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        showConfirm('Hapus Target?', 'Hapus target impian ini? 🌸', () => {
          goals = goals.filter(g => g.id !== id);
          saveData();
          renderGoals();
          showToast('Target impian dihapus', 'info');
        });
      });
    });
  }

  // --- Riwayat Transaksi Bersih ---
  function renderTransactions() {
    let filtered = transactions.filter(t => {
      if (currentFilter !== 'all' && t.type !== currentFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const notes = (t.notes || '').toLowerCase();
        const cat = (t.categoryLabel || '').toLowerCase();
        return notes.includes(q) || cat.includes(q);
      }
      return true;
    });

    filtered.sort((a, b) => {
      const d = (b.date || '').localeCompare(a.date || '');
      if (d !== 0) return d;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    transactionsList.innerHTML = '';

    if (filtered.length === 0) {
      emptyTxState.classList.remove('hidden');
      transactionsList.classList.add('hidden');
      return;
    }

    emptyTxState.classList.add('hidden');
    transactionsList.classList.remove('hidden');

    filtered.forEach(tx => {
      const item = document.createElement('div');
      item.className = 'p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between gap-2.5 group';

      const isIncome = tx.type === 'income';
      const badgeIcon = isIncome
        ? '<span class="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/70 text-[#0284c7] dark:text-sky-300 flex items-center justify-center text-xs shrink-0"><i class="fa-solid fa-arrow-down"></i></span>'
        : '<span class="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-950/70 text-[#ec4899] dark:text-pink-300 flex items-center justify-center text-xs shrink-0"><i class="fa-solid fa-arrow-up"></i></span>';

      const amountText = (isIncome ? '+ ' : '- ') + formatRupiah(tx.amount);
      const amountClass = isIncome ? 'text-[#0284c7] dark:text-sky-400' : 'text-[#ec4899] dark:text-pink-400';

      const dateFormatted = tx.date
        ? new Date(tx.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : 'Hari ini';

      item.innerHTML = `
        <div class="flex items-center gap-2.5 min-w-0">
          ${badgeIcon}
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(tx.notes || tx.categoryLabel)}</h4>
            <div class="flex items-center gap-1.5 text-[10px] text-slate-400">
              <span class="truncate">${escapeHtml(tx.categoryLabel || 'Lainnya')}</span>
              <span>•</span>
              <span class="shrink-0">${escapeHtml(dateFormatted)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs font-bold ${amountClass}">
            ${amountText}
          </span>
          <button class="btn-edit-tx text-slate-300 hover:text-sky-500 p-1 rounded-md transition-colors cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Ubah">
            <i class="fa-regular fa-pen-to-square text-[11px]"></i>
          </button>
          <button class="btn-delete-tx text-slate-300 hover:text-rose-400 p-1 rounded-md transition-colors cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Hapus">
            <i class="fa-regular fa-trash-can text-[11px]"></i>
          </button>
        </div>
      `;

      transactionsList.appendChild(item);
    });

    transactionsList.querySelectorAll('.btn-edit-tx').forEach(btn => {
      btn.addEventListener('click', () => openEditTxModal(btn.getAttribute('data-id')));
    });

    transactionsList.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        showConfirm('Hapus Catatan?', 'Hapus catatan transaksi ini? 💕', () => {
          transactions = transactions.filter(t => t.id !== id);
          saveData();
          refreshAllUI();
          showToast('Catatan dihapus', 'info');
        });
      });
    });
  }

  // --- Visual Grafik Sederhana ---
  function updateChart() {
    if (typeof Chart === 'undefined') return;

    if (transactions.length === 0) {
      if (financeChartInstance) {
        financeChartInstance.destroy();
        financeChartInstance = null;
      }
      chartCanvas.classList.add('hidden');
      chartEmptyMessage.classList.remove('hidden');
      return;
    }

    chartCanvas.classList.remove('hidden');
    chartEmptyMessage.classList.add('hidden');

    if (financeChartInstance) {
      financeChartInstance.destroy();
    }

    const isDark = document.documentElement.classList.contains('dark');
    const ctx = chartCanvas.getContext('2d');
    const textColor = isDark ? '#cbd5e1' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.4)' : 'rgba(241, 245, 249, 0.8)';

    if (activeChartTab === 'summary') {
      let inc = 0, exp = 0;
      transactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') inc += amt;
        else if (t.type === 'expense') exp += amt;
      });

      financeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pemasukan (+)', 'Pengeluaran (-)'],
          datasets: [{
            data: [inc, exp],
            backgroundColor: [
              'rgba(56, 189, 248, 0.85)',
              'rgba(244, 114, 182, 0.85)'
            ],
            borderColor: ['#0ea5e9', '#ec4899'],
            borderWidth: 1.5,
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: context => ' ' + formatRupiah(context.raw)
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: textColor,
                font: { family: 'Quicksand', size: 10 },
                callback: value => (value >= 1000000 ? (value / 1000000) + 'jt' : (value >= 1000 ? (value / 1000) + 'rb' : value))
              },
              grid: { color: gridColor }
            },
            x: {
              ticks: { color: textColor, font: { family: 'Quicksand', size: 11, weight: '600' } },
              grid: { display: false }
            }
          }
        }
      });
    } else {
      const expenses = transactions.filter(t => t.type === 'expense');
      const categoryMap = {};

      expenses.forEach(t => {
        const label = t.categoryLabel || 'Lainnya';
        categoryMap[label] = (categoryMap[label] || 0) + (Number(t.amount) || 0);
      });

      const labels = Object.keys(categoryMap);
      const data = Object.values(categoryMap);

      if (labels.length === 0) {
        chartCanvas.classList.add('hidden');
        chartEmptyMessage.classList.remove('hidden');
        return;
      }

      const cutePalette = ['#f472b6', '#38bdf8', '#c084fc', '#fbcfe8', '#bae6fd', '#fb7185', '#60a5fa'];

      financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: cutePalette.slice(0, labels.length),
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: textColor,
                font: { family: 'Quicksand', size: 10, weight: '600' },
                boxWidth: 10,
                padding: 8
              }
            },
            tooltip: {
              callbacks: {
                label: context => ' ' + context.label + ': ' + formatRupiah(context.raw)
              }
            }
          },
          cutout: '65%'
        }
      });
    }
  }

  function refreshAllUI() {
    updateSummary();
    renderTransactions();
    renderGoals();
    updateChart();
  }

  // --- Modal Helpers ---
  function openDepositModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    inputDepositGoalId.value = goal.id;
    inputDepositAmount.value = '';
    textDepositGoalTitle.textContent = `${goal.emoji || '🎁'} ${goal.title} (Terkumpul: ${formatRupiah(goal.currentAmount)})`;

    depositModal.classList.remove('hidden');
    depositModal.classList.add('open');
    inputDepositAmount.focus();
  }

  function closeDepositModal() {
    depositModal.classList.add('hidden');
    depositModal.classList.remove('open');
  }

  function openGoalModal() {
    inputGoalTitle.value = '';
    inputGoalTarget.value = '';
    inputGoalEmoji.value = '🎁';
    emojiBtns.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-emoji') === '🎁'));

    goalModal.classList.remove('hidden');
    goalModal.classList.add('open');
    inputGoalTitle.focus();
  }

  function closeGoalModal() {
    goalModal.classList.add('hidden');
    goalModal.classList.remove('open');
  }

  function openEditTxModal(txId) {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    inputEditTxId.value = tx.id;
    inputEditTxAmount.value = Number(tx.amount).toLocaleString('id-ID');
    populateCategorySelect(selectEditTxCategory, tx.type, tx.category);
    inputEditTxNotes.value = tx.notes || '';
    inputEditTxDate.value = tx.date || todayISO;

    editTxModal.classList.remove('hidden');
    editTxModal.classList.add('open');
    inputEditTxAmount.focus();
  }

  function closeEditTxModal() {
    editTxModal.classList.add('hidden');
    editTxModal.classList.remove('open');
  }

  // --- Export CSV ---
  function exportToCSV() {
    if (transactions.length === 0) {
      showToast('Belum ada transaksi untuk diunduh', 'error');
      return;
    }

    const header = ['Tanggal', 'Tipe', 'Kategori', 'Keterangan', 'Nominal'];
    const csvLines = [header.join(',')];
    transactions.forEach(t => {
      const safeNotes = '"' + String(t.notes || '').replace(/"/g, '""') + '"';
      const safeCat = '"' + String(t.categoryLabel || '').replace(/"/g, '""') + '"';
      const typeText = t.type === 'income' ? 'Pemasukan (+)' : 'Pengeluaran (-)';
      csvLines.push([t.date || '', typeText, safeCat, safeNotes, t.amount || 0].join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cutecuan-tabungan-${todayISO}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast('Laporan CSV berhasil diunduh! 📊', 'success');
  }

  // --- Event Listeners Initialization ---
  function initEvents() {
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', toggleTheme);
    }

    const now = new Date();
    elCurrentDate.textContent = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    inputTxDate.value = todayISO;

    attachCurrencyMask(inputTxAmount);
    attachCurrencyMask(inputGoalTarget);
    attachCurrencyMask(inputDepositAmount);
    attachCurrencyMask(inputEditTxAmount);

    // Toggle: Pemasukan vs Pengeluaran
    tabIncome.addEventListener('click', () => {
      tabIncome.classList.add('active');
      tabExpense.classList.remove('active');
      inputTxType.value = 'income';
      populateCategorySelect(selectTxCategory, 'income');
    });

    tabExpense.addEventListener('click', () => {
      tabExpense.classList.add('active');
      tabIncome.classList.remove('active');
      inputTxType.value = 'expense';
      populateCategorySelect(selectTxCategory, 'expense');
    });

    // Form Catat Transaksi Baru
    formTx.addEventListener('submit', (e) => {
      e.preventDefault();

      const type = inputTxType.value;
      const amount = parseRupiahInput(inputTxAmount.value);
      const categoryId = selectTxCategory.value;
      const selectedOption = selectTxCategory.options[selectTxCategory.selectedIndex];
      const categoryLabel = selectedOption ? selectedOption.textContent : 'Lainnya';
      const notes = inputTxNotes.value.trim();
      const date = inputTxDate.value;

      if (amount <= 0) {
        showToast('Nominal harus lebih dari Rp 0 ya 🌸', 'error');
        return;
      }

      transactions.unshift({
        id: 'tx-' + Date.now(),
        type: type,
        amount: amount,
        category: categoryId,
        categoryLabel: categoryLabel,
        notes: notes,
        date: date,
        createdAt: Date.now()
      });

      saveData();
      refreshAllUI();

      if (type === 'income') {
        triggerCuteConfetti();
        showToast('Tabungan bertambah! 💵✨', 'success');
      } else {
        showToast('Pengeluaran dicatat (memotong tabungan) 📝', 'info');
      }

      inputTxAmount.value = '';
      inputTxNotes.value = '';
    });

    // Edit Modal Events
    btnCloseEditTxModal.addEventListener('click', closeEditTxModal);
    btnCancelEditTx.addEventListener('click', closeEditTxModal);
    formEditTx.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = inputEditTxId.value;
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      const amount = parseRupiahInput(inputEditTxAmount.value);
      if (amount <= 0) {
        showToast('Nominal tidak boleh nol', 'error');
        return;
      }

      const selectedOpt = selectEditTxCategory.options[selectEditTxCategory.selectedIndex];
      tx.amount = amount;
      tx.category = selectEditTxCategory.value;
      tx.categoryLabel = selectedOpt ? selectedOpt.textContent : tx.categoryLabel;
      tx.notes = inputEditTxNotes.value.trim();
      tx.date = inputEditTxDate.value;

      saveData();
      refreshAllUI();
      closeEditTxModal();
      showToast('Catatan diperbarui ✨', 'success');
    });

    // Goal Modal Events
    btnOpenGoalModal.addEventListener('click', openGoalModal);
    btnCloseGoalModal.addEventListener('click', closeGoalModal);
    btnCancelGoal.addEventListener('click', closeGoalModal);

    emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        emojiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        inputGoalEmoji.value = btn.getAttribute('data-emoji');
      });
    });

    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = inputGoalTitle.value.trim();
      const emoji = inputGoalEmoji.value || '🎁';
      const targetAmount = parseRupiahInput(inputGoalTarget.value);

      if (!title || targetAmount <= 0) {
        showToast('Isi nama impian dan target nominal yang benar ✨', 'error');
        return;
      }

      goals.push({
        id: 'goal-' + Date.now(),
        title: title,
        emoji: emoji,
        targetAmount: targetAmount,
        currentAmount: 0,
        createdAt: Date.now()
      });

      saveData();
      renderGoals();
      closeGoalModal();
      triggerCuteConfetti();
      showToast('Target impian dibuat! 🎯', 'success');
    });

    // Deposit to Goal Events
    btnCloseDepositModal.addEventListener('click', closeDepositModal);
    btnCancelDeposit.addEventListener('click', closeDepositModal);

    formDeposit.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = inputDepositGoalId.value;
      const amt = parseRupiahInput(inputDepositAmount.value);

      if (amt <= 0) {
        showToast('Masukkan nominal yang benar ya 🪙', 'error');
        return;
      }

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      const wasReached = goal.currentAmount >= goal.targetAmount;
      goal.currentAmount = (goal.currentAmount || 0) + amt;
      const nowReached = goal.currentAmount >= goal.targetAmount;

      saveData();
      renderGoals();
      closeDepositModal();
      triggerCuteConfetti();

      if (!wasReached && nowReached) {
        showToast(`Selamat! Target "${goal.title}" sudah 100% tercapai! 🎉`, 'success');
      } else {
        showToast(`Berhasil menyisihkan ${formatRupiah(amt)} untuk ${goal.title} ✨`, 'success');
      }
    });

    // Confirm Modal Events
    confirmCancelBtn.addEventListener('click', closeConfirm);
    confirmOkBtn.addEventListener('click', () => {
      if (typeof pendingConfirmAction === 'function') {
        pendingConfirmAction();
      }
      closeConfirm();
    });

    // History Filters & Search
    historyFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        historyFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTransactions();
      });
    });

    inputSearchTx.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTransactions();
    });

    // Chart Tabs
    chartTabSummary.addEventListener('click', () => {
      activeChartTab = 'summary';
      chartTabSummary.className = 'px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 shadow-2xs text-[#0284c7] dark:text-sky-300 font-bold cursor-pointer';
      chartTabCategory.className = 'px-2.5 py-1 rounded-md text-slate-500 dark:text-slate-400 font-medium cursor-pointer';
      updateChart();
    });

    chartTabCategory.addEventListener('click', () => {
      activeChartTab = 'category';
      chartTabCategory.className = 'px-2.5 py-1 rounded-md bg-white dark:bg-slate-700 shadow-2xs text-[#ec4899] dark:text-pink-300 font-bold cursor-pointer';
      chartTabSummary.className = 'px-2.5 py-1 rounded-md text-slate-500 dark:text-slate-400 font-medium cursor-pointer';
      updateChart();
    });

    // Export CSV
    btnExportCsv.addEventListener('click', exportToCSV);

    // Export JSON
    btnExport.addEventListener('click', () => {
      const backupData = {
        appName: 'CuteCuan',
        version: '3.0',
        exportedAt: new Date().toISOString(),
        transactions: transactions,
        goals: goals
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cutecuan-backup-${todayISO}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Cadangan data berhasil diunduh 💾', 'success');
    });

    // Import JSON
    btnImport.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!Array.isArray(parsed.transactions)) {
            showToast('Format cadangan tidak sesuai', 'error');
            return;
          }
          showConfirm(
            'Pulihkan Data?',
            `Pulihkan ${parsed.transactions.length} transaksi cadangan?`,
            () => {
              transactions = parsed.transactions;
              if (Array.isArray(parsed.goals)) goals = parsed.goals;
              saveData();
              refreshAllUI();
              showToast('Data berhasil dipulihkan! ✨', 'success');
            }
          );
        } catch (err) {
          showToast('Gagal membaca file JSON', 'error');
        }
      };
      reader.readAsText(file);
      importFileInput.value = '';
    });

    // Reset All Data
    btnReset.addEventListener('click', () => {
      showConfirm(
        'Reset Data?',
        'Hapus semua catatan transaksi dan target celengan? 🧹',
        () => {
          transactions = [];
          goals = [];
          saveData();
          refreshAllUI();
          showToast('Data berhasil dibersihkan ✨', 'info');
        }
      );
    });
  }

  // --- Bootstrap App ---
  function initApp() {
    initTheme();
    loadData();
    populateCategorySelect(selectTxCategory, 'income');
    initEvents();
    refreshAllUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
