(() => {
  'use strict';
  const $ = (selector) => document.querySelector(selector);
  const money = new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 2 });
  const dayFormat = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormat = new Intl.DateTimeFormat('en-AU', { timeZone: 'Australia/Sydney', hour: 'numeric', minute: '2-digit', hour12: true });

  async function getData(path, signal) {
    const response = await fetch(path, { headers: { Accept: 'application/json' }, signal });
    let payload;
    try { payload = await response.json(); } catch { throw new Error('The event service returned an unexpected response.'); }
    if (!response.ok) {
      const error = new Error(response.status === 404 ? 'This event is no longer available. Please choose another event.' : (payload?.error?.message || 'We could not load this information.'));
      error.status = response.status;
      throw error;
    }
    return payload.data;
  }

  function setText(selector, value) { $(selector).textContent = value == null ? '' : String(value); }
  function dateOf(value) { const date = new Date(value); return Number.isNaN(date.getTime()) ? null : date; }
  function dateLabel(value) { const date = dateOf(value); return date ? dayFormat.format(date) : 'Date to be confirmed'; }
  function timeLabel(value) { const date = dateOf(value); return date ? timeFormat.format(date) : 'Time to be confirmed'; }
  function priceLabel(value) { const number = Number(value); return Number.isFinite(number) && number > 0 ? money.format(number) : 'Free'; }
  function moneyLabel(value) { const number = Number(value); return Number.isFinite(number) ? money.format(number) : 'To be confirmed'; }
  function eventLink(id) { return `/event.html?id=${encodeURIComponent(String(id))}`; }

  function showStatus(container, message, retry) {
    container.replaceChildren();
    const text = document.createElement('p'); text.textContent = message; container.append(text);
    if (retry) {
      const button = document.createElement('button');
      button.className = 'status-retry'; button.type = 'button'; button.textContent = 'Try again ↗';
      button.addEventListener('click', retry); container.append(button);
    }
    container.hidden = false;
  }

  function createCard(event, index) {
    const article = document.createElement('article'); article.className = `event-card tone-${index % 3}`;
    const link = document.createElement('a'); link.href = eventLink(event.id); link.className = 'card-link';
    link.setAttribute('aria-label', `View details for ${event.name || 'event'}`);
    const visual = document.createElement('div'); visual.className = 'card-visual'; visual.setAttribute('aria-hidden', 'true');
    const orbital = document.createElement('span'); orbital.className = 'card-orbit';
    const symbol = document.createElement('span'); symbol.className = 'card-symbol'; symbol.textContent = ['✳', '✦', '☼'][index % 3];
    const visualWords = document.createElement('span'); visualWords.className = 'card-visual-words'; visualWords.textContent = ['Good grows here.', 'Together, we can.', 'A brighter day.'][index % 3];
    visual.append(orbital, symbol, visualWords);
    const body = document.createElement('div'); body.className = 'card-body';
    const meta = document.createElement('div'); meta.className = 'card-meta';
    const category = document.createElement('span'); category.textContent = event.category?.name || 'Community event';
    const date = document.createElement('time'); date.textContent = dateLabel(event.startAt);
    if (dateOf(event.startAt)) date.dateTime = event.startAt;
    meta.append(category, date);
    const title = document.createElement('h3'); title.textContent = event.name || 'Community event';
    const purpose = document.createElement('p'); purpose.className = 'card-purpose'; purpose.textContent = event.purpose || '';
    const foot = document.createElement('div'); foot.className = 'card-foot';
    const place = document.createElement('span'); place.textContent = `⌖ ${event.city || event.venue || 'Location to be confirmed'}`;
    const arrow = document.createElement('span'); arrow.className = 'card-arrow'; arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true');
    foot.append(place, arrow); body.append(meta, title, purpose, foot); link.append(visual, body); article.append(link);
    return article;
  }

  function paintCards(container, events) {
    container.replaceChildren(...events.map(createCard));
    container.hidden = false;
  }

  async function home() {
    const status = $('#home-status'); const grid = $('#home-events');
    async function load() {
      grid.hidden = true; showStatus(status, 'Loading upcoming events…');
      try {
        const data = await getData('/api/events');
        if (!Array.isArray(data)) throw new Error('Event information is unavailable right now.');
        if (!data.length) { showStatus(status, 'No upcoming events are listed yet. Please check back soon.'); return; }
        const sorted = [...data].sort((a, b) => new Date(a.startAt) - new Date(b.startAt));
        paintCards(grid, sorted); status.hidden = true;
      } catch (error) { showStatus(status, error.message || 'Events are temporarily unavailable.', load); }
    }
    await load();
  }

  function readFilters() {
    const form = $('#search-form');
    return { date: form.elements.date.value, location: form.elements.location.value.trim(), category: form.elements.category.value };
  }
  function filterQuery(filters) {
    const params = new URLSearchParams();
    if (filters.date) params.set('date', filters.date);
    if (filters.location) params.set('location', filters.location);
    if (filters.category) params.set('category', filters.category);
    return params;
  }
  function restoreCategorySelection(select, category, createOption) {
    select.querySelector('[data-temporary-category]')?.remove();
    if (category && !Array.from(select.options).some((option) => option.value === category)) {
      const option = createOption();
      option.value = category;
      option.textContent = `Unknown category (${category.slice(0, 30)})`;
      option.dataset.temporaryCategory = 'true';
      select.append(option);
    }
    select.value = category;
  }
  function restoreFilters() {
    const params = new URLSearchParams(location.search); const form = $('#search-form');
    form.elements.date.value = params.get('date') || '';
    form.elements.location.value = params.get('location') || '';
    const category = params.get('category') || '';
    restoreCategorySelection(form.elements.category, category, () => document.createElement('option'));
  }

  async function search() {
    const form = $('#search-form'); const grid = $('#search-events'); const status = $('#search-status');
    const count = $('#results-count'); let currentRequest;
    restoreFilters();
    try {
      const categories = await getData('/api/categories');
      if (Array.isArray(categories)) {
        for (const item of categories) {
          const option = document.createElement('option'); option.value = String(item.id); option.textContent = item.name; form.elements.category.append(option);
        }
        restoreFilters();
      }
    } catch {
      const option = document.createElement('option'); option.disabled = true; option.textContent = 'Categories unavailable'; form.elements.category.append(option);
      restoreFilters();
    }
    async function load() {
      currentRequest?.abort(); currentRequest = new AbortController();
      grid.hidden = true; count.textContent = ''; showStatus(status, 'Finding events…');
      try {
        const query = filterQuery(readFilters()).toString();
        const events = await getData(`/api/events${query ? `?${query}` : ''}`, currentRequest.signal);
        if (!Array.isArray(events)) throw new Error('Event information is unavailable right now.');
        count.textContent = `${events.length} ${events.length === 1 ? 'event' : 'events'} found`;
        if (!events.length) { showStatus(status, 'No events match these filters. Try a different date, place or category.'); return; }
        paintCards(grid, events); status.hidden = true;
      } catch (error) {
        if (error.name === 'AbortError') return;
        showStatus(status, error.message || 'Events are temporarily unavailable.', load);
      }
    }
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;
      const query = filterQuery(readFilters()).toString();
      history.pushState(null, '', `/search.html${query ? `?${query}` : ''}`); load();
    });
    $('#clear-filters').addEventListener('click', () => {
      form.reset(); form.elements.category.querySelector('[data-temporary-category]')?.remove();
      history.pushState(null, '', '/search.html'); load();
    });
    window.addEventListener('popstate', () => { restoreFilters(); load(); });
    await load();
  }

  async function detail() {
    const status = $('#event-status'); const article = $('#event-detail');
    const id = new URLSearchParams(location.search).get('id');
    if (!id || !/^[1-9]\d*$/.test(id)) { showStatus(status, 'This event link is invalid. Please choose an event from the calendar.'); return; }
    async function load() {
      article.hidden = true; showStatus(status, 'Loading event details…');
      try {
        const event = await getData(`/api/events/${encodeURIComponent(id)}`);
        if (!event || typeof event !== 'object') throw new Error('Event information is unavailable right now.');
        document.title = `${event.name || 'Event'} | Harbourlight`;
        setText('#detail-category', event.category?.name || 'Community event');
        setText('#detail-name', event.name || 'Community event');
        setText('#detail-purpose', event.purpose || 'A moment to make a difference together.');
        setText('#detail-description', event.description || 'More information is coming soon.');
        setText('#detail-organisation', event.organisation?.name ? `Organised by ${event.organisation.name}.` : 'Organised for our community.');
        setText('#detail-goal', moneyLabel(event.fundraisingGoal));
        setText('#detail-raised', moneyLabel(event.amountRaised));
        const goal = Number(event.fundraisingGoal); const raised = Number(event.amountRaised);
        const percent = goal > 0 && Number.isFinite(raised) ? Math.max(0, Math.round((raised / goal) * 100)) : 0;
        $('#progress-fill').style.width = `${Math.min(percent, 100)}%`;
        $('.progress-track').setAttribute('aria-valuenow', String(Math.min(percent, 100)));
        setText('#progress-caption', goal > 0 ? `${percent}% of the goal raised` : 'Fundraising progress will be updated soon.');
        const sameDay = dateOf(event.startAt) && dateOf(event.endAt) && dayFormat.format(dateOf(event.startAt)) === dayFormat.format(dateOf(event.endAt));
        setText('#detail-when', `${dateLabel(event.startAt)} · ${timeLabel(event.startAt)}${event.endAt ? ` – ${sameDay ? '' : `${dateLabel(event.endAt)} · `}${timeLabel(event.endAt)}` : ''} (Sydney time)`);
        setText('#detail-where', [event.venue, event.city].filter(Boolean).join(', ') || 'To be confirmed');
        setText('#detail-price', priceLabel(event.ticketPrice));
        setText('#detail-aside-category', event.category?.name || 'Community event');
        status.hidden = true; article.hidden = false;
      } catch (error) {
        showStatus(status, error.message || 'This event is unavailable.', error.status === 404 ? null : load);
      }
    }
    $('#register-button').addEventListener('click', () => $('#register-dialog').showModal());
    $('#close-dialog').addEventListener('click', () => $('#register-dialog').close());
    await load();
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = { restoreCategorySelection, filterQuery };
  if (typeof document === 'undefined') return;
  const page = document.body.dataset.page;
  if (page === 'home') home();
  if (page === 'search') search();
  if (page === 'event') detail();
})();
