function rendermidnight() {
  const p = photoHtml();
  injectmidnightTemplateStyles()

  const icon = (svg) =>
    `<span style="display:inline-flex;align-items:center;margin-right:6px;color:#6f93c1">
      ${svg}
    </span>`;

  const ICONS = {

    profile: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <circle cx="12" cy="8" r="4" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
        <path d="M4 20a8 8 0 0 1 16 0" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
      </svg>`,

    education: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M3 7l9-4 9 4-9 4-9-4z" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
        <path d="M5 10v6c0 1 3 3 7 3s7-2 7-3v-6" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
      </svg>`,

    experience: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <rect x="3" y="7" width="18" height="13" rx="2" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
        <path d="M9 7V5h6v2" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
      </svg>`,

    references: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <circle cx="12" cy="7" r="3.5" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
        <path d="M5 21a7 7 0 0 1 14 0" stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
      </svg>`,

    contact: `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
        <path d="M3 5a2 2 0 0 1 2-2h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2
        C9.8 19 5 14.2 5 7a2 2 0 0 1-2-2z"
        stroke="rgb(117, 125, 129)" stroke-width="1.5" stroke-linecap="round"/>
      </svg>`,


    interests: `
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
        <path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2
        4 4 0 0 1 7 2c0 5.6-7 10-7 10z"
        stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
      </svg>`,

    phone: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M3 5a2 2 0 0 1 2-2h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2C9.8 19 5 14.2 5 7a2 2 0 0 1-2-2z"
        stroke="#6f93c1" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>`,

    email: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="#6f93c1" stroke-width="1.5"/>
      <path d="M3 7l9 6 9-6" stroke="#6f93c1" stroke-width="1.5"/>
    </svg>`,

    location: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M12 22s7-7 7-12a7 7 0 1 0-14 0c0 5 7 12 7 12z"
        stroke="#6f93c1" stroke-width="1.5"/>
      <circle cx="12" cy="10" r="2.5" stroke="#6f93c1" stroke-width="1.5"/>
    </svg>`,

    website: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <circle cx="12" cy="12" r="9" stroke="#6f93c1" stroke-width="1.5"/>
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"
        stroke="#6f93c1" stroke-width="1.5"/>
    </svg>`,

    linkedin: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="3"
        stroke="#6f93c1" stroke-width="1.5"/>
      <path d="M8 11v5M8 8h.01M12 16v-3a2 2 0 0 1 4 0v3"
        stroke="#6f93c1" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,


    skills: `<svg viewBox="0 0 24 24" width="22" height="22" fill="none">
      <path d="M12 2l2.5 5 5.5.8-4 4 .9 5.7-4.9-2.6-4.9 2.6.9-5.7-4-4 5.5-.8L12 2z"
        stroke="rgb(117, 125, 129)" stroke-width="1.5"/>
    </svg>`,

    campany: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none">
    <rect x="3" y="7" width="18" height="13" rx="2"
      stroke="#6f93c1" stroke-width="1.5"/>
    <path d="M9 7V5h6v2"
      stroke="#6f93c1" stroke-width="1.5"/>
  </svg>`,

    calendar: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <rect x="3" y="4" width="18" height="17" rx="2"
    stroke="#6f93c1" stroke-width="1.5"/>
  <path d="M8 2v4M16 2v4M3 10h18"
    stroke="#6f93c1" stroke-width="1.5"/>
</svg>`,

    heart: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <path d="M12 21s-7-4.5-7-10.5a4 4 0 0 1 7-2.5
           4 4 0 0 1 7 2.5c0 6-7 10.5-7 10.5z"
    stroke="#6f93c1" stroke-width="1.5"/>
</svg>`,

    user: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <circle cx="12" cy="7.5" r="3.5"
    stroke="#6f93c1" stroke-width="1.5"/>
  <path d="M4.5 20a7.5 7.5 0 0 1 15 0"
    stroke="#6f93c1" stroke-width="1.5"/>
</svg>`,

    faith: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <path d="M12 2.5v19M5.5 9.5h13"
    stroke="#6f93c1" stroke-width="1.5" stroke-linecap="round"/>
</svg>`,

    group: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <circle cx="7.5" cy="9" r="3"
    stroke="#6f93c1" stroke-width="1.5"/>
  <circle cx="16.5" cy="9" r="3"
    stroke="#6f93c1" stroke-width="1.5"/>
  <path d="M2.5 20a6 6 0 0 1 10 0M11.5 20a6 6 0 0 1 10 0"
    stroke="#6f93c1" stroke-width="1.5"/>
</svg>`,

    car: `
<svg viewBox="0 0 24 24" width="16" height="16" fill="none">
  <rect x="3" y="9" width="18" height="7" rx="2"
    stroke="#6f93c1" stroke-width="1.5"/>
  <path d="M6 9l2-4h8l2 4"
    stroke="#6f93c1" stroke-width="1.5"/>
  <circle cx="7.5" cy="17" r="1.5"
    stroke="#6f93c1" stroke-width="1.5"/>
  <circle cx="16.5" cy="17" r="1.5"
    stroke="#6f93c1" stroke-width="1.5"/>
</svg>`,

    language: `
<svg viewBox="0 0 24 24" width="22" height="22" fill="none">
  <path d="M4 5h16M4 12h10M4 19h16"
    stroke="rgb(117,125,129)" stroke-width="1.5"/>
</svg>`,

  }
  return `
  <div class="resume_Template_1">
    <aside class="sidebar_Template_1">
      <div class="photo-wrap_Template_1">${p}</div>

      <div style="margin-top:85px;text-align:center">
        <div class="name_Template_1">${escapeHtml(data.personal.fullName || '')}</div>
        <div class="role_Template_1">${escapeHtml(data.personal.title || '')}</div>
      </div>

      ${data.summary && data.summary.trim()
      ? `
<section class="section_Template_1 summary">
  <div  class="heading_Template_1">
    <h2>${ICONS.profile}<span>Profile</span></h2>
  </div>
  <p class="about_Template_1">${escapeHtml(data.summary)}</p>
</section>
`
      : ''}

${(
      data.personal.phone ||
      data.personal.email ||
      data.personal.location ||
      data.personal.website ||
      data.personal.linkedin
    ) ? `
<div class="side-section_Template_1">
  <div class="section-title_Template_1">
    ${ICONS.contact} Contact
  </div>
  <ul class="contact-list_Template_1">

    ${data.personal.phone
      ? `<li>${icon(ICONS.phone)}${escapeHtml(data.personal.phone)}</li>`
      : ''}

    ${data.personal.email
      ? `<li>${icon(ICONS.email)}${escapeHtml(data.personal.email)}</li>`
      : ''}

    ${data.personal.location
      ? `<li>${icon(ICONS.location)}${escapeHtml(data.personal.location)}</li>`
      : ''}

    ${data.personal.website
      ? `<li>${icon(ICONS.website)}${escapeHtml(data.personal.website)}</li>`
      : ''}

    ${data.personal.linkedin
      ? `<li>${icon(ICONS.linkedin)}${escapeHtml(data.personal.linkedin)}</li>`
      : ''}

    ${data.personal.dob
      ? `<li>${icon(ICONS.calendar)}${escapeHtml(data.personal.dob)}</li>`
      : ''}
    ${data.personal.gender
      ? `<li>${icon(ICONS.user)}${escapeHtml(data.personal.gender)}</li>`
      : ''}

${data.personal.race
      ? `<li>${icon(ICONS.group)}${escapeHtml(data.personal.race)}</li>`
      : ''}

${data.personal.religion
      ? `<li>${icon(ICONS.faith)}${escapeHtml(data.personal.religion)}</li>`
      : ''}

${data.personal.maritalStatus
      ? `<li>${icon(ICONS.heart)}${escapeHtml(data.personal.maritalStatus)}</li>`
      : ''}

${data.personal.driversLicence
      ? `<li>${icon(ICONS.car)}${escapeHtml(data.personal.driversLicence)}</li>`
      : ''}

  </ul>
</div>
` : ''}


    </aside>
<main class="content_Template_1" style="
  display:flex;
  flex-direction:column;
  flex-grow:1;
  background:#fff;
  color:#0f172a;
  font-size:10.5pt;
  line-height:17px;
">

${hasExperience() ? `
<div class="heading_Template_1 overflow" style="margin-bottom: 5px; margin-top: 5px;">
  <h2>${ICONS.experience}<span>Professional Experience</span></h2>
  <div class="rule"></div>
</div>
` : ``}

${data.experience.map(exp => `
  <!-- EXPERIENCE ITEM -->
  <div class="overflow" style="margin-top:1rem;font-weight:bold; display:flex; justify-content:space-between;">
    <p style="font-weight:800">${escapeHtml(exp.campany)}</p>
    ${[exp.start, exp.end].some(d => d && d.trim())
          ? `<i style="font-weight:400;font-size:13px;">${[exp.start, exp.end]
            .filter(d => d && d.trim())
            .join(' – ')}</i>`
          : ''
        }
  </div>

  <p class="overflow" style="margin:0;font-weight:600;color:rgb(59,57,57); margin-bottom: 5px;">
    ${escapeHtml(exp.role)}
  </p>

  ${exp.bullets && exp.bullets.length
          ? `
    ${exp.bullets.map(b => `
     <li class="overflow ${b?.trim() ? 'li' : ''}">
    ${escapeHtml(b)}
        </li>
          `).join('')}
      `
          : ''
        }
`).join('')}



        ${hasEducation() && `
<!-- EDUCATION HEADING -->
<div class="heading_Template_1 overflow" id="h2-edu" style="margin-bottom:5px;">
  <h2>
    ${ICONS.education}<span>EDUCATION</span>
  </h2>
  <div class="rule"></div>
</div>
`}

        <!-- EDUCATION ITEM -->
        ${data.education.map(edu => `
              <div class="overflow" style="margin-top:1rem;;font-weight:bold; display: flex; justify-content: space-between;">
              <p style="font-weight: 800">${escapeHtml(edu.degree)}</p>
              <i style="margin:0; float: right; font-weight:400; font-size: 13px; list-style-type: none;">${escapeHtml(edu.year || '')}</i>
            </div>
            <p class="overflow" style="margin:0; font-weight: 600; margin-bottom:5px; color: rgb(59, 57, 57);">${escapeHtml(edu.school)}</p>
              <li class="overflow" style="display:flex;white-space:pre-wrap;">
              </li>

              <li class="overflow ${edu.discription?.trim() ? 'li' : ''}">
             ${escapeHtml(edu.discription)}
             </li>
              `).join('')}

              ${renderSkillsPreview()}
              ${renderLanguagesPreview()}

            <section class="section_Template_1 overflow">
              <div class="heading_Template_1">
                <h2>${ICONS.interests}<span>Interests</span>
                </h2>
                <div class="rule"></div>
              </div>
              <ul class="skills-list_Template_1">
                <li>${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}</li>
              </ul>
            </section>

            <section class="section_Template_1 overflow">
          <div class="heading_Template_1">
          <h2>${ICONS.references}<span>References</span></h2>
          <div class="rule"></div>
          </div>
          ${data.references.map(ref => `
         <div class="ref-card-wrapper">
          <div class="ref-card_Template_1">

        ${ref.name ? `<h4>${escapeHtml(ref.name)}</h4>` : ''}

         ${(ref.campany || ref.position) ? `
         <p class="ref-line">
          ${ICONS.campany}
          ${[
              ref.campany
                ? `<strong>${escapeHtml(ref.campany)}</strong>`
                : '',
              ref.position
                ? escapeHtml(ref.position)
                : ''
            ].filter(Boolean).join(' / ')}
        </p>
      ` : ''}

      ${ref.phone ? `
        <p class="ref-line">
          ${ICONS.phone}
          ${escapeHtml(ref.phone)}
        </p>
      ` : ''}

      ${ref.email ? `
        <p class="ref-line">
          ${ICONS.email}
          ${escapeHtml(ref.email)}
        </p>
      ` : ''}
          </div>
        </div>
        `).join('')}
      </section>
        </main>
  </div>
  `;
}


renderLanguagesPreview

 <section class="section_Template_1 overflow">
            ${hasLanguage() ? `
            <div class="heading_Template_1">
            <h2>
            ${ICONS.language}
            <span>Languages</span>
           </h2>
            <div class="rule"></div>
           </div>
            ` : ""}

      <ul class="skills-list_Template_1 languages-list_Template_1 overflow">
        ${data.languages
        .filter(lang => lang.name?.trim())
         .map(lang => `
        <li class="language-item_Template_1">
         <span class="language-name_Template_1">
          ${escapeHtml(lang.name)}
         </span>
       ${renderLanguageLevel(lang.level)}
        </li>
      `).join('')}
      </ul>
    </section>