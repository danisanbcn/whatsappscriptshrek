// === CONFIG ===
const LINE_DELAY_MS = 2000;     // 2 segundos entre mensajes
const LONG_LINE_LIMIT = 3500;  // Telegram aguanta bastante, pero mejor no forzar
const SKIP_EMPTY_LINES = false;

// === TEXTO GIGANTE ===
const RAW_TEXT = `
estoy
flipando
mucho
`;

// === HELPERS ===
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

function getComposer() {
  // Telegram Web K
  return (
    document.querySelector('[contenteditable="true"][role="textbox"]') ||
    document.querySelector('div.input-message-input') ||
    document.querySelector('[contenteditable="true"]')
  );
}

function setText(el, text) {
  el.focus();
  document.execCommand('selectAll', false, null);
  document.execCommand('insertText', false, text);
  el.dispatchEvent(new InputEvent('input', { bubbles: true }));
}

function clickSendButton() {
  const btn =
    document.querySelector('button.send') ||
    document.querySelector('[aria-label="Send message"]') ||
    document.querySelector('button[title="Send"]');
  if (btn) {
    btn.click();
    return true;
  }
  return false;
}

function pressEnter(el) {
  ['keydown', 'keypress', 'keyup'].forEach(type => {
    el.dispatchEvent(new KeyboardEvent(type, {
      key: 'Enter',
      code: 'Enter',
      which: 13,
      keyCode: 13,
      bubbles: true
    }));
  });
}

async function sendOne(text) {
  const box = getComposer();
  if (!box) throw new Error('No encuentro el cuadro de texto. Abre un chat y reintenta.');

  setText(box, text);
  await sleep(80);

  if (!clickSendButton()) {
    pressEnter(box);
  }

  await sleep(150);
}

function splitLongLine(line, limit) {
  const parts = [];
  for (let i = 0; i < line.length; i += limit) {
    parts.push(line.slice(i, i + limit));
  }
  return parts;
}

(async () => {
  const lines = RAW_TEXT.replace(/\r\n/g, '\n').split('\n');

  const queue = [];
  for (const line of lines) {
    if (!SKIP_EMPTY_LINES && line === '') {
      queue.push(' '); // Telegram a veces ignora vacío → espacio troll
    } else if (line.length > LONG_LINE_LIMIT) {
      queue.push(...splitLongLine(line, LONG_LINE_LIMIT));
    } else {
      queue.push(line);
    }
  }

  console.log(`📨 Enviando ${queue.length} mensajes (Telegram Web K)...`);

  for (let i = 0; i < queue.length; i++) {
    try {
      await sendOne(queue[i]);
      console.log(`✔️ ${i + 1}/${queue.length}`);
      await sleep(LINE_DELAY_MS);
    } catch (e) {
      console.warn(`⚠️ Error en línea ${i + 1}: ${e.message}`);
      console.warn('⏳ Reintentando en 3s...');
      await sleep(3000);
      await sendOne(queue[i]);
      await sleep(LINE_DELAY_MS);
    }
  }

  console.log('🎉 Troll terminado. Telegram sigue en pie (de momento).');
})();

