const section = document.getElementById('section');
const record = document.getElementById('record');
const fields = document.getElementById('fields');
const status = document.getElementById('status');
const save = document.getElementById('save');
const add = document.getElementById('add');
const remove = document.getElementById('remove');
let data;
let adding = false;
let dirty = false;

function fillRecords(selected = 0) {
  const key = section.value;
  const [,columns] = sections[key];
  record.replaceChildren();
  if (columns) {
    data.content[key].forEach((row, index) => {
      const title = ['videos','reviews'].includes(key) ? [row[1], row[3]] : row.slice(0,2);
      record.add(new Option(title.filter(Boolean).join(' · '), index));
    });
    record.selectedIndex = Math.min(selected, record.options.length - 1);
  }
  adding = Boolean(columns && !record.options.length);
  draw();
}

function draw() {
  const key = section.value;
  const [,columns,required] = sections[key];
  const row = columns && !adding ? data.content[key][Number(record.value)] : null;
  document.getElementById('record-label').hidden = !columns;
  record.disabled = !columns || adding;
  add.hidden = !columns;
  add.disabled = false;
  add.textContent = adding && record.options.length ? '追加をキャンセル' : '新規追加';
  remove.hidden = !columns || adding;
  remove.disabled = false;
  fields.disabled = false;
  save.disabled = false;
  fields.replaceChildren();
  (columns ?? ['本文']).forEach((title,index) => {
    const label = document.createElement('label');
    label.textContent = title;
    const input = document.createElement('textarea');
    input.rows = columns ? 2 : 18;
    input.name = 'field-' + index;
    input.required = required?.includes(index) ?? false;
    input.maxLength = columns ? 10000 : 50000;
    input.value = columns ? row?.[index] ?? '' : data.content[key];
    label.append(input);
    fields.append(label);
  });
  dirty = false;
}

async function persist(deleting = false) {
  const key = section.value;
  const [,columns] = sections[key];
  const values = [...fields.querySelectorAll('textarea')].map(input => input.value);
  const content = structuredClone(data.content);
  const selected = Number(record.value);
  if (!columns) content[key] = values[0];
  else if (deleting) content[key].splice(selected, 1);
  else if (adding) content[key].push(values);
  else content[key][selected] = values;
  const next = adding ? content[key].length - 1 : selected;
  [section,record,fields,save,add,remove].forEach(node => node.disabled = true);
  status.textContent = '保存中…';
  try {
    const response = await fetch('/handbook/api/admin',{
      method:'PUT', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({revision:data.revision,content})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    data = result;
    fillRecords(next);
    status.textContent = '保存しました。閲覧画面に反映されます。';
  } catch (error) {
    status.textContent = error.message || '保存できませんでした。';
  } finally {
    [section,fields,save,add,remove].forEach(node => node.disabled = false);
    record.disabled = !columns || adding;
  }
}

function confirmDiscard() {
  return !dirty || confirm('保存していない変更を破棄しますか？');
}

async function start() {
  const response = await fetch('/handbook/api/admin');
  if (!response.ok) throw new Error('編集データを読み込めませんでした。');
  data = await response.json();
  for (const [key,[title]] of Object.entries(sections)) section.add(new Option(title,key));
  section.disabled = false;
  let previousSection = section.value;
  let previousRecord = '0';
  section.addEventListener('change', () => {
    if (!confirmDiscard()) { section.value = previousSection; return; }
    previousSection = section.value;
    fillRecords();
    previousRecord = record.value;
  });
  record.addEventListener('change', () => {
    if (!confirmDiscard()) { record.value = previousRecord; return; }
    previousRecord = record.value;
    draw();
  });
  record.addEventListener('focus', () => previousRecord = record.value);
  add.addEventListener('click', () => {
    if (!confirmDiscard()) return;
    adding = !adding || !record.options.length;
    draw();
    if (adding) fields.querySelector('textarea')?.focus();
  });
  remove.addEventListener('click', () => {
    if (confirm('この行を削除して閲覧画面に反映しますか？')) persist(true);
  });
  fields.addEventListener('input', () => dirty = true);
  window.addEventListener('beforeunload', event => {
    if (dirty) { event.preventDefault(); event.returnValue = ''; }
  });
  document.getElementById('editor-form').addEventListener('submit', event => {
    event.preventDefault();
    persist();
  });
  fillRecords();
  status.textContent = '';
}
start().catch(error => status.textContent = error.message);
