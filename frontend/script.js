/* =========================================================
   GAURAV AI — PERSONAL ASSISTANT
   Complete Frontend Controller
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
   STORAGE KEYS
========================================================= */

const STORAGE = {
  chat: 'gaurav_chat_history',
  notes: 'gaurav_notes',
  tasks: 'gaurav_tasks',
  theme: 'gaurav_theme'
};

/* =========================================================
   STATE
========================================================= */

let chatHistory = loadJSON(STORAGE.chat, []);
let notes = loadJSON(STORAGE.notes, []);
let tasks = loadJSON(STORAGE.tasks, []);

let isThinking = false;

/* =========================================================
   STORAGE HELPERS
========================================================= */

function loadJSON(key, fallback) {
  try {
    const value = localStorage.getItem(key);

    if (!value) {
      return fallback;
    }

    const parsed = JSON.parse(value);

    return parsed;
  } catch (error) {
    console.error('Storage load error:', error);
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
    console.error('Storage save error:', error);
  }
}

function saveAllData() {
  saveJSON(STORAGE.chat, chatHistory);
  saveJSON(STORAGE.notes, notes);
  saveJSON(STORAGE.tasks, tasks);
}

/* =========================================================
   STATUS
========================================================= */

function setStatus(text) {
  if (statusText) {
    statusText.textContent = text;
  }
}

function setThinking(active) {
  isThinking = active;

  if (active) {
    setStatus('THINKING...');

    aiOrb?.classList.add('ai-active');
  } else {
    setStatus('AI ONLINE');

    aiOrb?.classList.remove('ai-active');
  }
}

/* =========================================================
   MESSAGE RENDERING
========================================================= */

function addMessage(
  text,
  role = 'assistant',
  save = false
) {
  if (!messagesEl) return null;

  const item = document.createElement('div');

  item.className = `message ${role}`;

  const bubble = document.createElement('div');

  bubble.className = 'bubble';

  bubble.textContent = String(text);

  item.appendChild(bubble);

  messagesEl.appendChild(item);

  messagesEl.scrollTop =
    messagesEl.scrollHeight;

  if (save) {
    chatHistory.push({
      role:
        role === 'user'
          ? 'user'
          : 'assistant',
      content: String(text)
    });

    saveJSON(
      STORAGE.chat,
      chatHistory
    );
  }

  return item;
}

/* =========================================================
   THINKING MESSAGE
========================================================= */

function addThinkingMessage() {
  if (!messagesEl) return null;

  const item = document.createElement('div');

  item.className =
    'message assistant';

  const bubble =
    document.createElement('div');

  bubble.className = 'bubble';

  bubble.innerHTML = `
    <div class="ai-thinking">
      <strong>Gaurav AI</strong>
      <span></span>
      <span></span>
      <span></span>
    </div>
  `;

  item.appendChild(bubble);

  messagesEl.appendChild(item);

  messagesEl.scrollTop =
    messagesEl.scrollHeight;

  return item;
}

/* =========================================================
   TYPING EFFECT
========================================================= */

async function typeMessage(
  text,
  role = 'assistant',
  save = true
) {
  if (!messagesEl) return null;

  const item =
    document.createElement('div');

  item.className =
    `message ${role}`;

  const bubble =
    document.createElement('div');

  bubble.className = 'bubble';

  item.appendChild(bubble);

  messagesEl.appendChild(item);

  const characters =
    [...String(text)];

  let current = '';

  for (
    let i = 0;
    i < characters.length;
    i++
  ) {
    current += characters[i];

    bubble.textContent =
      current;

    messagesEl.scrollTop =
      messagesEl.scrollHeight;

    let delay = 8;

    if (
      characters[i] === '.' ||
      characters[i] === '!' ||
      characters[i] === '?'
    ) {
      delay = 35;
    }

    await wait(delay);
  }

  if (save) {
    chatHistory.push({
      role:
        role === 'user'
          ? 'user'
          : 'assistant',
      content: String(text)
    });

    saveJSON(
      STORAGE.chat,
      chatHistory
    );
  }

  return item;
}

function wait(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}

/* =========================================================
   RESTORE CHAT
========================================================= */

function restoreChat() {
  if (!messagesEl) return;

  messagesEl.innerHTML = '';

  if (!chatHistory.length) {
    showWelcomeMessage();
    return;
  }

  chatHistory.forEach((message) => {
    addMessage(
      message.content,
      message.role === 'user'
        ? 'user'
        : 'assistant',
      false
    );
  });
}

function showWelcomeMessage() {
  addMessage(
    'Namaste Gaurav 👋',
    'assistant',
    false
  );

  addMessage(
    'Main Gaurav AI hoon — tumhara personal AI assistant. 🤖',
    'assistant',
    false
  );

  addMessage(
    'Tum mujhse normal chat, questions, calculations, notes aur tasks ke baare mein baat kar sakte ho.',
    'assistant',
    false
  );
}

/* =========================================================
   SEND MESSAGE TO BACKEND
========================================================= */

async function sendToAI(text) {
  const cleanText =
    String(text || '').trim();

  if (
    (!cleanText && !selectedImageFile) ||
    isThinking
  ) {
    return;
  }

  addMessage(
    cleanText ||
      '📷 Image sent',
    'user',
    true
  );

  userInput.value = '';

  setThinking(true);

  const thinking =
    addThinkingMessage();

  try {
    let image = null;

    if (selectedImageFile) {
      image =
        await fileToDataURL(
          selectedImageFile
        );
    }

    const response =
      await fetch(
        '/api/chat',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json'
          },

          body: JSON.stringify({
            messages:
              chatHistory.slice(-12),

            image
          })
        }
      );

    let data;

    try {
      data =
        await response.json();
    } catch {
      data = {};
    }

    console.log(
      'Gaurav AI API:',
      response.status,
      data
    );

    thinking?.remove();

    if (!response.ok) {
      throw new Error(
        data.error ||
        `Server error ${response.status}`
      );
    }

    const reply =
      String(
        data.reply ||
        data.message ||
        'Mujhe abhi response nahi mila.'
      );

    setThinking(false);

    await typeMessage(
      reply,
      'assistant',
      true
    );

  } catch (error) {
    console.error(
      'Gaurav AI Chat Error:',
      error
    );

    thinking?.remove();

    setThinking(false);

    await typeMessage(
      `⚠️ Gaurav AI se connection mein problem aa gayi.\n\n${error.message}`,
      'assistant',
      true
    );
  }
}

/* =========================================================
   CALCULATOR
========================================================= */

function calculate(expression) {
  try {
    const clean =
      String(expression)
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
          /[^0-9+\-*/().% ]/g,
          ''
        );

    if (!clean.trim()) {
      return (
        '🧮 Calculator mein expression do.\n\n' +
        'Example:\ncalculator 125*8'
      );
    }

    const result =
      Function(
        `"use strict"; return (${clean})`
      )();

    if (
      typeof result !== 'number' ||
      !Number.isFinite(result)
    ) {
      return '❌ Invalid calculation.';
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
   NOTE SYSTEM
========================================================= */

function addNote(text) {
  const clean =
    String(text || '').trim();

  if (!clean) return;

  const note = {
    id: Date.now(),
    text: clean,
    date:
      new Date().toLocaleString()
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

    card.className =
      'data-card';

    card.innerHTML = `
      <div class="body">
        <strong>📝 Note</strong>
        <p>${escapeHtml(note.text)}</p>
        <small>${escapeHtml(note.date)}</small>
      </div>

      <button
        class="delete-btn"
        data-delete-note="${note.id}"
        title="Delete note"
      >
        🗑️
      </button>
    `;

    list.appendChild(card);
  });
}

/* =========================================================
   TASK SYSTEM
========================================================= */

function addTask(text) {
  const clean =
    String(text || '').trim();

  if (!clean) return;

  const task = {
    id: Date.now(),
    text: clean,
    done: false,
    date:
      new Date().toLocaleString()
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
      `data-card task-card ${
        task.done ? 'done' : ''
      }`;

    card.innerHTML = `
      <button
        class="task-check"
        data-toggle-task="${task.id}"
        title="Mark task"
      >
        ${task.done ? '✓' : ''}
      </button>

      <div class="body">
        <strong>
          ${task.done ? '✅' : '⬜'} Task
        </strong>

        <p>${escapeHtml(task.text)}</p>

        <small>
          ${escapeHtml(task.date)}
        </small>
      </div>

      <button
        class="delete-btn"
        data-delete-task="${task.id}"
        title="Delete task"
      >
        🗑️
      </button>
    `;

    list.appendChild(card);
  });
}

/* =========================================================
   COUNTERS
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
   SAFE HTML
========================================================= */

function escapeHtml(value) {
  return String(value)
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    );
}

/* =========================================================
   VIEWS
========================================================= */

function showView(view) {
  document
    .querySelectorAll('.view')
    .forEach((el) => {
      el.classList.add('hidden');
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
      'Gaurav AI Notes',

    tasks:
      'Gaurav AI Tasks',

    calculator:
      'Gaurav AI Calculator'
  };

  if ($('pageTitle')) {
    $('pageTitle').textContent =
      titles[view] ||
      'Gaurav AI Assistant';
  }

  if (view === 'notes') {
    renderNotes();
  }

  if (view === 'tasks') {
    renderTasks();
  }

  if (
    window.innerWidth <= 820
  ) {
    $('sidebar')?.classList.remove(
      'open'
    );
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
          cache: 'no-store'
        }
      );

    const data =
      await response.json();

    console.log(
      'Gaurav AI Backend:',
      data
    );

    if (
      response.ok &&
      data.ok &&
      data.aiConfigured
    ) {
      setStatus('AI ONLINE');
    } else {
      setStatus('AI OFFLINE');
    }

  } catch (error) {
    console.error(
      'Health check failed:',
      error
    );

    setStatus('OFFLINE');
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
      userInput.value.trim();

    if (!text) return;

    /* Calculator */
    if (
      /^calculator\s+/i.test(text)
    ) {
      addMessage(
        text,
        'user',
        true
      );

      userInput.value = '';

      addMessage(
        calculate(text),
        'assistant',
        true
      );

      return;
    }

    /* Note */
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
        'user',
        true
      );

      userInput.value = '';

      if (noteText) {
        addNote(noteText);

        addMessage(
          `📝 Note saved: ${noteText}`,
          'assistant',
          true
        );
      }

      return;
    }

    /* Task */
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
        'user',
        true
      );

      userInput.value = '';

      if (taskText) {
        addTask(taskText);

        addMessage(
          `✅ Task added: ${taskText}`,
          'assistant',
          true
        );
      }

      return;
    }

    /* Normal AI */
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
      () => {

        const command =
          button.dataset.command ||
          '';

        if (
          /^calculator\s+/i.test(
            command
          )
        ) {
          addMessage(
            command,
            'user',
            true
          );

          addMessage(
            calculate(command),
            'assistant',
            true
          );

          return;
        }

        if (
          /^note\s+/i.test(command)
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
            'user',
            true
          );

          addNote(text);

          addMessage(
            `📝 Note saved: ${text}`,
            'assistant',
            true
          );

          return;
        }

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
            'user',
            true
          );

          addTask(text);

          addMessage(
            `✅ Task added: ${text}`,
            'assistant',
            true
          );

          return;
        }

        sendToAI(command);
      }
    );
  });

/* =========================================================
   NEW CHAT
========================================================= */

$('newChatBtn')?.addEventListener(
  'click',
  () => {

    if (isThinking) return;

    const confirmed =
      confirm(
        'Current conversation clear karke new chat start karni hai?'
      );

    if (!confirmed) return;

    chatHistory = [];

    saveJSON(
      STORAGE.chat,
      chatHistory
    );

    if (messagesEl) {
      messagesEl.innerHTML = '';
    }

    showWelcomeMessage();

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
   NOTES FORM
========================================================= */

$('addNoteBtn')?.addEventListener(
  'click',
  () => {

    $('noteForm')?.classList.toggle(
      'hidden'
    );

    $('noteInput')?.focus();
  }
);

$('saveNoteBtn')?.addEventListener(
  'click',
  () => {

    const input =
      $('noteInput');

    const text =
      input?.value.trim();

    if (!text) return;

    addNote(text);

    input.value = '';

    $('noteForm')?.classList.add(
      'hidden'
    );
  }
);

/* =========================================================
   TASK FORM
========================================================= */

$('addTaskBtn')?.addEventListener(
  'click',
  () => {

    $('taskForm')?.classList.toggle(
      'hidden'
    );

    $('taskInput')?.focus();
  }
);

$('saveTaskBtn')?.addEventListener(
  'click',
  () => {

    const input =
      $('taskInput');

    const text =
      input?.value.trim();

    if (!text) return;

    addTask(text);

    input.value = '';

    $('taskForm')?.classList.add(
      'hidden'
    );
  }
);

/* =========================================================
   NOTE DELETE
========================================================= */

$('notesList')?.addEventListener(
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
  }
);

/* =========================================================
   TASK ACTIONS
========================================================= */

$('tasksList')?.addEventListener(
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
    }

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
      }

      saveJSON(
        STORAGE.tasks,
        tasks
      );

      renderTasks();
      updateCounts();
    }
  }
);

/* =========================================================
   CLEAR LOCAL DATA
========================================================= */

$('clearDataBtn')?.addEventListener(
  'click',
  () => {

    const confirmed =
      confirm(
        'Notes, tasks aur chat history permanently clear karni hai?'
      );

    if (!confirmed) return;

    notes = [];
    tasks = [];
    chatHistory = [];

    localStorage.removeItem(
      STORAGE.notes
    );

    localStorage.removeItem(
      STORAGE.tasks
    );

    localStorage.removeItem(
      STORAGE.chat
    );

    if (messagesEl) {
      messagesEl.innerHTML = '';
    }

    renderNotes();
    renderTasks();
    updateCounts();

    showWelcomeMessage();
  }
);

/* =========================================================
   THEME
========================================================= */

function applyTheme() {
  const theme =
    localStorage.getItem(
      STORAGE.theme
    );

  if (theme === 'light') {
    document.body.classList.add(
      'light'
    );
  } else {
    document.body.classList.remove(
      'light'
    );
  }
}

$('themeBtn')?.addEventListener(
  'click',
  () => {

    const isLight =
      document.body.classList.toggle(
        'light'
      );

    localStorage.setItem(
      STORAGE.theme,
      isLight
        ? 'light'
        : 'dark'
    );
  }
);

/* =========================================================
   MOBILE MENU
========================================================= */

$('mobileMenu')?.addEventListener(
  'click',
  () => {

    $('sidebar')?.classList.toggle(
      'open'
    );
  }
);

/* =========================================================
   VOICE INPUT
========================================================= */

$('voiceBtn')?.addEventListener(
  'click',
  () => {

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        'Voice input is not supported in this browser.'
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      'hi-IN';

    recognition.interimResults =
      false;

    recognition.maxAlternatives =
      1;

    setStatus(
      'LISTENING...'
    );

    aiOrb?.classList.add(
      'ai-active'
    );

    recognition.onresult =
      (event) => {

        const transcript =
          event
            .results[0][0]
            .transcript;

        userInput.value =
          transcript;

        userInput.focus();
      };

    recognition.onerror =
      (event) => {

        console.error(
          'Voice error:',
          event.error
        );

        setStatus(
          'AI ONLINE'
        );

        aiOrb?.classList.remove(
          'ai-active'
        );
      };

    recognition.onend =
      () => {

        setStatus(
          'AI ONLINE'
        );

        aiOrb?.classList.remove(
          'ai-active'
        );
      };

    recognition.start();
  }
);

/* =========================================================
   CALCULATOR UI
========================================================= */

const calcDisplay =
  $('calcDisplay');

const calcGrid =
  $('calcGrid');

if (calcGrid && calcDisplay) {

  calcGrid.addEventListener(
    'click',
    (event) => {

      const button =
        event.target.closest(
          'button'
        );

      if (!button) return;

      const value =
        button.dataset.value;

      if (!value) return;

      if (value === 'C') {
        calcDisplay.value = '';
        return;
      }

      if (value === '⌫') {
        calcDisplay.value =
          calcDisplay.value.slice(
            0,
            -1
          );

        return;
      }

      if (value === '=') {

        try {

          const expression =
            calcDisplay.value
              .replace(
                /×/g,
                '*'
              )
              .replace(
                /÷/g,
                '/'
              );

          const result =
            Function(
              `"use strict"; return (${expression})`
            )();

          calcDisplay.value =
            Number.isFinite(result)
              ? result
              : '';

        } catch {

          calcDisplay.value =
            'Error';
        }

        return;
      }

      if (value === '%') {

        try {

          const current =
            parseFloat(
              calcDisplay.value
            );

          if (
            Number.isFinite(
              current
            )
          ) {
            calcDisplay.value =
              current / 100;
          }

        } catch {}

        return;
      }

      calcDisplay.value +=
        value;
    }
  );
}

/* =========================================================
   CLOCK
========================================================= */

function updateClock() {

  const clock =
    $('clock');

  if (!clock) return;

  const now =
    new Date();

  clock.textContent =
    now.toLocaleTimeString(
      [],
      {
        hour:
          '2-digit',

        minute:
          '2-digit'
      }
    );
}

setInterval(
  updateClock,
  1000
);

/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
  'keydown',
  (event) => {

    if (
      event.key === '/' &&
      document.activeElement !==
        userInput
    ) {

      event.preventDefault();

      userInput?.focus();
    }

    if (
      event.key === 'Escape'
    ) {

      $('sidebar')?.classList.remove(
        'open'
      );
    }
  }
);

/* =========================================================
   INITIALIZE
========================================================= */

applyTheme();

updateClock();

renderNotes();

renderTasks();

updateCounts();

restoreChat();

checkBackend();

userInput?.focus();

console.log(
  '🚀 GAURAV AI initialized successfully.'
);
/* =========================================================
   PHOTO ATTACHMENT — PREVIEW ONLY
========================================================= */

let selectedImageFile = null;

const imageInput = $('imageInput');
const imageBtn = $('imageBtn');
const imagePreview = $('imagePreview');
const previewImage = $('previewImage');
const removeImageBtn = $('removeImageBtn');

imageBtn?.addEventListener('click', () => {
  imageInput?.click();
});

imageInput?.addEventListener('change', () => {
  const file = imageInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file.');
    imageInput.value = '';
    return;
  }

  selectedImageFile = file;

  const reader = new FileReader();

  reader.onload = (event) => {
    if (previewImage) {
      previewImage.src = event.target.result;
    }

    imagePreview?.classList.remove('hidden');
  };

  reader.readAsDataURL(file);
});

removeImageBtn?.addEventListener('click', () => {
  selectedImageFile = null;

  if (imageInput) {
    imageInput.value = '';
  }

  if (previewImage) {
    previewImage.removeAttribute('src');
  }

  imagePreview?.classList.add('hidden');
});

/* =========================================================
   IMAGE DATA HELPER
========================================================= */

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve(null);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      resolve(String(reader.result));
    };

    reader.onerror = () => {
      reject(new Error('Image read failed.'));
    };

    reader.readAsDataURL(file);
  });
}
