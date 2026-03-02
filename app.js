let zoomControl;

(function () {
  let previewRAF = null;

  function updatePreviewLive() {
    if (previewRAF) return;

    previewRAF = requestAnimationFrame(() => {
      renderPreview();
      previewRAF = null;
    });
  }

  function updateExpHeader(expId) {
    const card = document.querySelector(`.exp-card[data-exp="${expId}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.exp-title');
    if (!titleEl) return;

    const exp = data.experience.find(x => x.id === expId);
    if (!exp) return;

    titleEl.innerHTML = `
    ${escapeHtml(exp.role || 'New Role')}
    <span class="exp-sep">|</span>
    ${escapeHtml(exp.campany || 'campany')}
  `;
  }

  function updateEduHeader(eduId) {
    const card = document.querySelector(`.edu-card[data-edu="${eduId}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.edu-title');
    if (!titleEl) return;

    const edu = data.education.find(x => x.id === eduId);
    if (!edu) return;

    titleEl.innerHTML = `
    ${escapeHtml(edu.degree || 'New Degree')}
    <span class="edu-sep">|</span>
    ${escapeHtml(edu.school || 'Institution')}
  `;
  }

  function updateRefHeader(refId) {
    const card = document.querySelector(`.ref-card[data-ref="${refId}"]`);
    if (!card) return;

    const titleEl = card.querySelector('.ref-title');
    if (!titleEl) return;

    const ref = data.references.find(x => x.id === refId);
    if (!ref) return;

    titleEl.innerHTML = `
    ${escapeHtml(ref.name || 'Contact Person')}
    <span class="ref-sep">|</span>
    ${escapeHtml(ref.campany || 'campany')}
  `;
  }
  // --- Utilities ------------------------------------------------------------
  function id() { return Math.random().toString(36).slice(2, 9); }
  function $(s) { return document.querySelector(s); }
  function $id(s) { return document.getElementById(s); }
  function $all(s) { return Array.from(document.querySelectorAll(s)); }

  // Basic stopwords set (simple)
  const STOPWORDS = new Set(("a about above after again against all am an and any are as at be because been before being below between both but by could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just me more most my yourself yourselves no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was were what when where which while who whom why with would you your yours").split(" "));


  // --- DOM refs -------------------------------------------------------------
  const refs = {
    fullName: $id('fullName'),
    title: $id('title'),
    email: $id('email'),
    phone: $id('phone'),
    location: $id('location'),
    website: $id('website'),
    linkedin: $id('linkedin'),
    summary: $id('summary'),
    experienceContainer: $id('experienceContainer'),
    educationContainer: $id('educationContainer'),
    referencesContainer: $id('referencesContainer'),
    skillsContainer: $id('skillsContainer'),
    interestsContainer: $id('interestsContainer'),
    resumePreview: $id('resumePreview'),
    addExpBtn: $id('addExpBtn'),
    addEduBtn: $id('addEduBtn'),
    addRefBtn: $id('addrefBtn'),
    addSkillBtn: $id('addSkillBtn'),
    addinterestBtn: $id('addinterestBtn'),
    pdfBtn: $id('pdfBtn'),
    pdfAtsBtn: $id('pdfAtsBtn'),
    exportJsonBtn: $id('exportJsonBtn'),
    importJsonInput: $id('importJsonInput'),
    jobDesc: $id('jobDesc'),
    keywordPanel: $id('keywordPanel'),
    covercampany: $id('covercampany'),
    coverRole: $id('coverRole'),
    generateCoverBtn: $id('generateCoverBtn'),
    coverPreview: $id('coverPreview'),
    downloadCoverPdfBtn: $id('downloadCoverPdfBtn'),
    templateSelect: $id('templateSelect'),
    profilePicInput: $id('profilePicInput'),
    photoPreviewContainer: $id('photoPreviewContainer'),
    photoPreviewContainers: $all('#photoPreviewContainer, .photoPreviewContainer, .photo-preview'),
    removePhotoBtn: $id('removePhotoBtn')

  };


  // --- Default data --------------------------------------------------------
  const DEFAULT = {
    personal: {
      fullName: "Samira Khumalo",
      title: "Engineering Manager",
      email: "samira.k@example.com",
      phone: "+27 82 999 8888",
      location: "Johannesburg, South Africa",
      website: "samirak.dev",
      linkedin: "linkedin.com/in/samirak",
      photo: "" // data URL
    },
    summary: "People-first engineering leader with a track record of scaling teams and shipping reliable distributed systems.",
    experience: [
      { id: id(), role: "Engineering Manager", campany: "Fintech Co", start: "Mar 2021", end: "Present", bullets: ["Grew backend team from 4 to 12 engineers while maintaining velocity.", "Introduced SRE practices reducing incidents by 40%."] },
      { id: id(), role: "Senior Software Engineer", campany: "Platform Labs", start: "2018", end: "2021", bullets: ["Built APIs used by 10M+ monthly active users.", "Mentored junior engineers."] }
    ],
    education: [
      { id: id(), school: "University of Cape Town", degree: "BSc Computer Science", discription: "school discribtion here", year: "2015" }
    ],
    references: [
      { id: id(), name: "April Piters", campany: "Console", position: "CEO", phone: "0825655525", email: "example@email.com" }
    ],
    skills: ["Leadership", "Distributed Systems", "Hiring & Mentoring", "Reliability"],
    interests: ["Leadership", "Distributed Systems", "Hiring & Mentoring", "Reliability"],
    template: "modern"
  };
  // --- State ---------------------------------------------------------------
  let data = load() || JSON.parse(JSON.stringify(DEFAULT));
  let lastJDKeywords = [];

  // --- Init ----------------------------------------------------------------
  function init() {
    bindProfileInputs();
    renderLists();
    renderPreview();
    bindButtons();
    refs.templateSelect.value = data.template || 'modern';
    window.addEventListener('beforeunload', save);
    renderPhotoPreview();

    const savedScale = Number(localStorage.getItem(PHOTO_SCALE_KEY)) || 100;
    photoScale.value = savedScale;

    const scale = savedScale / 100;
    document.querySelectorAll(
      '#photoPreviewContainer, .photoPreviewContainer, .photo-wrap_Template_1'
    ).forEach(container => {
      const img = container.querySelector('img');
      if (img) {
        img.style.transform = `scale(${scale})`;
        img.style.transformOrigin = 'center';
      }
    });

    refs.educationContainer.addEventListener('click', function (e) {
      const header = e.target.closest('.edu-header');
      if (!header) return;

      const card = header.closest('.edu-card');
      const eduId = card.dataset.edu;

      const isActive = card.classList.contains('active');

      // Close all
      refs.educationContainer
        .querySelectorAll('.edu-card')
        .forEach(c => c.classList.remove('active'));

      if (!isActive) {
        card.classList.add('active');
        localStorage.setItem('lastOpenEdu', eduId);
      } else {
        localStorage.removeItem('lastOpenEdu');
      }
    });

    refs.experienceContainer.addEventListener('click', function (e) {
      const header = e.target.closest('.exp-header');
      if (!header) return;

      const card = header.closest('.exp-card');
      const expId = card.dataset.exp;

      const isActive = card.classList.contains('active');

      // Close all
      refs.experienceContainer
        .querySelectorAll('.exp-card')
        .forEach(c => c.classList.remove('active'));

      if (!isActive) {
        card.classList.add('active');

        // 🔥 remember last opened
        localStorage.setItem('lastOpenExp', expId);
      } else {
        // 🔥 if clicking same header → close it and clear memory
        localStorage.removeItem('lastOpenExp');
      }
    });


    refs.referencesContainer.addEventListener('click', function (e) {
      const header = e.target.closest('.ref-header');
      if (!header) return;

      const card = header.closest('.ref-card');
      const refId = card.dataset.ref;

      const isActive = card.classList.contains('active');

      // Close all
      refs.referencesContainer
        .querySelectorAll('.ref-card')
        .forEach(c => c.classList.remove('active'));

      if (!isActive) {
        card.classList.add('active');
        localStorage.setItem('lastOpenRef', refId);
      } else {
        localStorage.removeItem('lastOpenRef');
      }
    });

  }

  // --- Photo handling -----------------------------------------------------
  // Max file size ~2MB
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const OUTPUT_PIXEL = 400; // square output size (pixels) — decent for print and PDF
const PHOTO_SCALE_KEY = 'photoScale';
  function handleProfilePicFile(file) {
    if (!file) return;
    if (!file.type.match(/^image\/(png|jpeg|jpg)$/)) { alert('Only PNG or JPEG allowed.'); return; }
    if (file.size > MAX_FILE_BYTES) { alert('Image too large (limit 2MB).'); return; }
    const reader = new FileReader();
    reader.onload = function (ev) {
      const img = new Image();
      img.onload = function () {
        const dataUrl = centerCropToDataURL(img, OUTPUT_PIXEL);
        data.personal.photo = dataUrl;
        save();
        renderPhotoPreview();
        renderPreview();
        const savedScale = Number(localStorage.getItem(PHOTO_SCALE_KEY)) || 100;
const scale = savedScale / 100;

document.querySelectorAll(
  '#photoPreviewContainer, .photoPreviewContainer, .photo-wrap_Template_1, .photo-wrap_Template_1',
).forEach(container => {
  const img = container.querySelector('img');
  if (img) {
    img.style.transform = `scale(${scale})`;
    img.style.transformOrigin = 'center';
  }
});
      };
      img.onerror = function () { alert('Failed to read image. Try a different file.'); };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  function centerCropToDataURL(img, size) {
    // create square canvas, center-crop the source image into it, respecting aspect ratio
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Determine scale so smaller side fits the square, then crop center
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    const srcRatio = iw / ih;
    let sx = 0, sy = 0, sSize = 0;

    if (iw > ih) {
      // wider than tall: crop sides
      sSize = ih;
      sx = Math.round((iw - ih) / 2);
      sy = 0;
    } else {
      // taller than wide: crop top/bottom
      sSize = iw;
      sx = 0;
      sy = Math.round((ih - iw) / 2);
    }

    // draw cropped square to full canvas
    try {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
      // return high-quality JPEG (smaller than PNG) but keep quality high
      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (e) {
      console.warn('Crop error', e);
      return '';
    }
  }

  function removePhoto() {
    data.personal.photo = '';
    save();
    renderPhotoPreview();
    renderPreview();
  }

  const photoScale = document.getElementById('photoScale');

  photoScale.addEventListener('input', () => {
    const scaleValue = Number(photoScale.value);
    const scale = scaleValue / 100;

    // 🔥 save to localStorage
    localStorage.setItem(PHOTO_SCALE_KEY, scaleValue);

    const containers = document.querySelectorAll(
      '#photoPreviewContainer, .photoPreviewContainer, .photo-wrap_Template_1'
    );

    containers.forEach(container => {
      const img = container.querySelector('img');
      if (!img) return;

      img.style.transform = `scale(${scale})`;
      img.style.transformOrigin = 'center';
    });
  });


  function renderPhotoPreview() {
    const containers =
      refs.photoPreviewContainers?.length
        ? refs.photoPreviewContainers
        : [refs.photoPreviewContainer];

    const photo = getPhotoSrc();

    containers.forEach(container => {
      if (!container) return;

      container.innerHTML = '';

      if (photo) {
        const img = document.createElement('img');
        img.src = photo;
        img.alt = 'Profile photo';
        container.appendChild(img);
      } else {
        const span = document.createElement('div');
        span.className = 'initials';
        span.textContent = getInitials(data.personal.fullName || '');
        container.appendChild(span);
      }
    });
  }

  function getPhotoSrc() {
    const p = data && data.personal && data.personal.photo;
    if (!p) return '';
    // only allow data URLs that look like images
    if (typeof p === 'string' && p.indexOf('data:image/') === 0) return p;
    return '';
  }

  function getInitials(name) {
    if (!name) return '';
    const parts = name.trim().split(/\s+/).slice(0, 2);
    return parts.map(p => p[0] ? p[0].toUpperCase() : '').join('');
  }

  // --- Bind profile inputs -----------------------------------------------
  function bindProfileInputs() {
    refs.fullName.value = data.personal.fullName || '';
    refs.title.value = data.personal.title || '';
    refs.email.value = data.personal.email || '';
    refs.phone.value = data.personal.phone || '';
    refs.location.value = data.personal.location || '';
    refs.website.value = data.personal.website || '';
    refs.linkedin.value = data.personal.linkedin || '';
    refs.summary.value = data.summary || '';

    ['fullName', 'title', 'email', 'phone', 'location', 'website', 'linkedin'].forEach(key => {
      $id(key).addEventListener('input', (e) => {
        data.personal[key] = e.target.value;
        renderPhotoPreview(); // initials may change
        renderPreview();
        save();

      });
    });

    refs.summary.addEventListener('input', (e) => {
      data.summary = e.target.value;
      renderPreview();
      save();
    });

    refs.templateSelect.addEventListener('change', (e) => {
      data.template = e.target.value;
      renderPreview();
      save();
    });

    // photo input
    if (refs.profilePicInput) {
      refs.profilePicInput.addEventListener('change', (e) => {
        const f = e.target.files && e.target.files[0];
        handleProfilePicFile(f);
        e.target.value = ''; // reset
      });
    }
    if (refs.removePhotoBtn) {
      refs.removePhotoBtn.addEventListener('click', () => {
        if (confirm('Remove profile photo?')) removePhoto();
      });
    }
  }

  // --- Render lists (experience, education, skills, references) -----------------------
  function renderLists() {

    // Education
    refs.educationContainer.innerHTML = '';
    data.education.forEach((edu) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = node.innerHTML = node.innerHTML = `
  <div class="edu-card" data-edu="${edu.id}">

    <!-- HEADER -->
    <div class="edu-header">
      <div class="edu-title">
        ${escapeHtml(edu.degree || 'New Degree')}
        <span class="edu-sep">|</span>
        ${escapeHtml(edu.school || 'Institution')}
      </div>
      <div class="edu-actions">
        <i class="fa-solid fa-chevron-down edu-chevron"></i>
      </div>
    </div>

    <!-- BODY -->
    <div class="edu-body">

      <div class="edu-grid">

        <div class="field">
          <label>Degree</label>
          <input class="input_data"
            data-id="${edu.id}"
            data-field="degree"
            value="${escapeHtml(edu.degree)}"
            placeholder="e.g. BSc Computer Science" />
        </div>

        <div class="field">
          <label>Institution</label>
          <input class="input_data"
            data-id="${edu.id}"
            data-field="school"
            value="${escapeHtml(edu.school)}"
            placeholder="e.g. University of Cape Town" />
        </div>

        <div class="field">
          <label>Year Obtained</label>
          <input class="input_data"
            data-id="${edu.id}"
            data-field="year"
            value="${escapeHtml(edu.year || '')}"
            placeholder="e.g. 2024" />
        </div>

        <div class="field">
          <label>Description</label>
          <input class="input_data"
            data-id="${edu.id}"
            data-field="discription"
            value="${escapeHtml(edu.discription || '')}"
            placeholder="Achievements, distinctions, major subjects..." />
        </div>

      </div>

      <div class="edu-actions-row">
        <button class="move btn-modern">
          <i class="fa-solid fa-arrow-up"
            data-action="upedu"
            data-id="${edu.id}"></i>
        </button>

        <button class="move btn-modern">
          <i class="fa-solid fa-arrow-down"
            data-action="downedu"
            data-id="${edu.id}"></i>
        </button>

        <button class="btn-danger">
          <i class="fa-solid fa-trash"
            data-action="removeedu"
            data-id="${edu.id}"></i>
        </button>
      </div>

    </div>
  </div>
`;
      refs.educationContainer.appendChild(node);
      // 🔥 Restore last opened education
      const lastOpenEdu = localStorage.getItem('lastOpenEdu');
      if (lastOpenEdu) {
        const card = refs.educationContainer.querySelector(
          `.edu-card[data-edu="${lastOpenEdu}"]`
        );
        if (card) {
          card.classList.add('active');
        }
      }
    });


    // Experience
    refs.experienceContainer.innerHTML = '';
    data.experience.forEach((exp) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = node.innerHTML = node.innerHTML = `
  <div class="exp-card" data-exp="${exp.id}">
    
    <!-- HEADER -->
    <div class="exp-header">
      <div class="exp-title">
        ${escapeHtml(exp.role || 'New Role')}
        <span class="exp-sep">|</span>
        ${escapeHtml(exp.campany || 'campany')}
      </div>
      <div class="exp-actions">
        <i class="fa-solid fa-chevron-down exp-chevron"></i>
      </div>
    </div>

    <!-- BODY -->
    <div class="exp-body">

      <div class="exp-grid">

        <div class="field">
          <label>Job Title</label>
          <input class="input_data"
            data-id="${exp.id}"
            data-field="role"
            value="${escapeHtml(exp.role)}"
            placeholder="e.g. Frontend Developer" />
        </div>

        <div class="field">
          <label>campany</label>
          <input class="input_data"
            data-id="${exp.id}"
            data-field="campany"
            value="${escapeHtml(exp.campany)}"
            placeholder="e.g. Google" />
        </div>

        <div class="field">
          <label>Start Date</label>
          <input class="input_data"
            data-id="${exp.id}"
            data-field="start"
            value="${escapeHtml(exp.start || '')}"
            placeholder="e.g. Jan 2023" />
        </div>

        <div class="field">
          <label>End Date</label>
          <input class="input_data"
            data-id="${exp.id}"
            data-field="end"
            value="${escapeHtml(exp.end || '')}"
            placeholder="e.g. Present" />
        </div>

      </div>

      <!-- RESPONSIBILITIES -->
      <div class="exp-bullets-section">
        <label class="section-label">Responsibilities</label>

        <div class="exp-bullets" data-bullets="${exp.id}">
          ${(exp.bullets || []).map((b, i) => `
            <div class="bullet-row">
              <input class="bullet-input"
                data-id="${exp.id}"
                data-field="bullet"
                data-idx="${i}"
                placeholder="Describe your achievement..."
                value="${escapeHtml(b)}" />
              
              <button class="bullet-delete">
                <i class="fa-solid fa-trash"
                   data-action="delbullet"
                   data-id="${exp.id}"
                   data-idx="${i}"></i>
              </button>
            </div>
          `).join('')}
        </div>

        <button class="addbullet modern-add">
          <i class="fa-solid fa-plus"
             data-action="addbullet"
             data-id="${exp.id}"></i>
          Add Responsibility
        </button>
      </div>

      <!-- ACTIONS -->
      <div class="exp-actions-row">
        <button class="btn-modern">
          <i class="fa-solid fa-arrow-up"
             data-action="up"
             data-id="${exp.id}"></i>
        </button>

        <button class="btn-modern">
          <i class="fa-solid fa-arrow-down"
             data-action="down"
             data-id="${exp.id}"></i>
        </button>

        <button class="btn-danger">
          <i class="fa-solid fa-trash"
             data-action="remove"
             data-id="${exp.id}"></i>
        </button>
      </div>

    </div>
  </div>
`;
      refs.experienceContainer.appendChild(node);
      // 🔥 Restore last opened experience
      const lastOpenExp = localStorage.getItem('lastOpenExp');
      if (lastOpenExp) {
        const card = refs.experienceContainer.querySelector(
          `.exp-card[data-exp="${lastOpenExp}"]`
        );
        if (card) {
          card.classList.add('active');
        }
      }
    });


    refs.referencesContainer.innerHTML = '';
    data.references.forEach((ref) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = `
  <div class="ref-card" data-ref="${ref.id}">

    <!-- HEADER -->
    <div class="ref-header">
      <div class="ref-title">
        ${escapeHtml(ref.name || 'Contact Person')}
        <span class="ref-sep">|</span>
        ${escapeHtml(ref.campany || 'campany')}
      </div>
      <div class="ref-actions">
        <i class="fa-solid fa-chevron-down ref-chevron"></i>
      </div>
    </div>

    <!-- BODY -->
    <div class="ref-body">

      <div class="ref-grid">

        <div class="field">
          <label>Contact Person</label>
          <input class="input_data"
            data-id="${ref.id}"
            data-field="name"
            value="${escapeHtml(ref.name)}"
            placeholder="e.g. John Smith" />
        </div>

        <div class="field">
          <label>campany</label>
          <input class="input_data"
            data-id="${ref.id}"
            data-field="campany"
            value="${escapeHtml(ref.campany)}"
            placeholder="e.g. ABC Corporation" />
        </div>

        <div class="field">
          <label>Position Held</label>
          <input class="input_data"
            data-id="${ref.id}"
            data-field="position"
            value="${escapeHtml(ref.position || '')}"
            placeholder="e.g. Senior Manager" />
        </div>

        <div class="field">
          <label>Phone Number</label>
          <input class="input_data"
            data-id="${ref.id}"
            data-field="phone"
            value="${escapeHtml(ref.phone || '')}"
            placeholder="e.g. +27 82 123 4567" />
        </div>

        <div class="field">
          <label>Email Address</label>
          <input class="input_data"
            data-id="${ref.id}"
            data-field="email"
            value="${escapeHtml(ref.email || '')}"
            placeholder="e.g. john@email.com" />
        </div>

      </div>

      <!-- ACTION BUTTONS -->
      <div class="ref-actions-row">
        <button class="btn-modern">
          <i class="fa-solid fa-arrow-up"
             data-action="upref"
             data-id="${ref.id}"></i>
        </button>

        <button class="btn-modern">
          <i class="fa-solid fa-arrow-down"
             data-action="downref"
             data-id="${ref.id}"></i>
        </button>

        <button class="btn-danger">
          <i class="fa-solid fa-trash"
             data-action="removeref"
             data-id="${ref.id}"></i>
        </button>
      </div>

    </div>
  </div>
`;
      refs.referencesContainer.appendChild(node);
      // 🔥 Restore last opened reference
      const lastOpenRef = localStorage.getItem('lastOpenRef');
      if (lastOpenRef) {
        const card = refs.referencesContainer.querySelector(
          `.ref-card[data-ref="${lastOpenRef}"]`
        );
        if (card) {
          card.classList.add('active');
        }
      }
    });

    // Skills
    refs.skillsContainer.innerHTML = '';
    data.skills.forEach((sk, idx) => {
      const node = document.createElement('div');
      node.className = 'item-row-skill-hobby';
      node.innerHTML = `<div class="row-skill-hobby"><input class="delete-raw" data-idx="${idx}" data-field="skill" placeholder="New Skill" value="${escapeHtml(sk)}" /><button class="btn tiny" id="delete"> <i class="fa-solid fa-trash" data-action="removeskill" data-idx="${idx}"></i> </button></div>`;
      refs.skillsContainer.appendChild(node);
    });

    // interests
    refs.interestsContainer.innerHTML = '';
    data.interests.forEach((its, idx) => {
      const node = document.createElement('div');
      node.className = 'item-row-skill-hobby';
      node.innerHTML = `<div class="row-skill-hobby"><input class="delete-raw" data-idx="${idx}" data-field="interest" placeholder="New interest" value="${escapeHtml(its)}" /><button class="btn tiny" id="delete"> <i class="fa-solid fa-trash" data-action="removeinterest" data-idx="${idx}" ></i> </button></div>`;
      refs.interestsContainer.appendChild(node);
    });

    // attach listeners
    refs.experienceContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', expInputHandler));
    refs.experienceContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', expButtonHandler));
    refs.educationContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', eduInputHandler));
    refs.educationContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', eduButtonHandler));
    refs.referencesContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', refInputHandler));
    refs.referencesContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', refButtonHandler));
    refs.skillsContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', skillInputHandler));
    refs.skillsContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', skillButtonHandler));
    refs.interestsContainer.querySelectorAll('input').forEach(inp => inp.addEventListener('input', interestInputHandler));
    refs.interestsContainer.querySelectorAll('button').forEach(btn => btn.addEventListener('click', interestButtonHandler));

  }

  // --- Input handlers ----------------------------------------------------
  function expInputHandler(e) {
    const idVal = e.target.dataset.id;
    const field = e.target.dataset.field;
    const idx = e.target.dataset.idx;

    const exp = data.experience.find(x => x.id === idVal);
    if (!exp) return;

    if (field === 'bullet') {
      exp.bullets[idx] = e.target.value;
    } else {
      exp[field] = e.target.value;

      // 🔥 LIVE update editor header
      if (field === 'role' || field === 'campany') {
        updateExpHeader(idVal);
      }
    }

    updatePreviewLive();
    save();
  }

  function expButtonHandler(e) {
    const action = e.target.dataset.action;
    const idVal = e.target.dataset.id;
    const idx = Number(e.target.dataset.idx);

    if (action === 'addbullet') {
      const exp = data.experience.find(x => x.id === idVal);
      exp.bullets.push('');
    } else if (action === 'delbullet') {
      const exp = data.experience.find(x => x.id === idVal);
      exp.bullets.splice(idx, 1);
    } else if (action === 'remove') {
      data.experience = data.experience.filter(x => x.id !== idVal);
    } else if (action === 'up') {
      moveItem(data.experience, idVal, -1);
    } else if (action === 'down') {
      moveItem(data.experience, idVal, 1);
    }

    renderLists();
    renderPreview();
    save();
  }

  function eduInputHandler(e) {
    const eduId = e.target.dataset.id;
    const field = e.target.dataset.field;

    const edu = data.education.find(x => x.id === eduId);
    if (!edu) return;

    edu[field] = e.target.value;

    // 🔥 LIVE editor header update
    if (field === 'degree' || field === 'school') {
      updateEduHeader(eduId);
    }

    updatePreviewLive();
    save();
  }

  function refInputHandler(e) {
    const refId = e.target.dataset.id;
    const field = e.target.dataset.field;

    const ref = data.references.find(x => x.id === refId);
    if (!ref) return;

    ref[field] = e.target.value;

    // 🔥 LIVE editor header update
    if (field === 'name' || field === 'campany') {
      updateRefHeader(refId);
    }

    updatePreviewLive();
    save();
  }
  function eduButtonHandler(e) {
    const action = e.target.dataset.action;
    const idVal = e.target.dataset.id;
    if (action === 'removeedu') {
      data.education = data.education.filter(x => x.id !== idVal);
    } else if (action === 'upedu') {
      moveItem(data.education, idVal, -1);
    } else if (action === 'downedu') {
      moveItem(data.education, idVal, 1);
    }
    renderLists(); renderPreview(); save();
  }
  function refButtonHandler(e) {
    const action = e.target.dataset.action;
    const idVal = e.target.dataset.id;
    if (action === 'removeref') {
      data.references = data.references.filter(x => x.id !== idVal);
    } else if (action === 'upref') {
      moveItem(data.references, idVal, -1);
    } else if (action === 'downref') {
      moveItem(data.references, idVal, 1);
    }
    renderLists(); renderPreview(); save();
  }
  function skillInputHandler(e) {
    const idx = Number(e.target.dataset.idx);
    data.skills[idx] = e.target.value;
    renderPreview(); save();
  }
  function skillButtonHandler(e) {
    const action = e.target.dataset.action;
    if (action === 'removeskill') {
      const idx = Number(e.target.dataset.idx);
      data.skills.splice(idx, 1);
    }
    renderLists(); renderPreview(); save();
  }
  function interestInputHandler(e) {
    const idx = Number(e.target.dataset.idx);
    data.interests[idx] = e.target.value;
    renderPreview(); save();
  }
  function interestButtonHandler(e) {
    const action = e.target.dataset.action;
    if (action === 'removeinterest') {
      const idx = Number(e.target.dataset.idx);
      data.interests.splice(idx, 1);
    }
    renderLists(); renderPreview(); save();
  }

  // --- Helpers ------------------------------------------------------------
  function moveItem(arr, idVal, delta) {
    const i = arr.findIndex(x => x.id === idVal);
    if (i < 0) return;
    const j = i + delta;
    if (j < 0 || j >= arr.length) return;
    const tmp = arr[i];
    arr.splice(i, 1);
    arr.splice(j, 0, tmp);
  }

  // --- Buttons ------------------------------------------------------------
  function bindButtons() {
    refs.addExpBtn.addEventListener('click', () => {

      data.experience.unshift({
        id: id(),
        role: "",
        campany: "",
        start: "",
        end: "",
        bullets: [""]
      });
      renderLists();
      renderPreview();
      save();
    });

    refs.addEduBtn.addEventListener('click', () => {
      data.education.unshift({ id: id(), school: "", degree: "", year: "", discription: "" });
      renderLists(); renderPreview(); save();
    });

    //References
    refs.addRefBtn.addEventListener('click', () => {
      data.references.unshift({ id: id(), name: "", campany: "", position: "", phone: "", email: "" });
      renderLists(); renderPreview(); save();
    });


    refs.addSkillBtn.addEventListener('click', () => {
      data.skills.unshift("");
      renderLists(); renderPreview(); save();
    });
    refs.addinterestBtn.addEventListener('click', () => {
      data.interests.unshift("");
      renderLists(); renderPreview(); save();
    });
    refs.pdfBtn.addEventListener('click', () => downloadPDF(false));
    refs.pdfAtsBtn && refs.pdfAtsBtn.addEventListener('click', () => downloadPDF(true));
  }


  function downloadPDF(atsMode) {

    const preview = refs.resumePreview;
    const templateClass = atsMode ? 'ats' : (data.template || 'professional');

    preview.className = 'resume ' + templateClass;

    const filename =
      (data.personal.fullName || 'resume')
        .replace(/\s+/g, '_') +
      (atsMode ? '_ATS' : '') +
      '_resume.pdf';

    if (typeof html2pdf === 'undefined') {
      alert('PDF library not loaded.');
      return;
    }

    // 🔥 get ALL resume pages
    const pages = preview.querySelectorAll('.resume-page');

    // temp wrapper
    const wrapper = document.createElement('div');
    wrapper.style.background = '#fff';

    pages.forEach((page, i) => {
      const clone = page.cloneNode(true);

      // force page break except last
      if (i !== pages.length - 1) {
        clone.style.pageBreakAfter = 'always';
      }

      wrapper.appendChild(clone);
    });

    document.body.appendChild(wrapper);

    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait'
      }
    };

    html2pdf()
      .set(opt)
      .from(wrapper)
      .save()
      .then(() => {
        wrapper.remove(); // cleanup
      });
  }

  // --- Rendering preview -------------------------------------------------
  function renderPreview(highlightKeywords) {
    rendoerPersonalDetails();
    refs.resumePreview.className = (data.template || 'professional');
    switch (data.template) {
      case 'minimal': refs.resumePreview.innerHTML = renderMinimal(); break;
      case 'creative': refs.resumePreview.innerHTML = renderCreative(); break;
      case 'recruiter': refs.resumePreview.innerHTML = renderRecruiter(); break;
      case 'ats': refs.resumePreview.innerHTML = renderATS(); break;
      default: const html = (() => {
        switch (data.template) {
          case 'minimal': return renderMinimal();
          case 'creative': return renderCreative();
          case 'recruiter': return renderRecruiter();
          case 'ats': return renderATS();
          default: return renderModern();
        }
      })();
        setTimeout(() => {
          paginateResume(html);
        }, 100);
        break;
    }
    if (highlightKeywords && highlightKeywords.length) {
      highlightKeywordsInPreview(highlightKeywords);


    }
  }

  function rendoerPersonalDetails() {
    document.querySelector('.name').textContent = data.personal.fullName || '';
    document.querySelector('.tittle').textContent = data.personal.title || '';
    document.querySelector('.emailAd').textContent = data.personal.email || '';
    document.querySelector('.phoneNo').textContent = data.personal.phone || '';
    document.querySelector('.locationAd').textContent = data.personal.location || '';
  }

  rendoerPersonalDetails()

  function paginateResume(html) {

    const container = refs.resumePreview;
    container.innerHTML = '';

    const PAGE_HEIGHT = 1122;

    const temp = document.createElement('div');
    temp.style.position = 'absolute';
    temp.style.visibility = 'hidden';
    temp.style.width = '794px';
    temp.innerHTML = html;
    document.body.appendChild(temp);

    const root = temp.firstElementChild;
    cleanAllSections(root);
    const sidebar = root.querySelector('aside');
    const main = root.querySelector('main');

    if (!sidebar || !main) {
      container.innerHTML = html;
      document.body.removeChild(temp);
      return;
    }

    let currentPage = createPageWithSidebar(sidebar);

    [...main.children].forEach(section => {

      const clone = section.cloneNode(true);
      currentPage.main.appendChild(clone);

      if (currentPage.page.scrollHeight <= PAGE_HEIGHT) return;

      currentPage = microSplitOverflow(currentPage, PAGE_HEIGHT);
    });

    document.body.removeChild(temp);

    console.log(
      'Pages rendered:',
      container.querySelectorAll('.resume-page').length
    );
  }


  function microSplitOverflow(pageObj, PAGE_HEIGHT) {

    let currentPage = pageObj;
    let nextPage = createPageWithoutSidebar();

    while (currentPage.page.scrollHeight > PAGE_HEIGHT) {

      const items = currentPage.main.querySelectorAll('.timeline_Template_1-item');
      if (!items.length) break;

      const lastItem = items[items.length - 1];

      // 🔥 IMPORTANT: get the wrapper
      const timelineWrapper = lastItem.closest('.timeline_Template_1');

      const lists = lastItem.querySelectorAll('.item-desc_Template_1');

      let movedSomething = false;

      for (let i = lists.length - 1; i >= 0; i--) {

        const list = lists[i];
        const bullets = list.querySelectorAll('li');

        if (!bullets.length) continue;

        const lastBullet = bullets[bullets.length - 1];

        // ---------- FIND OR CREATE WRAPPER ON NEXT PAGE ----------
        let nextWrapper = nextPage.main.querySelector('.timeline_Template_1');

        if (!nextWrapper) {
          nextWrapper = timelineWrapper.cloneNode(false); // clone wrapper ONLY
          nextPage.main.insertBefore(nextWrapper, nextPage.main.firstChild);
        }

        // ---------- FIND OR CREATE ITEM ----------
        let overflowItem = nextWrapper.querySelector('.timeline_Template_1-item');

        if (!overflowItem) {

          overflowItem = lastItem.cloneNode(true);

          // remove all bullets from clone
          overflowItem.querySelectorAll('.item-desc_Template_1')
            .forEach(l => l.innerHTML = '');

          // 🔥 Hide headers for continuation page
          overflowItem.querySelectorAll('.item-head_Template_1')
            .forEach(head => head.style.display = 'none');

          nextWrapper.appendChild(overflowItem);
        }

        const overflowLists = overflowItem.querySelectorAll('.item-desc_Template_1');
        const targetList = overflowLists[i];

        targetList.insertBefore(lastBullet, targetList.firstChild);

        movedSomething = true;
        break;
      }

      // If no bullets → move entire wrapper safely
      if (!movedSomething) {

        nextPage.main.insertBefore(
          timelineWrapper,
          nextPage.main.firstChild
        );
      }

      // Clean empty lists
      lastItem.querySelectorAll('.item-desc_Template_1').forEach(list => {
        if (!list.children.length) list.remove();
      });

      // 🔥 If original item has no bullets left
      if (!lastItem.querySelector('li')) {

        // Remove empty item from current page
        lastItem.remove();

        // If wrapper is empty, remove it
        if (timelineWrapper && !timelineWrapper.querySelector('.timeline_Template_1-item')) {
          timelineWrapper.remove();
        }

        // 🔥 Now fix next page:
        const nextWrapper = nextPage.main.querySelector('.timeline_Template_1');
        const overflowItem = nextWrapper?.querySelector('.timeline_Template_1-item');

        if (overflowItem) {

          // This is NOT a continuation anymore
          // Restore headers
          overflowItem.querySelectorAll('.item-head_Template_1')
            .forEach(head => head.style.display = '');

        }

        break; // stop splitting
      }

      // Remove wrapper if empty
      if (timelineWrapper && !timelineWrapper.querySelector('.timeline_Template_1-item')) {
        timelineWrapper.remove();
      }
    }

    return nextPage;
  }



  function createPageWithSidebar(sidebarNode) {
    console.log("with")
    const page = document.createElement('div');
    page.className = 'resume-page resume professional';
    page.style.minHeight = '1122px';

    const wrapper = document.createElement('div');
    wrapper.className = 'resume_Template_1';

    const sidebarClone = sidebarNode.cloneNode(true);
    const main = document.createElement('main');
    main.className = 'content_Template_1';

    wrapper.appendChild(sidebarClone);
    wrapper.appendChild(main);
    page.appendChild(wrapper);

    refs.resumePreview.appendChild(page);

    return { page, main };
  }

  function createPageWithoutSidebar() {
    console.log("WITHOUT")
    const page = document.createElement('div');
    page.className = 'resume-page resume professional';

    const main = document.createElement('main');
    main.className = 'content_Template_1';
    main.style.width = '100%';

    page.appendChild(main);
    refs.resumePreview.appendChild(page);

    return { page, main };
  }


  // --- Template renderers -----------------------------------------------
  function photoHtml() {
    const photo = getPhotoSrc();
    if (photo) {
      // safe: only include data URLs we produced or approved
      return `<img class="avatar" src="${photo}" alt="Profile photo">`;
    } else {
      const initials = escapeHtml(getInitials(data.personal.fullName || ''));
      return `<div class="avatar placeholder" style="display:flex;align-items:center;justify-content:center;background:#f3f6fb;color:var(--brand);font-weight:700;font-size:20px">${initials}</div>`;
    }
  }

  function renderModern() {
    const p = photoHtml();

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
  </svg>`
    };

    // Inject ATS + Template CSS once
    if (!document.getElementById('modern-template-style')) {
      const style = document.createElement('style');
      style.id = 'modern-template-style';

      style.textContent = `
    :root {
      --fa-primary: #68687a;
      --fa-accent: #9cc7d1;
      --dark: #191c24;
      --gray: #64748b;
      --light: #f8fafc;
      --border: #e2e8f0;
    }
    .ATS-resume {
      position: relative;
      margin: auto;
      padding: 60px;
    }

    /* ATS-header */
    .ATS-header {
      margin-bottom: 40px;
      position: absolute;
      background-color: rgba(11, 35, 44, 0.705);
      color: white;
      left: 0;
      right: 0;
      top: 0;
      min-width: fit-content;
      padding: 30px 60px 30px 60px;
      display: flex;
      gap: 20px;
    }

    .ATS-header .right img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
    }

    .ATS-header h1 {
      font-size: 34px;
      font-weight: 800;
      letter-spacing: -1px;
    }

    .ATS-header h2 {
      font-size: 18px;
      font-weight: 500;
      color: rgb(199, 192, 192);
    }

    /* ATS-contact */
    .ATS-contact {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
      margin-top: 10px;
      font-size: 14px;
      color: white;
    }

    .ATS-contact span {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .ATS-contact .fa-solid {
        color: white;
    }

    .ATS-contact i {
      background: linear-gradient(135deg, white, gray);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    /* ATS-section s */
    .ATS-section  {
      margin-top: 35px;
    }

    .ATS-section  h3 {
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 18px;
      padding-left: 20px;
      position: relative;
      background-color: rgba(11, 35, 44, 0.5);
      color: white;
      padding: 5px;
      text-align: center;
    }

    /* .ATS-section  h3::before{
  content:"";
  width:3px;
  height:100%;
  background:linear-gradient(to bottom,var(--accent),var(--primary));
  position:absolute;
  left:0;
  top:0;
  border-radius:3px;
}

.ATS-section  h3::after{
  content:"";
  width:3px;
  height:100%;
  background:linear-gradient(to bottom,var(--accent),var(--primary));
  position:absolute;
  right:0;
  top:0;
  border-radius:3px;
} */

    .ATS-section  p {
      font-size: 15px;
      line-height: 1.7;
      color: var(--gray);
    }

    /* Experience */
    .job {
      margin-bottom: 25px;
    }

    .job-ATS-header {
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .job-ATS-header h4 {
      font-size: 16px;
      font-weight: 600;
    }

    .job-ATS-header span {
      font-size: 13px;
      color: var(--gray);
    }

    .job ul {
      margin-top: 8px;
      padding-left: 18px;
      color: var(--gray);
      font-size: 14px;
      line-height: 1.6;
    }

    .skill {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    /* ATS-skills */
    .ATS-skills {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
      gap: 15px;
    }

    .bar {
      height: 5px;
      background: rgb(48, 40, 40);
      border-radius: 3px;
      overflow: hidden;
    }

    .bar span {
      display: block;
      height: 100%;
      background: linear-gradient(to right, var(--fa-accent), var(--fa-primary));
    }

    /* Footer */
    .footer {
      margin-top: 50px;
      font-size: 12px;
      color: var(--gray);
    }

    /* ================================
   BASE
================================ */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: #eef2f9;
  font-family: "Inter", "Segoe UI", sans-serif;
}

.resume {
    width: 794px;
    min-width: 794px;
    min-height: 1122px;
    max-height: 1122px;
    margin-bottom: 30px;
    background: #ffffff;
}

.resume_Template_1 {
  display: flex;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #ffffff;
      width: 794px;
    min-width: 794px;
    min-height: 1122px;
}

/* ================================
   SIDEBAR – GLASS + GRADIENT
================================ */
.sidebar_Template_1 {
  width: 34%;
  padding: 50px 30px;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
  color: #e2e8f0;
  position: relative;
  max-height: 1122px;
  overflow-y: hidden;
}

.photo-wrap_Template_1 {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto 25px;
  border: 4px solid rgba(255,255,255,0.15);
  box-shadow: 0 10px 30px rgba(0,0,0,0.25);
}

.photo-wrap_Template_1 img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name_Template_1 {
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5px;
}

.role_Template_1 {
  font-size: 14px;
  text-align: center;
  margin-top: 6px;
  color: #94a3b8;
}

.side-section_Template_1 {
  margin-top: 40px;
}

.section-title_Template_1 {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 15px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cbd5e1;
}

.contact-list_Template_1,
.skills-list_Template_1 {
  list-style: none;
 
}

.summary {
  margin-top: 1rem;
}

.summary .heading_Template_1 h2 {
  font-size: 13px;
  color:#e2e8f0 ;
  margin-top: 2rem;
  margin-bottom: -0.5rem;
}

.skills-list_Template_1 {
 border-left: 2px solid #e2e8f0;
 display: grid;
 grid-template-columns: 1fr 1fr 1fr;
}

.contact-list_Template_1 li {
  font-size: 13px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #e2e8f0;
  line-height: 1.5;
}

.skills-list_Template_1 li {
  font-size: 13px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  line-height: 1.5;
  padding-left: 20px;
}

/* ================================
   MAIN CONTENT – CLEAN + AIRY
================================ */
.content_Template_1 {
  width: 66%;
  padding: 70px 60px;
  background: #ffffff;
}

.section_Template_1 {
  margin-bottom: 55px;
}

.heading_Template_1 {
  margin-bottom: 20px;
}

.heading_Template_1 h2 {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 17px;
  font-weight: 600;
  color: #0f172a;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

.rule {
  height: 2px;
  width: 50px;
  background: linear-gradient(to right, #6f93c1, #4f46e5);
  margin-top: 8px;
  border-radius: 2px;
}

.about_Template_1 {
  font-size: 14px;
  line-height: 1.8;
  color: #e2e8f0;
}

/* ================================
   TIMELINE – MODERN
================================ */
.timeline_Template_1 {
  margin-bottom: 25px;
  padding-left: 20px;
  border-left: 2px solid #e2e8f0;
  position: relative;
}

.item-head_Template_1::before {
  content: "";
  position: absolute;
  left: -6px;
  top: 6px;
  width: 10px;
  height: 10px;
  background: #6f93c1;
  border-radius: 50%;
}

.no-timeline::before {
  display: none !important;
}

.item-head_Template_1 {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
}

.item-head_Template_1 h3 {
  font-size: 15px;
  font-weight: 600;
  color: #0f172a;
}

.item-sub_Template_1 {
  font-size: 13px;
  color: #64748b;
}

.date {
  font-size: 12px;
  color: #94a3b8;
}

.item-desc_Template_1 {
  margin-top: 10px;
  font-size: 13px;
  line-height: 1.7;
  color: #475569;
}

.item-desc_Template_1 li {
  margin-left: 18px;
  margin-bottom: 6px;
}

/* ================================
   REFERENCES – CARD STYLE
================================ */
.ref-card-wrapper {
  margin-bottom: 15px;
}

.ref-card_Template_1 {
  background: #f8fafc;
  padding: 18px 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.2s ease;
}

.ref-card_Template_1:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(15,23,42,0.05);
}

.ref-card_Template_1 h4 {
  font-size: 14px;
  margin-bottom: 6px;
  font-weight: 600;
  color: #0f172a;
}

.ref-line {
  font-size: 13px;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #475569;
}



.section_Template_1,
.ref-card_Template_1,
.timeline_Template_1 {
  break-inside: avoid;
}

.edu-card:hover {
  border-color: #22c55e;
  box-shadow: 0 10px 30px rgba(34, 197, 94, 0.15);
}

.edu-sep {
  color: #22c55e;
  margin: 0 6px;
}

.edu-chevron {
  transition: transform 0.3s ease;
}

.edu-card.active .edu-chevron {
  transform: rotate(180deg);
}

/* BODY */
.edu-body {
  max-height: 0;
  overflow: hidden;
  transition: all 0.35s ease;
  padding: 0 22px;
}

.edu-card.active .edu-body {
  max-height: 900px;
  padding: 22px;
}

/* GRID */
.edu-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
}

/* FIELD */
.field {
  display: flex;
  flex-direction: column;
}

.field label {
  font-size: 12px;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.field input {
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  transition: 0.25s;
}

.field input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.2);
  outline: none;
}

/* BUTTON ROW */
.edu-actions-row {
  margin-top: 22px;
  display: flex;
  gap: 10px;
}

/* MODERN BUTTONS */
.btn-modern {
  cursor: pointer;
  transition: 0.25s;
}

.btn-modern:hover {
  background: #334155;
}
`;

      document.head.appendChild(style);
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
  <div class="heading_Template_1">
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

  </ul>
</div>
` : ''}


    </aside>

    <main class="content_Template_1">
      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.education}<span>Education</span></h2>
          <div class="rule"></div>
        </div>
        ${data.education.map(edu => `
          <div class="timeline_Template_1">
            <div class="timeline_Template_1-item">
              <div class="item-head_Template_1">
                <h3>${escapeHtml(edu.degree)}</h3>
              </div>
              <div class="item-head_Template_1">
              <div class="item-sub_Template_1">${escapeHtml(edu.school)}</div>
              <div class="date">${escapeHtml(edu.year || '')}</div>
              </div>
              <div class="item-desc_Template_1">${escapeHtml(edu.discription)}</div>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.experience}<span>Experience</span></h2>
          <div class="rule"></div>
        </div>
        ${data.experience.map(exp => `
          <div class="timeline_Template_1">
            <div class="timeline_Template_1-item">
              <div class="item-head_Template_1">
                <h3>${escapeHtml(exp.role)}</h3>
                

              </div>
              <div class="item-head_Template_1">
              <div class="item-sub_Template_1">${escapeHtml(exp.campany)}</div>
              <div class="date">
          ${[exp.start, exp.end].some(d => d && d.trim())
            ? `<div class="date">${[exp.start, exp.end].filter(d => d && d.trim()).join(' – ')}</div>`
            : ''
          }
      </div>
              </div>
              <ul class="item-desc_Template_1">
                ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.skills}<span>Skills</span></h2>
          <div class="rule"></div>
        </div>
        <ul class="skills-list_Template_1">
          ${data.skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </section>
<section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.interests}<span>Interests</span></h2>
          <div class="rule"></div>
        </div>
        <ul class="skills-list_Template_1">
          ${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </section>
      <section class="section_Template_1">
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


  function renderMinimal() {
    const p = photoHtml();

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
  </svg>`
    };


    return `
  <div class="resume_Template_1">
    <aside class="sidebar_Template_1">
      <div class="photo-wrap_Template_1">${p}</div>

      <div style="margin-top:85px;text-align:center">
        <div class="name_Template_1">${escapeHtml(data.personal.fullName || '')}</div>
        <div class="role_Template_1">${escapeHtml(data.personal.title || '')}</div>
      </div>

          <section class="section_Template_1 summary">
        <div class="heading_Template_1">
          <h2>${ICONS.profile}<span>Profile</span></h2>
        </div>
        <p class="about_Template_1">${escapeHtml(data.summary || '')}</p>
      </section>

      <div class="side-section_Template_1">
        <div class="section-title_Template_1">
          ${ICONS.contact} Contact
        </div>
        <ul class="contact-list_Template_1">
          <li>${icon(ICONS.phone)}${escapeHtml(data.personal.phone || '')}</li>
          <li>${icon(ICONS.email)}${escapeHtml(data.personal.email || '')}</li>
          <li>${icon(ICONS.location)}${escapeHtml(data.personal.location || '')}</li>
          <li>${icon(ICONS.website)}${escapeHtml(data.personal.website || '')}</li>
          <li>${icon(ICONS.linkedin)}${escapeHtml(data.personal.linkedin || '')}</li>
        </ul>
      </div>


    </aside>

    <main class="content_Template_1">
      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.education}<span>Education</span></h2>
          <div class="rule"></div>
        </div>
        ${data.education.map(edu => `
          <div class="timeline_Template_1">
            <div class="timeline_Template_1-item">
              <div class="item-head_Template_1">
                <h3>${escapeHtml(edu.degree)}</h3>
              </div>
              <div class="item-head_Template_1">
              <div class="item-sub_Template_1">${escapeHtml(edu.school)}</div>
              <div class="date">${escapeHtml(edu.year || '')}</div>
              </div>
              <div class="item-desc_Template_1">${escapeHtml(edu.discription)}</div>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.experience}<span>Experience</span></h2>
          <div class="rule"></div>
        </div>
        ${data.experience.map(exp => `
          <div class="timeline_Template_1">
            <div class="timeline_Template_1-item">
              <div class="item-head_Template_1">
                <h3>${escapeHtml(exp.role)}</h3>
                

              </div>
              <div class="item-head_Template_1">
              <div class="item-sub_Template_1">${escapeHtml(exp.campany)}</div>
              <div class="date">
          ${[exp.start, exp.end].some(d => d && d.trim())
        ? `<div class="date">${[exp.start, exp.end].filter(d => d && d.trim()).join(' – ')}</div>`
        : ''
      }
      </div>
              </div>
              <ul class="item-desc_Template_1">
                ${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}
              </ul>
            </div>
          </div>
        `).join('')}
      </section>

      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.skills}<span>Skills</span></h2>
          <div class="rule"></div>
        </div>
        <ul class="skills-list_Template_1">
          ${data.skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </section>
<section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.interests}<span>Interests</span></h2>
          <div class="rule"></div>
        </div>
        <ul class="skills-list_Template_1">
          ${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </section>
      <section class="section_Template_1">
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

  function renderCreative() {
    const p = photoHtml();
    return `
      <div class="r-top">
        <div class="r-left">${p}<div style="margin-top:12px"><div class="name">${escapeHtml(data.personal.fullName || '')}</div><div class="title">${escapeHtml(data.personal.title || '')}</div><div class="contact small">${escapeHtml(data.personal.location || '')}</div><div style="margin-top:12px"><h4>Skills</h4><div class="small">${data.skills.map(s => escapeHtml(s)).join(', ')}</div></div></div></div>
        <div class="r-right"><div class="section"><h4>About</h4><div class="small">${escapeHtml(data.summary || '')}</div></div><div class="section"><h4>Experience</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.campany)} <div class="meta small">${escapeHtml(exp.start || '')} — ${escapeHtml(exp.end || '')}</div><ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div><div class="section"><h4>Education</h4>${data.education.map(edu => `<div class="job"><strong>${escapeHtml(edu.school)}</strong> — ${escapeHtml(edu.degree)} <div class="meta small">${escapeHtml(edu.year || '')}</div></div>`).join('')}</div></div>
      </div>
    `;
  }

  function renderRecruiter() {
    const p = photoHtml();
    return `
      <div class="r-top">
        <div class="r-left">${p}<div style="margin-top:10px"><div class="name">${escapeHtml(data.personal.fullName || '')}</div><div class="title">${escapeHtml(data.personal.title || '')}</div><div class="contact small">${escapeHtml(data.personal.email || '')} • ${escapeHtml(data.personal.phone || '')}</div></div></div>
        <div class="r-right"><div class="section"><h4>TL;DR</h4><div class="small">${escapeHtml(data.summary || '')}</div></div><div class="section"><h4>Key wins</h4><ul class="bullets">${data.experience.slice(0, 3).map(exp => `<li><strong>${escapeHtml(exp.role)}</strong> at ${escapeHtml(exp.campany)} — ${(exp.bullets || [])[0] || ''}</li>`).join('')}</ul></div><div class="section"><h4>Experience (full)</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.campany)} <div class="meta small">${escapeHtml(exp.start || '')} — ${escapeHtml(exp.end || '')}</div><ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div></div>
      </div>
    `;
  }

  function renderATS() {
    // For ATS we purposely omit photo (many ATS prefer no images)
    return `
      
    <div class="ATS-resume">
    <div class="ATS-header">
      <div class="left">
        <h1>Mpho James Matli</h1>
        <h2>Senior Product Designer</h2>

        <div class="ATS-contact">
          <span><i class="fa-solid fa-envelope"></i> jane@email.com</span>
          <span><i class="fa-solid fa-phone"></i> +27 00 000 0000</span>
          <span><i class="fa-solid fa-location-dot"></i> Johannesburg, South Africa</span>
          <span><i class="fa-brands fa-linkedin"></i> linkedin.com/in/jane</span>
          <span><i class="fa-brands fa-github"></i> github.com/jane</span>
          <span><i class="fa-solid fa-globe"></i> www.janerams.com</span>
        </div>
      </div>
      <div class="right">
        <img src="./profile.png" alt="" class="profile">
      </div>

    </div>

    <!-- Summary -->
    <div class="ATS-section  proSummary">
      <h3>Professional Summary</h3>
      <p>
        Results-driven product designer with 8+ years of experience creating scalable, human-centered digital products.
        Skilled in UX research, interaction design, and cross-functional collaboration. Proven ability to increase
        user engagement, improve conversion metrics, and deliver measurable business outcomes.
      </p>
    </div>

    <!-- Experience -->
    <div class="ATS-section ">
      <h3>Professional Experience</h3>

      <div class="job">
        <div class="job-ATS-header">
          <h4>Lead Product Designer <br /><span
              style="color: rgb(104, 111, 116); font-size: 14px; padding-top: 8px;">TechCorp</span></h4>
          <span>2022 – Present</span>
        </div>
        <ul>
          <li>Led UX strategy for SaaS platform serving 2M+ users.</li>
          <li>Improved conversion rate by 34% through data-driven redesign.</li>
          <li>Managed and mentored a team of 5 designers.</li>
        </ul>
      </div>

      <div class="job">
        <div class="job-ATS-header">
          <h4>Lead Product Designer <br /><span
              style="color: rgb(104, 111, 116); font-size: 14px; padding-top: 8px;">TechCorp</span></h4>
          <span>2022 – Present</span>
        </div>
        <ul>
          <li>Led UX strategy for SaaS platform serving 2M+ users.</li>
          <li>Improved conversion rate by 34% through data-driven redesign.</li>
          <li>Managed and mentored a team of 5 designers.</li>
        </ul>
      </div>

    </div>

    <!-- ATS-skills -->
    <div class="ATS-section ">
      <h3>Core ATS-skills</h3>
      <div class="ATS-skills">
        <div class="skill">
          <small>UI/UX Design</small>
          <div class="bar"><span style="width:95%"></span></div>
        </div>
        <div class="skill">
          <small>Product Strategy</small>
          <div class="bar"><span style="width:90%"></span></div>
        </div>
        <div class="skill">
          <small>Leadership</small>
          <div class="bar"><span style="width:88%"></span></div>
        </div>
        <div class="skill">
          <small>Figma / Adobe</small>
          <div class="bar"><span style="width:92%"></span></div>
        </div>
        <div class="skill">
          <small>UI/UX Design</small>
          <div class="bar"><span style="width:95%"></span></div>
        </div>
        <div class="skill">
          <small>Product Strategy</small>
          <div class="bar"><span style="width:90%"></span></div>
        </div>
        <div class="skill">
          <small>Leadership</small>
          <div class="bar"><span style="width:88%"></span></div>
        </div>
        <div class="skill">
          <small>Figma / Adobe</small>
          <div class="bar"><span style="width:92%"></span></div>
        </div>
        <div class="skill">
          <small>UI/UX Design</small>
          <div class="bar"><span style="width:95%"></span></div>
        </div>
        <div class="skill">
          <small>Product Strategy</small>
          <div class="bar"><span style="width:90%"></span></div>
        </div>
        <div class="skill">
          <small>Leadership</small>
          <div class="bar"><span style="width:88%"></span></div>
        </div>
        <div class="skill">
          <small>Figma / Adobe</small>
          <div class="bar"><span style="width:92%"></span></div>
        </div>
      </div>
    </div>

    <!-- Education -->
    <div class="ATS-section ">
      <h3>Education</h3>

      <div class="job">
        <div class="job-ATS-header">
          <h4>Lead Product Designer <br /><span
              style="color: rgb(104, 111, 116); font-size: 14px; padding-top: 8px;">TechCorp</span></h4>
          <span>2022 – Present</span>
        </div>
        <ul>
          <p>Results-driven product designer with 8+ years of experience creating scalable, human-centered digital
            products.
            Skilled in UX research, interaction design, and cross-functional collaboration. Proven ability to increase
            user engagement,
            improve conversion metrics, and deliver measurable business outcomes.</p>
        </ul>
      </div>


      <div class="job">
        <div class="job-ATS-header">
          <h4>Lead Product Designer <br /><span
              style="color: rgb(104, 111, 116); font-size: 14px; padding-top: 8px;">TechCorp</span></h4>
          <span>2022 – Present</span>
        </div>
        <ul>
          <p>Results-driven product designer with 8+ years of experience creating scalable, human-centered digital
            products.
            Skilled in UX research, interaction design, and cross-functional collaboration. Proven ability to increase
            user engagement,
            improve conversion metrics, and deliver measurable business outcomes.</p>
        </ul>
      </div>

    </div>

    <!-- Certifications -->
    <div class="ATS-section ">
      <h3>Certifications</h3>
      <ul style="padding-left:18px;color:var(--gray);font-size:14px;line-height:1.6;">
        <li>Google UX Design Professional Certificate</li>
        <li>Agile Product Management Certification</li>
      </ul>
    </div>

    <div class="footer">
      References available upon request
    </div>
    </div>

    `;
  }

  // --- Sanitizer ----------------------------------------------------------
  function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; });
  }

  // --- Highlight matched keywords safely ---------------------------------
  function escapeRegExp(str) {
    return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function highlightKeywordsInPreview(keywords) {
    if (!Array.isArray(keywords) || !keywords.length) return;
    const root = refs.resumePreview;
    const safeParts = keywords.map(k => escapeRegExp(k)).filter(Boolean).slice(0, 200);
    if (!safeParts.length) return;
    const pattern = '\\b(' + safeParts.join('|') + ')\\b';
    let regex;
    try {
      regex = new RegExp(pattern, 'gi');
    } catch (err) {
      console.warn('Failed to construct highlight RegExp:', err);
      return;
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(textNode => {
      const parent = textNode.parentNode;
      if (!parent) return;
      const text = textNode.nodeValue;
      if (!text || !regex.test(text)) return;
      regex.lastIndex = 0;
      const frag = document.createDocumentFragment();
      let lastIndex = 0;
      let match;
      while ((match = regex.exec(text)) !== null) {
        const matchStart = match.index;
        const matchEnd = regex.lastIndex;
        if (matchStart > lastIndex) {
          frag.appendChild(document.createTextNode(text.slice(lastIndex, matchStart)));
        }
        const m = document.createElement('mark');
        m.textContent = text.slice(matchStart, matchEnd);
        frag.appendChild(m);
        lastIndex = matchEnd;
        if (matchEnd === matchStart) regex.lastIndex++;
      }
      if (lastIndex < text.length) frag.appendChild(document.createTextNode(text.slice(lastIndex)));
      parent.replaceChild(frag, textNode);
    });
  }

  // --- Persistence --------------------------------------------------------
  function save() { try { localStorage.setItem('resume:data', JSON.stringify(data)); } catch (e) { /* ignore */ } }
  function load() { try { const raw = localStorage.getItem('resume:data'); return raw ? JSON.parse(raw) : null; } catch (e) { return null; } }

  // --- Start ----------------------------------------------------------------
  init();
})();

const previewOverlay = document.querySelector('.preview-wrap');
const previewBtns = document.querySelectorAll('#previewBtn');
const editResumeBtn = document.querySelector('#editResume');
const navbar = document.querySelector('.navbar');
const overlayPersonalDetails = document.querySelector('.overlay-personalDetails');
const editProfileBtn = document.querySelectorAll('#editProfileBtn, .profile-section .left');
const savePersonalDetails = document.querySelector('.savePersonalDetails')

editProfileBtn.forEach(btn => btn.addEventListener('click', () => {
  overlayPersonalDetails.classList.remove('hidden');
  savePersonalDetails.classList.remove('hidden');
  setTimeout(() => {
    overlayPersonalDetails.classList.add('opacity');
    savePersonalDetails.classList.add('opacity');
  }, 100);
}));

savePersonalDetails.addEventListener('click', () => {
  overlayPersonalDetails.classList.remove('opacity');
  savePersonalDetails.classList.remove('opacity');
  setTimeout(() => {
    overlayPersonalDetails.classList.add('hidden');
    savePersonalDetails.classList.add('hidden');
  }, 450);


});

/* OPEN PREVIEW */
previewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // show overlay
    previewOverlay.classList.add('open');
    document.querySelector('.download-btn-premium').classList.add('open');
    document.querySelector('.closeBtn').classList.add('open');
    setTimeout(() => {
      previewOverlay.classList.add('opacity');
    }, 450); // MUST match CSS transition

    // hide UI
    document.body.classList.add('overlay-open');
    navbar?.classList.add('hidden-ui');
  });
});

/* CLOSE PREVIEW (EDIT MODE) */
editResumeBtn.addEventListener('click', () => {
  // start overlay exit animation
  previewOverlay.classList.remove('opacity');
  setTimeout(() => {
    previewOverlay.classList.remove('open');
    document.querySelector('.closeBtn').classList.remove('open');
    document.querySelector('.download-btn-premium').classList.remove('open');
    zoomControl = false;
    scalePreview()
  }, 450); // MUST match CSS transition
});


const previewContent = previewOverlay.querySelector("#resumePreview");
// or use ".preview-content" if that's your wrapper

function closePreview() {
  previewOverlay.classList.remove("opacity");
  document.querySelector('.download-btn-premium').classList.remove('open');

  setTimeout(() => {
    previewOverlay.classList.remove("open");
    document.querySelector(".closeBtn")?.classList.remove("open");
    zoomControl = false;
    scalePreview();
  }, 450); // must match CSS transition
}

// Close when clicking outside the resume content
previewOverlay.addEventListener("click", (e) => {
  if (!previewContent.contains(e.target)) {
    closePreview();
  }
});

// Close with ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closePreview();
  }
});


// show overlay when no PDF
function showpreviewOverlay() {
  previewOverlay.classList.remove("hidden");
  previewOverlay.classList.add('opacity')
}

function hidepreviewOverlay() {
  previewOverlay.classList.add("hidden");
  previewOverlay.classList.add('opacity')
}

const profilePicPreview = document.querySelectorAll('.backdropBtn');
const profilePhotoUpload = document.querySelector('#profilePhotoUpload');
const closeProfilePhotoUpload = document.querySelector('#closeProfilePhotoUpload');

profilePicPreview.forEach(profile => profile.addEventListener('click', () => {
  profilePhotoUpload.classList.remove('hidden')
  setTimeout(() => {
    profilePhotoUpload.classList.add('opacity')
  }, 450);
}))

closeProfilePhotoUpload.addEventListener('click', () => {
  profilePhotoUpload.classList.remove('opacity')
  setTimeout(() => {
    profilePhotoUpload.classList.add('hidden')
  }, 450);
})

document.querySelector('.saveImage').addEventListener('click', () => {
  profilePhotoUpload.classList.remove('opacity')
  setTimeout(() => {
    profilePhotoUpload.classList.add('hidden')
  }, 450);
})

console.log(profilePicPreview)

function scalePreview() {
  const stage = document.querySelector('.preview-wrap');
  const preview = document.querySelector('#resumePreview');
  if (!stage || !preview) return;

  const w = window.innerWidth;
  let scale;

  let BASE_WIDTH = 1499;   // real preview width
  let START_POINT = 1000; // where scale = 0.63
  let START_SCALE = 0.55;
  previewOverlay.classList.remove('hidden');
  previewOverlay.classList.remove('opacity');

  if (window.innerWidth <= 900) {
    BASE_WIDTH = 794;      // real resume width
    START_POINT = 510;     // where scale = 0.63
    START_SCALE = 0.63;
    previewOverlay.classList.add('hidden');
    previewOverlay.classList.add('opacity');
  }

  if (window.innerWidth >= 901 && zoomControl === true) {
    BASE_WIDTH = 794;      // real resume width
    START_POINT = 510;     // where scale = 0.63
    START_SCALE = 0.63;
    previewOverlay.classList.add('hidden');
    previewOverlay.classList.add('opacity');
  }

  if (w >= 1500) {
    scale = 1
  } else if (w <= BASE_WIDTH) {
    // smooth proportional scaling from phones up to tablets
    scale = (w / START_POINT) * START_SCALE;
  }

  else {
    // full size on large screens
    scale = 1;
  }
  // 🔒 never let it get too tiny
  scale = Math.max(scale, 0.4);

  preview.style.transform = `scale(${scale})`;
}

window.addEventListener('resize', scalePreview);
scalePreview();

const resumePreview = document.querySelector('#resumePreview');
resumePreview.addEventListener('click', () => {
  document.querySelector('.preview-wrap').classList.add('open');
  document.querySelector('.download-btn-premium').classList.add('open');
  document.querySelector('.closeBtn').classList.add('open');
  zoomControl = true;
  scalePreview();
})

function setTemplateCss() {
  const ATSheader = document.querySelector('.ATS-header');
  const proSummary = document.querySelector('.proSummary')
  const proSummaryMargin = ATSheader.scrollHeight
  proSummary.style.marginTop = `${proSummaryMargin - 30}px`
}

function cleanAllSections(root) {

  const main = root.querySelector('.content_Template_1');
  if (!main) return;

  const sections = main.querySelectorAll('.section_Template_1');

  sections.forEach(section => {

    /* =========================
       1️⃣ CLEAN TIMELINE ITEMS
    ========================== */

    section.querySelectorAll('.timeline_Template_1-item').forEach(item => {

      const title = item.querySelector('h3')?.textContent.trim();
      const sub = item.querySelector('.item-sub_Template_1')?.textContent.trim();
      const date = item.querySelector('.date')?.textContent.trim();

      const bullets = Array.from(
        item.querySelectorAll('.item-desc_Template_1 li')
      ).filter(li => li.textContent.trim() !== '');

      // Remove empty bullets
      item.querySelectorAll('.item-desc_Template_1 li').forEach(li => {
        if (!li.textContent.trim()) li.remove();
      });

      const hasContent =
        title ||
        sub ||
        date ||
        bullets.length;

      if (!hasContent) {
        item.remove();
      }
    });

    /* =========================
       2️⃣ REMOVE EMPTY TIMELINES
    ========================== */

    section.querySelectorAll('.timeline_Template_1').forEach(timeline => {
      if (!timeline.querySelector('.timeline_Template_1-item')) {
        timeline.remove();
      }
    });

    /* =========================
       3️⃣ CLEAN SKILLS / INTERESTS
    ========================== */

    section.querySelectorAll('.skills-list_Template_1').forEach(list => {

      list.querySelectorAll('li').forEach(li => {
        if (!li.textContent.trim()) li.remove();
      });

      if (!list.querySelector('li')) {
        list.remove();
      }
    });

    /* =========================
       4️⃣ CLEAN REFERENCES
    ========================== */

    section.querySelectorAll('.ref-card_Template_1').forEach(card => {

      const name = card.querySelector('h4')?.textContent.trim();

      const lines = Array.from(
        card.querySelectorAll('.ref-line')
      ).filter(p => p.textContent.trim() !== '');

      // Remove empty lines
      card.querySelectorAll('.ref-line').forEach(p => {
        if (!p.textContent.trim()) p.remove();
      });

      if (!name && !lines.length) {
        card.remove();
      }
    });

    // Remove empty ref wrappers
    section.querySelectorAll('.ref-card-wrapper').forEach(wrapper => {
      if (!wrapper.querySelector('.ref-card_Template_1')) {
        wrapper.remove();
      }
    });

    /* =========================
       5️⃣ FINAL SECTION CHECK
    ========================== */

    const hasTimeline = section.querySelector('.timeline_Template_1');
    const hasSkills = section.querySelector('.skills-list_Template_1');
    const hasRefs = section.querySelector('.ref-card_Template_1');

    if (!hasTimeline && !hasSkills && !hasRefs) {
      section.remove();
    }
  });
}