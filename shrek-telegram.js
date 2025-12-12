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
