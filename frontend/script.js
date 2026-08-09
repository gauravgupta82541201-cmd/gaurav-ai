:root {
  --bg: #070a14;
  --bg-soft: #0c1120;

  --panel: rgba(15, 21, 40, 0.82);
  --panel-strong: rgba(20, 27, 50, 0.95);

  --text: #f7f8ff;
  --muted: #98a3c2;

  --line: rgba(255, 255, 255, 0.09);

  --accent: #7657ff;
  --accent-2: #00d9ff;

  --success: #55e6ad;
  --danger: #ff5577;

  --shadow: 0 20px 70px rgba(0, 0, 0, 0.35);

  --sidebar-width: 250px;
}

/* =========================================================
   RESET
========================================================= */

* {
  box-sizing: border-box;
}

html {
  margin: 0;
  padding: 0;
  min-height: 100%;
}

body {
  margin: 0;
  min-height: 100vh;

  font-family:
    Inter,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;

  background: var(--bg);
  color: var(--text);

  overflow-x: hidden;
}

button,
input {
  font: inherit;
}

button {
  cursor: pointer;
}

.hidden {
  display: none !important;
}

/* =========================================================
   BACKGROUND
========================================================= */

body::before {
  content: "";

  position: fixed;
  inset: 0;

  pointer-events: none;

  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(118, 87, 255, 0.14),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 90%,
      rgba(0, 217, 255, 0.09),
      transparent 30%
    );

  z-index: -3;
}

.bg-orb {
  position: fixed;

  width: 380px;
  height: 380px;

  border-radius: 50%;

  filter: blur(100px);

  opacity: 0.13;

  pointer-events: none;

  z-index: -2;
}

.orb-1 {
  top: -170px;
  left: -160px;
  background: #704cff;
}

.orb-2 {
  right: -180px;
  bottom: -190px;
  background: #00cfff;
}

/* =========================================================
   APP
========================================================= */

.app-shell {
  min-height: 100vh;

  display: flex;

  position: relative;
}

/* =========================================================
   SIDEBAR
========================================================= */

.sidebar {
  width: var(--sidebar-width);

  min-width: var(--sidebar-width);

  min-height: 100vh;

  padding: 22px 14px;

  border-right: 1px solid var(--line);

  background:
    rgba(5, 8, 20, 0.82);

  backdrop-filter: blur(25px);

  display: flex;
  flex-direction: column;

  gap: 20px;

  z-index: 100;
}

.brand {
  display: flex;

  align-items: center;

  gap: 10px;

  padding: 4px 8px;
}

.brand-orb {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border-radius: 13px;

  display: grid;
  place-items: center;

  background:
    linear-gradient(
      135deg,
      var(--accent),
      var(--accent-2)
    );

  box-shadow:
    0 0 25px rgba(118, 87, 255, 0.4),
    0 0 50px rgba(0, 217, 255, 0.1);

  font-size: 20px;

  animation: brandGlow 3s infinite ease-in-out;
}

@keyframes brandGlow {
  50% {
    transform: scale(1.04) rotate(3deg);

    box-shadow:
      0 0 38px rgba(118, 87, 255, 0.6),
      0 0 65px rgba(0, 217, 255, 0.15);
  }
}

.brand strong,
.brand span {
  display: block;
}

.brand strong {
  font-size: 13px;
  letter-spacing: 1.7px;
}

.brand span {
  margin-top: 4px;

  color: var(--muted);

  font-size: 10px;
}

/* =========================================================
   BUTTONS
========================================================= */

.new-chat,
.nav-item,
.primary-btn,
.quick-card,
.icon-btn,
.send-btn,
.calc-grid button {
  border: 0;

  color: inherit;

  background: transparent;
}

/* =========================================================
   NEW CHAT
========================================================= */

.new-chat {
  width: 100%;

  padding: 13px 14px;

  border: 1px solid var(--line);

  border-radius: 14px;

  background:
    linear-gradient(
      135deg,
      rgba(118, 87, 255, 0.2),
      rgba(0, 217, 255, 0.06)
    );

  text-align: left;

  transition: 0.2s;
}

.new-chat:hover {
  transform: translateY(-2px);

  border-color:
    rgba(118, 87, 255, 0.5);
}

/* =========================================================
   NAV
========================================================= */

.nav-item {
  width: 100%;

  padding: 11px 12px;

  margin: 3px 0;

  border-radius: 11px;

  color: var(--muted);

  display: flex;

  align-items: center;

  gap: 10px;

  text-align: left;

  transition: 0.2s;
}

.nav-item:hover,
.nav-item.active {
  color: var(--text);

  background:
    rgba(255, 255, 255, 0.07);
}

.nav-item.active {
  box-shadow:
    inset 2px 0 0 var(--accent-2);
}

.nav-item b {
  margin-left: auto;

  padding: 3px 7px;

  border-radius: 10px;

  font-size: 10px;

  background:
    rgba(255, 255, 255, 0.08);
}

.sidebar-bottom {
  margin-top: auto;
}

/* =========================================================
   MAIN PANEL
========================================================= */

.main-panel {
  flex: 1;

  min-width: 0;

  min-height: 100vh;

  display: flex;

  flex-direction: column;

  position: relative;
}

/* =========================================================
   TOPBAR
========================================================= */

.topbar {
  height: 82px;

  flex-shrink: 0;

  padding: 16px 30px;

  border-bottom: 1px solid var(--line);

  background:
    rgba(7, 11, 24, 0.42);

  backdrop-filter: blur(18px);

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  position: sticky;

  top: 0;

  z-index: 50;
}

.eyebrow {
  font-size: 10px;

  letter-spacing: 1.5px;

  color: #8490b1;

  font-weight: 700;
}

.eyebrow span {
  color: var(--success);
}

.topbar h1 {
  margin: 6px 0 0;

  font-size: 20px;

  line-height: 1.2;
}

.clock {
  color: var(--muted);

  font-size: 13px;

  font-variant-numeric: tabular-nums;

  white-space: nowrap;
}

.mobile-menu {
  display: none;

  border: 0;

  background: transparent;

  color: var(--text);

  font-size: 23px;

  padding: 5px;
}

/* =========================================================
   CONTENT
========================================================= */

.content {
  width: min(980px, calc(100% - 48px));

  margin: 0 auto;

  flex: 1;

  padding: 28px 0 125px;
}

.view {
  width: 100%;
}

/* =========================================================
   HERO
========================================================= */

.hero {
  text-align: center;

  padding:
    8px 0 25px;
}

.ai-orb {
  width: 118px;
  height: 118px;

  margin: 0 auto 18px;

  border-radius: 50%;

  display: grid;

  place-items: center;

  background:
    radial-gradient(
      circle at 35% 30%,
      #eeeaff 0 4%,
      #8063ff 13%,
      #34277e 43%,
      #11162e 70%
    );

  box-shadow:
    0 0 40px rgba(118, 87, 255, 0.42),
    0 0 85px rgba(0, 217, 255, 0.1),
    inset 0 0 28px rgba(0, 217, 255, 0.16);

  animation: orbFloat 4s ease-in-out infinite;

  transition: 0.3s;
}

.orb-core {
  width: 56px;
  height: 56px;

  border-radius: 50%;

  display: grid;
  place-items: center;

  background:
    rgba(255, 255, 255, 0.08);

  border:
    1px solid rgba(255, 255, 255, 0.22);

  font-size: 24px;

  box-shadow:
    0 0 22px rgba(0, 217, 255, 0.25);
}

@keyframes orbFloat {
  50% {
    transform: translateY(-7px);

    box-shadow:
      0 0 65px rgba(118, 87, 255, 0.58),
      0 0 100px rgba(0, 217, 255, 0.12),
      inset 0 0 35px rgba(0, 217, 255, 0.2);
  }
}

.ai-orb.ai-active {
  animation:
    aiThinkingPulse 1.3s infinite ease-in-out;
}

@keyframes aiThinkingPulse {
  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.08);

    box-shadow:
      0 0 80px rgba(118, 87, 255, 0.75),
      0 0 120px rgba(0, 217, 255, 0.2);
  }
}

.hello {
  margin: 0 0 5px;

  color: #a8b2d1;
}

.hero h2 {
  margin: 0 0 8px;

  font-size: 31px;

  line-height: 1.2;
}

.muted {
  margin: 0;

  color: var(--muted);
}

/* =========================================================
   QUICK ACTIONS
========================================================= */

.quick-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;
}

.quick-card {
  min-height: 110px;

  padding: 16px;

  border:
    1px solid var(--line);

  border-radius: 17px;

  background:
    var(--panel);

  box-shadow:
    var(--shadow);

  text-align: left;

  transition:
    transform 0.2s,
    border-color 0.2s,
    background 0.2s;
}

.quick-card:hover {
  transform: translateY(-4px);

  border-color:
    rgba(118, 87, 255, 0.55);

  background:
    rgba(25, 31, 62, 0.92);
}

.quick-card span,
.quick-card small {
  display: block;
}

.quick-card span {
  margin-top: 10px;

  font-size: 13px;

  font-weight: 700;
}

.quick-card small {
  margin-top: 4px;

  color: var(--muted);

  font-size: 10px;
}

/* =========================================================
   CHAT MESSAGES
========================================================= */

.messages {
  display: flex;

  flex-direction: column;

  gap: 13px;

  margin-top: 25px;

  scroll-behavior: smooth;
}

.message {
  max-width: 78%;

  font-size: 13px;

  line-height: 1.6;

  white-space: pre-wrap;

  word-break: break-word;
}

.message .bubble {
  padding: 13px 16px;

  border-radius: 17px;

  animation:
    messageIn 0.3s ease-out;
}

.message.assistant {
  align-self: flex-start;
}

.message.assistant .bubble {
  background:
    linear-gradient(
      145deg,
      rgba(24, 31, 62, 0.94),
      rgba(15, 20, 42, 0.9)
    );

  border:
    1px solid var(--line);

  box-shadow:
    0 10px 30px rgba(0, 0, 0, 0.15);
}

.message.user {
  align-self: flex-end;
}

.message.user .bubble {
  background:
    linear-gradient(
      135deg,
      #6750df,
      #3988c8
    );

  box-shadow:
    0 12px 35px rgba(65, 76, 190, 0.24);
}

@keyframes messageIn {
  from {
    opacity: 0;

    transform:
      translateY(8px)
      scale(0.98);
  }

  to {
    opacity: 1;

    transform:
      translateY(0)
      scale(1);
  }
}

/* =========================================================
   THINKING
========================================================= */

.ai-thinking {
  display: inline-flex;

  align-items: center;

  gap: 6px;
}

.ai-thinking span {
  width: 6px;
  height: 6px;

  border-radius: 50%;

  background:
    var(--accent-2);

  animation:
    thinkingDot 1.15s infinite ease-in-out;
}

.ai-thinking span:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-thinking span:nth-child(3) {
  animation-delay: 0.3s;
}

@keyframes thinkingDot {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.35;
  }

  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* =========================================================
   SECTION HEAD
========================================================= */

.section-head {
  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 15px;

  margin-bottom: 20px;
}

.section-head h2 {
  margin: 6px 0 0;

  font-size: 28px;
}

.primary-btn {
  border: 0;

  padding: 11px 15px;

  border-radius: 12px;

  background:
    linear-gradient(
      135deg,
      var(--accent),
      #4d8cff
    );

  color: white;

  font-weight: 700;

  font-size: 12px;

  transition: 0.2s;
}

.primary-btn:hover {
  transform: translateY(-2px);

  box-shadow:
    0 10px 25px
    rgba(118, 87, 255, 0.25);
}

/* =========================================================
   FORMS
========================================================= */

.note-form,
.task-form {
  display: flex;

  gap: 10px;

  margin-bottom: 16px;
}

.note-form input,
.task-form input {
  flex: 1;
}

.note-form input,
.task-form input,
.composer input,
.calculator input {
  min-width: 0;

  color: var(--text);

  background:
    rgba(255, 255, 255, 0.055);

  border:
    1px solid var(--line);

  outline: none;

  border-radius: 13px;

  padding: 13px 14px;
}

.note-form input:focus,
.task-form input:focus,
.composer input:focus,
.calculator input:focus {
  border-color:
    rgba(118, 87, 255, 0.7);
}

/* =========================================================
   DATA CARDS
========================================================= */

.cards-list {
  display: grid;

  gap: 10px;
}

.data-card,
.card {
  padding: 15px 16px;

  background:
    var(--panel);

  border:
    1px solid var(--line);

  border-radius: 15px;

  display: flex;

  gap: 12px;

  align-items: center;
}

.data-card .body,
.card > div:first-child {
  flex: 1;

  min-width: 0;
}

.data-card p,
.card p {
  margin: 5px 0 0;

  font-size: 13px;

  line-height: 1.45;

  word-break: break-word;
}

.data-card small,
.card small {
  display: block;

  margin-top: 5px;

  color: var(--muted);

  font-size: 10px;
}

.card button {
  border: 1px solid var(--line);

  border-radius: 9px;

  padding: 7px 10px;

  background:
    rgba(255, 255, 255, 0.05);

  color: var(--text);

  cursor: pointer;
}

.card button:hover {
  background:
    rgba(255, 255, 255, 0.1);
}

.card button.danger {
  color: #ff829b;
}

.delete-btn {
  border: 0;

  background: transparent;

  color: #8490b1;

  cursor: pointer;
}

/* =========================================================
   CALCULATOR
========================================================= */

.calculator {
  width: min(390px, 100%);

  margin:
    25px auto 0;

  padding: 18px;

  border:
    1px solid var(--line);

  border-radius: 22px;

  background:
    var(--panel);

  box-shadow:
    var(--shadow);
}

.calculator input {
  width: 100%;

  height: 72px;

  margin-bottom: 12px;

  text-align: right;

  font-size: 28px;
}

.calc-grid {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 8px;
}

.calc-grid button {
  height: 56px;

  border-radius: 13px;

  background:
    rgba(255, 255, 255, 0.065);

  color: var(--text);

  font-size: 16px;

  transition: 0.15s;
}

.calc-grid button:hover {
  transform: translateY(-1px);

  background:
    rgba(255, 255, 255, 0.12);
}

.calc-grid .operator {
  color: #9bb0ff;
}

.calc-grid .equals {
  background:
    linear-gradient(
      135deg,
      var(--accent),
      #478fff
    );
}

.calc-grid .danger {
  color: #ff829b;
}

.calc-grid .wide {
  grid-column: span 2;
}

/* =========================================================
   CHAT COMPOSER
========================================================= */

.composer {
  position: fixed;

  left:
    calc(
      var(--sidebar-width) +
      (100% - var(--sidebar-width)) / 2
    );

  bottom: 22px;

  transform:
    translateX(-50%);

  width:
    min(
      850px,
      calc(100% - var(--sidebar-width) - 60px)
    );

  min-height: 60px;

  display: flex;

  align-items: center;

  gap: 9px;

  padding: 8px;

  background:
    rgba(12, 17, 35, 0.94);

  border:
    1px solid rgba(255, 255, 255, 0.13);

  border-radius: 18px;

  backdrop-filter: blur(20px);

  box-shadow:
    0 20px 55px rgba(0, 0, 0, 0.4);

  z-index: 80;

  transition: 0.2s;
}

.composer:focus-within {
  transform:
    translateX(-50%)
    translateY(-2px);

  border-color:
    rgba(118, 87, 255, 0.45);

  box-shadow:
    0 20px 65px rgba(0, 0, 0, 0.48),
    0 0 35px rgba(118, 87, 255, 0.08);
}

.composer input {
  flex: 1;

  border: 0;

  background: transparent;

  padding: 12px 4px;
}

.composer input::placeholder {
  color: #737d9d;
}

.icon-btn,
.send-btn {
  width: 42px;
  height: 42px;

  flex-shrink: 0;

  border-radius: 12px;

  transition: 0.2s;
}

.icon-btn {
  background:
    rgba(255, 255, 255, 0.06);
}

.icon-btn:hover {
  background:
    rgba(255, 255, 255, 0.12);
}

.send-btn {
  background:
    linear-gradient(
      135deg,
      var(--accent),
      #398dff
    );
}

.send-btn:hover {
  transform: scale(1.04);

  box-shadow:
    0 8px 25px
    rgba(118, 87, 255, 0.35);
}

/* =========================================================
   TIP
========================================================= */

.tip {
  position: fixed;

  bottom: 3px;

  left:
    calc(
      var(--sidebar-width) +
      (100% - var(--sidebar-width)) / 2
    );

  transform:
    translateX(-50%);

  margin: 0;

  color: #6f7894;

  font-size: 9px;

  z-index: 81;
}

/* =========================================================
   TOAST
========================================================= */

.toast {
  position: fixed;

  top: 20px;
  right: 20px;

  padding: 11px 14px;

  border:
    1px solid var(--line);

  border-radius: 12px;

  background:
    #141b34;

  font-size: 12px;

  opacity: 0;

  transform:
    translateY(-8px);

  transition: 0.25s;

  z-index: 200;
}

.toast.show {
  opacity: 1;

  transform:
    translateY(0);
}

/* =========================================================
   LIGHT THEME
========================================================= */

body.light,
body.light-theme {
  --bg: #f4f6ff;

  --panel:
    rgba(255, 255, 255, 0.82);

  --panel-strong: #ffffff;

  --text: #14182b;

  --muted: #68718a;

  --line:
    rgba(20, 30, 60, 0.1);
}

body.light .sidebar,
body.light-theme .sidebar {
  background:
    rgba(255, 255, 255, 0.8);
}

body.light .topbar,
body.light-theme .topbar {
  background:
    rgba(255, 255, 255, 0.55);
}

body.light .composer,
body.light-theme .composer {
  background:
    rgba(255, 255, 255, 0.94);
}

body.light .calc-grid button,
body.light-theme .calc-grid button {
  background:
    rgba(20, 30, 60, 0.05);
}

body.light .message.assistant .bubble,
body.light-theme .message.assistant .bubble {
  background: #ffffff;
}

/* =========================================================
   TABLET
========================================================= */

@media (max-width: 900px) {

  :root {
    --sidebar-width: 235px;
  }

  .content {
    width:
      min(
        100% - 36px,
        760px
      );
  }

  .quick-grid {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .composer {
    width:
      min(
        760px,
        calc(100% - var(--sidebar-width) - 40px)
      );
  }
}

/* =========================================================
   MOBILE
========================================================= */

@media (max-width: 820px) {

  .app-shell {
    display: block;
  }

  .sidebar {
    position: fixed;

    top: 0;
    left: -285px;
    bottom: 0;

    width: 270px;

    min-width: 270px;

    transition:
      left 0.25s ease;

    box-shadow:
      20px 0 60px
      rgba(0, 0, 0, 0.4);
  }

  .sidebar.open {
    left: 0;
  }

  .main-panel {
    width: 100%;

    min-height: 100vh;
  }

  .mobile-menu {
    display: block;
  }

  .topbar {
    height: 72px;

    padding:
      14px 16px;
  }

  .topbar h1 {
    font-size: 17px;
  }

  .clock {
    font-size: 11px;
  }

  .content {
    width:
      calc(100% - 24px);

    padding:
      22px 0 105px;
  }

  .hero {
    padding:
      5px 0 22px;
  }

  .hero h2 {
    font-size: 26px;
  }

  .ai-orb {
    width: 96px;
    height: 96px;
  }

  .orb-core {
    width: 45px;
    height: 45px;

    font-size: 20px;
  }

  .quick-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));

    gap: 8px;
  }

  .quick-card {
    min-height: 100px;

    padding: 13px;
  }

  .message {
    max-width: 91%;
  }

  .composer {
    left: 12px;
    right: 12px;
    bottom: 12px;

    width: auto;

    transform: none;

    min-height: 56px;
  }

  .composer:focus-within {
    transform:
      translateY(-2px);
  }

  .tip {
    display: none;
  }

  .section-head {
    align-items: flex-start;
  }

  .section-head h2 {
    font-size: 24px;
  }

  .calculator {
    margin-top: 20px;
  }
}

/* =========================================================
   SMALL PHONES
========================================================= */

@media (max-width: 460px) {

  .topbar {
    padding:
      13px 12px;
  }

  .topbar h1 {
    font-size: 16px;
  }

  .eyebrow {
    font-size: 8px;

    letter-spacing: 1.2px;
  }

  .clock {
    font-size: 10px;
  }

  .content {
    width:
      calc(100% - 18px);

    padding-top: 18px;
  }

  .quick-grid {
    grid-template-columns:
      1fr 1fr;
  }

  .quick-card {
    
