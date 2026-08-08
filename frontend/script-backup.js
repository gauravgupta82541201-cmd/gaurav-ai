const $ = (id) => document.getElementById(id);

const messagesEl = $('messages');
const composer = $('composer');
const userInput = $('userInput');
const statusText = $('statusText');
const aiOrb = $('aiOrb');

let chatHistory = [];
let notes = JSON.parse(localStorage.getItem('gaurav_notes') || '[]');
let tasks = JSON.parse(localStorage.getItem('gaurav_tasks') || '[]');

function saveData() {
  localStorage.setItem('gaurav_notes', JSON.stringify(notes));
  localStorage.setItem('gaurav_tasks', JSON.stringify(tasks));
}

function addMessage(text, role = 'assistant') {
  const item = document.createElement('div');
  item.className = `message ${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'bubble';
  bubble.textContent = text;

  item.appendChild(bubble);
  messagesEl.appendChild(item);
  messagesEl.scrollTop = messagesEl.scrollHeight;

  return item;
}

function setStatus(text) {
  if (statusText) statusText.textContent = text;
}

async function sendToAI(text) {
  if (!text.trim()) return;

  addMessage(text, 'user');
  userInput.value = '';

  const thinking = addMessage('Thinking... 🤖', 'assistant');

  try {
    chatHistory.push({
      role: 'user',
      content: text.trim()
    });

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: chatHistory.slice(-12)
      })
    });

    const data = await response.json();

    console.log('Gaurav AI API:', response.status, data);

    thinking.remove();

    if (!response.ok) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    const reply = String(
      data.reply || 'Mujhe abhi response nahi mila.'
    );

    chatHistory.push({
      role: 'assistant',
      content: reply
    });

    addMessage(reply, 'assistant');

  } catch (error) {
    console.error('AI Chat Error:', error);

    thinking.remove();

    addMessage(
      `⚠️ AI connection error:\n${error.message}`,
      'assistant'
    );
  }
}

function calculate(expression) {
  try {
    const clean = expression
      .replace(/^calculator\s*/i, '')
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/[^0-9+\-*/().% ]/g, '');

    if (!clean.trim()) {
      return 'Calculator mein expression do. Example: calculator 125*8';
    }

    const result = Function(
      `"use strict"; return (${clean})`
    )();

    return `🧮 Answer: ${result}`;
  } catch {
    return '❌ Calculation samajh nahi aayi.';
  }
}

function addNote(text) {
  const note = {
    id: Date.now(),
    text,
    date: new Date().toLocaleString()
  };

  notes.unshift(note);
  saveData();
  renderNotes();
  updateCounts();
}

function addTask(text) {
  const task = {
    id: Date.now(),
    text,
    done: false,
    date: new Date().toLocaleString()
  };

  tasks.unshift(task);
  saveData();
  renderTasks();
  updateCounts();
}

function renderNotes() {
  const list = $('notesList');
  if (!list) return;

  list.innerHTML = '';

  if (!notes.length) {
    list.innerHTML = '<p class="muted">No notes yet.</p>';
    return;
  }

  notes.forEach((note) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div>
        <strong>📝 Note</strong>
        <p>${escapeHtml(note.text)}</p>
        <small>${escapeHtml(note.date)}</small>
      </div>
      <button class="danger" data-delete-note="${note.id}">Delete</button>
    `;

    list.appendChild(card);
  });
}

function renderTasks() {
  const list = $('tasksList');
  if (!list) return;

  list.innerHTML = '';

  if (!tasks.length) {
    list.innerHTML = '<p class="muted">No tasks yet.</p>';
    return;
  }

  tasks.forEach((task) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <div>
        <strong>${task.done ? '✅' : '⬜'} Task</strong>
        <p>${escapeHtml(task.text)}</p>
        <small>${escapeHtml(task.date)}</small>
      </div>
      <div>
        <button data-toggle-task="${task.id}">
          ${task.done ? 'Undo' : 'Done'}
        </button>
        <button class="danger" data-delete-task="${task.id}">
          Delete
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function updateCounts() {
  if ($('noteCount')) {
    $('noteCount').textContent = notes.length;
  }

  if ($('taskCount')) {
    $('taskCount').textContent =
      tasks.filter((task) => !task.done).length;
  }
}

function showView(view) {
  document.querySelectorAll('.view').forEach((el) => {
    el.classList.add('hidden');
  });

  const target = $(`${view}View`);

  if (target) {
    target.classList.remove('hidden');
  }

  document
    .querySelectorAll('.nav-item[data-view]')
    .forEach((button) => {
      button.classList.toggle(
        'active',
        button.dataset.view === view
      );
    });

  const titles = {
    chat: 'Your AI Assistant',
    notes: 'Your Notes',
    tasks: 'Your Tasks',
    calculator: 'Calculator'
  };

  if ($('pageTitle')) {
    $('pageTitle').textContent =
      titles[view] || 'Gaurav AI';
  }

  if (view === 'notes') renderNotes();
  if (view === 'tasks') renderTasks();
}

async function checkBackend() {
  try {
    const response = await fetch('/api/health');
    const data = await response.json();

    console.log('Backend health:', data);

    if (data.ok && data.aiConfigured) {
      setStatus('AI ONLINE');
    } else {
      setStatus('AI OFFLINE');
    }
  } catch (error) {
    console.error('Health check failed:', error);
    setStatus('OFFLINE');
  }
}

composer?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const text = userInput.value.trim();

  if (!text) return;

  // Local calculator command
  if (/^calculator\s+/i.test(text)) {
    addMessage(text, 'user');
    userInput.value = '';
    addMessage(calculate(text), 'assistant');
    return;
  }

  // Local note command
  if (/^note\s+/i.test(text)) {
    const noteText = text.replace(/^note\s+/i, '').trim();

    addMessage(text, 'user');
    userInput.value = '';

    if (noteText) {
      addNote(noteText);
      addMessage(`📝 Note saved: ${noteText}`, 'assistant');
    }

    return;
  }

  // Local task command
  if (/^add task\s+/i.test(text)) {
    const taskText = text.replace(/^add task\s+/i, '').trim();

    addMessage(text, 'user');
    userInput.value = '';

    if (taskText) {
      addTask(taskText);
      addMessage(`✅ Task added: ${taskText}`, 'assistant');
    }

    return;
  }

  // Normal AI message
  await sendToAI(text);
});

document.querySelectorAll('.quick-card').forEach((button) => {
  button.addEventListener('click', () => {
    const command = button.dataset.command || '';

    if (/^calculator\s+/i.test(command)) {
      addMessage(command, 'user');
      addMessage(calculate(command), 'assistant');
      return;
    }

    if (/^note\s+/i.test(command)) {
      const text = command.replace(/^note\s+/i, '').trim();
      addMessage(command, 'user');
      addNote(text);
      addMessage(`📝 Note saved: ${text}`, 'assistant');
      return;
    }

    if (/^add task\s+/i.test(command)) {
      const text = command.replace(/^add task\s+/i, '').trim();
      addMessage(command, 'user');
      addTask(text);
      addMessage(`✅ Task added: ${text}`, 'assistant');
      return;
    }

    sendToAI(command);
  });
});

$('newChatBtn')?.addEventListener('click', () => {
  chatHistory = [];
  messagesEl.innerHTML = '';

  addMessage(
    'New conversation started. 👋 Bolo Gaurav, kya karna hai?',
    'assistant'
  );
});

document
  .querySelectorAll('.nav-item[data-view]')
  .forEach((button) => {
    button.addEventListener('click', () => {
      showView(button.dataset.view);
    });
  });

$('addNoteBtn')?.addEventListener('click', () => {
  $('noteForm')?.classList.toggle('hidden');
  $('noteInput')?.focus();
});

$('saveNoteBtn')?.addEventListener('click', () => {
  const input = $('noteInput');
  const text = input?.value.trim();

  if (!text) return;

  addNote(text);
  input.value = '';
  $('noteForm')?.classList.add('hidden');
});

$('addTaskBtn')?.addEventListener('click', () => {
  $('taskForm')?.classList.toggle('hidden');
  $('taskInput')?.focus();
});

$('saveTaskBtn')?.addEventListener('click', () => {
  const input = $('taskInput');
  const text = input?.value.trim();

  if (!text) return;

  addTask(text);
  input.value = '';
  $('taskForm')?.classList.add('hidden');
});

$('notesList')?.addEventListener('click', (event) => {
  const button = event.target.closest('[data-delete-note]');

  if (!button) return;

  const id = Number(button.dataset.deleteNote);

  notes = notes.filter((note) => note.id !== id);

  saveData();
  renderNotes();
  updateCounts();
});

$('tasksList')?.addEventListener('click', (event) => {
  const deleteButton =
    event.target.closest('[data-delete-task]');

  const toggleButton =
    event.target.closest('[data-toggle-task]');

  if (deleteButton) {
    const id = Number(deleteButton.dataset.deleteTask);

    tasks = tasks.filter((task) => task.id !== id);

    saveData();
    renderTasks();
    updateCounts();
  }

  if (toggleButton) {
    const id = Number(toggleButton.dataset.toggleTask);

    const task = tasks.find((item) => item.id === id);

    if (task) {
      task.done = !task.done;
    }

    saveData();
    renderTasks();
    updateCounts();
  }
});

$('clearDataBtn')?.addEventListener('click', () => {
  const confirmed = confirm(
    'Notes, tasks aur local chat data clear karna hai?'
  );

  if (!confirmed) return;

  notes = [];
  tasks = [];
  chatHistory = [];

  localStorage.removeItem('gaurav_notes');
  localStorage.removeItem('gaurav_tasks');

  messagesEl.innerHTML = '';

  renderNotes();
  renderTasks();
  updateCounts();

  addMessage(
    'Local data cleared successfully. 🧹',
    'assistant'
  );
});

$('themeBtn')?.addEventListener('click', () => {
  document.body.classList.toggle('light-theme');

  localStorage.setItem(
    'gaurav_theme',
    document.body.classList.contains('light-theme')
      ? 'light'
      : 'dark'
  );
});

if (localStorage.getItem('gaurav_theme') === 'light') {
  document.body.classList.add('light-theme');
}

$('mobileMenu')?.addEventListener('click', () => {
  $('sidebar')?.classList.toggle('open');
});

$('voiceBtn')?.addEventListener('click', () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Voice input browser mein supported nahi hai.');
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = 'hi-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  setStatus('LISTENING...');

  recognition.onresult = (event) => {
    userInput.value =
      event.results[0][0].transcript;

    userInput.focus();
  };

  recognition.onerror = (event) => {
    console.error('Voice error:', event.error);
  };

  recognition.onend = () => {
    setStatus('AI ONLINE');
  };

  recognition.start();
});

function updateClock() {
  const now = new Date();

  $('clock').textContent =
    now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
}

setInterval(updateClock, 1000);
updateClock();

renderNotes();
renderTasks();
updateCounts();
checkBackend();

console.log('Gaurav AI frontend loaded successfully.');
