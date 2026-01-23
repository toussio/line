/* =========================================================
   LINE RP SERVER - static site script (no backend)
   - Connect / Discord / Tebex buttons
   - Copy to clipboard + toast
   - Mobile drawer
   - Reveal on scroll
   - News/Patch sample data (replace later)
   - Gallery placeholders + lightbox
   - Portal mock login via LocalStorage
========================================================= */

const CONNECT_CMD = "connect 116.40.177.169:30120";
const CONNECT_IP_ONLY = "116.40.177.169:30120";
const DISCORD_URL = "https://discord.gg/KKXA3P74yF";

/* Tebex 링크만 여기 바꾸면 됨 */
const TEBEX_URL = ""; // 예: "https://yourserver.tebex.io/"

/* ===== Helpers ===== */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function toast(msg){
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(()=> t.classList.remove("show"), 1600);
}

async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    toast("복사 완료: " + text);
    return true;
  }catch(e){
    // fallback
    try{
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.top = "-9999px";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      document.execCommand("copy");
      ta.remove();
      toast("복사 완료: " + text);
      return true;
    }catch(err){
      toast("복사 실패… 수동으로 복사해줘!");
      return false;
    }
  }
}

function openExternal(url){
  if (!url){
    toast("Tebex 링크가 아직 없어!");
    return;
  }
  window.open(url, "_blank", "noopener");
}

/* ===== Connect Modal (simple) ===== */
function connectAction(){
  // 브라우저에서 FiveM을 직접 실행할 수는 없어서,
  // "복사 + 안내" 방식이 제일 확실함.
  copyText(CONNECT_CMD);
  toast("F8 콘솔에 붙여넣기: " + CONNECT_CMD);
}

/* ===== Mobile Drawer ===== */
function initDrawer(){
  const drawer = $("#drawer");
  const btnOpen = $("#hamburger");
  const btnClose = $("#drawerClose");
  const backdrop = $("#drawerBackdrop");
  const links = $$(".drawerLink");

  if (!drawer || !btnOpen) return;

  const open = () => {
    drawer.classList.add("isOpen");
    drawer.setAttribute("aria-hidden", "false");
    btnOpen.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };
  const close = () => {
    drawer.classList.remove("isOpen");
    drawer.setAttribute("aria-hidden", "true");
    btnOpen.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };

  btnOpen.addEventListener("click", open);
  btnClose && btnClose.addEventListener("click", close);
  backdrop && backdrop.addEventListener("click", close);
  links.forEach(a => a.addEventListener("click", close));

  // esc close
  window.addEventListener("keydown", (e)=>{
    if (e.key === "Escape" && drawer.classList.contains("isOpen")) close();
  });
}

/* ===== Reveal on Scroll ===== */
function initReveal(){
  const items = $$(".reveal");
  if (!items.length) return;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(ent=>{
      if (ent.isIntersecting){
        ent.target.classList.add("on");
        io.unobserve(ent.target);
      }
    });
  }, { threshold: 0.12 });

  items.forEach(el => io.observe(el));
}

/* ===== News / Patch sample ===== */
const NEWS = [
  {
    type: "공지",
    date: "2026-01-23",
    title: "LINE RP SERVER 오픈 안내",
    body:
`라인서버 오픈!
- 뉴비 가이드 / 규칙은 디스코드에서 최신 유지
- 서버 UI는 계속 개선 중 (HUD/채팅/마이크/상단 정보)

※ 문의/신고는 디스코드 티켓으로 부탁!`
  },
  {
    type: "패치",
    date: "2026-01-23",
    title: "UI 개선 (HUD/채팅)",
    body:
`- HUD: 정보 가독성 개선
- 채팅: 탭/정렬/스크롤 개선 예정
- 마이크 표시: 위치/표시 방식 개선

다음 패치에 갤러리/포털 연동도 준비 중.`
  },
  {
    type: "공지",
    date: "2026-01-22",
    title: "서버 접속 방법",
    body:
`FiveM 실행 → F8 콘솔 열기 → 아래 명령어 입력:
${CONNECT_CMD}

디스코드 입장: ${DISCORD_URL}`
  }
];

function initNews(){
  const list = $("#newsList");
  if (!list) return;

  list.innerHTML = "";
  NEWS.forEach((n, idx)=>{
    const item = document.createElement("div");
    item.className = "newsItem";
    item.dataset.idx = String(idx);

    item.innerHTML = `
      <div class="newsItem__top">
        <div class="newsItem__title">${escapeHtml(n.title)}</div>
        <div class="newsItem__date">${escapeHtml(n.date)}</div>
      </div>
      <div class="newsItem__tag">${escapeHtml(n.type)}</div>
    `;

    item.addEventListener("click", ()=> showNews(idx));
    list.appendChild(item);
  });

  // default
  showNews(0);
}

function showNews(idx){
  const n = NEWS[idx];
  if (!n) return;
  const title = $("#newsTitle");
  const meta = $("#newsMeta");
  const body = $("#newsBody");

  title && (title.textContent = n.title);
  meta && (meta.textContent = `${n.type} • ${n.date}`);
  body && (body.textContent = n.body);

  // highlight
  $$(".newsItem").forEach(el=>{
    el.style.outline = "none";
    el.style.background = "rgba(255,255,255,.04)";
  });
  const active = $(`.newsItem[data-idx="${idx}"]`);
  if (active){
    active.style.background = "rgba(255,255,255,.06)";
    active.style.outline = "1px solid rgba(114,210,255,.20)";
  }
}

function escapeHtml(str){
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

/* ===== Gallery placeholders + lightbox =====
   실제 스샷 넣고 싶으면:
   const GALLERY = [
     { src:"/images/shot1.jpg", cap:"이벤트" },
     ...
   ]
   그리고 images 폴더도 같이 깃허브에 올리면 됨.
*/
const GALLERY = [
  { src:"https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=60", cap:"CITY" },
  { src:"https://images.unsplash.com/photo-1520975693416-35a2f101b8a6?auto=format&fit=crop&w=1200&q=60", cap:"NIGHT" },
  { src:"https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=1200&q=60", cap:"CHASE" },
  { src:"https://images.unsplash.com/photo-1526378722445-2a4d4d3b3a4c?auto=format&fit=crop&w=1200&q=60", cap:"EVENT" },
  { src:"https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=1200&q=60", cap:"ROLEPLAY" },
  { src:"https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=60", cap:"STREET" },
  { src:"https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=60", cap:"CARS" },
  { src:"https://images.unsplash.com/photo-1483729558449-99ef09a8c325?auto=format&fit=crop&w=1200&q=60", cap:"MOMENT" },
];

let lightboxIdx = 0;

function initGallery(){
  const grid = $("#galleryGrid");
  if (!grid) return;

  grid.innerHTML = "";
  GALLERY.forEach((g, idx)=>{
    const item = document.createElement("div");
    item.className = "gItem";
    item.dataset.idx = String(idx);
    item.innerHTML = `
      <img src="${g.src}" alt="gallery ${idx+1}"/>
      <div class="gItem__cap">${escapeHtml(g.cap)}</div>
    `;
    item.addEventListener("click", ()=> openLightbox(idx));
    grid.appendChild(item);
  });

  const btnPreview = $("#btnOpenLightbox");
  btnPreview && btnPreview.addEventListener("click", ()=> openLightbox(0));
}

/* ===== Lightbox ===== */
function openLightbox(idx){
  const lb = $("#lightbox");
  if (!lb) return;
  lightboxIdx = clamp(idx, 0, GALLERY.length-1);
  renderLightbox();

  lb.classList.add("isOpen");
  lb.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

function closeLightbox(){
  const lb = $("#lightbox");
  if (!lb) return;
  lb.classList.remove("isOpen");
  lb.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function renderLightbox(){
  const img = $("#lightboxImg");
  const title = $("#lightboxTitle");
  const g = GALLERY[lightboxIdx];
  if (!g) return;
  img && (img.src = g.src);
  title && (title.textContent = `Gallery • ${g.cap}`);
}

function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

function initLightbox(){
  const closeBtn = $("#lightboxClose");
  const backdrop = $("#lightboxBackdrop");
  const prev = $("#lightboxPrev");
  const next = $("#lightboxNext");

  closeBtn && closeBtn.addEventListener("click", closeLightbox);
  backdrop && backdrop.addEventListener("click", closeLightbox);

  prev && prev.addEventListener("click", ()=>{
    lightboxIdx = (lightboxIdx - 1 + GALLERY.length) % GALLERY.length;
    renderLightbox();
  });
  next && next.addEventListener("click", ()=>{
    lightboxIdx = (lightboxIdx + 1) % GALLERY.length;
    renderLightbox();
  });

  window.addEventListener("keydown", (e)=>{
    const lb = $("#lightbox");
    if (!lb || !lb.classList.contains("isOpen")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft"){
      lightboxIdx = (lightboxIdx - 1 + GALLERY.length) % GALLERY.length;
      renderLightbox();
    }
    if (e.key === "ArrowRight"){
      lightboxIdx = (lightboxIdx + 1) % GALLERY.length;
      renderLightbox();
    }
  });
}

/* ===== Portal: mock login ===== */
const LS_KEY = "line_portal_user";

function initPortal(){
  const form = $("#loginForm");
  const btnLogout = $("#btnLogout");

  const pName = $("#pName");
  const pId = $("#pId");
  const pJob = $("#pJob");
  const pPlaytime = $("#pPlaytime");

  function render(){
    const u = getUser();
    if (!u){
      pName && (pName.textContent = "—");
      pId && (pId.textContent = "—");
      pJob && (pJob.textContent = "—");
      pPlaytime && (pPlaytime.textContent = "—");
      return;
    }
    pName && (pName.textContent = u.name || "—");
    pId && (pId.textContent = u.id || "—");
    pJob && (pJob.textContent = u.job || "무직");
    pPlaytime && (pPlaytime.textContent = u.playtime || "0h");
  }

  function getUser(){
    try{
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    }catch(e){
      return null;
    }
  }
  window.__getPortalUser = getUser;

  function setUser(u){
    localStorage.setItem(LS_KEY, JSON.stringify(u));
  }
  function clearUser(){
    localStorage.removeItem(LS_KEY);
  }

  form && form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const id = ($("#fid")?.value || "").trim();
    const name = ($("#fname")?.value || "").trim();
    if (!id || !name){
      toast("고유번호/닉네임을 입력해줘!");
      return;
    }

    // mock data
    setUser({
      id,
      name,
      job: "시민",
      playtime: "—"
    });

    toast("로그인 완료!");
    render();
  });

  btnLogout && btnLogout.addEventListener("click", ()=>{
    clearUser();
    toast("로그아웃 완료!");
    render();
  });

  render();
}

/* ===== Buttons wiring ===== */
function initButtons(){
  // connect buttons
  const connectButtons = [
    "#btnConnectTop",
    "#btnConnectHero",
    "#btnConnectDrawer",
    "#btnConnectFooter"
  ];
  connectButtons.forEach(sel=>{
    const el = $(sel);
    el && el.addEventListener("click", connectAction);
  });

  // copy connect
  $("#btnCopyConnect")?.addEventListener("click", ()=> copyText(CONNECT_CMD));
  $("#btnCopyConnect2")?.addEventListener("click", ()=> copyText(CONNECT_CMD));

  // set connect code text
  $("#connectCmd") && ($("#connectCmd").textContent = CONNECT_CMD);
  $("#connectCmd2") && ($("#connectCmd2").textContent = CONNECT_CMD);

  // tebex buttons
  $("#btnTebexHero")?.addEventListener("click", ()=> openExternal(TEBEX_URL));
  $("#btnTebexDrawer")?.addEventListener("click", ()=> openExternal(TEBEX_URL));
  $("#btnTebexPortal")?.addEventListener("click", ()=> openExternal(TEBEX_URL));

  // discord copy
  $("#btnCopyDiscord")?.addEventListener("click", ()=> copyText(DISCORD_URL));
}

/* ===== Fake stats (optional) =====
   실제 인원 표시하려면 서버 상태 API가 필요함.
   일단 "Online"만 유지하고 숫자는 샘플로 돌림.
*/
function initStats(){
  const pc = $("#playerCount");
  const pm = $("#playerMax");
  if (!pc || !pm) return;

  let t = 0;
  const max = 64;
  pm.textContent = String(max);

  setInterval(()=>{
    t++;
    // 그냥 자연스럽게 움직이는 느낌만
    const v = 18 + Math.floor(Math.abs(Math.sin(t/4)) * 22);
    pc.textContent = String(v);
  }, 1300);
}

/* ===== Boot ===== */
window.addEventListener("DOMContentLoaded", ()=>{
  initDrawer();
  initReveal();
  initButtons();
  initNews();
  initGallery();
  initLightbox();
  initPortal();
  initStats();
});

