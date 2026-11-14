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

  // Data demo bawaan awal yang simpel & realistis
  const DEFAULT_TRANSACTIONS = [
    {
      id: 'tx-1',
      type: 'income',
      amount: 100000,
      category: 'allowance',
      categoryLabel: '🧧 Uang Saku / Kiriman',
      notes: 'Uang jajan & tabungan 🥰',
      date: todayISO,
      createdAt: Date.now() - 3600000 * 24
    }
  ];

  const DEFAULT_GOALS = [
    {
      id: 'goal-1',
      title: 'Beli Sepatu Sneakers 👟',
      emoji: '👟',
      targetAmount: 300000,
      currentAmount: 0,
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
  const inputGoalInitial = document.getElementById('goalInitialAmount');
  const emojiBtns = document.querySelectorAll('.emoji-btn');
  const presetChips = document.querySelectorAll('.preset-chip');

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
  const btnInstallApp = document.getElementById('btnInstallApp');

  // Mascot Elements
  const mascotBox = document.getElementById('mascotBox');
  const mascotAvatar = document.getElementById('mascotAvatar');
  const mascotSpeech = document.getElementById('mascotSpeech');
  const mascotName = document.getElementById('mascotName');

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
  function getFinancialTotals() {
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

    const currentSavings = income - expense;
    return { income, expense, currentSavings };
  }

  // --- Estimasi Kecepatan Tabungan per Hari ---
  function calculateDailySavingsRate() {
    if (!transactions || transactions.length === 0) return 20000;
    
    let totalInc = 0;
    const timestamps = [];
    transactions.forEach(t => {
      if (t.type === 'income') totalInc += (Number(t.amount) || 0);
      if (t.date) {
        const time = new Date(t.date).getTime();
        if (!isNaN(time)) timestamps.push(time);
      }
    });

    if (totalInc <= 0) return 20000;

    if (timestamps.length < 2) {
      return Math.max(10000, Math.round(totalInc / 7));
    }

    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);
    const daySpan = Math.max(1, Math.round((maxTime - minTime) / (1000 * 60 * 60 * 24)) + 1);
    const dailyAvg = Math.round(totalInc / daySpan);

    return Math.max(10000, dailyAvg);
  }

  // --- Maskot Interaktif Quotes & Emosi ---
  const MASCOT_QUOTES = {
    happy: [
      "Semangat ya! Setiap rupiah yang kamu sisihkan bikin impianmu makin dekat~ ✨",
      "Keren banget! Tabunganmu sehat, pertahankan gaya hidup hematmu ya! 🌸",
      "Sedikit demi sedikit, lama-lama celengan kita jadi bukit berlian! 💎",
      "Aku bangga banget kamu rajin mencatat uang masuk & keluar! 🐾",
      "Nabung itu keren, jajan secukupnya biar masa depan cerah ceria! 🧋"
    ],
    worried: [
      "Waduh, pengeluaran lagi kencang nih. Yuk rem jajan boba & kopi dulu! 🥺",
      "Jangan sedih ya, besok kita mulai nabung lagi pelan-pelan! 💪",
      "Coba lirik barang impianmu di bawah, yuk kumpulin lagi uangnya! 🌸"
    ],
    celebrate: [
      "WAAAH! Target impianmu sudah cukup uangnya! Waktunya checkout! 🥳🎉",
      "YEY! Selamat ya! Usaha nabungmu terbayar tuntas! Kamu juara! 👑✨"
    ]
  };

  let mascotQuoteIndex = 0;
  let currentMascotMood = 'happy';

  function updateMascotReaction() {
    if (!mascotBox || !mascotAvatar || !mascotSpeech) return;
    const { income, expense, currentSavings } = getFinancialTotals();
    const hasReachedGoal = goals.some(g => g.targetAmount > 0 && (g.currentAmount || 0) >= g.targetAmount);

    if (hasReachedGoal) {
      currentMascotMood = 'celebrate';
      mascotAvatar.textContent = '🥳';
    } else if (currentSavings < 0 || (expense > income && expense > 0)) {
      currentMascotMood = 'worried';
      mascotAvatar.textContent = '🥺';
    } else {
      currentMascotMood = 'happy';
      mascotAvatar.textContent = '🐱';
    }

    const quotes = MASCOT_QUOTES[currentMascotMood] || MASCOT_QUOTES.happy;
    mascotSpeech.textContent = `"${quotes[mascotQuoteIndex % quotes.length]}"`;
  }

  function updateSummary() {
    const { income, expense, currentSavings } = getFinancialTotals();

    elTotalIncome.textContent = formatRupiah(income);
    elTotalExpense.textContent = formatRupiah(expense);
    elTotalSavings.textContent = formatRupiah(currentSavings);

    // Status pesan tabungan
    if (currentSavings > 0) {
      savingsStatusText.textContent = 'Tabungan Sehat 🌸';
    } else if (currentSavings === 0) {
      savingsStatusText.textContent = 'Yuk Catat Pemasukan! ✨';
    } else {
      savingsStatusText.textContent = 'Tabungan Minus 🥺';
    }
  }

  // --- Target Celengan Impian (Otomatis Terisi dari Tabungan) ---
  function renderGoals() {
    goalsContainer.innerHTML = '';
    if (goals.length === 0) {
      goalsContainer.innerHTML = `
        <div class="p-4 rounded-2xl bg-pink-50/40 dark:bg-slate-900 border-2 border-dashed border-pink-200 dark:border-slate-700 text-center">
          <p class="text-xs text-slate-600 dark:text-slate-400 font-bold">Belum ada target impian.</p>
          <p class="text-[11px] text-[#e11d48] font-extrabold mt-0.5">Klik "+ Tambah" di atas untuk mencatat barang yang mau kamu beli!</p>
        </div>
      `;
      return;
    }

    const { currentSavings } = getFinancialTotals();
    let availableSavings = Math.max(0, currentSavings);
    const dailyRate = calculateDailySavingsRate();

    goals.forEach((goal, idx) => {
      // Tabungan yang kamu miliki otomatis mengisi target ini
      const allocated = Math.min(goal.targetAmount, availableSavings);
      availableSavings = Math.max(0, availableSavings - allocated);
      goal.currentAmount = allocated;

      const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
      const percentage = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) || 0;
      const isReached = goal.currentAmount >= goal.targetAmount;

      if (isReached && !goal._celebrated) {
        goal._celebrated = true;
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      }

      const card = document.createElement('div');
      card.className = 'p-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-pink-200 dark:border-slate-700 shadow-xs transition-all';
      card.innerHTML = `
        <!-- Baris Atas: Ikon, Nama Barang, Harga & Tombol Aksi -->
        <div class="flex items-center justify-between gap-2 mb-2">
          <div class="flex items-center gap-2.5 min-w-0">
            <span class="text-2xl p-2 rounded-xl bg-pink-100 text-[#e11d48] dark:bg-slate-800 shrink-0 select-none">${escapeHtml(goal.emoji || '🎁')}</span>
            <div class="min-w-0">
              <h4 class="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate flex items-center gap-1.5">
                <span>${escapeHtml(goal.title)}</span>
                ${isReached ? '<span class="text-[9px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-md shrink-0">Tercapai! 🎉</span>' : ''}
                ${idx === 0 && goals.length > 1 ? '<span class="text-[9px] bg-sky-100 text-[#0284c7] font-bold px-1.5 py-0.5 rounded-md shrink-0">Prioritas 1 🌟</span>' : ''}
              </h4>
              <p class="text-[11px] text-slate-500 font-semibold mt-0.5">
                Target Harga: <span class="font-extrabold text-[#e11d48] dark:text-pink-300">${formatRupiah(goal.targetAmount)}</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            <button class="btn-deposit-goal px-3 py-1.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer shadow-xs" data-id="${escapeHtml(goal.id)}" data-title="${escapeHtml(goal.title)}" title="Isi tabungan untuk barang ini">
              + Isi Tabungan
            </button>
            <button class="btn-delete-goal p-1 text-slate-300 hover:text-rose-500 rounded-lg text-xs transition-colors cursor-pointer" data-id="${escapeHtml(goal.id)}" title="Hapus target">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>

        <!-- Progress Bar Solid Warna Pink Jelas -->
        <div class="w-full bg-pink-100 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden p-0.5 border border-pink-200 dark:border-slate-600">
          <div class="bg-[#ff6b95] h-full rounded-full transition-all duration-300" style="width: ${percentage}%"></div>
        </div>

        <!-- Baris Bawah: Terkumpul & SISA BERAPA LAGI (Solid & High Contrast) -->
        <div class="flex items-center justify-between text-xs font-bold mt-2.5 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex-wrap gap-1">
          <span class="text-slate-600 dark:text-slate-400">
            Terkumpul: <b class="text-[#0284c7] dark:text-sky-300 font-extrabold">${formatRupiah(goal.currentAmount)}</b> (${percentage}%)
          </span>
          ${remaining > 0 
            ? `<span class="px-2.5 py-1 rounded-xl bg-[#ffe4ec] dark:bg-pink-950 text-[#be123c] dark:text-pink-200 font-extrabold text-[11px] border border-pink-300">
                Kurang <b class="font-black text-[#e11d48]">${formatRupiah(remaining)}</b> lagi! ⏳
               </span>`
            : `<span class="px-2.5 py-1 rounded-xl bg-sky-100 dark:bg-sky-950 text-[#0284c7] dark:text-sky-300 font-extrabold text-[11px] border border-sky-300">
                Uang Sudah Cukup! Siap Dibeli ✨
               </span>`
          }
        </div>

        <!-- ESTIMASI WAKTU TERCAPAI (Target Countdown) -->
        ${isReached ? `
          <div class="mt-2.5 flex items-center justify-between text-[11px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-circle-check"></i> Siap Dibeli!
            </span>
            <span>Uang Sudah Lengkap 🛍️</span>
          </div>
        ` : `
          <div class="mt-2.5 flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-sky-50 dark:bg-slate-800/80 px-3 py-1.5 rounded-xl border border-sky-100 dark:border-slate-700">
            <span class="flex items-center gap-1.5 text-[#0284c7] dark:text-sky-300 font-extrabold">
              <i class="fa-solid fa-hourglass-half text-xs"></i> Estimasi Tercapai:
            </span>
            <span class="font-black text-[#0369a1] dark:text-sky-200">
              ± ${Math.ceil(remaining / dailyRate)} Hari Lagi <span class="font-normal text-[10px] text-slate-400 dark:text-slate-500">(nabung ${formatRupiah(dailyRate)}/hari)</span>
            </span>
          </div>
        `}
      `;
      goalsContainer.appendChild(card);
    });

    goalsContainer.querySelectorAll('.btn-deposit-goal').forEach(btn => {
      btn.addEventListener('click', () => {
        const title = btn.getAttribute('data-title');
        // Arahkan langsung ke form pemasukan agar uang masuk otomatis mengisi target!
        tabIncome.click();
        inputTxNotes.value = 'Tabungan untuk ' + title;
        inputTxAmount.focus();
        showToast('Masukkan nominal pemasukan untuk ' + title + ' 🌸', 'info');
      });
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
      item.className = 'p-3 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs transition-all';

      const isIncome = tx.type === 'income';
      const badgeIcon = isIncome
        ? '<span class="w-8 h-8 rounded-xl bg-[#e0f2fe] text-[#0284c7] border border-[#bae6fd] flex items-center justify-center text-xs font-black shrink-0"><i class="fa-solid fa-arrow-down"></i></span>'
        : '<span class="w-8 h-8 rounded-xl bg-[#ffe4ec] text-[#e11d48] border border-[#fecddc] flex items-center justify-center text-xs font-black shrink-0"><i class="fa-solid fa-arrow-up"></i></span>';

      const amountText = (isIncome ? '+ ' : '- ') + formatRupiah(tx.amount);
      const amountClass = isIncome ? 'text-[#0284c7] font-black' : 'text-[#e11d48] font-black';

      const dateFormatted = tx.date
        ? new Date(tx.date + 'T00:00:00').toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
        : 'Hari ini';

      item.innerHTML = `
        <div class="flex items-center gap-3 min-w-0">
          ${badgeIcon}
          <div class="min-w-0">
            <h4 class="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">${escapeHtml(tx.notes || tx.categoryLabel)}</h4>
            <div class="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mt-0.5">
              <span class="truncate">${escapeHtml(tx.categoryLabel || 'Lainnya')}</span>
              <span>•</span>
              <span class="shrink-0 text-slate-400">${escapeHtml(dateFormatted)}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span class="text-xs sm:text-sm ${amountClass}">
            ${amountText}
          </span>
          <button class="btn-edit-tx text-slate-400 hover:text-[#0284c7] p-1.5 rounded-lg hover:bg-sky-50 transition-colors cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Ubah">
            <i class="fa-regular fa-pen-to-square text-xs"></i>
          </button>
          <button class="btn-delete-tx text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer" data-id="${escapeHtml(tx.id)}" title="Hapus">
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
    updateMascotReaction();
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
    if (inputGoalInitial) inputGoalInitial.value = '';
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
    if (inputGoalInitial) attachCurrencyMask(inputGoalInitial);
    attachCurrencyMask(inputDepositAmount);
    attachCurrencyMask(inputEditTxAmount);

    const submitBtn = document.getElementById('submitBtn');

    // Toggle: Pemasukan vs Pengeluaran
    tabIncome.addEventListener('click', () => {
      tabIncome.classList.add('active');
      tabExpense.classList.remove('active');
      inputTxType.value = 'income';
      populateCategorySelect(selectTxCategory, 'income');
      if (submitBtn) {
        submitBtn.className = 'w-full py-3 px-4 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-sky-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer';
        submitBtn.innerHTML = '<i class="fa-solid fa-plus"></i><span>Simpan Pemasukan</span>';
      }
    });

    tabExpense.addEventListener('click', () => {
      tabExpense.classList.add('active');
      tabIncome.classList.remove('active');
      inputTxType.value = 'expense';
      populateCategorySelect(selectTxCategory, 'expense');
      if (submitBtn) {
        submitBtn.className = 'w-full py-3 px-4 rounded-xl bg-[#ff6b95] hover:bg-[#e11d48] text-white font-extrabold text-xs tracking-wider uppercase shadow-md shadow-pink-200 dark:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer';
        submitBtn.innerHTML = '<i class="fa-solid fa-minus"></i><span>Simpan Pengeluaran</span>';
      }
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
        if (goals.length > 0) {
          const topGoal = goals[0];
          const remaining = Math.max(0, topGoal.targetAmount - topGoal.currentAmount);
          if (remaining > 0) {
            showToast(`Pemasukan +${formatRupiah(amount)}! Sisa target ${topGoal.title} berkurang (sisa ${formatRupiah(remaining)} lagi) 🎯✨`, 'success');
          } else {
            showToast(`Tabungan bertambah +${formatRupiah(amount)}! Target ${topGoal.title} sudah tercapai 🎉`, 'success');
          }
        } else {
          showToast(`Tabungan bertambah +${formatRupiah(amount)}! 💵✨`, 'success');
        }
      } else {
        showToast(`Pengeluaran dicatat -${formatRupiah(amount)} (memotong tabungan) 📝`, 'info');
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

    presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        inputGoalTitle.value = chip.getAttribute('data-name');
        const em = chip.getAttribute('data-emoji');
        inputGoalEmoji.value = em;
        emojiBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-emoji') === em));
      });
    });

    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = inputGoalTitle.value.trim();
      const emoji = inputGoalEmoji.value || '🎁';
      const targetAmount = parseRupiahInput(inputGoalTarget.value);
      const initialAmt = inputGoalInitial ? (parseRupiahInput(inputGoalInitial.value) || 0) : 0;

      if (!title || targetAmount <= 0) {
        showToast('Isi nama barang dan target nominal yang benar ✨', 'error');
        return;
      }

      goals.push({
        id: 'goal-' + Date.now(),
        title: title,
        emoji: emoji,
        targetAmount: targetAmount,
        currentAmount: Math.min(targetAmount, initialAmt),
        createdAt: Date.now()
      });

      saveData();
      renderGoals();
      closeGoalModal();
      triggerCuteConfetti();
      showToast('Target barang impian berhasil dibuat! 🎯', 'success');
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

    // Mascot Click Interaction
    if (mascotBox) {
      mascotBox.addEventListener('click', () => {
        mascotQuoteIndex++;
        updateMascotReaction();

        if (mascotAvatar) {
          mascotAvatar.classList.remove('animate-bounce-soft');
          mascotAvatar.style.transform = 'scale(1.3) rotate(12deg)';
          setTimeout(() => {
            mascotAvatar.style.transform = '';
            mascotAvatar.classList.add('animate-bounce-soft');
          }, 300);
        }

        if (typeof confetti === 'function') {
          confetti({
            particleCount: 15,
            spread: 40,
            origin: { y: 0.3 }
          });
        }
      });
    }

    // PWA Service Worker & Install Prompt
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(() => {});
      });
    }

    let deferredPrompt = null;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (btnInstallApp) {
        btnInstallApp.classList.remove('hidden');
        btnInstallApp.classList.add('flex');
      }
    });

    if (btnInstallApp) {
      // Selalu tampilkan tombol install di header agar user tahu bisa dipasang ke HP
      btnInstallApp.classList.remove('hidden');
      btnInstallApp.classList.add('flex');

      btnInstallApp.addEventListener('click', async () => {
        if (deferredPrompt) {
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          if (outcome === 'accepted') {
            showToast('CuteCuan berhasil dipasang ke HP! 🌸', 'success');
          }
          deferredPrompt = null;
        } else {
          showConfirm(
            '📱 Pasang CuteCuan ke HP',
            'Kamu bisa pasang CuteCuan langsung ke layar utama HP:\n\n• Android Chrome: Klik Titik Tiga (⋮) di atas > Tambahkan ke Layar Utama\n• iPhone Safari: Klik tombol Share (⬆️) di bawah > Add to Home Screen',
            () => {}
          );
        }
      });
    }

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
