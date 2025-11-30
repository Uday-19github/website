/***** SPA with backend integration for contact form *****/

// Local storage keys and seed data
const KEYS = {
  projects: 'il_proj_v2',
  users: 'il_users_v2',
  session: 'il_sess_v2',
  contacts: 'il_contacts_v2',
  gfLink: 'il_gf_v2'
};

const SEED_PROJECTS = [
  {
    id: 1,
    title: 'Duplicate Image Detection',
    abstract: 'Detect duplicate or near-duplicate images at scale using hybrid CNN + SIFT matching. Short demo available.',
    algo: 'ResNet + SIFT',
    tech: 'Flask, Redis, MongoDB',
    video: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    ppt: 'https://example.com/duplicate_detection_ppt.pdf',
    tags: ['Computer Vision','Deep Learning']
  },
  {
    id: 2,
    title: 'Smart Scheduler',
    abstract: 'An optimization-based scheduler that balances preferences and constraints using a hybrid GA + ILP approach.',
    algo: 'Genetic Algorithm',
    tech: 'Python, Flask',
    video: '',
    ppt: '',
    tags: ['Optimization','Algorithms']
  },
  {
    id: 3,
    title: 'LMS Revamp',
    abstract: 'A modern, accessible library-management platform with role-based access and analytics dashboards.',
    algo: 'CRUD, RBAC',
    tech: 'Django, PostgreSQL',
    video: '',
    ppt: '',
    tags: ['Web','Full-Stack']
  }
];

const SEED_USERS = [
  { id: 1, email: 'admin@innovate.local', password: 'Admin123!', role: 'admin', name: 'Admin' },
  { id: 2, email: 'user@innovate.local', password: 'User123!', role: 'user', name: 'Demo User' }
];

function get(key){
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch(e){
    return null;
  }
}
function set(key,val){
  localStorage.setItem(key, JSON.stringify(val));
}
function ensure(){
  if(!get(KEYS.projects)) set(KEYS.projects, SEED_PROJECTS);
  if(!get(KEYS.users)) set(KEYS.users, SEED_USERS);
  if(!get(KEYS.contacts)) set(KEYS.contacts, []);
}
ensure();

// === CONFIG: Backend API endpoint ===
// When backend runs on localhost:5000
const SHEET_ENDPOINT = 'http://localhost:5000/api/contact';
const SHEET_SECRET = ''; // optional shared secret, keep '' for now

// Router
const app = document.getElementById('app');
function route(){
  const hash = location.hash.replace('#','') || '/';
  const [path] = hash.split(':');
  renderPage(path);
}

// Page renderers
function renderPage(path){
  const pages = {
    '/': renderHome,
    '/projects': renderProjectsPage,
    '/services': renderServicesPage,
    '/contact': renderContactPage
  };
  const fn = pages[path] || renderNotFound;
  app.innerHTML = '';
  const container = document.createElement('div');
  container.className = 'page-enter card-entrance';
  container.innerHTML = fn();
  app.appendChild(container);
  requestAnimationFrame(()=>{
    container.classList.add('page-enter-active');
    container.classList.add('in');
  });
  attachPageEvents();
}

/* ---------- HOME ---------- */
function renderHome(){
  return `
  <section class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center hero-gradient rounded-2xl p-8 shadow">
    <div>
      <h2 class="text-4xl font-extrabold">Innovate. Build. Ship.</h2>
      <p class="mt-4 text-slate-600">We transform ideas into production-ready prototypes and help scale them.
      Explore projects, request services, or get in touch — everything is a click away.</p>

      <div class="mt-6 flex gap-3">
        <a href="#/projects" class="px-5 py-3 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-md shadow">See Projects</a>
        <a href="#/services" class="px-5 py-3 border rounded-md">Our Services</a>
      </div>

      <div class="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="p-4 bg-white rounded-lg shadow glass">
          <h4 class="font-semibold">Fast Prototyping</h4>
          <p class="text-sm text-slate-600 mt-2">Validate ideas with a working prototype in weeks.</p>
        </div>
        <div class="p-4 bg-white rounded-lg shadow glass">
          <h4 class="font-semibold">MLOps & Pipelines</h4>
          <p class="text-sm text-slate-600 mt-2">Deploy models reliably with monitoring and CI/CD.</p>
        </div>
      </div>
    </div>

    <div>
      <div class="w-full h-64 rounded-2xl overflow-hidden shadow-lg floaty">
        <video autoplay muted loop playsinline class="w-full h-full object-cover">
          <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
        </video>
      </div>

      <div class="mt-6 grid grid-cols-3 gap-3">
        <div class="p-4 bg-white rounded-lg shadow text-center">
          <div class="text-xl font-bold">50+</div>
          <div class="text-xs text-slate-500">Projects</div>
        </div>
        <div class="p-4 bg-white rounded-lg shadow text-center">
          <div class="text-xl font-bold">10+</div>
          <div class="text-xs text-slate-500">Technologies</div>
        </div>
        <div class="p-4 bg-white rounded-lg shadow text-center">
          <div class="text-xl font-bold">5</div>
          <div class="text-xs text-slate-500">Active Collaborations</div>
        </div>
      </div>
    </div>
  </section>

  <section class="mt-8">
    <h3 class="text-xl font-semibold mb-3">Featured tech areas</h3>
    <div class="flex gap-2 flex-wrap">
      <span class="badge bg-indigo-100 text-indigo-800">AI & ML</span>
      <span class="badge bg-teal-100 text-teal-800">Cloud</span>
      <span class="badge bg-pink-100 text-pink-800">Computer Vision</span>
      <span class="badge bg-sky-100 text-sky-800">Optimization</span>
    </div>
  </section>
  `;
}

/* ---------- PROJECTS PAGE ---------- */
function renderProjectsPage(){
  const projects = get(KEYS.projects) || [];
  const tags = Array.from(new Set(projects.flatMap(p=>p.tags||[])));
  return `
  <section>
    <div class="flex items-center justify-between mb-4">
      <h2 class="text-2xl font-bold">Projects</h2>
      <div class="flex gap-2 items-center">
        <select id="projectFilter" class="p-2 border rounded">
          <option value="all">All</option>
          ${tags.map(t=>`<option value="${t}">${t}</option>`).join('')}
        </select>
        <button id="btnNewProject" class="px-3 py-2 bg-green-600 text-white rounded ${isAdmin() ? '' : 'opacity-60'}" ${isAdmin() ? '' : 'disabled'}>New Project</button>
      </div>
    </div>

    <div id="projectsGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${projects.map(p=>projectCardHtml(p)).join('')}
    </div>
  </section>
  `;
}

function projectCardHtml(p){
  return `
  <article class="p-4 bg-white rounded-lg shadow">
    <div class="h-40 bg-slate-100 rounded overflow-hidden mb-3 flex items-center justify-center">
      ${
        p.video
          ? `<img src="https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=800&auto=format&fit=crop&ixlib=rb-4.0.3&s=placeholder" alt="thumb" class="w-full h-full object-cover">`
          : `<div class="text-sm text-slate-500 p-4">No media</div>`
      }
    </div>
    <h4 class="font-semibold text-lg">${escapeHtml(p.title)}</h4>
    <p class="text-sm text-slate-600 mt-2 line-clamp-3">${escapeHtml(p.abstract)}</p>
    <div class="mt-3 flex items-center justify-between">
      <div class="text-xs text-slate-500">${escapeHtml(p.tech||'')}</div>
      <div class="flex gap-2">
        <button class="px-3 py-1 border rounded text-sm" data-action="preview" data-id="${p.id}">Preview</button>
        ${
          isAdmin()
            ? `<button class="px-3 py-1 border rounded text-sm" data-action="edit" data-id="${p.id}">Edit</button>
               <button class="px-3 py-1 border rounded text-sm" data-action="del" data-id="${p.id}">Delete</button>`
            : ''
        }
      </div>
    </div>
  </article>
  `;
}

/* ---------- SERVICES PAGE (with scrolling cards) ---------- */
function renderServicesPage(){
  const services = [
    {
      key: 'prototype',
      title: 'Prototype Development',
      desc: 'Fast front-end & back-end prototypes to validate your idea.'
    },
    {
      key: 'algo-consult',
      title: 'Algorithm Consultancy',
      desc: 'Custom algorithm selection, tuning, and performance analysis.'
    },
    {
      key: 'research',
      title: 'Research Paper Support',
      desc: 'Implementation, experiments, graphs, and result interpretation.'
    },
    {
      key: 'doc',
      title: 'Project Documentation',
      desc: 'Clean, submission-ready reports, diagrams, and PPTs.'
    },
    {
      key: 'integration',
      title: 'System Integration',
      desc: 'APIs, databases, and cloud deployments that connect everything.'
    },
    {
      key: 'consult',
      title: 'Consultation',
      desc: 'Architecture and planning sessions for a solid project roadmap.'
    }
  ];

  // Duplicate list to create a loop for auto-scroll
  const scrollingList = [...services, ...services];

  return `
  <section>
    <h2 class="text-2xl font-bold mb-4">Services</h2>

    <!-- Horizontal auto-scrolling container -->
    <div class="services-marquee mt-2">
      <div class="services-track">
        ${scrollingList.map(s=>`
          <div class="services-card p-6 bg-white rounded-xl shadow glass text-center">
            <h4 class="font-semibold text-lg">${escapeHtml(s.title)}</h4>
            <p class="text-sm text-slate-600 mt-2">${escapeHtml(s.desc)}</p>
            <div class="mt-4">
              <button
                class="px-3 py-2 bg-indigo-600 text-white rounded"
                data-service="${escapeHtml(s.title)}"
                data-service-key="${escapeHtml(s.key)}"
              >
                Request
              </button>
            </div>
          </div>`).join('')}
      </div>
    </div>

   <div class="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-teal-50 rounded-lg why-box">

      <h3 class="font-semibold">Why work with us?</h3>
      <ul class="mt-2 text-sm text-slate-600 list-disc list-inside">
        <li>Rapid prototyping and iterative feedback cycles.</li>
        <li>Clear timelines and transparent deliverables.</li>
        <li>Scalable, maintainable architecture choices.</li>
      </ul>
    </div>
  </section>
  `;
}

/* ---------- CONTACT PAGE ---------- */
function renderContactPage(){
  return `
  <section class="max-w-2xl mx-auto p-6">
    <div class="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-300 hover:shadow-2xl">
      <h2 class="text-2xl font-bold">Contact Us</h2>
      <p class="mt-2 text-sm text-slate-600">
        Share your name, how we should reach you, and what you need — we'll get back soon.
      </p>

      <form id="contactForm" class="mt-6 space-y-4">
        <div class="grid grid-cols-1 gap-3">
          <input name="name" placeholder="Your name" class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
          <input name="details" placeholder="Email or phone" class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" required />
          <textarea name="message" placeholder="What do you want?" class="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-200" rows="5" required></textarea>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex gap-3 items-center text-sm text-slate-500">
            <span class="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 8a2 2 0 0 0-2-2h-1l-2-2H8L6 6H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8z" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>hello@techproprojects.local</span>
            </span>
            <span class="inline-flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 16.92V21a1 1 0 0 1-1.11 1A19 19 0 0 1 3 5.11 1 1 0 0 1 4 4h4.09a1 1 0 0 1 1 .75 12.05 12.05 0 0 0 .7 2.81 1 1 0 0 1-.23 1L8.7 11.7a16 16 0 0 0 4.6 4.6l1.04-1.04a1 1 0 0 1 1-.23 12 12 0 0 0 2.8.7 1 1 0 0 1 .75 1V21z" stroke="#10b981" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>+91 98765 43210</span>
            </span>
          </div>

          <div class="flex items-center gap-2">
            <button type="submit" class="px-5 py-2 bg-gradient-to-r from-indigo-600 to-teal-500 text-white rounded-lg shadow">
              Send
            </button>
          </div>
        </div>

        <div id="contactAlert" class="mt-2 hidden p-3 rounded-lg text-sm"></div>

        <div class="mt-3 flex justify-end">
          <button type="button" id="btnViewContactsInline" class="text-xs text-indigo-600 hover:underline">
            View saved submissions (this browser)
          </button>
        </div>
      </form>

      <div class="mt-6 text-center text-slate-500 text-sm">
        Follow us:
        <a href="#" class="inline-flex items-center gap-2 ml-2 text-indigo-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5z" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Instagram
        </a>
        <a href="#" class="inline-flex items-center gap-2 ml-3 text-indigo-600">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 8a6 6 0 1 1-8 0" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 21v-3a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v3" stroke="#6366f1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          LinkedIn
        </a>
      </div>
    </div>
  </section>
  `;
}

function renderNotFound(){
  return `<div><h2 class="text-2xl">Page not found</h2></div>`;
}

/* ---------- Modal helpers ---------- */
function openModal(html){
  document.getElementById('modal').innerHTML = html;
  const b = document.getElementById('modalBackdrop');
  b.classList.remove('hidden');
  b.style.display = 'flex';
}
function closeModal(){
  const b = document.getElementById('modalBackdrop');
  b.classList.add('hidden');
  b.style.display = 'none';
}
document.getElementById('modalBackdrop').addEventListener('click',(e)=>{
  if(e.target.id==='modalBackdrop') closeModal();
});

/* ---------- Small UI bits / actions ---------- */
function escapeHtml(s){
  return String(s||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

function isAdmin(){
  const s = get(KEYS.session);
  return s && s.role === 'admin';
}
function isLoggedIn(){
  return !!get(KEYS.session);
}

// Attach events after page render
function attachPageEvents(){
  // Projects page events
  const grid = document.getElementById('projectsGrid');
  if(grid){
    grid.addEventListener('click', (e)=>{
      const a = e.target.closest('[data-action]');
      if(!a) return;
      const id = a.dataset.id;
      const act = a.dataset.action;
      if(act === 'preview') return openProjectPreview(id);
      if(act === 'edit') return openProjectEdit(id);
      if(act === 'del') return deleteProject(id);
    });

    const filter = document.getElementById('projectFilter');
    if(filter) filter.addEventListener('change', ()=>{
      const val = filter.value;
      renderFilteredProjects(val);
    });

    const newBtn = document.getElementById('btnNewProject');
    if(newBtn) newBtn.addEventListener('click', ()=>{
      if(!isAdmin()){
        alert('Only admin can add projects.');
        return;
      }
      openProjectEdit();
    });
  }

  // Contact page events
  const contactForm = document.getElementById('contactForm');
  if(contactForm){
    contactForm.addEventListener('submit', async (ev)=>{
      ev.preventDefault();
      const alertBox = document.getElementById('contactAlert');
      alertBox.className = 'mt-2 hidden p-3 rounded-lg text-sm';

      const fd = new FormData(contactForm);
      const obj = {
        name: fd.get('name'),
        details: fd.get('details'),
        message: fd.get('message')
      };

      // Try to post to backend
      const result = await postToSheet(obj);
      if(result && result.ok){
        alertBox.className = 'mt-2 p-3 rounded-lg text-sm bg-green-50 text-green-700 alert-show';
        alertBox.innerText = 'Thanks — your message was sent. We will contact you soon.';
        contactForm.reset();
        setTimeout(()=>{
          alertBox.classList.remove('alert-show');
          alertBox.classList.add('hidden');
        }, 4500);
        return;
      }

      // fallback: save locally
      const contacts = get(KEYS.contacts) || [];
      contacts.push({
        id: Date.now(),
        name: obj.name,
        details: obj.details,
        message: obj.message,
        created: new Date().toISOString()
      });
      set(KEYS.contacts, contacts);

      alertBox.className = 'mt-2 p-3 rounded-lg text-sm bg-yellow-50 text-amber-800 alert-show';
      alertBox.innerText = 'Could not reach backend — saved locally in this browser. You can export submissions.';
      contactForm.reset();
      setTimeout(()=>{
        alertBox.classList.remove('alert-show');
        alertBox.classList.add('hidden');
      }, 6000);
    });
  }

  // Projects slider actions on home (if any)
  const previewBtns = document.querySelectorAll('button[data-preview-id]');
  previewBtns.forEach(b=>b.addEventListener('click', ()=>openProjectPreview(b.dataset.previewId)));

  // Wire up auth buttons
  const signBtn = document.getElementById('btnOpenLogin');
  if(signBtn) signBtn.addEventListener('click', openLoginModal);
  const logoutBtn = document.getElementById('btnLogout');
  if(logoutBtn) logoutBtn.addEventListener('click', ()=>{
    localStorage.removeItem(KEYS.session);
    updateAuthUI();
    alert('Signed out');
  });

  const navViewBtn = document.getElementById('btnViewContacts');
  if(navViewBtn) navViewBtn.addEventListener('click', openContactsViewer);

  const inlineViewBtn = document.getElementById('btnViewContactsInline');
  if(inlineViewBtn) inlineViewBtn.addEventListener('click', openContactsViewer);

  // Mobile menu
  const mobile = document.getElementById('mobileMenuBtn');
  if(mobile) mobile.addEventListener('click', ()=>{
    openModal(`
      <div class="p-4">
        <h3 class="font-semibold">Menu</h3>
        <div class="mt-3 flex flex-col gap-2">
          <a href="#/">Home</a>
          <a href="#/projects">Projects</a>
          <a href="#/services">Services</a>
          <a href="#/contact">Contact</a>
        </div>
      </div>`);
  });

  // Services horizontal scroll: auto + mouse wheel (no drag)
  const marquee = document.querySelector('.services-marquee');
  if(marquee){
    initServicesScroller(marquee);
  }

  // Theme toggle (simple)
  const themeToggle = document.getElementById('themeToggle');
  if(themeToggle){
    themeToggle.onclick = toggleTheme;
    applyTheme();
  }
}

/* ---------- Services auto-scroll + wheel scroll ---------- */
function initServicesScroller(container){
  const track = container.querySelector('.services-track');
  if(!track) return;

  let autoScrollId = null;
  const speed = 0.7; // pixels per tick

  function startAuto(){
    if(autoScrollId) return;
    autoScrollId = setInterval(()=>{
      container.scrollLeft += speed;
      const maxScroll = track.scrollWidth / 2;
      if(container.scrollLeft >= maxScroll){
        container.scrollLeft = 0;
      }
    }, 16); // ~60fps
  }

  function stopAuto(){
    if(autoScrollId){
      clearInterval(autoScrollId);
      autoScrollId = null;
    }
  }

  // Start auto-scroll
  startAuto();

  // Mouse wheel scrolls horizontally
  container.addEventListener('wheel', (e)=>{
    // Convert vertical wheel into horizontal scroll
    if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    } else if(e.deltaX !== 0){
      e.preventDefault();
      container.scrollLeft += e.deltaX;
    }
  }, { passive: false });

  // Optional: pause auto-scroll while user is actively moving mouse wheel
  let wheelTimeout;
  container.addEventListener('wheel', ()=>{
    stopAuto();
    clearTimeout(wheelTimeout);
    wheelTimeout = setTimeout(startAuto, 800);
  });
}

/* ---------- Theme helpers ---------- */
function getTheme(){
  return localStorage.getItem('tp_theme') || 'light';
}
function applyTheme(){
  const t = getTheme();
  const isDark = t === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  document.body.classList.toggle('dark-body', isDark);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.textContent = isDark ? '☀️' : '🌙';
}
function toggleTheme(){
  const current = getTheme();
  localStorage.setItem('tp_theme', current === 'light' ? 'dark' : 'light');
  applyTheme();
}

/* ---------- Service Request Modal ---------- */
function openServiceRequestModal(serviceTitle, serviceKey){
  openModal(`
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">Request: ${escapeHtml(serviceTitle)}</h3>
        <button onclick="closeModal()" class="text-slate-500">✕</button>
      </div>
      <form id="serviceRequestForm" class="space-y-3">
        <input name="name" placeholder="Your name" class="w-full p-2 border rounded" required />
        <input name="details" placeholder="Email or phone" class="w-full p-2 border rounded" required />
        <textarea name="message" placeholder="Describe your requirements" class="w-full p-2 border rounded" rows="5" required>Hi — I'm interested in ${serviceTitle}. Please tell me how we can proceed.</textarea>
        <div class="text-right">
          <button class="px-4 py-2 bg-indigo-600 text-white rounded">Send Request</button>
        </div>
      </form>
    </div>
  `);

  // submit handler - reuse same logic as contact form
  document.getElementById('serviceRequestForm').addEventListener('submit', async function(ev){
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const obj = {
      name: fd.get('name'),
      details: fd.get('details'),
      message: fd.get('message')
    };

    // try backend
    const result = await postToSheet(obj);
    const alertHtml = result && result.ok
      ? 'Thanks — your request was sent. We will contact you soon.'
      : 'Could not reach backend — saved locally in this browser. You can export submissions.';

    // close modal and show a short alert
    closeModal();
    const tmp = document.createElement('div');
    tmp.className = 'fixed right-6 bottom-6 p-3 rounded-lg shadow bg-white border';
    tmp.innerText = alertHtml;
    document.body.appendChild(tmp);
    setTimeout(()=> tmp.remove(), 3500);

    // fallback: save locally
    if(!(result && result.ok)){
      const contacts = get(KEYS.contacts) || [];
      contacts.push({
        id: Date.now(),
        name: obj.name,
        details: obj.details,
        message: `[Service: ${serviceKey || serviceTitle}] ` + obj.message,
        created: new Date().toISOString()
      });
      set(KEYS.contacts, contacts);
    }
  });
}

// delegate clicks for service-request buttons (attach once)
(function wireServiceButtons(){
  const root = document.getElementById('app');
  if(!root) return;
  root.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-service]');
    if(!btn) return;
    const title = btn.getAttribute('data-service');
    const key = btn.getAttribute('data-service-key') || '';
    openServiceRequestModal(title, key);
  });
})();

function renderFilteredProjects(tag){
  const all = get(KEYS.projects) || [];
  const filtered = tag === 'all' ? all : all.filter(p=> (p.tags||[]).includes(tag));
  const grid = document.getElementById('projectsGrid');
  if(!grid) return;
  grid.innerHTML = filtered.map(p=>projectCardHtml(p)).join('');
}

// Project preview/edit/delete
function openProjectPreview(id){
  const p = (get(KEYS.projects)||[]).find(x=>x.id==id);
  if(!p) return alert('Not found');
  openModal(`
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">${escapeHtml(p.title)}</h3>
        <button onclick="closeModal()" class="text-slate-500">✕</button>
      </div>
      ${
        p.video
          ? `<video controls class="w-full max-h-80 rounded"><source src="${escapeHtml(p.video)}" type="video/mp4"></video>`
          : '<div class="w-full h-48 bg-slate-100 rounded flex items-center justify-center text-slate-500">No demo</div>'
      }
      <p class="mt-4">${escapeHtml(p.abstract)}</p>
      <div class="mt-4 text-right">
        ${p.ppt ? `<button class="px-4 py-2 bg-indigo-600 text-white rounded" onclick="handlePPT(${p.id})">View PPT</button>` : ''}
        <button onclick="closeModal()" class="px-4 py-2 border rounded">Close</button>
      </div>
    </div>`);
}

function handlePPT(id){
  const p = (get(KEYS.projects)||[]).find(x=>x.id==id);
  if(!p) return;
  if(!p.ppt) return alert('No PPT available');
  if(!isLoggedIn()){
    openLoginModal(()=>{ window.open(p.ppt,'_blank'); });
  } else {
    window.open(p.ppt,'_blank');
  }
}

function openProjectEdit(id){
  if(!isAdmin()) return alert('Only admin');
  const p = (get(KEYS.projects)||[]).find(x=>x.id==id) || {};
  openModal(`
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">${p.id?'Edit':'New'} Project</h3>
        <button onclick="closeModal()" class="text-slate-500">✕</button>
      </div>
      <form id="projEditForm" class="space-y-3">
        <input name="title" placeholder="Title" value="${escapeHtml(p.title||'')}" class="w-full p-2 border rounded" required />
        <textarea name="abstract" placeholder="Abstract" class="w-full p-2 border rounded" required>${escapeHtml(p.abstract||'')}</textarea>
        <div class="grid grid-cols-2 gap-3">
          <input name="algo" placeholder="Algorithm" value="${escapeHtml(p.algo||'')}" class="p-2 border rounded" />
          <input name="tech" placeholder="Tech stack" value="${escapeHtml(p.tech||'')}" class="p-2 border rounded" />
        </div>
        <input name="video" placeholder="Video MP4 URL" value="${escapeHtml(p.video||'')}" class="w-full p-2 border rounded" />
        <input name="ppt" placeholder="PPT/PDF URL" value="${escapeHtml(p.ppt||'')}" class="w-full p-2 border rounded" />
        <input name="tags" placeholder="Comma separated tags" value="${escapeHtml((p.tags||[]).join(','))}" class="w-full p-2 border rounded" />
        <div class="text-right">
          <button class="px-4 py-2 bg-green-600 text-white rounded">Save</button>
        </div>
      </form>
    </div>`);
  document.getElementById('projEditForm').addEventListener('submit', (ev)=>{
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const projects = get(KEYS.projects)||[];
    const obj = {
      title: fd.get('title'),
      abstract: fd.get('abstract'),
      algo: fd.get('algo'),
      tech: fd.get('tech'),
      video: fd.get('video'),
      ppt: fd.get('ppt'),
      tags: fd.get('tags') ? fd.get('tags').split(',').map(s=>s.trim()) : []
    };
    if(p.id){
      const idx = projects.findIndex(x=>x.id==p.id);
      projects[idx] = { ...projects[idx], ...obj };
    } else {
      obj.id = Date.now();
      projects.unshift(obj);
    }
    set(KEYS.projects, projects);
    closeModal();
    route();
  });
}

function deleteProject(id){
  if(!confirm('Delete project?')) return;
  const projects = (get(KEYS.projects)||[]).filter(x=>x.id!=id);
  set(KEYS.projects, projects);
  route();
}

// Auth modal
function openLoginModal(after){
  openModal(`
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">Sign in / Register</h3>
        <button onclick="closeModal()" class="text-slate-500">✕</button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h4 class="font-semibold">Sign in</h4>
          <form id="loginForm">
            <input name="email" placeholder="Email" required class="w-full p-2 border rounded" />
            <input name="password" type="password" placeholder="Password" required class="w-full p-2 border rounded" />
            <div class="text-right mt-2">
              <button class="px-4 py-2 bg-indigo-600 text-white rounded">Sign in</button>
            </div>
          </form>
        </div>
        <div>
          <h4 class="font-semibold">Register</h4>
          <form id="regForm">
            <input name="name" placeholder="Name" class="w-full p-2 border rounded" />
            <input name="email" placeholder="Email" required class="w-full p-2 border rounded" />
            <input name="password" type="password" placeholder="Password" required class="w-full p-2 border rounded" />
            <div class="text-right mt-2">
              <button class="px-4 py-2 border rounded">Register</button>
            </div>
          </form>
        </div>
      </div>
    </div>`);
  document.getElementById('loginForm').addEventListener('submit',(ev)=>{
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const users = get(KEYS.users)||[];
    const u = users.find(x=>x.email===fd.get('email') && x.password===fd.get('password'));
    if(!u) return alert('Invalid credentials');
    set(KEYS.session, { id: u.id, email: u.email, role: u.role, name: u.name });
    updateAuthUI();
    closeModal();
    if(after) after();
  });
  document.getElementById('regForm').addEventListener('submit',(ev)=>{
    ev.preventDefault();
    const fd = new FormData(ev.target);
    const users = get(KEYS.users)||[];
    if(users.find(x=>x.email===fd.get('email'))) return alert('Email exists');
    const id = Date.now();
    const obj = {
      id,
      email: fd.get('email'),
      password: fd.get('password'),
      role: 'user',
      name: fd.get('name')||fd.get('email')
    };
    users.push(obj);
    set(KEYS.users, users);
    set(KEYS.session, { id, email: obj.email, role: obj.role, name: obj.name });
    updateAuthUI();
    closeModal();
  });
}

// Update header auth UI
function updateAuthUI(){
  const s = get(KEYS.session);
  const sign = document.getElementById('btnOpenLogin');
  const out = document.getElementById('btnLogout');
  const viewBtn = document.getElementById('btnViewContacts');

  if(s){
    if(sign) sign.classList.add('hidden');
    if(out) out.classList.remove('hidden');
    if(viewBtn){
      if(s.role === 'admin') viewBtn.classList.remove('hidden');
      else viewBtn.classList.add('hidden');
    }
  } else {
    if(sign) sign.classList.remove('hidden');
    if(out) out.classList.add('hidden');
    if(viewBtn) viewBtn.classList.add('hidden');
  }
}

/* ---------- CONTACT UTILITIES ---------- */
function exportContactsCSV(){
  const contacts = get(KEYS.contacts) || [];
  if(!contacts.length) return alert('No submissions yet');
  const header = ['id','created','name','details','message'];
  const rows = contacts.map(c=>header.map(h=>{
    const v = c[h]===undefined || c[h]===null ? '' : String(c[h]);
    return '"' + v.replace(/"/g,'""') + '"';
  }).join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `techpro_contacts_${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function downloadContactsJSON(){
  const contacts = get(KEYS.contacts) || [];
  if(!contacts.length) return alert('No submissions yet');
  const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `techpro_contacts_${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openContactsViewer(){
  const contacts = get(KEYS.contacts) || [];
  const rows = contacts.map(c=>`
    <tr class="border-b">
      <td class="p-2 text-sm">${escapeHtml(c.created)}</td>
      <td class="p-2 text-sm">${escapeHtml(c.name)}</td>
      <td class="p-2 text-sm">${escapeHtml(c.details||'')}</td>
      <td class="p-2 text-sm">${escapeHtml(c.message||'')}</td>
    </tr>`).join('');
  openModal(`
    <div>
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-bold">Submissions (${contacts.length})</h3>
        <button onclick="closeModal()" class="text-slate-500">✕</button>
      </div>
      <div class="overflow-auto max-h-[60vh]">
        <table class="w-full">
          <thead class="bg-slate-100">
            <tr>
              <th class="p-2 text-left">Date</th>
              <th class="p-2 text-left">Name</th>
              <th class="p-2 text-left">Details</th>
              <th class="p-2 text-left">Message</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td class="p-2">No submissions</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="mt-4 text-right">
        <button onclick="exportContactsCSV()" class="px-3 py-2 border rounded">Export CSV</button>
        <button onclick="downloadContactsJSON()" class="ml-2 px-3 py-2 border rounded">Download JSON</button>
      </div>
    </div>`);
}

/* ---------- Backend POST helper ---------- */
async function postToSheet(payload){
  if(!SHEET_ENDPOINT) {
    return { ok: false, reason: 'no_endpoint' };
  }
  try {
    const body = { ...payload };
    if(SHEET_SECRET) body.secret = SHEET_SECRET;
    body.meta = { source: 'techpro-spa', userAgent: navigator.userAgent };
    const res = await fetch(SHEET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      mode: 'cors',
      body: JSON.stringify(body),
    });
    const text = await res.text();
    try { return JSON.parse(text); } catch(e){ return { ok: false, error: 'invalid_response', text }; }
  } catch(err){
    console.error('postToSheet error', err);
    return { ok: false, error: err.toString() };
  }
}

// On load
window.addEventListener('hashchange', route);
window.addEventListener('load', ()=>{
  updateAuthUI();
  if(!location.hash) location.hash = '#/';
  else route();
  applyTheme();
});
