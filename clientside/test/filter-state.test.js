const { test } = require('node:test');
const assert = require('node:assert/strict');
const { restoreCategorySelection, filterQuery } = require('../app.js');

function fakeSelect() {
  const select = {
    options: [{ value: '', textContent: 'All categories', dataset: {} }],
    selected: '',
    querySelector() { return this.options.find((option) => option.dataset.temporaryCategory); },
    append(option) { this.options.push(option); },
    get value() { return this.selected; },
    set value(next) { this.selected = this.options.some((option) => option.value === next) ? next : ''; }
  };
  const createOption = () => ({ value: '', textContent: '', dataset: {}, remove() { select.options.splice(select.options.indexOf(this), 1); } });
  return { select, createOption };
}

test('unknown category remains selected and reaches the API query', () => {
  const { select, createOption } = fakeSelect();
  restoreCategorySelection(select, '999', createOption);
  assert.equal(select.value, '999');
  assert.match(select.options[1].textContent, /Unknown category/);
  assert.equal(filterQuery({ date: '', location: '', category: select.value }).toString(), 'category=999');

  select.append({ value: '2', textContent: 'Environment', dataset: {} });
  restoreCategorySelection(select, '2', createOption);
  assert.equal(select.value, '2');
  assert.equal(select.options.some((option) => option.dataset.temporaryCategory), false);
  assert.equal(filterQuery({ date: '2026-10-31', location: 'Wollongong', category: select.value }).toString(), 'date=2026-10-31&location=Wollongong&category=2');
});
