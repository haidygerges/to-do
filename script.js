let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let darkMode = true;

function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function addTask() {
  const input = document.getElementById('taskInput');
  const dateInput = document.getElementById('dueDateInput');
  const text = input.value.trim();

  if (!text) {
    input.classList.add('border-red-500');
    setTimeout(() => input.classList.remove('border-red-500'), 1000);
    return;
  }

  tasks.push({
    id: Date.now(),
    text: text,
    done: false,
    starred: false,
    dueDate: dateInput.value
  });

  input.value = '';
  dateInput.value = '';
  save();
  renderTasks();
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  save();
  renderTasks();
}

function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.done = !task.done;
  save();
  renderTasks();
}

function toggleStar(id) {
  const task = tasks.find(t => t.id === id);
  if (task) task.starred = !task.starred;
  tasks.sort((a, b) => b.starred - a.starred);
  save();
  renderTasks();
}

function editTask(id, el) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;

  const inp = document.createElement('input');
  inp.className = 'edit-input text-sm';
  inp.value = task.text;
  el.replaceWith(inp);
  inp.focus();

  function saveEdit(e) {
    if (e.type === 'blur' || e.key === 'Enter') {
      const newText = inp.value.trim();
      if (newText) task.text = newText;
      save();
      renderTasks();
    }
  }

  inp.addEventListener('blur', saveEdit);
  inp.addEventListener('keydown', saveEdit);
}

function setFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  save();
  renderTasks();
}

function toggleMode() {
  darkMode = !darkMode;
  document.body.classList.toggle('light-mode', !darkMode);
  document.getElementById('modeToggleBtn').textContent = darkMode ? '🌙' : '☀️';
}

function renderTasks() {
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  const list = document.getElementById('taskList');
  const emptyMsg = document.getElementById('emptyMsg');

  list.innerHTML = '';

  let filtered = tasks.filter(task => {
    if (currentFilter === 'active') return !task.done;
    if (currentFilter === 'completed') return task.done;
    if (currentFilter === 'starred') return task.starred;
    return true;
  });

  filtered = filtered.filter(task =>
    task.text.toLowerCase().includes(searchQuery)
  );

  document.getElementById('totalCount').textContent = tasks.length;
  document.getElementById('doneCount').textContent = tasks.filter(t => t.done).length;
  document.getElementById('leftCount').textContent = tasks.filter(t => !t.done).length;

  if (filtered.length === 0) {
    emptyMsg.classList.remove('hidden');
    return;
  }
  emptyMsg.classList.add('hidden');

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.dataset.id = task.id;
    li.className = `task-card rounded-xl px-4 py-3 flex items-center gap-3 ${task.done ? 'finished' : ''}`;

    let dueBadge = '';
    if (task.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      const overdue = task.dueDate < today && !task.done;
      const color = overdue ? 'bg-red-500/30 text-red-300' : 'bg-purple-500/20 text-purple-300';
      dueBadge = `<span class="text-xs px-2 py-0.5 rounded-full ${color}">${task.dueDate}</span>`;
    }

    li.innerHTML = `
      <span class="icon-btn text-xl" onclick="toggleStar(${task.id})" title="Toggle important">
        ${task.starred ? '⭐' : '☆'}
      </span>
      <span class="task-title flex-1 text-white text-sm cursor-pointer min-w-0" ondblclick="editTask(${task.id}, this)" title="Double-click to edit">
        ${task.text}
      </span>
      ${dueBadge}
      <span class="icon-btn text-lg" onclick="deleteTask(${task.id})" title="Delete task">🗑️</span>
      <span class="icon-btn text-lg" onclick="toggleDone(${task.id})" title="${task.done ? 'Mark as unfinished' : 'Mark as finished'}">
        ${task.done ? '❤️' : '😡'}
      </span>
    `;

    list.appendChild(li);
  });

  Sortable.create(list, {
    animation: 150,
    ghostClass: 'drag-ghost',
    onEnd() {
      const newOrder = [...list.querySelectorAll('li')].map(li => parseInt(li.dataset.id));
      tasks.sort((a, b) => newOrder.indexOf(a.id) - newOrder.indexOf(b.id));
      save();
    }
  });
}

renderTasks();