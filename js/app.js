// Main Application Orchestrator for MysticDeck
// Universal Execution Script (Compatible with file:// double click & http://)

let currentUser = null;
let currentDrawnCard = null;
let selectedMood = { emoji: "🌿", label: "Reflective", value: 4 };
let generatedCustomerCode = null;
let selectedReadingPackage = "3 Cards (Rp 10.000)";
let vantaEffect = null;

// DOM ELEMENTS
let btnDrawCard, pullStatusText, cardDisplayArea, tarotCardInner, cardImage, cardTitle, cardSummary, orientationBadge;
let reflectCareer, reflectRelationship, reflectWellbeing;
let journalFormSection, journalInput, btnSaveJournal, journalSaveStatus;
let btnPrivateReadingCTA, waModal, displayCustomerCode, btnCopyCode, btnCloseWAModal, btnConfirmWA;
let btnOpenHistory, historyModal, btnCloseHistory, historyListContainer;
let btnOpenAuth, authBtnText, authModal, btnCloseAuth, btnGoogleAuth, authForm, authEmail, authPassword, authErrorMsg;

document.addEventListener("DOMContentLoaded", () => {
  initVantaBackground();
  initDOMReferences();
  initAuthObserver();
  initEventListeners();
  setupMoodPicker();
  setupPackageSelectors();
});

// INITIALIZE ANIMATED VANTA.FOG BACKGROUND
function initVantaBackground() {
  if (typeof window.VANTA !== "undefined" && typeof window.VANTA.FOG !== "undefined") {
    try {
      vantaEffect = window.VANTA.FOG({
        el: "#vanta-bg",
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        highlightColor: 0x543a7e,
        midtoneColor: 0x25291c,
        lowlightColor: 0xffe099,
        baseColor: 0x25291c,
        speed: 1.20,
        zoom: 0.90
      });
    } catch (e) {
      console.warn("Vanta.js background initialization error:", e);
    }
  }
}

function initDOMReferences() {
  btnDrawCard = document.getElementById("btnDrawCard");
  pullStatusText = document.getElementById("pullStatusText");
  cardDisplayArea = document.getElementById("cardDisplayArea");
  tarotCardInner = document.getElementById("tarotCardInner");
  cardImage = document.getElementById("cardImage");
  cardTitle = document.getElementById("cardTitle");
  cardSummary = document.getElementById("cardSummary");
  orientationBadge = document.getElementById("orientationBadge");

  reflectCareer = document.getElementById("reflectCareer");
  reflectRelationship = document.getElementById("reflectRelationship");
  reflectWellbeing = document.getElementById("reflectWellbeing");

  journalFormSection = document.getElementById("journalFormSection");
  journalInput = document.getElementById("journalInput");
  btnSaveJournal = document.getElementById("btnSaveJournal");
  journalSaveStatus = document.getElementById("journalSaveStatus");

  btnPrivateReadingCTA = document.getElementById("btnPrivateReadingCTA");
  waModal = document.getElementById("waModal");
  displayCustomerCode = document.getElementById("displayCustomerCode");
  btnCopyCode = document.getElementById("btnCopyCode");
  btnCloseWAModal = document.getElementById("btnCloseWAModal");
  btnConfirmWA = document.getElementById("btnConfirmWA");

  btnOpenHistory = document.getElementById("btnOpenHistory");
  historyModal = document.getElementById("historyModal");
  btnCloseHistory = document.getElementById("btnCloseHistory");
  historyListContainer = document.getElementById("historyListContainer");

  btnOpenAuth = document.getElementById("btnOpenAuth");
  authBtnText = document.getElementById("authBtnText");
  authModal = document.getElementById("authModal");
  btnCloseAuth = document.getElementById("btnCloseAuth");
  btnGoogleAuth = document.getElementById("btnGoogleAuth");
  authForm = document.getElementById("authForm");
  authEmail = document.getElementById("authEmail");
  authPassword = document.getElementById("authPassword");
  authErrorMsg = document.getElementById("authErrorMsg");
}

function initAuthObserver() {
  if (window.ArcanaFirebase && window.ArcanaFirebase.auth) {
    window.ArcanaFirebase.auth.onAuthStateChanged((user) => {
      if (user) {
        currentUser = user;
        if (authBtnText) authBtnText.textContent = user.displayName || user.email.split("@")[0];
      } else {
        currentUser = null;
        if (authBtnText) authBtnText.textContent = "Login / Sign In";
      }
    });
  }
}

function initEventListeners() {
  if (btnDrawCard) btnDrawCard.addEventListener("click", handleDrawCard);
  if (btnSaveJournal) btnSaveJournal.addEventListener("click", handleSaveJournal);

  if (btnPrivateReadingCTA) btnPrivateReadingCTA.addEventListener("click", openWhatsAppModal);
  if (btnCloseWAModal) btnCloseWAModal.addEventListener("click", () => waModal.classList.add("hidden"));
  if (btnConfirmWA) btnConfirmWA.addEventListener("click", executeWARedirect);
  if (btnCopyCode) btnCopyCode.addEventListener("click", copyCustomerCodeToClipboard);

  if (btnOpenHistory) btnOpenHistory.addEventListener("click", openHistoryDrawer);
  if (btnCloseHistory) btnCloseHistory.addEventListener("click", () => historyModal.classList.add("hidden"));

  if (btnOpenAuth) {
    btnOpenAuth.addEventListener("click", () => {
      if (currentUser && window.ArcanaFirebase && window.ArcanaFirebase.auth) {
        if (confirm(`Logout from account ${currentUser.email}?`)) {
          window.ArcanaFirebase.auth.signOut();
        }
      } else {
        if (authModal) authModal.classList.remove("hidden");
      }
    });
  }
  if (btnCloseAuth) btnCloseAuth.addEventListener("click", () => authModal.classList.add("hidden"));

  if (btnGoogleAuth) btnGoogleAuth.addEventListener("click", handleGoogleAuth);
  if (authForm) authForm.addEventListener("submit", handleEmailAuth);
}

async function handleDrawCard() {
  if (!window.ArcanaTarotApi) return;
  btnDrawCard.disabled = true;
  btnDrawCard.classList.add("opacity-60", "cursor-not-allowed");
  btnDrawCard.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Drawing Your Card...</span>`;

  try {
    const result = await window.ArcanaTarotApi.fetchDailyTarotCard();
    if (result && result.card) {
      currentDrawnCard = result.card;
      renderDrawnCard(result.card);
    }
  } catch (err) {
    alert("Error drawing card: " + err.message);
  } finally {
    btnDrawCard.disabled = false;
    btnDrawCard.classList.remove("opacity-60", "cursor-not-allowed");
    btnDrawCard.innerHTML = `<i class="fa-solid fa-rotate"></i> <span>Redraw Daily Card</span>`;
  }
}

function renderDrawnCard(card) {
  cardDisplayArea.classList.remove("hidden");
  journalFormSection.classList.remove("hidden");

  tarotCardInner.classList.remove("flipped");

  if (cardImage) {
    cardImage.onerror = function() {
      this.onerror = null;
      if (card.svgFallback) {
        this.src = card.svgFallback;
      } else if (window.ArcanaTarotApi && window.ArcanaTarotApi.generateTarotCardSVG) {
        this.src = window.ArcanaTarotApi.generateTarotCardSVG(card.name, card.isReversed);
      }
    };
    cardImage.src = card.image;
    if (card.isReversed) {
      cardImage.classList.add("reversed");
    } else {
      cardImage.classList.remove("reversed");
    }
  }

  if (card.isReversed) {
    orientationBadge.className = "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#543A7E] text-[#FFE099] border border-[#C8ADC0]/40";
    orientationBadge.innerHTML = `<i class="fa-solid fa-rotate-left mr-1.5"></i> ${card.orientationLabel}`;
  } else {
    orientationBadge.className = "inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide bg-[#25291C] text-[#FFE099] border border-[#FFE099]/40";
    orientationBadge.innerHTML = `<i class="fa-solid fa-sun mr-1.5"></i> ${card.orientationLabel}`;
  }

  cardTitle.textContent = card.name;
  cardSummary.textContent = `"${card.summary}"`;

  reflectCareer.textContent = card.reflection.career;
  reflectRelationship.textContent = card.reflection.relationship;
  reflectWellbeing.textContent = card.reflection.wellbeing;

  setTimeout(() => {
    tarotCardInner.classList.add("flipped");
  }, 300);

  // Smooth scroll to cardDisplayArea
  cardDisplayArea.scrollIntoView({ behavior: "smooth", block: "start" });
}

function setupMoodPicker() {
  const options = document.querySelectorAll(".mood-option");
  options.forEach((btn, index) => {
    if (index === 1) btn.classList.add("selected");

    btn.addEventListener("click", () => {
      options.forEach(o => o.classList.remove("selected"));
      btn.classList.add("selected");
      selectedMood = {
        emoji: btn.dataset.emoji,
        label: btn.dataset.mood,
        value: index + 1
      };
    });
  });
}

function setupPackageSelectors() {
  const pkgCards = document.querySelectorAll(".pricelist-card");
  pkgCards.forEach((card) => {
    card.addEventListener("click", () => {
      pkgCards.forEach(c => c.classList.remove("border-[#FFE099]", "bg-[#543A7E]/90", "ring-2", "ring-[#FFE099]"));
      card.classList.add("border-[#FFE099]", "bg-[#543A7E]/90", "ring-2", "ring-[#FFE099]");
      selectedReadingPackage = card.dataset.pkg || "3 Cards (Rp 10.000)";
    });
  });
}

async function handleSaveJournal() {
  if (!currentDrawnCard) {
    alert("Please draw your daily Tarot card first.");
    return;
  }

  const text = journalInput.value.trim();
  if (!text) {
    alert("Please write a few reflection sentences before saving.");
    return;
  }

  btnSaveJournal.disabled = true;
  btnSaveJournal.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`;

  try {
    const res = await window.ArcanaJournal.saveJournalEntry(currentUser, {
      card: currentDrawnCard,
      mood: selectedMood,
      journalText: text,
      customerCode: generatedCustomerCode
    });

    if (res.success) {
      journalSaveStatus.textContent = `✅ Reflection saved (${res.storage})`;
      journalSaveStatus.classList.add("text-[#FFE099]");
      setTimeout(() => { journalSaveStatus.textContent = ""; }, 4000);
    }
  } catch (err) {
    alert("Failed to save journal entry: " + err.message);
  } finally {
    btnSaveJournal.disabled = false;
    btnSaveJournal.innerHTML = `<i class="fa-solid fa-floppy-disk"></i> <span>Save Daily Reflection</span>`;
  }
}

function openWhatsAppModal() {
  if (!window.ArcanaWhatsApp) return;
  generatedCustomerCode = window.ArcanaWhatsApp.generateCustomerCode();
  displayCustomerCode.textContent = generatedCustomerCode;
  
  const pkgDisplay = document.getElementById("displaySelectedPackage");
  if (pkgDisplay) {
    pkgDisplay.textContent = selectedReadingPackage;
  }

  waModal.classList.remove("hidden");
}

function executeWARedirect() {
  if (!window.ArcanaWhatsApp) return;
  const cardName = currentDrawnCard ? currentDrawnCard.name : "";
  const url = window.ArcanaWhatsApp.buildWhatsAppUrl(generatedCustomerCode, selectedReadingPackage, cardName, "6281288467698");
  window.open(url, "_blank", "noopener,noreferrer");
  waModal.classList.add("hidden");
}

function copyCustomerCodeToClipboard() {
  if (generatedCustomerCode) {
    navigator.clipboard.writeText(generatedCustomerCode);
    btnCopyCode.innerHTML = `<i class="fa-solid fa-check text-[#FFE099]"></i> Copied!`;
    setTimeout(() => {
      btnCopyCode.innerHTML = `<i class="fa-regular fa-copy mr-1"></i> Copy Code`;
    }, 2000);
  }
}

async function openHistoryDrawer() {
  if (!window.ArcanaJournal) return;
  historyModal.classList.remove("hidden");
  historyListContainer.innerHTML = `<div class="text-center py-8 text-[#C8ADC0]"><i class="fa-solid fa-spinner fa-spin text-2xl mb-2"></i><p class="text-xs">Loading reflection history...</p></div>`;

  const journals = await window.ArcanaJournal.getUserJournals(currentUser);
  
  if (!journals || journals.length === 0) {
    historyListContainer.innerHTML = `
      <div class="text-center py-12 space-y-3">
        <i class="fa-solid fa-book-open text-3xl text-[#C8ADC0]/50"></i>
        <p class="text-sm text-[#C8ADC0]">No journal reflections found yet.</p>
        <p class="text-xs text-[#C8ADC0]/70">Draw your daily card and record your reflection above.</p>
      </div>`;
    return;
  }

  historyListContainer.innerHTML = journals.map(item => `
    <div class="p-4 rounded-2xl bg-[#25291C]/80 border border-[#C8ADC0]/30 space-y-3">
      <div class="flex items-center justify-between border-b border-[#C8ADC0]/20 pb-2">
        <span class="text-[11px] font-mono text-[#FFE099]">${item.date || (item.createdAt ? item.createdAt.split('T')[0] : '')}</span>
        <span class="px-2 py-0.5 rounded-full text-[10px] bg-[#543A7E] text-[#FFE099] font-medium border border-[#C8ADC0]/30">
          ${item.mood ? item.mood.emoji + ' ' + item.mood.label : '🌿 Reflective'}
        </span>
      </div>

      <div class="flex items-start space-x-3">
        <img src="${item.card.image}" onerror="this.onerror=null; if(window.ArcanaTarotApi) this.src=window.ArcanaTarotApi.generateTarotCardSVG('${item.card.name.replace(/'/g, "\\'")}', ${item.card.isReversed || item.card.orientation === 'reversed'});" class="w-12 h-20 object-cover rounded-lg border border-[#FFE099]/30 shrink-0 ${item.card.orientation === 'reversed' ? 'rotate-180' : ''}">
        <div class="space-y-1 flex-grow">
          <h4 class="text-sm font-bold text-[#FFE099]">${item.card.name}</h4>
          <span class="text-[10px] text-[#C8ADC0] block">${item.card.orientationLabel || item.card.orientation}</span>
          <p class="text-xs text-[#C8ADC0] line-clamp-3 italic font-light">"${item.journalText}"</p>
        </div>
      </div>
    </div>
  `).join("");
}

async function handleGoogleAuth() {
  if (!window.ArcanaFirebase || !window.ArcanaFirebase.auth) {
    showAuthError("⚠️ Firebase belum terhubung! Masukkan kredensial Firebase di js/config/firebase.js.");
    return;
  }
  try {
    await window.ArcanaFirebase.auth.signInWithPopup(window.ArcanaFirebase.googleProvider);
    authModal.classList.add("hidden");
  } catch (err) {
    if (err.code === "auth/unauthorized-domain") {
      showAuthError("❌ Domain belum di-authorize! Tambahkan domain website ini di Firebase Console -> Authentication -> Settings -> Authorized domains.");
    } else if (err.code === "auth/operation-not-allowed") {
      showAuthError("❌ Google Sign-In belum diaktifkan di Firebase Console -> Authentication -> Sign-in method.");
    } else {
      showAuthError("Google Sign-In failed: " + err.message);
    }
  }
}

async function handleEmailAuth(e) {
  e.preventDefault();
  if (!window.ArcanaFirebase || !window.ArcanaFirebase.auth) {
    showAuthError("⚠️ Firebase belum terhubung! Masukkan kredensial Firebase di js/config/firebase.js.");
    return;
  }
  const email = authEmail.value;
  const password = authPassword.value;

  try {
    await window.ArcanaFirebase.auth.signInWithEmailAndPassword(email, password);
    authModal.classList.add("hidden");
  } catch (loginErr) {
    try {
      await window.ArcanaFirebase.auth.createUserWithEmailAndPassword(email, password);
      authModal.classList.add("hidden");
    } catch (regErr) {
      if (regErr.code === "auth/operation-not-allowed") {
        showAuthError("❌ Email/Password auth belum diaktifkan di Firebase Console -> Authentication -> Sign-in method.");
      } else {
        showAuthError("Authentication failed: " + regErr.message);
      }
    }
  }
}

function showAuthError(msg) {
  authErrorMsg.textContent = msg;
  authErrorMsg.classList.remove("hidden");
}
