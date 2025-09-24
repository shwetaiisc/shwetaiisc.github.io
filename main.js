// Load content from content.json and populate sections
fetch('content.json')
  .then(res => res.json())
  .then(content => {
    // About
    document.getElementById('about').innerHTML = `
      <h2>About Me</h2>
      <h3>${content.about.name}</h3>
      <p><strong>${content.about.title}</strong></p>
      <p>${content.about.bio}</p>
      <p><b>Location:</b> ${content.about.location}</p>
      <p><b>Email:</b> <a href="mailto:${content.about.email}">${content.about.email}</a></p>
    `;

    // Publications
    document.getElementById('publications').innerHTML = `
      <h2>Publications</h2>
      <ul>
        ${content.publications.map(pub => `
          <li>
            <b>${pub.title}</b><br>
            <em>${pub.authors}</em><br>
            <span>${pub.venue}</span><br>
            ${Object.entries(pub.links).map(([type, url]) => url ?
              `<a href="${url}" target="_blank">${type[0].toUpperCase()+type.slice(1)}</a>` : '').join(' ')}
          </li>
        `).join('')}
      </ul>
    `;

    // Experience
    document.getElementById('experience').innerHTML = `
      <h2>Experience</h2>
      <ul>
        ${content.experience.map(exp => `
          <li>
            <b>${exp.role}</b>, ${exp.organization} <span style="color: #888">(${exp.years})</span>
            <br>${exp.description}
          </li>
        `).join('')}
      </ul>
    `;

    // Talks
    document.getElementById('talks').innerHTML = `
      <h2>Talks</h2>
      ${content.talks.length === 0 ? "<p>No talks yet.</p>" : ""}
      <ul>
        ${content.talks.map(talk => `
          <li class="talk-item">
            <b>${talk.title}</b><br>
            <span>${talk.event}</span>
            <span style="color:#888;"> (${talk.date})</span>
            ${talk.link ? `<br><a href="${talk.link}" target="_blank">Link</a>` : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // News
    document.getElementById('news').innerHTML = `
      <h2>News</h2>
      ${content.news.length === 0 ? "<p>No news yet.</p>" : ""}
      <ul>
        ${content.news.map(item => `
          <li class="news-item">
            <span style="color:#888;">${item.date}:</span> 
            ${item.text}
            ${item.link ? `<br><a href="${item.link}" target="_blank">More</a>` : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // Projects
    document.getElementById('projects').innerHTML = `
      <h2>Projects</h2>
      <ul>
        ${content.projects.map(proj => `
          <li>
            <b>${proj.name}</b>: ${proj.description}
            ${proj.link ? ` [<a href="${proj.link}" target="_blank">Link</a>]` : ''}
          </li>
        `).join('')}
      </ul>
    `;

    // Contact
    document.getElementById('contact').innerHTML = `
      <h2>Contact</h2>
      <ul>
        <li><b>Email:</b> <a href="mailto:${content.contact.email}">${content.contact.email}</a></li>
        ${content.contact.linkedin ? `<li><b>LinkedIn:</b> <a href="${content.contact.linkedin}" target="_blank">${content.contact.linkedin}</a></li>` : ''}
        <li><b>GitHub:</b> <a href="${content.contact.github}" target="_blank">${content.contact.github}</a></li>
      </ul>
    `;

    // Footer year
    document.getElementById('year').textContent = new Date().getFullYear();

    // Highlight active navbar link on scroll
    const navLinks = document.querySelectorAll('nav a');
    const sectionIds = ['about','publications','experience','talks','news','projects','contact'];
    const sectionElements = sectionIds.map(id => document.getElementById(id));
    window.addEventListener('scroll', () => {
      let current = '';
      sectionElements.forEach((sec, idx) => {
        const top = sec.getBoundingClientRect().top + window.scrollY - 80;
        if(window.scrollY >= top) {
          current = sectionIds[idx];
        }
      });
      navLinks.forEach(link => {
        link.classList.remove('active');
        if(link.getAttribute('href') === '#' + current) {
          link.classList.add('active');
        }
      });
    });
  })
  .catch(e => {
    document.querySelector('main').innerHTML = "<p>Could not load content. Please check your content.json file.</p>";
    console.error(e);
  });
