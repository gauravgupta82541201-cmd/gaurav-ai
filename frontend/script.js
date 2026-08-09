/* =========================================================
   GAURAV AI — FRONTEND
   Works with the current index.html + style.css
========================================================= */

const $ = (id) => document.getElementById(id);

/* =========================================================
   ELEMENTS
========================================================= */

const messagesEl = $('messages');
const composer = $('composer');
const userInput = $('userInput');
const statusText = $('statusText');
const aiOrb = $('aiOrb');

/* =========================================================
   STORAGE
========================================================= */

const STORAGE = {
  notes: 'gaurav_notes',
  tasks: 'gaurav_tasks',
  theme: 'gaurav_theme'
};

function loadJSON(key, fallback = []) {
  try {
    const value = localStorage.getItem(key);

    if (!value) return fallback;

    const parsed = JSON.parse(value);

    return Array.isArray(parsed)
      ? parsed
      : fallback;

  } catch (error) {
    console.error(`Storage error: ${key}`, error);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );
  } catch (error) {
    console.error(`Storage save error: ${key}`, error);
  }
}

let chatHistory = [];

let notes = loadJSON(
  STORAGE.notes
);

let tasks = loadJSON(
  STORAGE.tasks
);

/* =========================================================
   GENERAL HELPERS
========================================================= */

function setStatus(text) {
  if (statusText) {
    statusText.textContent = text;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function showToast(message) {
  const toast = $('toast');

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(
    showToast.timer
  );

  showToast.timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

/* =========================================================
   MESSAGES
========================================================= */

function addMessage(
  text,
  role = 'assistant'
) {
  if (!messagesEl) return null;

  const item =
    document.createElement('div');

  item.className =
    `message ${role}`;

  const bubble =
    document.createElement('div');

  bubble.className = 'bubble';

  bubble.textContent =
    String(text);

  item.appendChild(bubble);

  messagesEl.appendChild(item);

  requestAnimationFrame(() => {
    messagesEl.scrollTop =
      messagesEl.scrollHeight;
  });

  return item;
}

/* =========================================================
   AI ORB
========================================================= */

function setAIThinking(active) {
  if (!aiOrb) return;

  aiOrb.classList.toggle(
    'ai-active',
    active
  );
}

/* =========================================================
   SEND MESSAGE TO AI
========================================================= */

async function sendToAI(text) {

  const message =
    String(text || '').trim();

  if (!message) return;

  if (!userInput) return;

  addMessage(
    message,
    'user'
  );

  userInput.value = '';

  const thinking =
    addMessage(
      'Thinking... 🤖',
      'assistant'
    );

  setAIThinking(true);
  setStatus('THINKING...');

  chatHistory.push({
    role: 'user',
    content: message
  });

  /*
   * Keep only last 12 messages.
   */
  const messages =
    chatHistory.slice(-12);

  try {

    /*
     * IMPORTANT:
     * Frontend and backend should normally
     * be on the same Render server.
     */
    const response =
      await fetch(
        '/api/chat',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
            'Accept':
              'application/json'
          },

          body: JSON.stringify({
            messages
          })
        }
      );

    /*
     * Read as TEXT first.
     *
     * This prevents:
     *
     * Unexpected token 'F',
     * "File not found!"
     *
     * from crashing JSON parsing.
     */
    const raw =
      await response.text();

    console.log(
      'Gaurav AI API status:',
      response.status
    );

    console.log(
      'Gaurav AI raw response:',
      raw
    );

    if (thinking) {
      thinking.remove();
    }

    let data;

    try {

      data =
        JSON.parse(raw);

    } catch (parseError) {

      throw new Error(
        `Server ne JSON response nahi diya.\n` +
        `Status: ${response.status}\n` +
        `Response: ${raw.slice(0, 300)}`
      );
    }

    if (!response.ok) {

      throw new Error(
        data?.error ||
        `Server error ${response.status}`
      );
    }

    const reply =
      String(
        data?.reply ||
        'Mujhe abhi response nahi mila.'
      ).trim();

    if (!reply) {

      throw new Error(
        'AI ne empty response diya.'
      );
    }

    chatHistory.push({
      role: 'assistant',
      content: reply
    });

    addMessage(
      reply,
      'assistant'
    );

    setStatus('AI ONLINE');

    setAIThinking(false);

    console.log(
      'AI provider:',
      data?.provider || 'unknown'
    );

  } catch (error) {

    console.error(
      'Gaurav AI Chat Error:',
      error
    );

    if (thinking) {
      thinking.remove();
    }

    setAIThinking(false);

    setStatus('AI ONLINE');

    addMessage(
      `⚠️ AI connection error:\n${error.message}`,
      'assistant'
    );

  }
}

/* =========================================================
   CALCULATOR
========================================================= */

function calculate(expression) {

  try {

    const clean =
      String(expression || '')
        .replace(
          /^calculator\s*/i,
          ''
        )
        .replace(
          /×/g,
          '*'
        )
        .replace(
          /÷/g,
          '/'
        )
        .replace(
          /%/g,
          '/100'
        )
        .replace(
          /[^0-9+\-*/(). ]/g,
          ''
        );

    if (!clean.trim()) {

      return (
        '🧮 Calculator mein expression do.\n' +
        'Example: calculator 125*8'
      );
    }

    /*
     * Basic expression validation.
     */
    if (
      /[+\-*/.]$/.test(
        clean.trim()
      )
    ) {
      return '❌ Expression incomplete hai.';
    }

    const result =
      Function(
        `"use strict"; return (${clean})`
      )();

    if (
      typeof result !== 'number' ||
      !Number.isFinite(result)
    ) {
      return '❌ Calculation valid nahi hai.';
    }

    return `🧮 Answer: ${result}`;

  } catch (error) {

    console.error(
      'Calculator error:',
      error
    );

    return (
      '❌ Calculation samajh nahi aayi.'
    );
  }
}

/* =========================================================
   NOTES
========================================================= */

function addNote(text) {

  const clean =
    String(text || '').trim();

  if (!clean) return;

  const note = {
    id: Date.now(),
    text: clean,
    date: new Date().toLocaleString()
  };

  notes.unshift(note);

  saveJSON(
    STORAGE.notes,
    notes
  );

  renderNotes();
  updateCounts();
}

function renderNotes() {

  const list =
    $('notesList');

  if (!list) return;

  list.innerHTML = '';

  if (!notes.length) {

    list.innerHTML =
      '<p class="muted">No notes yet.</p>';

    return;
  }

  notes.forEach((note) => {

    const card =
      document.createElement('div');

    card.className = 'card';

    card.innerHTML = `
      <div>
        <strong>📝 Note</strong>

        <p>
          ${escapeHtml(note.text)}
        </p>

        <small>
          ${escapeHtml(note.date)}
        </small>
      </div>

      <button
        class="danger"
        data-delete-note="${note.id}"
      >
        Delete
      </button>
    `;

    list.appendChild(card);
  });
}

/* =========================================================
   TASKS
========================================================= */

function addTask(text) {

  const clean =
    String(text || '').trim();

  if (!clean) return;

  const task = {
    id: Date.now(),
    text: clean,
    done: false,
    date: new Date().toLocaleString()
  };

  tasks.unshift(task);

  saveJSON(
    STORAGE.tasks,
    tasks
  );

  renderTasks();
  updateCounts();
}

function renderTasks() {

  const list =
    $('tasksList');

  if (!list) return;

  list.innerHTML = '';

  if (!tasks.length) {

    list.innerHTML =
      '<p class="muted">No tasks yet.</p>';

    return;
  }

  tasks.forEach((task) => {

    const card =
      document.createElement('div');

    card.className =
      'card';

    card.innerHTML = `
      <div>
        <strong>
          ${task.done ? '✅' : '⬜'} Task
        </strong>

        <p>
          ${escapeHtml(task.text)}
        </p>

        <small>
          ${escapeHtml(task.date)}
        </small>
      </div>

      <div>
        <button
          data-toggle-task="${task.id}"
        >
          ${task.done ? 'Undo' : 'Done'}
        </button>

        <button
          class="danger"
          data-delete-task="${task.id}"
        >
          Delete
        </button>
      </div>
    `;

    list.appendChild(card);
  });
}

/* =========================================================
   COUNTS
========================================================= */

function updateCounts() {

  const noteCount =
    $('noteCount');

  const taskCount =
    $('taskCount');

  if (noteCount) {

    noteCount.textContent =
      notes.length;
  }

  if (taskCount) {

    taskCount.textContent =
      tasks.filter(
        (task) => !task.done
      ).length;
  }
}

/* =========================================================
   VIEW SWITCHING
========================================================= */

function showView(view) {

  document
    .querySelectorAll('.view')
    .forEach((element) => {

      element.classList.add(
        'hidden'
      );

    });

  const target =
    $(`${view}View`);

  if (target) {

    target.classList.remove(
      'hidden'
    );
  }

  document
    .querySelectorAll(
      '.nav-item[data-view]'
    )
    .forEach((button) => {

      button.classList.toggle(
        'active',
        button.dataset.view === view
      );

    });

  const titles = {
    chat:
      'Gaurav AI Assistant',

    notes:
      'Your Notes',

    tasks:
      'Your Tasks',

    calculator:
      'Calculator'
  };

  const pageTitle =
    $('pageTitle');

  if (pageTitle) {

    pageTitle.textContent =
      titles[view] ||
      'Gaurav AI Assistant';
  }

  /*
   * Hide mobile sidebar after selecting a page.
   */
  if (window.innerWidth <= 820) {

    $('sidebar')
      ?.classList.remove(
        'open'
      );
  }

  if (view === 'notes') {
    renderNotes();
  }

  if (view === 'tasks') {
    renderTasks();
  }
}

/* =========================================================
   BACKEND HEALTH
========================================================= */

async function checkBackend() {

  try {

    const response =
      await fetch(
        '/api/health',
        {
          method: 'GET',
          headers: {
            'Accept':
              'application/json'
          },
          cache: 'no-store'
        }
      );

    const raw =
      await response.text();

    console.log(
      'Backend health raw:',
      raw
    );

    let data;

    try {

      data =
        JSON.parse(raw);

    } catch {

      setStatus('OFFLINE');

      return;
    }

    if (
      response.ok &&
      data?.ok &&
      data?.aiConfigured
    ) {

      setStatus(
        'AI ONLINE'
      );

    } else {

      setStatus(
        'AI OFFLINE'
      );
    }

  } catch (error) {

    console.error(
      'Health check failed:',
      error
    );

    setStatus(
      'OFFLINE'
    );
  }
}

/* =========================================================
   COMPOSER
========================================================= */

composer?.addEventListener(
  'submit',
  async (event) => {

    event.preventDefault();

    const text =
      userInput?.value.trim();

    if (!text) return;

    /*
     * Local calculator
     */
    if (
      /^calculator\s+/i.test(text)
    ) {

      addMessage(
        text,
        'user'
      );

      userInput.value = '';

      addMessage(
        calculate(text),
        'assistant'
      );

      return;
    }

    /*
     * Local note
     */
    if (
      /^note\s+/i.test(text)
    ) {

      const noteText =
        text
          .replace(
            /^note\s+/i,
            ''
          )
          .trim();

      addMessage(
        text,
        'user'
      );

      userInput.value = '';

      if (noteText) {

        addNote(noteText);

        addMessage(
          `📝 Note saved: ${noteText}`,
          'assistant'
        );

      }

      return;
    }

    /*
     * Local task
     */
    if (
      /^add task\s+/i.test(text)
    ) {

      const taskText =
        text
          .replace(
            /^add task\s+/i,
            ''
          )
          .trim();

      addMessage(
        text,
        'user'
      );

      userInput.value = '';

      if (taskText) {

        addTask(taskText);

        addMessage(
          `✅ Task added: ${taskText}`,
          'assistant'
        );
      }

      return;
    }

    /*
     * Normal AI message
     */
    await sendToAI(text);
  }
);

/* =========================================================
   QUICK CARDS
========================================================= */

document
  .querySelectorAll('.quick-card')
  .forEach((button) => {

    button.addEventListener(
      'click',
      async () => {

        const command =
          button.dataset.command ||
          '';

        if (!command) return;

        /*
         * Calculator
         */
        if (
          /^calculator\s+/i.test(
            command
          )
        ) {

          addMessage(
            command,
            'user'
          );

          addMessage(
            calculate(command),
            'assistant'
          );

          return;
        }

        /*
         * Note
         */
        if (
          /^note\s+/i.test(
            command
          )
        ) {

          const text =
            command
              .replace(
                /^note\s+/i,
                ''
              )
              .trim();

          addMessage(
            command,
            'user'
          );

          addNote(text);

          addMessage(
            `📝 Note saved: ${text}`,
            'assistant'
          );

          return;
        }

        /*
         * Task
         */
        if (
          /^add task\s+/i.test(
            command
          )
        ) {

          const text =
            command
              .replace(
                /^add task\s+/i,
                ''
              )
              .trim();

          addMessage(
            command,
            'user'
          );

          addTask(text);

          addMessage(
            `✅ Task added: ${text}`,
            'assistant'
          );

          return;
        }

        /*
         * Normal AI
         */
        await sendToAI(command);
      }
    );
  });

/* =========================================================
   NEW CHAT
========================================================= */

$('newChatBtn')
  ?.addEventListener(
    'click',
    () => {

      chatHistory = [];

      if (messagesEl) {
        messagesEl.innerHTML = '';
      }

      showView('chat');

      addMessage(
        'New conversation started. 👋 Bolo Gaurav, kya karna hai?',
        'assistant'
      );

      userInput?.focus();
    }
  );

/* =========================================================
   NAVIGATION
========================================================= */

document
  .querySelectorAll(
    '.nav-item[data-view]'
  )
  .forEach((button) => {

    button.addEventListener(
      'click',
      () => {

        showView(
          button.dataset.view
        );
      }
    );
  });

/* =========================================================
   NOTES UI
========================================================= */

$('addNoteBtn')
  ?.addEventListener(
    'click',
    () => {

      const form =
        $('noteForm');

      form?.classList.toggle(
        'hidden'
      );

      $('noteInput')?.focus();
    }
  );

$('saveNoteBtn')
  ?.addEventListener(
    'click',
    () => {

      const input =
        $('noteInput');

      const text =
        input?.value.trim();

      if (!text) return;

      addNote(text);

      input.value = '';

      $('noteForm')
        ?.classList.add(
          'hidden'
        );
    }
  );

$('noteInput')
  ?.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Enter'
      ) {

        event.preventDefault();

        $('saveNoteBtn')?.click();
      }
    }
  );

/* =========================================================
   TASK UI
========================================================= */

$('addTaskBtn')
  ?.addEventListener(
    'click',
    () => {

      const form =
        $('taskForm');

      form?.classList.toggle(
        'hidden'
      );

      $('taskInput')?.focus();
    }
  );

$('saveTaskBtn')
  ?.addEventListener(
    'click',
    () => {

      const input =
        $('taskInput');

      const text =
        input?.value.trim();

      if (!text) return;

      addTask(text);

      input.value = '';

      $('taskForm')
        ?.classList.add(
          'hidden'
        );
    }
  );

$('taskInput')
  ?.addEventListener(
    'keydown',
    (event) => {

      if (
        event.key === 'Enter'
      ) {

        event.preventDefault();

        $('saveTaskBtn')?.click();
      }
    }
  );

/* =========================================================
   NOTE DELETE
========================================================= */

$('notesList')
  ?.addEventListener(
    'click',
    (event) => {

      const button =
        event.target.closest(
          '[data-delete-note]'
        );

      if (!button) return;

      const id =
        Number(
          button.dataset.deleteNote
        );

      notes =
        notes.filter(
          (note) =>
            note.id !== id
        );

      saveJSON(
        STORAGE.notes,
        notes
      );

      renderNotes();
      updateCounts();

      showToast(
        'Note deleted 🗑️'
      );
    }
  );

/* =========================================================
   TASK ACTIONS
========================================================= */

$('tasksList')
  ?.addEventListener(
    'click',
    (event) => {

      const deleteButton =
        event.target.closest(
          '[data-delete-task]'
        );

      const toggleButton =
        event.target.closest(
          '[data-toggle-task]'
        );

      /*
       * Delete task
       */
      if (deleteButton) {

        const id =
          Number(
            deleteButton.dataset
              .deleteTask
          );

        tasks =
          tasks.filter(
            (task) =>
              task.id !== id
          );

        saveJSON(
          STORAGE.tasks,
          tasks
        );

        renderTasks();
        updateCounts();

        showToast(
          'Task deleted 🗑️'
        );
      }

      /*
       * Toggle task
       */
      if (toggleButton) {

        const id =
          Number(
            toggleButton.dataset
              .toggleTask
          );

        const task =
          tasks.find(
            (item) =>
              item.id === id
          );

        if (task) {

          task.done =
            !task.done;

        
