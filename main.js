// Utility: throttle a function to run at most every `wait` ms
function throttle(fn, wait = 100) {
  let last = 0, timeout = null, savedArgs = null, savedThis = null;
  return function throttled(...args) {
    const now = Date.now();
    const remaining = wait - (now - last);
    savedArgs = args; savedThis = this;
    if (remaining <= 0) {
      last = now;
      fn.apply(savedThis, savedArgs);
      savedArgs = savedThis = null;
    } else if (!timeout) {
      timeout = setTimeout(() => {
        last = Date.now();
        timeout = null;
        fn.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }, remaining);
    }
  };
}

// Smooth scroll to an element with offset for sticky nav (desktop only)
function scrollToSection(el) {
  if (!el) return;
  const nav = document.querySelector('nav');
  // if nav is hidden (mobile), height is 0
  const navH = (nav && getComputedStyle(nav).display !== 'none')
    ? nav.getBoundingClientRect().height
    : 0;
  const top = window.scrollY + el.getBoundingClientRect().top - (navH + 10);
  window.scrollTo({ top, behavior: 'smooth' });
}

// Helpers
function renderLinks(links = {}) {
  return Object.entries(links)
    .filter(([_, url]) => !!url)
    .map(([type, url]) => {
      const label = type.charAt(0).toUpperCase() + type.slice(1);
      return `<a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .join(' ');
}

function setupActiveNav() {
  const nav = document.querySelector('nav');
  if (!nav || getComputedStyle(nav).display === 'none') return; // skip on mobile

  const navLinks = Array.from(nav.querySelectorAll('a'));
  const sections = navLinks
    .map(a => a.getAttribute('href'))
    .filter(h => h && h.startsWith('#'))
    .map(h => h.slice(1))
    .map(id => ({ id, el: document.getElementById(id) }))
    .filter(s => s.el);

  const getNavH = () => (nav ? nav.getBoundingClientRect().height : 0);

  const onScroll = throttle(() => {
    const offset = getNavH() + 12;
    let current = sections[0]?.id || '';
    for (const s of sections) {
      const top = s.el.getBoundingClientRect().top + window.scrollY - offset;
      if (window.scrollY >= top) current = s.id;
    }
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, 100);

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', throttle(onScroll, 150));
  onScroll();

  navLinks.forEach(a => {
    const hash = a.getAttribute('href') || '';
    if (hash.startsWith('#')) {
      const target = document.getElementById(hash.slice(1));
      a.addEventListener('click', (e) => {
        e.preventDefault();
        scrollToSection(target);
        navLinks.forEach(l => l.classList.remove('active'));
        a.classList.add('active');
        history.replaceState(null, '', hash);
      });
    }
  });
}

// Load content and populate sections
fetch('content.json')
  .then(res => res.json())
  .then(content => {
    // ==== About: bind fields ====
    if (content.about) {
      const { photo, name, title, bio, location, email } = content.about;

      const photoEl = document.getElementById('about-photo');
      if (photoEl && photo) photoEl.src = photo;

      const nameEl = document.getElementById('about-name');
      if (nameEl && name) nameEl.textContent = name;

      const titleEl = document.getElementById('about-title');
      if (titleEl && title) {
        const html = titleEl.innerHTML;
        const commaIdx = html.indexOf(',');
        const suffix = commaIdx !== -1 ? html.slice(commaIdx) : '';
        titleEl.innerHTML = `${title}${suffix}`;
      }

      const bioEl = document.getElementById('about-bio');
      if (bioEl && bio) bioEl.textContent = bio;

      const locEl = document.getElementById('about-location');
      if (locEl && location) locEl.textContent = location;

      const emailEl = document.getElementById('about-email');
      if (emailEl && email) {
        emailEl.textContent = email;
        emailEl.href = `mailto:${email}`;
      }
    }

    // ==== Publications ====
    const pubsRoot = document.getElementById('publications');
    if (pubsRoot) {
      pubsRoot.innerHTML = `
        <h2>Publications</h2>
        <ul>
          ${(content.publications || []).map(pub => `
            <li>
              <b>${pub.title || ''}</b><br>
              <em>${pub.authors || ''}</em><br>
              <span>${pub.venue || ''}</span><br>
              ${renderLinks(pub.links)}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== Education ====
    const eduRoot = document.getElementById('education');
    if (eduRoot) {
      eduRoot.innerHTML = `
        <h2>Education</h2>
        <ul>
          ${(content.education || []).map(edu => `
            <li>
              <b>${edu.degree || ''}</b>, ${edu.institution || ''} <span style="color:#888">(${edu.years || ''})</span>
              ${edu.gpa ? `<br>GPA: ${edu.gpa}` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== Experience ====
    const expRoot = document.getElementById('experience');
    if (expRoot) {
      expRoot.innerHTML = `
        <h2>Experience</h2>
        <ul>
          ${(content.experience || []).map(exp => `
            <li>
              <b>${exp.role || ''}</b>, ${exp.organization || ''} <span style="color:#888">(${exp.years || ''})</span>
              <br>${exp.description || ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== Talks ====
    const talksRoot = document.getElementById('talks');
    if (talksRoot) {
      talksRoot.innerHTML = `
        <h2>Talks</h2>
        ${(content.talks || []).length === 0 ? "<p>No talks yet.</p>" : ""}
        <ul>
          ${(content.talks || []).map(talk => `
            <li class="talk-item">
              <b>${talk.title || ''}</b><br>
              <span>${talk.event || ''}</span>
              <span style="color:#888;"> (${talk.date || ''})</span>
              ${talk.link ? `<br><a href="${talk.link}" target="_blank" rel="noopener">Link</a>` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== News ====
    const newsRoot = document.getElementById('news');
    if (newsRoot) {
      newsRoot.innerHTML = `
        <h2>News</h2>
        ${(content.news || []).length === 0 ? "<p>No news yet.</p>" : ""}
        <ul>
          ${(content.news || []).map(item => `
            <li class="news-item">
              <span style="color:#888;">${item.date || ''}:</span>
              ${item.text || ''}
              ${item.link ? `<br><a href="${item.link}" target="_blank" rel="noopener">More</a>` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== Projects ====
    const projRoot = document.getElementById('projects');
    if (projRoot) {
      projRoot.innerHTML = `
        <h2>Projects</h2>
        <ul>
          ${(content.projects || []).map(proj => `
            <li>
              <b>${proj.name || ''}</b>: ${proj.description || ''}
              ${proj.link ? ` [<a href="${proj.link}" target="_blank" rel="noopener">Link</a>]` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }
        // ==== Awards ====
    const awardRoot = document.getElementById('awards');
    if (awardRoot) {
      awardRoot.innerHTML = `
        <h2>Awards</h2>
        <ul>
          ${(content.awards || []).map(award => `
            <li>
              <b>${award.name || ''}</b>: ${award.description || ''}
              ${award.link ? ` [<a href="${award.link}" target="_blank" rel="noopener">Link</a>]` : ''}
            </li>
          `).join('')}
        </ul>
      `;
    }

    // ==== Contact ====
    const contactRoot = document.getElementById('contact');
    if (contactRoot && content.contact) {
      contactRoot.innerHTML = `
        <h2>Contact</h2>
        <ul>
          <li><b>Email:</b> <a href="mailto:${content.contact.email}">${content.contact.email}</a></li>
          ${content.contact.linkedin ? `<li><b>LinkedIn:</b> <a href="${content.contact.linkedin}" target="_blank" rel="noopener">${content.contact.linkedin}</a></li>` : ''}
          <li><b>GitHub:</b> <a href="${content.contact.github}" target="_blank" rel="noopener">${content.contact.github}</a></li>
        </ul>
      `;
    }

    // Footer year
    const yr = document.getElementById('year');
    if (yr) yr.textContent = new Date().getFullYear();

    // Desktop nav behavior only (mobile nav is hidden)
    setupActiveNav();

    // Adjust for hash on load
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      setTimeout(() => scrollToSection(target), 50);
    }
  })
  .catch(e => {
    const main = document.querySelector('main');
    if (main) main.innerHTML = "<p>Could not load content. Please check your content.json file.</p>";
    console.error(e);
  });
