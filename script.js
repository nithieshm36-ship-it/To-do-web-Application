// ── APP STATE ──
let lists = {
  'Personal': [
    { id: 1, title: 'Buy groceries', done: false, date: '', time: '' },
    { id: 2, title: 'Call the dentist', done: true, date: '', time: '' }
  ],
  'Work': [
    { id: 3, title: 'Finish project proposal', done: false, date: '2026-06-25', time: '17:00' }
  ]
};

let activeList = 'Personal';
let nextId = 4;
let editingId = null; // id of the task currently being edited (null = none)

const tabsEl = document.getElementById('list-tabs');
const taskListEl = document.getElementById('task-list');
const countEl = document.getElementById('count-label');

// ── RENDER LIST TABS ──
function renderTabs() {
  tabsEl.innerHTML = '';

  Object.keys(lists).forEach(name => {
    const btn = document.createElement('button');
    btn.className = 'list-tab' + (name === activeList ? ' active' : '');
    btn.textContent = name;
    btn.addEventListener('click', () => {
      activeList = name;
      editingId = null;
      renderTabs();
      renderTasks();
    });
    tabsEl.appendChild(btn);
  });

  // "+ List" button to create a new list
  const addBtn = document.createElement('button');
  addBtn.className = 'list-tab list-tab-add';
  addBtn.innerHTML = '<i class="ti ti-plus"></i> List';
  addBtn.addEventListener('click', createNewList);
  tabsEl.appendChild(addBtn);
}

function createNewList() {
  const name = prompt('New list name:');
  if (name && name.trim() && !lists[name.trim()]) {
    lists[name.trim()] = [];
    activeList = name.trim();
    renderTabs();
    renderTasks();
  }
}

// ── HELPERS ──
function formatDateTime(date, time) {
  if (!date) return '';
  const d = new Date(date + 'T' + (time || '00:00'));
  const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = time ? d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }) : '';
  return dateStr + (timeStr ? ' · ' + timeStr : '');
}

// ── RENDER TASK LIST ──
function renderTasks() {
  const tasks = lists[activeList];
  const doneCount = tasks.filter(t => t.done).length;
  countEl.textContent = tasks.length === 0 ? '' : doneCount + ' of ' + tasks.length + ' completed';

  taskListEl.innerHTML = '';

  if (tasks.length === 0) {
    taskListEl.innerHTML =
      '<div class="empty-state"><i class="ti ti-checklist"></i>No tasks yet. Add one above.</div>';
    return;
  }

  tasks.forEach(task => taskListEl.appendChild(renderTaskItem(task)));
}

function renderTaskItem(task) {
  const item = document.createElement('div');
  item.className = 'task-item' + (task.done ? ' done' : '');

  // Checkbox toggle
  const checkbox = document.createElement('button');
  checkbox.className = 'checkbox' + (task.done ? ' done' : '');
  checkbox.setAttribute('aria-label', task.done ? 'Mark incomplete' : 'Mark complete');
  checkbox.innerHTML = task.done ? '<i class="ti ti-check"></i>' : '';
  checkbox.addEventListener('click', () => toggleComplete(task.id));
  item.appendChild(checkbox);

  // Body: either edit form or display text
  const body = document.createElement('div');
  body.className = 'task-body';

  if (editingId === task.id) {
    body.appendChild(renderEditForm(task));
  } else {
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    body.appendChild(title);

    const meta = formatDateTime(task.date, task.time);
    if (meta) {
      const metaEl = document.createElement('div');
      metaEl.className = 'task-meta';
      metaEl.innerHTML = '<i class="ti ti-calendar"></i>' + meta;
      body.appendChild(metaEl);
    }
  }
  item.appendChild(body);

  // Action buttons: edit / delete
  const actions = document.createElement('div');
  actions.className = 'task-actions';

  const editBtn = document.createElement('button');
  editBtn.className = 'icon-btn';
  editBtn.setAttribute('aria-label', 'Edit task');
  editBtn.innerHTML = '<i class="ti ti-edit"></i>';
  editBtn.addEventListener('click', () => toggleEdit(task.id));
  actions.appendChild(editBtn);

  const delBtn = document.createElement('button');
  delBtn.className = 'icon-btn';
  delBtn.setAttribute('aria-label', 'Delete task');
  delBtn.innerHTML = '<i class="ti ti-trash"></i>';
  delBtn.addEventListener('click', () => deleteTask(task.id));
  actions.appendChild(delBtn);

  item.appendChild(actions);
  return item;
}

function renderEditForm(task) {
  const editRow = document.createElement('div');
  editRow.className = 'edit-row';

  const titleInput = document.createElement('input');
  titleInput.type = 'text';
  titleInput.value = task.title;

  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.value = task.date || '';

  const timeInput = document.createElement('input');
  timeInput.type = 'time';
  timeInput.value = task.time || '';

  const saveBtn = document.createElement('button');
  saveBtn.textContent = 'Save';
  saveBtn.addEventListener('click', () => {
    saveEdit(task.id, titleInput.value, dateInput.value, timeInput.value);
  });

  editRow.appendChild(titleInput);
  editRow.appendChild(dateInput);
  editRow.appendChild(timeInput);
  editRow.appendChild(saveBtn);
  return editRow;
}

// ── TASK ACTIONS ──
function toggleComplete(id) {
  const task = lists[activeList].find(t => t.id === id);
  if (task) task.done = !task.done;
  renderTasks();
}

function toggleEdit(id) {
  editingId = editingId === id ? null : id;
  renderTasks();
}

function saveEdit(id, title, date, time) {
  const task = lists[activeList].find(t => t.id === id);
  if (task) {
    task.title = title.trim() || task.title;
    task.date = date;
    task.time = time;
  }
  editingId = null;
  renderTasks();
}

function deleteTask(id) {
  lists[activeList] = lists[activeList].filter(t => t.id !== id);
  renderTasks();
}

// ── ADD NEW TASK ──
function addTask() {
  const input = document.getElementById('new-task-input');
  const dateInput = document.getElementById('new-task-date');
  const timeInput = document.getElementById('new-task-time');

  const title = input.value.trim();
  if (!title) return;

  lists[activeList].push({
    id: nextId++,
    title,
    done: false,
    date: dateInput.value,
    time: timeInput.value
  });

  input.value = '';
  dateInput.value = '';
  timeInput.value = '';
  renderTasks();
}

document.getElementById('add-btn').addEventListener('click', addTask);
document.getElementById('new-task-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') addTask();
});

// ── INITIAL RENDER ──
renderTabs();
renderTasks();
