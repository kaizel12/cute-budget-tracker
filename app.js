// CuteCuan v2.0 - Clean, Feature-Rich & Vercel Ready

(function() {
  'use strict';

  // --- Constants & Predefined Categories ---
  const CATEGORIES = {
    expense: [
      { id: 'food', label: '🍰 Makanan & Jajan' },
      { id: 'shopping', label: '🛍️ Belanja & Shopping' },
      { id: 'transport', label: '🛵 Transport & Bensin' },
      { id: 'entertainment', label: '🎮 Hiburan & Liburan' },
      { id: 'beauty', label: '💄 Skincare & Cantik' },
      { id: 'education', label: '📚 Buku & Belajar' },
      { id: 'bills', label: '🏠 Tagihan & Pulsa' },
      { id: 'others', label: '🫧 Pengeluaran Lain' }
    ],
    income: [
      { id: 'salary', label: '💵 Gaji / Penghasilan' },
      { id: 'allowance', label: '🧧 Uang Saku / Kiriman' },
      { id: 'freelance', label: '📈 Freelance & Usaha' },
      { id: 'gift', label: '🎁 Hadiah & Bonus' },
      { id: 'income_others', label: '🪙 Pemasukan Lain' }
    ],
    savings: [
      { id: 'piggy', label: '🐷 Masuk Celengan' },
      { id: 'emergency', label: '🛡️ Dana Darurat' },
      { id: 'investment', label: '🌟 Investasi Masa Depan' },
      { id: 'dream', label: '🎯 Target Impian' }
    ]
  };

  const todayISO = new Date().toISOString().split('T')[0];

  const DEFAULT_TRANSACTIONS = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 1500000,
      category: 'allowance',
      categoryLabel: '🧧 Uang Saku / Kiriman',
      notes: 'Uang bulanan tersayang 🥰',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 24
    },
    {
      id: 'tx-2',
      type: 'savings',
      amount: 300000,
      category: 'piggy',
      categoryLabel: '🐷 Masuk Celengan',
      notes: 'Sisihkan tabungan di awal bulan ✨',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 12
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 45000,
      category: 'food',
      categoryLabel: '🍰 Makanan & Jajan',
      notes: 'Matcha latte + cheesecake manis 🍰',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 4
    }
  ];

  const DEFAULT_GOALS = [
    {
      id: 'goal-1',
      title: 'Beli Sepatu Lucu 👟',
      emoji: '🎁',
      targetAmount: 500000,
      currentAmount: 250000,
      createdAt: Date.now()
    },
    {
      id: 'goal-2',
      title: 'Liburan ke Pantai 🏖️',
      emoji: '✈️',
      targetAmount: 1200000,
      currentAmount: 450000,
      createdAt: Date.now()
    }
  ];

  // --- State ---
  let transactions = [];
  let goals = [];
  let monthlyBudgetLimit = 1000000;
  let selectedMonth = 'all'; // 'all' or 'YYYY-MM'
  let currentFilter = 'all';
  let searchQuery = '';
  let activeChartTab = 'summary';
  let financeChartInstance = null;
  let pendingConfirmAction = null;

  // --- DOM Elements ---
  const elCurrentDate = document.getElementById('currentDate');
  const elWalletBalance = document.getElementById('walletBalance');
  const elTotalIncome = document.getElementById('totalIncome');
  const elTotalExpense = document.getElementById('totalExpense');
  const elTotalSavings = document.getElementById('totalSavings');
  const elSavingsRateBadge = document.getElementById('savingsRateBadge');

  const selectMonthFilter = document.getElementById('monthFilter');
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const budgetStatusBadge = document.getElementById('budgetStatusBadge');
  const budgetSubtitle = document.getElementById('budgetSubtitle');
  const budgetProgressBar = document.getElementById('budgetProgressBar');
  const btnOpenBudgetModal = document.getElementById('btnOpenBudgetModal');
  const budgetModal = document.getElementById('budgetModal');
  const btnCloseBudgetModal = document.getElementById('btnCloseBudgetModal');
  const btnCancelBudget = document.getElementById('btnCancelBudget');
  const formBudget = document.getElementById('budgetForm');
  const inputBudgetLimit = document.getElementById('budgetLimitInput');

  const formTx = document.getElementById('transactionForm');
  const inputTxType = document.getElementById('txType');
  const inputTxAmount = document.getElementById('txAmount');
  const selectTxCategory = document.getElementById('txCategory');
  const inputTxNotes = document.getElementById('txNotes');
  const inputTxDate = document.getElementById('txDate');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const chipBtns = document.querySelectorAll('.chip-btn[data-add]');
  const btnClearAmount = document.getElementById('btnClearAmount');

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
  const inputDepositAction = document.getElementById('depositAction');
  const inputDepositAmount = document.getElementById('depositAmount');
  const textDepositGoalTitle = document.getElementById('depositGoalTitle');
  const modeDepositBtn = document.getElementById('modeDepositBtn');
  const modeWithdrawBtn = document.getElementById('modeWithdrawBtn');
  const depositSubmitBtn = document.getElementById('depositSubmitBtn');

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

  // --- Safe Escaping & Utility Helpers ---
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
        particleCount: 55,
        spread: 65,
        origin: { y: 0.7 },
        colors: ['#f472b6', '#38bdf8', '#fbcfe8', '#bae6fd', '#fcd34d']
      });
    }
  }

  // --- Cute Toast Notifications ---
  function showToast(message, variant = 'success') {
    const toast = document.createElement('div');
    const styles = {
      success: 'bg-white dark:bg-slate-800 border-pink-200 dark:border-pink-800 text-slate-700 dark:text-slate-100',
      info: 'bg-white dark:bg-slate-800 border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-100',
      error: 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-200'
    };
    const icons = { success: '🌸', info: '✨', error: '🥺' };

    toast.className = `pointer-events-auto p-3.5 rounded-2xl shadow-lg border ${styles[variant] || styles.success} flex items-center gap-2.5 text-xs font-bold toast-enter`;
    toast.innerHTML = `<span class="text-base">${icons[variant] || '🌸'}</span><span>${escapeHtml(message)}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 220);
    }, 2800);
  }

  // --- Custom Cute Confirmation Modal ---
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

  // --- Theme Mode (Dark/Light) Management ---
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
      const storedBudget = localStorage.getItem('cutecuan_budget_limit');

      transactions = storedTx ? JSON.parse(storedTx) : DEFAULT_TRANSACTIONS;
      goals = storedGoals ? JSON.parse(storedGoals) : DEFAULT_GOALS;
      monthlyBudgetLimit = storedBudget ? parseInt(storedBudget, 10) : 1000000;
      if (isNaN(monthlyBudgetLimit) || monthlyBudgetLimit <= 0) monthlyBudgetLimit = 1000000;
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      transactions = DEFAULT_TRANSACTIONS;
      goals = DEFAULT_GOALS;
      monthlyBudgetLimit = 1000000;
    }
  }

  function saveData() {
    try {
      localStorage.setItem('cutecuan_transactions', JSON.stringify(transactions));
      localStorage.setItem('cutecuan_goals', JSON.stringify(goals));
      localStorage.setItem('cutecuan_budget_limit', String(monthlyBudgetLimit));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  // --- Month Period Filter Helpers ---
  function getPeriodTransactions() {
    if (selectedMonth === 'all') return transactions;
    return transactions.filter(t => (t.date || '').startsWith(selectedMonth));
  }

  function populateMonthFilter() {
    const monthsSet = new Set();
    monthsSet.add(todayISO.slice(0, 7)); // Always include current month
    transactions.forEach(t => {
      if (t.date && t.date.length >= 7) {
        monthsSet.add(t.date.slice(0, 7));
      }
    });

    const sortedMonths = Array.from(monthsSet).sort().reverse();
    const prevValue = selectedMonth;

    selectMonthFilter.innerHTML = '<option value="all">📅 Semua Periode</option>';
    sortedMonths.forEach(ym => {
      const [y, m] = ym.split('-');
      const dateObj = new Date(Number(y), Number(m) - 1, 1);
      const label = dateObj.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      const opt = document.createElement('option');
      opt.value = ym;
      opt.textContent = '🗓️ ' + label;
      selectMonthFilter.appendChild(opt);
    });

    if (prevValue === 'all' || sortedMonths.includes(prevValue)) {
      selectMonthFilter.value = prevValue;
    } else {
      selectedMonth = 'all';
      selectMonthFilter.value = 'all';
    }
  }

  // --- UI Update: Categories Select ---
  function populateCategorySelect(selectEl, type, selectedValue = null) {
    const categories = CATEGORIES[type] || CATEGORIES.expense;
    selectEl.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.label;
      selectEl.appendChild(option);
    });
    if (selectedValue) {
      selectEl.value = selectedValue;
    }
  }

  // --- UI Update: Summary & Monthly Budget Bar ---
  function updateSummary() {
    const periodTxs = getPeriodTransactions();
    let income = 0;
    let expense = 0;
    let savings = 0;

    periodTxs.forEach(t => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'income') income += amt;
      else if (t.type === 'expense') expense += amt;
      else if (t.type === 'savings') savings += amt;
    });

    const walletBalance = income - expense - savings;

    elWalletBalance.textContent = formatRupiah(walletBalance);
    elTotalIncome.textContent = formatRupiah(income);
    elTotalExpense.textContent = formatRupiah(expense);
    elTotalSavings.textContent = formatRupiah(savings);

    if (walletBalance < 0) {
      elWalletBalance.classList.remove('text-slate-800', 'dark:text-white');
      elWalletBalance.classList.add('text-rose-500');
    } else {
      elWalletBalance.classList.remove('text-rose-500');
      elWalletBalance.classList.add('text-slate-800', 'dark:text-white');
    }

    // Savings rate badge
    const savingsRate = income > 0 ? Math.round((savings / income) * 100) : 0;
    if (savingsRate >= 20) {
      elSavingsRateBadge.textContent = `Rasio tabungan: ${savingsRate}% (Keren! 🌟)`;
    } else if (savingsRate > 0) {
      elSavingsRateBadge.textContent = `Rasio tabungan: ${savingsRate}% ⭐`;
    } else {
      elSavingsRateBadge.textContent = 'Yuk sisihkan tabungan! 🐷';
    }

    // Update Rem Jajan / Budget Limit Widget
    const budgetPct = Math.min(100, Math.round((expense / monthlyBudgetLimit) * 100)) || 0;
    const rawPct = Math.round((expense / monthlyBudgetLimit) * 100) || 0;
    budgetSubtitle.textContent = `Terpakai ${formatRupiah(expense)} dari batas ${formatRupiah(monthlyBudgetLimit)} (${rawPct}%)`;
    budgetProgressBar.style.width = `${budgetPct}%`;

    budgetProgressBar.className = 'h-full rounded-full transition-all duration-500';
    if (rawPct >= 100) {
      budgetProgressBar.classList.add('bg-gradient-to-r', 'from-rose-500', 'to-pink-600');
      budgetStatusBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-300 font-bold';
      budgetStatusBadge.textContent = 'Melebihi Batas! 🥺';
    } else if (rawPct >= 75) {
      budgetProgressBar.classList.add('bg-gradient-to-r', 'from-amber-400', 'to-orange-400');
      budgetStatusBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300 font-bold';
      budgetStatusBadge.textContent = 'Hati-hati Boros ⚡';
    } else {
      budgetProgressBar.classList.add('bg-gradient-to-r', 'from-sky-400', 'to-pink-400');
      budgetStatusBadge.className = 'text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 font-bold';
      budgetStatusBadge.textContent = 'Aman Terkendali ✨';
    }
  }

  // --- UI Update: Goals Section ---
  function renderGoals() {
    goalsContainer.innerHTML = '';
    if (goals.length === 0) {
      goalsContainer.innerHTML = `
        <div class="p-4 rounded-2xl bg-sky-50/50 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50 text-center">
          <p class="text-xs text-sky-600 dark:text-sky-400 font-semibold">Belum ada target impian! 🌈</p>
          <p class="text-[11px] text-slate-400 mt-0.5">Klik tombol "+ Target Baru" di atas untuk menambah celengan impianmu.</p>
        </div>
      `;
      return;
    }

    goals.forEach(goal => {
      const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
      const isReached = goal.currentAmount >= goal.targetAmount;

      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-2xl bg-gradient-to-r from-pink-50/60 to-sky-50/60 dark:from-slate-900/80 dark:to-slate-800/80 border border-pink-100/70 dark:border-slate-700 hover:border-pink-200 dark:hover:border-pink-500/40 transition-all shadow-xs';
      card.innerHTML = `
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xl shrink-0">${escapeHtml(goal.emoji || '🎁')}</span>
            <div class="min-w-0">
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 flex-wrap">
                <span class="truncate">${escapeHtml(goal.title)}</span>
                ${isReached ? '<span class="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-md">Tercapai! 🎉</span>' : ''}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                ${formatRupiah(goal.currentAmount)} <span class="text-slate-400 dark:text-slate-500">/ ${formatRupiah(goal.targetAmount)}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="btn-deposit-goal p-1.5 px-2.5 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer" data-id="${escapeHtml(goal.id)}">
              <i class="fa-solid fa-piggy-bank text-[10px]"></i> Kelola
            </button>
            <button class="btn-delete-goal p-1.5 text-slate-300 dark:text-slate-500 hover:text-rose-400 rounded-lg text-xs transition-colors cursor-pointer" data-id="${escapeHtml(goal.id)}" title="Hapus target">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

        <div class="w-full bg-slate-100 dark:bg-slate-700/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-600/50">
          <div class="bg-gradient-to-r from-pink-400 to-sky-400 dark:from-pink-500 dark:to-sky-500 h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
        </div>
        <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 mt-1">
          <span>Progres</span>
          <span class="text-pink-500 dark:text-pink-400">${percentage}%</span>
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
        showConfirm('Hapus Target?', 'Yakin ingin menghapus target celengan impian ini? 🌸', () => {
          goals = goals.filter(g => g.id !== id);
          saveData();
          renderGoals();
          showToast('Target impian dihapus', 'info');
        });
      });
    });
  }

  // --- UI Update: Transactions List ---
  function renderTransactions() {
    let filtered = getPeriodTransactions().filter(t => {
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
      const dateCompare = (b.date || '').localeCompare(a.date || '');
      if (dateCompare !== 0) return dateCompare;
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
      item.className = 'p-3 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700/70 hover:border-pink-200 dark:hover:border-pink-500/40 shadow-xs hover:shadow-sm transition-all flex items-center justify-between gap-3 group';

      let typeBadge = '';
      let amountClass = '';
      let prefix = '';

      if (tx.type === 'income') {
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-sm shrink-0"><i class="fa-solid fa-arrow-down"></i></span>';
        amountClass = 'text-emerald-600 dark:text-emerald-400';
        prefix = '+';
      } else if (tx.type === 'expense') {
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center text-sm shrink-0"><i class="fa-solid fa-arrow-up"></i></span>';
        amountClass = 'text-pink-500 dark:text-pink-400';
        prefix = '-';
      } else {
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center text-sm shrink-0"><i class="fa-solid fa-piggy-bank"></i></span>';
        amountClass = 'text-sky-500 dark:text-sky-400';
        prefix = '🐖 ';
      }

      const dateFormatted = tx.date
        ? new Date(tx.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: '2-digit' })
        : 'Hari ini';

      item.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          ${typeBadge}
          <div class="min-w-0">
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">${escapeHtml(tx.notes || tx.categoryLabel)}</h4>
            <div class="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span class="text-[11px] font-semibold text-slate-400">${escapeHtml(tx.categoryLabel || 'Lainnya')}</span>
              <span class="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <span class="text-[10px] font-medium text-slate-400">${escapeHtml(dateFormatted)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0">
          <span class="text-xs sm:text-sm font-bold ${amountClass} mr-1">
            ${prefix}${formatRupiah(tx.amount)}
          </span>
          <button class="btn-edit-tx text-slate-300 dark:text-slate-500 hover:text-sky-500 p-1.5 rounded-lg opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Edit catatan">
            <i class="fa-regular fa-pen-to-square text-xs"></i>
          </button>
          <button class="btn-delete-tx text-slate-300 dark:text-slate-500 hover:text-rose-400 p-1.5 rounded-lg opacity-70 sm:opacity-0 group-hover:opacity-100 transition-all cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Hapus catatan">
            <i class="fa-regular fa-trash-can text-xs"></i>
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
        showConfirm('Hapus Catatan?', 'Catatan transaksi ini akan dihapus permanen 💕', () => {
          transactions = transactions.filter(t => t.id !== id);
          saveData();
          populateMonthFilter();
          refreshAllUI();
          showToast('Catatan berhasil dihapus', 'info');
        });
      });
    });
  }

  // --- UI Update: Chart.js Visuals ---
  function updateChart() {
    if (typeof Chart === 'undefined') return;

    const periodTxs = getPeriodTransactions();

    if (periodTxs.length === 0) {
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
    const legendColor = isDark ? '#f1f5f9' : '#334155';

    if (activeChartTab === 'summary') {
      let inc = 0, exp = 0, sav = 0;
      periodTxs.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') inc += amt;
        else if (t.type === 'expense') exp += amt;
        else if (t.type === 'savings') sav += amt;
      });

      financeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Pemasukan 🌸', 'Pengeluaran 🛍️', 'Tabungan 🐷'],
          datasets: [{
            data: [inc, exp, sav],
            backgroundColor: [
              'rgba(52, 211, 153, 0.75)',
              'rgba(244, 114, 182, 0.75)',
              'rgba(56, 189, 248, 0.75)'
            ],
            borderColor: ['#10b981', '#ec4899', '#0284c7'],
            borderWidth: 2,
            borderRadius: 12
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
                callback: value => {
                  if (value >= 1000000) return (value / 1000000) + 'jt';
                  if (value >= 1000) return (value / 1000) + 'rb';
                  return value;
                }
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
      const expenses = periodTxs.filter(t => t.type === 'expense');
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

      const cutePalette = [
        '#f472b6', '#38bdf8', '#fbbf24', '#a78bfa',
        '#34d399', '#f87171', '#fb923c', '#e879f9'
      ];

      financeChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: data,
            backgroundColor: cutePalette.slice(0, labels.length),
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff',
            hoverOffset: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: legendColor,
                font: { family: 'Quicksand', size: 10, weight: '600' },
                boxWidth: 12,
                padding: 10
              }
            },
            tooltip: {
              callbacks: {
                label: context => ' ' + context.label + ': ' + formatRupiah(context.raw)
              }
            }
          },
          cutout: '62%'
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
  function setDepositMode(action) {
    inputDepositAction.value = action;
    if (action === 'deposit') {
      modeDepositBtn.className = 'py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-xs cursor-pointer';
      modeWithdrawBtn.className = 'py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer';
      depositSubmitBtn.textContent = 'Masukkan 🪙';
    } else {
      modeWithdrawBtn.className = 'py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 text-rose-500 dark:text-rose-400 shadow-xs cursor-pointer';
      modeDepositBtn.className = 'py-1.5 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 cursor-pointer';
      depositSubmitBtn.textContent = 'Tarik Dana 💸';
    }
  }

  function openDepositModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    inputDepositGoalId.value = goal.id;
    inputDepositAmount.value = '';
    textDepositGoalTitle.textContent = `${goal.emoji || '🎁'} ${goal.title} (Terkumpul: ${formatRupiah(goal.currentAmount)})`;
    setDepositMode('deposit');

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

  function openBudgetModal() {
    inputBudgetLimit.value = monthlyBudgetLimit.toLocaleString('id-ID');
    budgetModal.classList.remove('hidden');
    budgetModal.classList.add('open');
    inputBudgetLimit.focus();
  }

  function closeBudgetModal() {
    budgetModal.classList.add('hidden');
    budgetModal.classList.remove('open');
  }

  // --- Export CSV ---
  function exportToCSV() {
    const rows = getPeriodTransactions();
    if (rows.length === 0) {
      showToast('Belum ada transaksi untuk diekspor', 'error');
      return;
    }

    const header = ['Tanggal', 'Tipe', 'Kategori', 'Catatan', 'Nominal'];
    const typeMap = { income: 'Pemasukan', expense: 'Pengeluaran', savings: 'Tabungan' };

    const csvLines = [header.join(',')];
    rows.forEach(t => {
      const safeNotes = '"' + String(t.notes || '').replace(/"/g, '""') + '"';
      const safeCat = '"' + String(t.categoryLabel || '').replace(/"/g, '""') + '"';
      csvLines.push([
        t.date || '',
        typeMap[t.type] || t.type,
        safeCat,
        safeNotes,
        t.amount || 0
      ].join(','));
    });

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cutecuan-laporan-${selectedMonth === 'all' ? 'semua' : selectedMonth}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
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
    attachCurrencyMask(inputBudgetLimit);

    // Quick amount chips
    chipBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        const addVal = parseInt(chip.getAttribute('data-add'), 10) || 0;
        const currentVal = parseRupiahInput(inputTxAmount.value);
        inputTxAmount.value = (currentVal + addVal).toLocaleString('id-ID');
      });
    });

    if (btnClearAmount) {
      btnClearAmount.addEventListener('click', () => {
        inputTxAmount.value = '';
        inputTxAmount.focus();
      });
    }

    // Month filter
    selectMonthFilter.addEventListener('change', (e) => {
      selectedMonth = e.target.value;
      refreshAllUI();
    });

    // Tab Type Buttons
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-type');
        inputTxType.value = type;
        populateCategorySelect(selectTxCategory, type);
      });
    });

    // Submit: New Transaction
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
        showToast('Nominal uang harus lebih dari Rp 0 ya 🌸', 'error');
        return;
      }

      const newTx = {
        id: 'tx-' + Date.now(),
        type: type,
        amount: amount,
        category: categoryId,
        categoryLabel: categoryLabel,
        notes: notes,
        date: date,
        createdAt: Date.now()
      };

      transactions.unshift(newTx);
      saveData();
      populateMonthFilter();
      refreshAllUI();

      // Smart confetti: only on income or savings!
      if (type === 'income' || type === 'savings') {
        triggerCuteConfetti();
        showToast(type === 'income' ? 'Yeay! Pemasukan dicatat 💵' : 'Hebat! Tabungan bertambah 🐷', 'success');
      } else {
        showToast('Pengeluaran tercatat rapi 📝', 'info');
      }

      inputTxAmount.value = '';
      inputTxNotes.value = '';
    });

    // Edit Transaction Modal Events
    btnCloseEditTxModal.addEventListener('click', closeEditTxModal);
    btnCancelEditTx.addEventListener('click', closeEditTxModal);
    formEditTx.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = inputEditTxId.value;
      const tx = transactions.find(t => t.id === id);
      if (!tx) return;

      const amount = parseRupiahInput(inputEditTxAmount.value);
      if (amount <= 0) {
        showToast('Nominal tidak boleh nol ya!', 'error');
        return;
      }

      const selectedOpt = selectEditTxCategory.options[selectEditTxCategory.selectedIndex];
      tx.amount = amount;
      tx.category = selectEditTxCategory.value;
      tx.categoryLabel = selectedOpt ? selectedOpt.textContent : tx.categoryLabel;
      tx.notes = inputEditTxNotes.value.trim();
      tx.date = inputEditTxDate.value;

      saveData();
      populateMonthFilter();
      refreshAllUI();
      closeEditTxModal();
      showToast('Catatan berhasil diperbarui ✨', 'success');
    });

    // Budget Limit Modal Events
    btnOpenBudgetModal.addEventListener('click', openBudgetModal);
    btnCloseBudgetModal.addEventListener('click', closeBudgetModal);
    btnCancelBudget.addEventListener('click', closeBudgetModal);
    formBudget.addEventListener('submit', (e) => {
      e.preventDefault();
      const limit = parseRupiahInput(inputBudgetLimit.value);
      if (limit <= 0) {
        showToast('Batas anggaran harus lebih dari Rp 0', 'error');
        return;
      }
      monthlyBudgetLimit = limit;
      saveData();
      updateSummary();
      closeBudgetModal();
      showToast('Rem jajan bulanan disimpan! 🚨', 'success');
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
        showToast('Isi nama impian dan target nominal yang benar ya ✨', 'error');
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
      showToast('Target impian baru dibuat! 🎯', 'success');
    });

    // Deposit / Withdraw Modal Events
    btnCloseDepositModal.addEventListener('click', closeDepositModal);
    btnCancelDeposit.addEventListener('click', closeDepositModal);
    modeDepositBtn.addEventListener('click', () => setDepositMode('deposit'));
    modeWithdrawBtn.addEventListener('click', () => setDepositMode('withdraw'));

    formDeposit.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = inputDepositGoalId.value;
      const action = inputDepositAction.value;
      const amt = parseRupiahInput(inputDepositAmount.value);

      if (amt <= 0) {
        showToast('Masukkan nominal yang benar ya! 🪙', 'error');
        return;
      }

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      if (action === 'withdraw') {
        if (amt > goal.currentAmount) {
          showToast('Saldo celengan ini tidak cukup untuk ditarik', 'error');
          return;
        }
        goal.currentAmount -= amt;
        saveData();
        refreshAllUI();
        closeDepositModal();
        showToast(`Berhasil tarik ${formatRupiah(amt)} dari celengan`, 'info');
        return;
      }

      const wasReached = goal.currentAmount >= goal.targetAmount;
      goal.currentAmount = (goal.currentAmount || 0) + amt;
      const nowReached = goal.currentAmount >= goal.targetAmount;

      transactions.unshift({
        id: 'tx-' + Date.now(),
        type: 'savings',
        amount: amt,
        category: 'dream',
        categoryLabel: '🎯 Target: ' + goal.title,
        notes: `Nabung untuk ${goal.title} ${goal.emoji}`,
        date: todayISO,
        createdAt: Date.now()
      });

      saveData();
      populateMonthFilter();
      refreshAllUI();
      closeDepositModal();
      triggerCuteConfetti();

      if (!wasReached && nowReached) {
        showToast(`Selamat! Target "${goal.title}" sudah 100% tercapai! 🎉`, 'success');
      } else {
        showToast(`Yeay! Berhasil menabung ${formatRupiah(amt)} 🐷`, 'success');
      }
    });

    // Custom Confirm Modal Events
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
      chartTabSummary.className = 'px-3 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs text-pink-600 dark:text-pink-400 font-bold cursor-pointer';
      chartTabCategory.className = 'px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-pink-600 font-medium cursor-pointer';
      updateChart();
    });

    chartTabCategory.addEventListener('click', () => {
      activeChartTab = 'category';
      chartTabCategory.className = 'px-3 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs text-pink-600 dark:text-pink-400 font-bold cursor-pointer';
      chartTabSummary.className = 'px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-pink-600 font-medium cursor-pointer';
      updateChart();
    });

    // Export CSV
    btnExportCsv.addEventListener('click', exportToCSV);

    // Export JSON Backup
    btnExport.addEventListener('click', () => {
      const backupData = {
        appName: 'CuteCuan',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        monthlyBudgetLimit: monthlyBudgetLimit,
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
      showToast('File cadangan JSON berhasil diunduh 💾', 'success');
    });

    // Import JSON Restore
    btnImport.addEventListener('click', () => importFileInput.click());
    importFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.goals)) {
            showToast('Format file cadangan tidak valid!', 'error');
            return;
          }
          showConfirm(
            'Pulihkan Data?',
            `Ditemukan ${parsed.transactions.length} catatan & ${parsed.goals.length} target. Ganti data saat ini?`,
            () => {
              transactions = parsed.transactions;
              goals = parsed.goals;
              if (parsed.monthlyBudgetLimit) monthlyBudgetLimit = parsed.monthlyBudgetLimit;
              saveData();
              populateMonthFilter();
              refreshAllUI();
              showToast('Data berhasil dipulihkan! ✨', 'success');
            }
          );
        } catch (err) {
          showToast('Gagal membaca file JSON!', 'error');
        }
      };
      reader.readAsText(file);
      importFileInput.value = '';
    });

    // Reset All Data
    btnReset.addEventListener('click', () => {
      showConfirm(
        'Bersihkan Semua Data?',
        'Semua catatan keuangan & target celengan akan dihapus permanen! 🧹',
        () => {
          transactions = [];
          goals = [];
          saveData();
          populateMonthFilter();
          refreshAllUI();
          showToast('Semua data telah dibersihkan ✨', 'info');
        }
      );
    });
  }

  // --- Bootstrap App ---
  function initApp() {
    initTheme();
    loadData();
    populateMonthFilter();
    populateCategorySelect(selectTxCategory, 'expense');
    initEvents();
    refreshAllUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
