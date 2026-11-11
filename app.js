// CuteCuan - Application Logic with Cute Dark Mode & Confetti

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

  // Default demo data
  const DEFAULT_TRANSACTIONS = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 1500000,
      category: 'allowance',
      categoryLabel: '🧧 Uang Saku / Kiriman',
      notes: 'Uang bulanan tersayang 🥰',
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now() - 3600000 * 24
    },
    {
      id: 'tx-2',
      type: 'savings',
      amount: 300000,
      category: 'piggy',
      categoryLabel: '🐷 Masuk Celengan',
      notes: 'Sisihkan tabungan di awal bulan ✨',
      date: new Date().toISOString().split('T')[0],
      createdAt: Date.now() - 3600000 * 12
    },
    {
      id: 'tx-3',
      type: 'expense',
      amount: 45000,
      category: 'food',
      categoryLabel: '🍰 Makanan & Jajan',
      notes: 'Matcha latte + cheesecake manis 🍰',
      date: new Date().toISOString().split('T')[0],
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
  let currentFilter = 'all';
  let searchQuery = '';
  let activeChartTab = 'summary'; // 'summary' or 'category'
  let financeChartInstance = null;

  // --- DOM Elements ---
  const elCurrentDate = document.getElementById('currentDate');
  const elWalletBalance = document.getElementById('walletBalance');
  const elTotalIncome = document.getElementById('totalIncome');
  const elTotalExpense = document.getElementById('totalExpense');
  const elTotalSavings = document.getElementById('totalSavings');

  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');

  const formTx = document.getElementById('transactionForm');
  const inputTxType = document.getElementById('txType');
  const inputTxAmount = document.getElementById('txAmount');
  const selectTxCategory = document.getElementById('txCategory');
  const inputTxNotes = document.getElementById('txNotes');
  const inputTxDate = document.getElementById('txDate');
  const tabBtns = document.querySelectorAll('.tab-btn');

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

  const historyFilters = document.querySelectorAll('#historyFilters .filter-btn');
  const inputSearchTx = document.getElementById('searchTx');
  const transactionsList = document.getElementById('transactionsList');
  const emptyTxState = document.getElementById('emptyTxState');

  const chartTabSummary = document.getElementById('chartTabSummary');
  const chartTabCategory = document.getElementById('chartTabCategory');
  const chartCanvas = document.getElementById('financeChart');
  const chartEmptyMessage = document.getElementById('chartEmptyMessage');

  const btnExport = document.getElementById('btnExport');
  const btnReset = document.getElementById('btnReset');

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

  // --- Utility Functions ---
  function formatRupiah(num) {
    if (isNaN(num)) num = 0;
    return 'Rp ' + Number(num).toLocaleString('id-ID');
  }

  function parseRupiahInput(value) {
    const raw = value.replace(/[^0-9]/g, '');
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
        colors: ['#f472b6', '#38bdf8', '#fbcfe8', '#bae6fd', '#fcd34d']
      });
    }
  }

  // --- Local Storage Management ---
  function loadData() {
    try {
      const storedTx = localStorage.getItem('cutecuan_transactions');
      const storedGoals = localStorage.getItem('cutecuan_goals');

      transactions = storedTx ? JSON.parse(storedTx) : DEFAULT_TRANSACTIONS;
      goals = storedGoals ? JSON.parse(storedGoals) : DEFAULT_GOALS;
    } catch (e) {
      console.error('Error loading data from localStorage', e);
      transactions = DEFAULT_TRANSACTIONS;
      goals = DEFAULT_GOALS;
    }
  }

  function saveData() {
    try {
      localStorage.setItem('cutecuan_transactions', JSON.stringify(transactions));
      localStorage.setItem('cutecuan_goals', JSON.stringify(goals));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  // --- UI Update: Categories Select ---
  function updateCategoryDropdown(type) {
    const categories = CATEGORIES[type] || CATEGORIES.expense;
    selectTxCategory.innerHTML = '';
    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;
      option.textContent = cat.label;
      selectTxCategory.appendChild(option);
    });
  }

  // --- UI Update: Summary Cards ---
  function updateSummary() {
    let income = 0;
    let expense = 0;
    let savings = 0;

    transactions.forEach(t => {
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
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">${goal.emoji || '🎁'}</span>
            <div>
              <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                ${goal.title}
                ${isReached ? '<span class="text-[10px] bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded-md">Tercapai! 🎉</span>' : ''}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                ${formatRupiah(goal.currentAmount)} <span class="text-slate-400 dark:text-slate-500">/ ${formatRupiah(goal.targetAmount)}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1">
            <button class="btn-deposit-goal p-1.5 px-2 bg-pink-500 hover:bg-pink-600 active:scale-95 text-white rounded-xl text-[11px] font-bold shadow-xs transition-all flex items-center gap-1" data-id="${goal.id}">
              <i class="fa-solid fa-plus text-[10px]"></i> Nabung
            </button>
            <button class="btn-delete-goal p-1.5 text-slate-300 dark:text-slate-500 hover:text-rose-400 rounded-lg text-xs transition-colors" data-id="${goal.id}" title="Hapus target">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="w-full bg-slate-100 dark:bg-slate-700/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200/50 dark:border-slate-600/50">
          <div class="bg-gradient-to-r from-pink-400 to-sky-400 dark:from-pink-500 dark:to-sky-500 h-full rounded-full transition-all duration-500" style="width: ${percentage}%"></div>
        </div>
        <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 dark:text-slate-400 mt-1">
          <span>Progres</span>
          <span class="text-pink-500 dark:text-pink-400">${percentage}%</span>
        </div>
      `;
      goalsContainer.appendChild(card);
    });

    // Attach listeners
    goalsContainer.querySelectorAll('.btn-deposit-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openDepositModal(id);
      });
    });

    goalsContainer.querySelectorAll('.btn-delete-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Yakin ingin menghapus target impian ini? 🌸')) {
          goals = goals.filter(g => g.id !== id);
          saveData();
          renderGoals();
        }
      });
    });
  }

  // --- UI Update: Transactions List ---
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

    filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

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
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 dark:text-emerald-400 flex items-center justify-center text-sm"><i class="fa-solid fa-arrow-down"></i></span>';
        amountClass = 'text-emerald-600 dark:text-emerald-400';
        prefix = '+';
      } else if (tx.type === 'expense') {
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-950/60 text-pink-500 dark:text-pink-400 flex items-center justify-center text-sm"><i class="fa-solid fa-arrow-up"></i></span>';
        amountClass = 'text-pink-500 dark:text-pink-400';
        prefix = '-';
      } else {
        typeBadge = '<span class="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-500 dark:text-sky-400 flex items-center justify-center text-sm"><i class="fa-solid fa-piggy-bank"></i></span>';
        amountClass = 'text-sky-500 dark:text-sky-400';
        prefix = '🐖 ';
      }

      const dateFormatted = tx.date ? new Date(tx.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : 'Hari ini';

      item.innerHTML = `
        <div class="flex items-center gap-3">
          ${typeBadge}
          <div>
            <h4 class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">${tx.notes || tx.categoryLabel}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-400">${tx.categoryLabel || 'Lainnya'}</span>
              <span class="text-[10px] text-slate-300 dark:text-slate-600">•</span>
              <span class="text-[10px] font-medium text-slate-400 dark:text-slate-400">${dateFormatted}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <span class="text-xs sm:text-sm font-bold ${amountClass}">
            ${prefix}${formatRupiah(tx.amount)}
          </span>
          <button class="btn-delete-tx text-slate-300 dark:text-slate-500 hover:text-rose-400 p-1 rounded-lg opacity-60 sm:opacity-0 group-hover:opacity-100 transition-all" data-id="${tx.id}" title="Hapus transaksi">
            <i class="fa-regular fa-trash-can text-xs"></i>
          </button>
        </div>
      `;

      transactionsList.appendChild(item);
    });

    transactionsList.querySelectorAll('.btn-delete-tx').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        if (confirm('Hapus catatan ini ya? 💕')) {
          transactions = transactions.filter(t => t.id !== id);
          saveData();
          refreshAllUI();
        }
      });
    });
  }

  // --- UI Update: Chart.js Visuals with Dark Mode Support ---
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
    const legendColor = isDark ? '#f1f5f9' : '#334155';

    if (activeChartTab === 'summary') {
      let inc = 0, exp = 0, sav = 0;
      transactions.forEach(t => {
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
            borderColor: [
              '#10b981',
              '#ec4899',
              '#0284c7'
            ],
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
                label: function(context) {
                  return ' ' + formatRupiah(context.raw);
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: textColor,
                font: { family: 'Quicksand', size: 10 },
                callback: function(value) {
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
                label: function(context) {
                  return ' ' + context.label + ': ' + formatRupiah(context.raw);
                }
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
  function openDepositModal(goalId) {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    inputDepositGoalId.value = goal.id;
    inputDepositAmount.value = '';
    textDepositGoalTitle.textContent = `Setor ke: ${goal.emoji || '🎁'} ${goal.title}`;
    
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

  // --- Event Listeners Initialization ---
  function initEvents() {
    // Dark mode toggle listener
    if (btnThemeToggle) {
      btnThemeToggle.addEventListener('click', toggleTheme);
    }

    // Current date in header
    const now = new Date();
    elCurrentDate.textContent = now.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    inputTxDate.value = now.toISOString().split('T')[0];

    // Currency masks
    attachCurrencyMask(inputTxAmount);
    attachCurrencyMask(inputGoalTarget);
    attachCurrencyMask(inputDepositAmount);

    // Tab Type Buttons (Keluar, Masuk, Nabung)
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const type = btn.getAttribute('data-type');
        inputTxType.value = type;
        updateCategoryDropdown(type);
      });
    });

    // Form Submit: New Transaction
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
        alert('Masukkan nominal uang yang manis ya! (lebih dari 0) 🌸');
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
      refreshAllUI();
      triggerCuteConfetti();

      inputTxAmount.value = '';
      inputTxNotes.value = '';
    });

    // Goal Modal Events
    btnOpenGoalModal.addEventListener('click', openGoalModal);
    btnCloseGoalModal.addEventListener('click', closeGoalModal);
    btnCancelGoal.addEventListener('click', closeGoalModal);

    // Emoji Picker
    emojiBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        emojiBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        inputGoalEmoji.value = btn.getAttribute('data-emoji');
      });
    });

    // Submit New Goal
    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = inputGoalTitle.value.trim();
      const emoji = inputGoalEmoji.value || '🎁';
      const targetAmount = parseRupiahInput(inputGoalTarget.value);

      if (!title || targetAmount <= 0) {
        alert('Mohon isi nama impian dan target nominal yang benar ya! ✨');
        return;
      }

      const newGoal = {
        id: 'goal-' + Date.now(),
        title: title,
        emoji: emoji,
        targetAmount: targetAmount,
        currentAmount: 0,
        createdAt: Date.now()
      };

      goals.push(newGoal);
      saveData();
      renderGoals();
      closeGoalModal();
      triggerCuteConfetti();
    });

    // Deposit Modal Events
    btnCloseDepositModal.addEventListener('click', closeDepositModal);
    btnCancelDeposit.addEventListener('click', closeDepositModal);

    formDeposit.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = inputDepositGoalId.value;
      const depositAmt = parseRupiahInput(inputDepositAmount.value);

      if (depositAmt <= 0) {
        alert('Masukkan nominal setoran tabungan yang manis ya! 🪙');
        return;
      }

      const goal = goals.find(g => g.id === goalId);
      if (!goal) return;

      goal.currentAmount = (goal.currentAmount || 0) + depositAmt;

      transactions.unshift({
        id: 'tx-' + Date.now(),
        type: 'savings',
        amount: depositAmt,
        category: 'dream',
        categoryLabel: '🎯 Target: ' + goal.title,
        notes: `Nabung untuk ${goal.title} ${goal.emoji}`,
        date: new Date().toISOString().split('T')[0],
        createdAt: Date.now()
      });

      saveData();
      refreshAllUI();
      closeDepositModal();
      triggerCuteConfetti();
    });

    // Filter Buttons in History
    historyFilters.forEach(btn => {
      btn.addEventListener('click', () => {
        historyFilters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTransactions();
      });
    });

    // Search Input
    inputSearchTx.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderTransactions();
    });

    // Chart Tabs Toggle
    chartTabSummary.addEventListener('click', () => {
      activeChartTab = 'summary';
      chartTabSummary.className = 'px-3 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs text-pink-600 dark:text-pink-400 font-bold';
      chartTabCategory.className = 'px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-pink-600 font-medium';
      updateChart();
    });

    chartTabCategory.addEventListener('click', () => {
      activeChartTab = 'category';
      chartTabCategory.className = 'px-3 py-1 rounded-lg bg-white dark:bg-slate-800 shadow-xs text-pink-600 dark:text-pink-400 font-bold';
      chartTabSummary.className = 'px-3 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-pink-600 font-medium';
      updateChart();
    });

    // Export Backup JSON
    btnExport.addEventListener('click', () => {
      const backupData = {
        appName: 'CuteCuan',
        version: '1.1',
        exportedAt: new Date().toISOString(),
        transactions: transactions,
        goals: goals
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `cutecuan-backup-${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Reset All Data
    btnReset.addEventListener('click', () => {
      const confirmReset = confirm('Hapus semua catatan dan tabungan? Data akan kembali kosong seperti baru! 🧹');
      if (confirmReset) {
        transactions = [];
        goals = [];
        saveData();
        refreshAllUI();
        alert('Semua data berhasil dibersihkan! Mulai lembaran baru yang ceria~ ✨');
      }
    });
  }

  // --- Bootstrap App ---
  function initApp() {
    initTheme();
    loadData();
    updateCategoryDropdown('expense');
    initEvents();
    refreshAllUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
