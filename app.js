// ========== PAGE NAVIGATION ==========
function show(pageId) {
  // Hide all pages
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });
  
  // Show selected page
  const page = document.getElementById(`page-${pageId}`);
  if (page) {
    page.classList.add('active');
  }
  
  // Update navigation
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelectorAll('.bnav-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Mark current tab as active
  document.querySelectorAll(`[onclick="show('${pageId}')"]`).forEach(el => {
    el.classList.add('active');
  });
}

// ========== TODO LIST MANAGEMENT ==========
let todos = JSON.parse(localStorage.getItem('todos')) || [];

function addTodo() {
  const title = document.getElementById('newTaskTitle').value.trim();
  const category = document.getElementById('newTaskCategory').value;
  const deadline = document.getElementById('newTaskDeadline').value;
  
  if (!title) {
    alert('Please enter a task title');
    return;
  }
  
  const todo = {
    id: Date.now(),
    title,
    category,
    deadline,
    completed: false,
    createdAt: new Date().toISOString()
  };
  
  todos.push(todo);
  saveTodos();
  
  // Clear inputs
  document.getElementById('newTaskTitle').value = '';
  document.getElementById('newTaskDeadline').value = '';
  
  renderTodos('all');
  renderDashboardTodos();
}

function deleteTodo(id) {
  todos = todos.filter(todo => todo.id !== id);
  saveTodos();
  renderTodos('all');
  renderDashboardTodos();
}

function toggleTodo(id) {
  const todo = todos.find(t => t.id === id);
  if (todo) {
    todo.completed = !todo.completed;
    saveTodos();
    renderTodos('all');
    renderDashboardTodos();
  }
}

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function filterTodos(filter) {
  // Update active button
  document.querySelectorAll(`[onclick*="filterTodos"]`).forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`).classList.add('active');
  
  renderTodos(filter);
}

function renderTodos(filter = 'all') {
  const todoList = document.getElementById('todoList');
  let filtered = todos;
  
  if (filter === 'school') {
    filtered = todos.filter(t => t.category === 'school');
  } else if (filter === 'work') {
    filtered = todos.filter(t => t.category === 'work');
  } else if (filter === 'aws') {
    filtered = todos.filter(t => t.category === 'aws');
  } else if (filter === 'internship') {
    filtered = todos.filter(t => t.category === 'internship');
  } else if (filter === 'overdue') {
    filtered = todos.filter(t => {
      if (!t.deadline) return false;
      return new Date(t.deadline) < new Date() && !t.completed;
    });
  }
  
  if (filtered.length === 0) {
    todoList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted)">No tasks</div>';
    return;
  }
  
  todoList.innerHTML = filtered.map(todo => {
    const deadline = todo.deadline ? new Date(todo.deadline) : null;
    const today = new Date();
    const isOverdue = deadline && deadline < today && !todo.completed;
    const isDueToday = deadline && deadline.toDateString() === today.toDateString();
    
    return `
      <div class="todo-item ${isOverdue ? 'overdue' : ''} ${isDueToday ? 'due-today' : ''} ${todo.completed ? 'completed' : ''}">
        <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" onclick="toggleTodo(${todo.id})">
          ${todo.completed ? '✓' : ''}
        </div>
        <div class="todo-content">
          <div class="todo-title">${todo.title}</div>
          <div class="todo-meta">
            ${getCategoryEmoji(todo.category)} ${todo.category.charAt(0).toUpperCase() + todo.category.slice(1)}
            ${todo.deadline ? `• Due: ${formatDate(todo.deadline)}` : ''}
          </div>
        </div>
        <button class="btn" style="padding:4px 8px;font-size:11px" onclick="deleteTodo(${todo.id})">Delete</button>
      </div>
    `;
  }).join('');
}

function renderDashboardTodos() {
  // School todos (first 3)
  const schoolTodos = todos.filter(t => t.category === 'school' && !t.completed).slice(0, 3);
  const schoolHtml = schoolTodos.map(todo => `
    <div class="todo-item" style="margin-bottom:8px">
      <div class="todo-checkbox" onclick="toggleTodo(${todo.id})"></div>
      <div class="todo-content" style="flex:1">
        <div class="todo-title">${todo.title}</div>
        <div class="todo-meta" style="font-size:10px">${todo.deadline ? formatDate(todo.deadline) : 'No deadline'}</div>
      </div>
    </div>
  `).join('') || '<div style="color:var(--muted);font-size:12px">No school tasks</div>';
  
  // Work todos (first 3)
  const workTodos = todos.filter(t => (t.category === 'work' || t.category === 'aws' || t.category === 'internship') && !t.completed).slice(0, 3);
  const workHtml = workTodos.map(todo => `
    <div class="todo-item" style="margin-bottom:8px">
      <div class="todo-checkbox" onclick="toggleTodo(${todo.id})"></div>
      <div class="todo-content" style="flex:1">
        <div class="todo-title">${todo.title}</div>
        <div class="todo-meta" style="font-size:10px">${getCategoryEmoji(todo.category)} ${todo.deadline ? formatDate(todo.deadline) : 'No deadline'}</div>
      </div>
    </div>
  `).join('') || '<div style="color:var(--muted);font-size:12px">No work tasks</div>';
  
  document.getElementById('schoolTodoList').innerHTML = schoolHtml;
  document.getElementById('workTodoList').innerHTML = workHtml;
}

function getCategoryEmoji(category) {
  const emojis = {
    school: '🎓',
    work: '💼',
    aws: '☁️',
    internship: '💼'
  };
  return emojis[category] || '📋';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === tomorrow.toDateString()) {
    return 'Tomorrow';
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
}

// ========== AWS NOTES ==========
function saveAWSNote() {
  const notes = document.getElementById('awsNotes').value;
  localStorage.setItem('awsNotes', notes);
  alert('AWS notes saved!');
}

function loadAWSNote() {
  const notes = localStorage.getItem('awsNotes') || '';
  const textarea = document.getElementById('awsNotes');
  if (textarea) {
    textarea.value = notes;
  }
}

// ========== BOOKS MANAGEMENT ==========
let books = JSON.parse(localStorage.getItem('books')) || [];

function addBook() {
  const title = document.getElementById('bookTitle').value.trim();
  const author = document.getElementById('bookAuthor').value.trim();
  const category = document.getElementById('bookCategory').value;
  
  if (!title || !author) {
    alert('Please enter book title and author');
    return;
  }
  
  const book = {
    id: Date.now(),
    title,
    author,
    category,
    progress: 0,
    addedAt: new Date().toISOString()
  };
  
  books.push(book);
  localStorage.setItem('books', JSON.stringify(books));
  
  document.getElementById('bookTitle').value = '';
  document.getElementById('bookAuthor').value = '';
  
  renderBooks();
}

function renderBooks() {
  const bookList = document.getElementById('bookList');
  
  if (books.length === 0) {
    bookList.innerHTML = '<div style="text-align:center;padding:2rem;color:var(--muted)">No books added yet</div>';
    return;
  }
  
  bookList.innerHTML = books.map(book => `
    <div class="card" style="margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div style="flex:1">
          <div style="font-size:14px;font-weight:700">${book.title}</div>
          <div style="font-size:12px;color:var(--muted);margin:4px 0">${book.author}</div>
          <div style="font-size:11px;color:var(--muted);margin:8px 0">${book.category}</div>
          <div style="display:flex;gap:8px;align-items:center;margin-top:8px">
            <input type="range" min="0" max="100" value="${book.progress}" 
              onchange="updateBookProgress(${book.id}, this.value)" 
              style="flex:1;cursor:pointer">
            <span style="font-size:12px;font-weight:600">${book.progress}%</span>
          </div>
        </div>
        <button class="btn" style="padding:4px 8px;font-size:11px" onclick="deleteBook(${book.id})">Delete</button>
      </div>
    </div>
  `).join('');
}

function updateBookProgress(id, progress) {
  const book = books.find(b => b.id === id);
  if (book) {
    book.progress = parseInt(progress);
    localStorage.setItem('books', JSON.stringify(books));
    renderBooks();
  }
}

function deleteBook(id) {
  books = books.filter(b => b.id !== id);
  localStorage.setItem('books', JSON.stringify(books));
  renderBooks();
}

// ========== COMPANIES TRACKING ==========
let companies = JSON.parse(localStorage.getItem('companies')) || [];

function addCompany() {
  const name = prompt('Company name:');
  if (!name) return;
  
  const company = {
    id: Date.now(),
    name,
    status: 'applied',
    appliedAt: new Date().toISOString(),
    notes: ''
  };
  
  companies.push(company);
  localStorage.setItem('companies', JSON.stringify(companies));
  renderCompanies();
}

function renderCompanies() {
  const list = document.getElementById('companyList');
  
  if (companies.length === 0) {
    list.innerHTML = '<div style="color:var(--muted);text-align:center;padding:2rem">No companies tracked yet</div>';
    return;
  }
  
  list.innerHTML = companies.map(company => `
    <div class="company-card">
      <h4>${company.name}</h4>
      <div style="font-size:11px;color:var(--muted);margin-bottom:8px">
        Applied: ${new Date(company.appliedAt).toLocaleDateString()}
      </div>
      <select onchange="updateCompanyStatus(${company.id}, this.value)" 
        style="background:var(--surface2);border:1px solid var(--border);border-radius:6px;color:var(--text);font-size:12px;padding:6px;outline:none;margin-bottom:8px">
        <option value="applied" ${company.status === 'applied' ? 'selected' : ''}>Applied</option>
        <option value="interviewed" ${company.status === 'interviewed' ? 'selected' : ''}>Interviewed</option>
        <option value="rejected" ${company.status === 'rejected' ? 'selected' : ''}>Rejected</option>
        <option value="offer" ${company.status === 'offer' ? 'selected' : ''}>Offer</option>
      </select>
      <button class="btn" style="font-size:11px;padding:4px 8px" onclick="deleteCompany(${company.id})">Delete</button>
    </div>
  `).join('');
}

function updateCompanyStatus(id, status) {
  const company = companies.find(c => c.id === id);
  if (company) {
    company.status = status;
    localStorage.setItem('companies', JSON.stringify(companies));
    renderCompanies();
  }
}

function deleteCompany(id) {
  companies = companies.filter(c => c.id !== id);
  localStorage.setItem('companies', JSON.stringify(companies));
  renderCompanies();
}

// ========== TIMER FUNCTIONALITY ==========
let timerState = {
  module: null,
  lo: null,
  duration: null,
  elapsed: 0,
  isRunning: false,
  isPaused: false,
  startTime: null,
  pausedTime: 0
};

let timerInterval = null;
let sessionLog = JSON.parse(localStorage.getItem('sessionLog')) || [];

function timerPickMod(mod) {
  timerState.module = mod;
  
  // Highlight selected module
  document.querySelectorAll('[id^="tmod-"]').forEach(btn => btn.style.background = '');
  document.getElementById(`tmod-${mod}`).style.background = 'rgba(79,156,249,.2)';
  
  // Show LO picker
  const loPicker = document.getElementById('timerLOPicker');
  loPicker.innerHTML = `
    <div style="font-size:14px;font-weight:700;margin-bottom:.5rem">Pick a Learning Outcome</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn" onclick="timerPickLO('LO1')">LO1</button>
      <button class="btn" onclick="timerPickLO('LO2')">LO2</button>
      <button class="btn" onclick="timerPickLO('LO3')">LO3</button>
      <button class="btn" onclick="timerPickLO('LO4')">LO4</button>
    </div>
  `;
}

function timerPickLO(lo) {
  timerState.lo = lo;
}

function timerSetDur(minutes) {
  timerState.duration = minutes;
  
  // Highlight selected duration
  document.querySelectorAll('[id^="tdur-"]').forEach(btn => btn.style.background = '');
  document.getElementById(`tdur-${minutes}`).style.background = 'rgba(79,156,249,.2)';
}

function timerStart() {
  if (!timerState.module || !timerState.lo || !timerState.duration) {
    alert('Please select module, LO, and duration');
    return;
  }
  
  timerState.isRunning = true;
  timerState.startTime = Date.now() - timerState.pausedTime * 1000;
  timerState.elapsed = 0;
  
  document.getElementById('timerSetupCard').style.display = 'none';
  document.getElementById('timerActiveCard').style.display = 'block';
  
  document.getElementById('timerModLabel').textContent = timerState.module;
  document.getElementById('timerLOLabel').textContent = timerState.lo;
  
  timerInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
  if (!timerState.isRunning) return;
  
  timerState.elapsed = Math.floor((Date.now() - timerState.startTime) / 1000);
  
  const minutes = Math.floor(timerState.elapsed / 60);
  const seconds = timerState.elapsed % 60;
  const totalSeconds = timerState.duration * 60;
  
  document.getElementById('timerDisplay').textContent = 
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  if (timerState.elapsed >= totalSeconds) {
    timerStop();
  }
}

function timerPause() {
  timerState.isRunning = false;
  timerState.isPaused = true;
  timerState.pausedTime = timerState.elapsed;
  
  document.getElementById('timerPauseBtn').style.display = 'none';
  document.getElementById('timerResumeBtn').style.display = 'block';
  document.getElementById('timerStatus').textContent = 'Session paused...';
}

function timerResume() {
  timerState.isRunning = true;
  timerState.isPaused = false;
  
  document.getElementById('timerPauseBtn').style.display = 'block';
  document.getElementById('timerResumeBtn').style.display = 'none';
  document.getElementById('timerStatus').textContent = 'Session running...';
}

function timerStop() {
  timerState.isRunning = false;
  clearInterval(timerInterval);
  
  document.getElementById('timerActiveCard').style.display = 'none';
  document.getElementById('timerLogCard').style.display = 'block';
  
  const minutes = Math.floor(timerState.elapsed / 60);
  const seconds = timerState.elapsed % 60;
  document.getElementById('timerLogSummary').innerHTML = `
    <strong>${timerState.module}</strong> • ${timerState.lo} • 
    ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}
  `;
}

function timerSetConf(level) {
  // Highlight confidence level
  document.querySelectorAll('[id^="conf-"]').forEach(btn => btn.style.opacity = '0.5');
  document.getElementById(`conf-${level}`).style.opacity = '1';
}

function timerSaveLog() {
  const covered = document.getElementById('timerLogCovered').value;
  const confLevel = Array.from(document.querySelectorAll('[id^="conf-"]')).findIndex(btn => btn.style.opacity !== '0.5') + 1;
  
  const log = {
    id: Date.now(),
    module: timerState.module,
    lo: timerState.lo,
    duration: timerState.duration,
    elapsed: timerState.elapsed,
    covered: covered || 'Not specified',
    confidence: confLevel || 3,
    date: new Date().toISOString()
  };
  
  sessionLog.push(log);
  localStorage.setItem('sessionLog', JSON.stringify(sessionLog));
  
  // Reset form
  timerState = {
    module: null,
    lo: null,
    duration: null,
    elapsed: 0,
    isRunning: false,
    isPaused: false,
    startTime: null,
    pausedTime: 0
  };
  
  document.getElementById('timerLogCard').style.display = 'none';
  document.getElementById('timerSetupCard').style.display = 'block';
  document.getElementById('timerSetupCard').style.innerHTML = '';
  
  renderSessionHistory();
  alert('Session saved! 🎉');
}

function renderSessionHistory() {
  const history = document.getElementById('timerHistory');
  
  if (sessionLog.length === 0) {
    history.innerHTML = '<div style="color:var(--muted);text-align:center">No sessions logged yet</div>';
    return;
  }
  
  history.innerHTML = sessionLog.slice(-5).reverse().map(log => `
    <div class="card" style="margin-bottom:0.75rem;padding:0.75rem">
      <div style="display:flex;justify-content:space-between;align-items:start">
        <div>
          <div style="font-weight:700;font-size:13px">${log.module} • ${log.lo}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:4px">
            ${Math.floor(log.elapsed / 60)}:${String(log.elapsed % 60).padStart(2, '0')} • 
            Confidence: ${'🔥😊😐😕😰'.split('')[log.confidence - 1]}
          </div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">${new Date(log.date).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  `).join('');
}

function timerClearLog() {
  if (confirm('Clear all session logs?')) {
    sessionLog = [];
    localStorage.setItem('sessionLog', JSON.stringify(sessionLog));
    renderSessionHistory();
  }
}

// ========== INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
  renderTodos('all');
  renderDashboardTodos();
  loadAWSNote();
  renderBooks();
  renderCompanies();
  renderSessionHistory();
  
  // Particle animation (optional)
  initParticles();
});

function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  const particles = [];
  
  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5,
      dx: (Math.random() - 0.5) * 0.5,
      dy: (Math.random() - 0.5) * 0.5,
      opacity: Math.random() * 0.5
    });
  }
  
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgba(79, 156, 249, 0.1)';
    
    particles.forEach(p => {
      p.x += p.dx;
      p.y += p.dy;
      
      if (p.x > canvas.width) p.x = 0;
      if (p.x < 0) p.x = canvas.width;
      if (p.y > canvas.height) p.y = 0;
      if (p.y < 0) p.y = canvas.height;
      
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  
  draw();
  
  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}
