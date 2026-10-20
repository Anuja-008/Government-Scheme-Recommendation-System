/* ================= CONFIG ================= */
const API_URL = "/api/recommendations";
const ALL_SCHEMES_URL = "/api/recommendations/schemes";
const STATES_URL = "/api/recommendations/states";

const $ = (id) => document.getElementById(id);

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
];

const SAMPLE_SCHEMES = [
  {
    name: "PM Kisan Samman Nidhi (PM-KISAN)",
    level: "National",
    occupation: "farmer",
    website: "https://pmkisan.gov.in/",
    minAge: 18,
    maxAge: 100,
    maxIncome: 600000,
    gender: "any",
    caste: "any",
    state: null,
    description: "Central Sector income support scheme providing ₹6,000 per year directly to all landholding farmer families across India.",
    benefits: "₹6,000 per year transferred via DBT in three equal four-monthly installments of ₹2,000 each.",
    documents: "Aadhaar Card, Land ownership papers (Khatauni/ROR), Bank passbook, Aadhaar-linked mobile.",
    applicationProcess: "Apply online at pmkisan.gov.in under 'New Farmer Registration' or visit CSC / Agriculture Office."
  },
  {
    name: "Ayushman Bharat - PMJAY (Health Assurance)",
    level: "National",
    occupation: "any",
    website: "https://pmjay.gov.in/",
    minAge: 0,
    maxAge: 119,
    maxIncome: 300000,
    gender: "any",
    caste: "any",
    state: null,
    description: "World's largest government-funded health scheme offering free cashless hospitalization cover up to ₹5 lakh per family per year.",
    benefits: "Cashless secondary and tertiary medical treatment up to ₹5,00,000 per family per year at empaneled hospitals.",
    documents: "Aadhaar Card, Ration Card / SECC record, Mobile number.",
    applicationProcess: "Check eligibility online at beneficiary.nha.gov.in or visit any empaneled hospital or Ayushman Mitra kiosk."
  },
  {
    name: "National Scholarship Portal - Post Matric for SC Students",
    level: "National",
    occupation: "student",
    website: "https://scholarships.gov.in/",
    minAge: 15,
    maxAge: 35,
    maxIncome: 250000,
    gender: "any",
    caste: "SC",
    state: null,
    description: "Centrally sponsored scholarship providing complete financial support to SC students pursuing higher studies.",
    benefits: "100% tuition and compulsory non-refundable fees reimbursement plus monthly maintenance allowance.",
    documents: "SC Caste Certificate, Income Certificate, Academic marksheets, Fee receipt, Bank passbook, Aadhaar.",
    applicationProcess: "Apply online through the National Scholarship Portal (scholarships.gov.in) with institute verification."
  }
];

const CATEGORY_WORDS = {
  student: ["student", "scholarship", "education", "college", "school"],
  health: ["health", "ayushman", "insurance", "medical", "hospital"],
  farmer: ["farmer", "agri", "kisan", "crop", "irrigation"],
  unemployed: ["unemployed", "employment", "job", "skill", "training"],
  female: ["female", "women", "girl", "mahila", "kanya", "matru"],
  labour: ["labour", "welfare", "worker", "pension", "bocw", "shram"]
};

let currentSchemes = [];
let activeKind = "all";
let activeCategory = null;
let searchText = "";

/* ================= URL HELPER ================= */
function formatOfficialUrl(url) {
  if (!url) return "#";
  let cleaned = String(url).trim();
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = "https://" + cleaned;
  }
  return cleaned;
}

/* ================= AUTH (browser-only demo) ================= */
const USERS_KEY = "govschemes_users";
const SESSION_KEY = "govschemes_session";

function getUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch (e) { return []; }
}
function saveUsers(users) { localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function ensureDemoUser() {
  const users = getUsers();
  if (!users.some((u) => u.email === "demo@govschemes.in")) {
    users.push({ name: "Demo User", email: "demo@govschemes.in", password: "Scheme@123" });
    saveUsers(users);
  }
}

function startSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
  showApp(user);
}

function showApp(user) {
  $("authScreen").classList.add("hidden");
  $("app").classList.remove("hidden");
  $("userName").textContent = user.name;
  $("userInitial").textContent = user.name.trim().charAt(0).toUpperCase() || "G";
  loadAllSchemes();
  loadStates();
}

function showAuth() {
  $("app").classList.add("hidden");
  $("authScreen").classList.remove("hidden");
}

$("showRegister").addEventListener("click", () => {
  $("loginPanel").classList.add("hidden");
  $("registerPanel").classList.remove("hidden");
});
$("showLogin").addEventListener("click", () => {
  $("registerPanel").classList.add("hidden");
  $("loginPanel").classList.remove("hidden");
});

$("loginForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = $("loginEmail").value.trim().toLowerCase();
  const password = $("loginPassword").value;
  const msg = $("loginMessage");

  if (!email || !password) { msg.textContent = "Enter your email and password."; return; }

  const user = getUsers().find((u) => u.email === email && u.password === password);
  if (!user) { msg.textContent = "Email or password is incorrect."; return; }

  msg.textContent = "";
  startSession(user);
});

$("registerForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = $("registerName").value.trim();
  const email = $("registerEmail").value.trim().toLowerCase();
  const password = $("registerPassword").value;
  const msg = $("registerMessage");

  if (!name || !email || password.length < 6) {
    msg.textContent = "Enter your name, a valid email and a password of 6+ characters.";
    return;
  }
  const users = getUsers();
  if (users.some((u) => u.email === email)) {
    msg.textContent = "This email is already registered. Sign in instead.";
    return;
  }
  const user = { name, email, password };
  users.push(user);
  saveUsers(users);
  msg.textContent = "";
  startSession(user);
});

$("guestBtn").addEventListener("click", () => {
  startSession({ name: "Guest User", email: "" });
});

$("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem(SESSION_KEY);
  showAuth();
});

/* ================= NAVIGATION ================= */
function setView(view) {
  document.querySelectorAll(".nav-item").forEach((b) =>
    b.classList.toggle("active", b.dataset.view === view));

  const page = (view === "saved" || view === "about") ? view : "home";
  ["home", "saved", "about"].forEach((v) =>
    $("view-" + v).classList.toggle("hidden", v !== page));

  if (page === "saved") renderSaved();

  if (page === "home") {
    if (view === "profile") $("profileSection").scrollIntoView({ behavior: "smooth" });
    if (view === "finder") $("exploreSection").scrollIntoView({ behavior: "smooth" });
    if (view === "home") window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

document.querySelectorAll(".nav-item").forEach((btn) =>
  btn.addEventListener("click", () => setView(btn.dataset.view)));

/* ================= STATES DROPDOWN ================= */
function populateStates(statesList) {
  const select = $("state");
  const currentValue = select.value;
  select.replaceChildren();

  const defaultOpt = document.createElement("option");
  defaultOpt.value = "";
  defaultOpt.textContent = "Select your state";
  select.appendChild(defaultOpt);

  const set = new Set([...STATES, ...statesList]);
  Array.from(set).sort((a, b) => a.localeCompare(b)).forEach((s) => {
    if (!s) return;
    const opt = document.createElement("option");
    opt.value = s;
    opt.textContent = s;
    if (s === currentValue) opt.selected = true;
    select.appendChild(opt);
  });
}
populateStates([]);

async function loadStates() {
  try {
    const res = await fetch(STATES_URL);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        populateStates(data);
      }
    }
  } catch (err) {
    // fallback remains active
  }
}

/* ================= PROFILE FORM ================= */
$("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const age = Number($("age").value);
  const annualIncome = Number($("annualIncome").value);

  if (!Number.isInteger(age) || age < 1 || age > 119) {
    return formError("Enter a valid age between 1 and 119.");
  }
  if ($("annualIncome").value === "" || !Number.isFinite(annualIncome) || annualIncome < 0) {
    return formError("Enter a valid annual family income.");
  }
  if (!$("occupation").value) return formError("Select your occupation.");
  if (!$("caste").value) return formError("Select your community category.");
  if (!$("state").value) return formError("Select your state.");

  formError("");

  const profile = {
    age: age,
    annualIncome: annualIncome,
    occupation: $("occupation").value,
    gender: $("gender").value,
    caste: $("caste").value,
    state: $("state").value
  };

  const button = $("submitButton");
  button.disabled = true;
  button.textContent = "Finding schemes...";
  showStatus("Searching for matching schemes in database...");
  $("schemeResults").replaceChildren();

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });

    let data = null;
    try { data = await response.json(); } catch (err) { data = null; }

    if (!response.ok) {
      throw new Error((data && (data.error || data.message)) || "Server returned " + response.status);
    }

    const schemes = Array.isArray(data) ? data : (data && Array.isArray(data.schemes) ? data.schemes : []);

    currentSchemes = schemes;
    activeCategory = null;
    $("resultSubtitle").textContent = schemes.length + " verified scheme(s) match your profile.";
    renderSchemes();
    $("exploreSection").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    showStatus("Could not get recommendations. Check that Spring Boot is running. Details: " + error.message);
  } finally {
    button.disabled = false;
    button.innerHTML = "&#9906; Find My Schemes &rarr;";
  }
});

function formError(text) {
  $("formMessage").textContent = text;
  return false;
}

/* ================= LOAD ALL SCHEMES ================= */
async function loadAllSchemes() {
  try {
    const response = await fetch(ALL_SCHEMES_URL);
    if (!response.ok) throw new Error("Status " + response.status);
    const data = await response.json();
    const list = Array.isArray(data) ? data : (data && Array.isArray(data.schemes) ? data.schemes : []);
    if (list.length === 0) throw new Error("Empty list");
    currentSchemes = list;
    $("statSchemes").textContent = list.length + "+";
  } catch (err) {
    currentSchemes = SAMPLE_SCHEMES;
    $("statSchemes").textContent = SAMPLE_SCHEMES.length + "+";
  }
  renderSchemes();
}

/* ================= FILTERS ================= */
document.querySelectorAll(".tab").forEach((tab) =>
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    activeKind = tab.dataset.kind;
    renderSchemes();
  }));

function onSearch(value) {
  searchText = value.trim().toLowerCase();
  $("schemeSearch").value = value;
  $("topSearch").value = value;
  renderSchemes();
}
$("schemeSearch").addEventListener("input", (e) => onSearch(e.target.value));
$("topSearch").addEventListener("input", (e) => {
  onSearch(e.target.value);
  if (e.target.value) $("exploreSection").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".cat").forEach((btn) =>
  btn.addEventListener("click", () => {
    const key = btn.dataset.cat;
    activeCategory = activeCategory === key ? null : key;
    document.querySelectorAll(".cat").forEach((b) =>
      b.style.borderColor = b.dataset.cat === activeCategory ? "#7c5cff" : "");
    renderSchemes();
    $("exploreSection").scrollIntoView({ behavior: "smooth" });
  }));

function matchesFilters(s) {
  const level = String(s.level || "").toLowerCase();
  if (activeKind === "national" && !level.includes("national") && !level.includes("central")) return false;
  if (activeKind === "state" && !level.includes("state")) return false;

  const text = JSON.stringify(s).toLowerCase();
  if (searchText && !text.includes(searchText)) return false;

  if (activeCategory) {
    const words = CATEGORY_WORDS[activeCategory] || [];
    if (!words.some((w) => text.includes(w))) return false;
  }
  return true;
}

/* ================= RENDER ================= */
function showStatus(message) {
  const box = $("statusMessage");
  box.hidden = false;
  box.textContent = message;
}

function renderSchemes() {
  renderInto($("schemeResults"), currentSchemes.filter(matchesFilters), true);
}

function renderSaved() {
  renderInto($("savedResults"), getSaved(), false);
}

function renderInto(container, list, useStatus) {
  container.replaceChildren();
  const box = $("statusMessage");

  if (useStatus) box.hidden = true;

  if (list.length === 0) {
    const text = useStatus
      ? "No schemes found. Try a different profile, tab or search."
      : "You have not saved any schemes yet.";
    if (useStatus) showStatus(text);
    else {
      const p = document.createElement("div");
      p.className = "status";
      p.textContent = text;
      container.appendChild(p);
    }
    return;
  }

  list.forEach((s) => container.appendChild(buildCard(s)));
}

function buildCard(s) {
  const card = document.createElement("article");
  card.className = "scheme-card";

  const top = document.createElement("div");
  top.className = "card-top";

  const title = document.createElement("h3");
  title.textContent = s.name || "Unnamed scheme";

  const tagWrap = document.createElement("div");
  tagWrap.style.display = "flex";
  tagWrap.style.gap = "4px";

  const tag = document.createElement("span");
  tag.className = "scheme-tag";
  tag.textContent = s.level || "National";
  tagWrap.appendChild(tag);

  if (s.state && String(s.state).trim().length > 0) {
    const stTag = document.createElement("span");
    stTag.className = "state-tag";
    stTag.textContent = s.state.trim();
    tagWrap.appendChild(stTag);
  }

  top.append(title, tagWrap);
  card.appendChild(top);

  if (s.description) {
    const descP = document.createElement("p");
    descP.className = "detail";
    descP.style.color = "#cbd5e1";
    descP.style.marginBottom = "4px";
    descP.textContent = s.description.length > 120 ? s.description.substring(0, 117) + "..." : s.description;
    card.appendChild(descP);
  }

  addDetail(card, "Occupation", s.occupation);
  addDetail(card, "Age Range", formatRange(s.minAge, s.maxAge));
  addDetail(card, "Max Income", formatIncome(s.maxIncome));
  addDetail(card, "Gender", s.gender);
  addDetail(card, "Community", s.caste);
  addDetail(card, "State", s.state);

  const actions = document.createElement("div");
  actions.className = "card-actions";

  const directUrl = formatOfficialUrl(s.website);

  if (s.website) {
    const viewBtn = document.createElement("a");
    viewBtn.className = "btn-view-scheme";
    viewBtn.textContent = "View Scheme \u2197";
    viewBtn.href = directUrl;
    viewBtn.target = "_blank";
    viewBtn.rel = "noopener noreferrer";
    viewBtn.title = "Visit official " + (s.name || "scheme") + " website directly";
    actions.appendChild(viewBtn);
  }

  const detailsBtn = document.createElement("button");
  detailsBtn.type = "button";
  detailsBtn.className = "btn-details";
  detailsBtn.textContent = "Details";
  detailsBtn.title = "View scheme overview, benefits & eligibility";
  detailsBtn.addEventListener("click", () => openSchemeModal(s));
  actions.appendChild(detailsBtn);

  const save = document.createElement("button");
  save.type = "button";
  save.className = "btn-save";
  setSaveLabel(save, isSaved(s));
  save.addEventListener("click", () => {
    toggleSaved(s);
    setSaveLabel(save, isSaved(s));
    if (!$("view-saved").classList.contains("hidden")) renderSaved();
  });
  actions.appendChild(save);

  card.appendChild(actions);
  return card;
}

function addDetail(card, label, value) {
  if (value === null || value === undefined || value === "" || value === "Not specified") return;
  const p = document.createElement("p");
  p.className = "detail";
  const b = document.createElement("b");
  b.textContent = label + ": ";
  p.append(b, document.createTextNode(String(value)));
  card.appendChild(p);
}

function formatRange(min, max) {
  if (min == null && max == null) return "Any age";
  return (min == null ? "Any" : min) + " \u2013 " + (max == null ? "Any" : max) + " yrs";
}

function formatIncome(max) {
  if (max == null) return "No upper limit";
  return "\u20B9" + Number(max).toLocaleString("en-IN") + " / year";
}

/* ================= MODAL LOGIC ================= */
function openSchemeModal(s) {
  $("modalTitle").textContent = s.name || "Scheme Details";
  $("modalLevelTag").textContent = s.level || "National";

  const stateTag = $("modalStateTag");
  if (s.state && s.state.trim().length > 0) {
    stateTag.textContent = s.state.trim();
    stateTag.classList.remove("hidden");
  } else {
    stateTag.classList.add("hidden");
  }

  $("modalCategoryTag").textContent = (s.occupation ? s.occupation.toUpperCase() : "ALL");

  $("modalDescription").textContent = s.description || "Official government welfare initiative designed to provide financial, educational, and healthcare security.";
  $("modalBenefits").textContent = s.benefits || "Direct financial assistance, subsidized loans, insurance, or grants credited as per government guidelines.";

  $("modalAge").textContent = formatRange(s.minAge, s.maxAge);
  $("modalIncome").textContent = formatIncome(s.maxIncome);
  $("modalOccupation").textContent = s.occupation ? s.occupation : "Any occupation";
  $("modalGender").textContent = s.gender ? s.gender : "Any gender";
  $("modalCaste").textContent = s.caste ? s.caste : "All categories";
  $("modalState").textContent = s.state ? s.state : "All India (National)";

  $("modalDocuments").textContent = s.documents || "Aadhaar Card, Bank account passbook, Identity proof, and Community/Income Certificate if applicable.";
  $("modalProcess").textContent = s.applicationProcess || "Apply through the official scheme portal or visit your nearest Common Service Centre (CSC) / district department office.";

  const directUrl = formatOfficialUrl(s.website);
  const linkBtn = $("modalOfficialLink");
  linkBtn.href = directUrl;
  linkBtn.setAttribute("target", "_blank");
  linkBtn.setAttribute("rel", "noopener noreferrer");

  $("schemeModal").classList.remove("hidden");
  document.body.style.overflow = "hidden";
}

function closeSchemeModal() {
  $("schemeModal").classList.add("hidden");
  document.body.style.overflow = "";
}

$("modalCloseBtn").addEventListener("click", closeSchemeModal);
$("modalDismissBtn").addEventListener("click", closeSchemeModal);

$("schemeModal").addEventListener("click", (e) => {
  if (e.target === $("schemeModal")) closeSchemeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$("schemeModal").classList.contains("hidden")) {
    closeSchemeModal();
  }
});

/* ================= SAVED SCHEMES ================= */
const SAVED_KEY = "govschemes_saved";

function getSaved() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY)) || []; }
  catch (e) { return []; }
}
function schemeKey(s) { return String(s.id != null ? s.id : s.name); }
function isSaved(s) { return getSaved().some((x) => schemeKey(x) === schemeKey(s)); }

function toggleSaved(s) {
  let saved = getSaved();
  if (isSaved(s)) saved = saved.filter((x) => schemeKey(x) !== schemeKey(s));
  else saved.push(s);
  localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
}

function setSaveLabel(button, saved) {
  button.textContent = saved ? "\u2605 Saved" : "\u2606 Save";
  button.classList.toggle("saved", saved);
}

/* ================= START ================= */
ensureDemoUser();
(function init() {
  try {
    const session = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (session && session.name) { showApp(session); return; }
  } catch (e) { /* ignore */ }
  showAuth();
})();