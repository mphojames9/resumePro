(function () {
  // --- Utilities ------------------------------------------------------------
  function id() { return Math.random().toString(36).slice(2, 9); }
  function $(s) { return document.querySelector(s); }
  function $id(s) { return document.getElementById(s); }

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
    coverCompany: $id('coverCompany'),
    coverRole: $id('coverRole'),
    generateCoverBtn: $id('generateCoverBtn'),
    coverPreview: $id('coverPreview'),
    downloadCoverPdfBtn: $id('downloadCoverPdfBtn'),
    templateSelect: $id('templateSelect'),
    profilePicInput: $id('profilePicInput'),
    photoPreviewContainer: $id('photoPreviewContainer'),
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
      { id: id(), role: "Engineering Manager", company: "Fintech Co", start: "Mar 2021", end: "Present", bullets: ["Grew backend team from 4 to 12 engineers while maintaining velocity.", "Introduced SRE practices reducing incidents by 40%."] },
      { id: id(), role: "Senior Software Engineer", company: "Platform Labs", start: "2018", end: "2021", bullets: ["Built APIs used by 10M+ monthly active users.", "Mentored junior engineers."] }
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
  }

  // --- Photo handling -----------------------------------------------------
  // Max file size ~2MB
  const MAX_FILE_BYTES = 2 * 1024 * 1024;
  const OUTPUT_PIXEL = 400; // square output size (pixels) — decent for print and PDF

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

  function renderPhotoPreview() {
    const container = refs.photoPreviewContainer;
    container.innerHTML = '';
    const photo = getPhotoSrc();
    if (photo) {
      const img = document.createElement('img');
      img.src = photo;
      img.alt = 'Profile photo';
      container.appendChild(img);
    } else {
      // show initials placeholder
      const span = document.createElement('div');
      span.className = 'initials';
      span.textContent = getInitials(data.personal.fullName || '');
      container.appendChild(span);
    }
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
      node.innerHTML = `
        <div class="row">
        <div class="small_wrapper">
          <input class="input_data" data-id="${edu.id}" data-field="degree" value="${escapeHtml(edu.degree)}" placeholder="Degree" />
          <input class="input_data" data-id="${edu.id}" data-field="school" value="${escapeHtml(edu.school)}" placeholder="School" />
        </div>
        </div>
        <div class="row small">
        <div class="small_wrapper">
          <input class="input_data" data-id="${edu.id}" data-field="year" value="${escapeHtml(edu.year || '')}" placeholder="Year Obtained" />
          <input class="input_data" data-id="${edu.id}" data-field="discription" value="${escapeHtml(edu.discription || '')}" placeholder="Discription" />
        </div>
          <div class="small_wrapper">
          <button class="move" data-action="upedu" data-id="${edu.id}" class="btn tiny"><svg style="transform: rotate(180deg);" viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="move" data-action="downedu" data-id="${edu.id}" class="btn tiny"><svg viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="delete" data-action="removeedu" data-id="${edu.id}" class="btn tiny"><i class="fa-solid fa-trash"></i> Delele</button>
          </div>
        </div>
      `;
      refs.educationContainer.appendChild(node);
    });


    // Experience
    refs.experienceContainer.innerHTML = '';
    data.experience.forEach((exp) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = `
        <div class="row">
          <input class="input_data" data-id="${exp.id}" data-field="role" value="${escapeHtml(exp.role)}" placeholder="Role" />
          <input class="input_data" data-id="${exp.id}" data-field="company" value="${escapeHtml(exp.company)}" placeholder="Company" />
        </div>
        <div class="row small">
        <div class="small_wrapper">
        <input class="input_data" data-id="${exp.id}" data-field="start" placeholder="Start" value="${escapeHtml(exp.start || '')}" />
          <input class="input_data" data-id="${exp.id}" data-field="end" placeholder="End" value="${escapeHtml(exp.end || '')}" />
        </div>
        </div>
        <div class="row" data-bullets="${exp.id}">
          ${(exp.bullets || []).map((b, i) => `<div class="row"><input data-id="${exp.id}" data-field="bullet" placeholder="Resposibility / duties" data-idx="${i}" value="${escapeHtml(b)}" style="flex:1"/><button class="delbullet" data-action="delbullet" data-id="${exp.id}" data-idx="${i}" class="btn tiny"><i class="fa-solid fa-trash"></i></button>
          <div style="margin-top:6px"><button data-action="addbullet" data-id="${exp.id}" class="addbullet"><i class="fa-solid fa-plus"></i></button></div>
          </div>`).join('')}
        </div>
        <div class="small_wrapper">
          <button class="move" data-action="up" data-id="${exp.id}" class="btn tiny"><svg style="transform: rotate(180deg);" viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="move" data-action="down" data-id="${exp.id}" class="btn tiny"><svg viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="delete" data-action="remove" data-id="${exp.id}" class="btn tiny"><i class="fa-solid fa-trash"></i> Delele</button>
        </div>
      `;
      refs.experienceContainer.appendChild(node);
    });


    refs.referencesContainer.innerHTML = '';
    data.references.forEach((ref) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = `
        <div class="row">
        <div class="small_wrapper">
          <input class="input_data" data-id="${ref.id}" data-field="name" value="${escapeHtml(ref.name)}" placeholder="Contact Person" />
          <input class="input_data" data-id="${ref.id}" data-field="campany" value="${escapeHtml(ref.campany)}" placeholder="Campany" />
        </div>
        </div><div class="row small">
        <div class="small_wrapper">
          <input class="input_data positionHeld" data-id="${ref.id}" data-field="position" value="${escapeHtml(ref.position || '')}" placeholder="Position Held" />
        </div>
        <div class="row small">
        <div class="small_wrapper">
          <input class="input_data" data-id="${ref.id}" data-field="phone" value="${escapeHtml(ref.phone || '')}" placeholder="Phone Number" />
          <input class="input_data" data-id="${ref.id}" data-field="email" value="${escapeHtml(ref.email || '')}" placeholder="email" />
        </div>
        <div class="small_wrapper">
          <button class="move" data-action="upref" data-id="${ref.id}" class="btn tiny"><svg style="transform: rotate(180deg);" viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="move" data-action="downref" data-id="${ref.id}" class="btn tiny"><svg viewBox="0 0 24 24" fill="none" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg></button>
          <button class="delete" data-action="removeref" data-id="${ref.id}" class="btn tiny"><i class="fa-solid fa-trash"></i> Delele</button>
        </div>
        </div>
      `;
      refs.referencesContainer.appendChild(node);
    });

    // Skills
    refs.skillsContainer.innerHTML = '';
    data.skills.forEach((sk, idx) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = `<div class="row"><input class="delete-raw" data-idx="${idx}" data-field="skill" placeholder="New Skill" value="${escapeHtml(sk)}" /><button data-action="removeskill" data-idx="${idx}" class="btn tiny" id="delete"> <i class="fa-solid fa-trash"></i> </button></div>`;
      refs.skillsContainer.appendChild(node);
    });

    // interests
    refs.interestsContainer.innerHTML = '';
    data.interests.forEach((its, idx) => {
      const node = document.createElement('div');
      node.className = 'item';
      node.innerHTML = `<div class="row"><input class="delete-raw" data-idx="${idx}" data-field="interest" placeholder="New interest" value="${escapeHtml(its)}" /><button data-action="removeinterest" data-idx="${idx}" class="btn tiny" id="delete"> <i class="fa-solid fa-trash"></i> </button></div>`;
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
    }
    renderPreview(); save();
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
    renderLists(); renderPreview(); save();
  }
  function eduInputHandler(e) {
    const idVal = e.target.dataset.id;
    const field = e.target.dataset.field;
    const edu = data.education.find(x => x.id === idVal);
    if (!edu) return;
    edu[field] = e.target.value;
    renderPreview(); save();
  }
  function refInputHandler(e) {
    const idVal = e.target.dataset.id;
    const field = e.target.dataset.field;
    const ref = data.references.find(x => x.id === idVal);
    if (!ref) return;
    ref[field] = e.target.value;
    renderPreview(); save();
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
     company: "",
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

  
  // --- PDF generation (html2pdf) -----------------------------------------
  function downloadPDF(atsMode) {
    const preview = refs.resumePreview;
    const templateClass = atsMode ? 'ats' : (data.template || 'professional');
    preview.className = 'resume ' + templateClass;
    const filename = (data.personal.fullName || 'resume').replace(/\s+/g, '_') + (atsMode ? '_ATS' : '') + '_resume.pdf';
    const opt = {
      margin: 0,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    if (typeof html2pdf === 'undefined') {
      alert('PDF library not loaded. Check internet connection or bundled script.');
      return;
    }
    html2pdf().set(opt).from(preview).save();
  }

  // --- Rendering preview -------------------------------------------------
  function renderPreview(highlightKeywords) {
    refs.resumePreview.className = 'resume ' + (data.template || 'professional');
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
  const sidebar = root.querySelector('aside');
  const main = root.querySelector('main');

  if (!sidebar || !main) {
    console.error('Pagination failed: sidebar or main missing');
    container.innerHTML = html;
    document.body.removeChild(temp);
    return;
  }

  // ✅ FIRST PAGE WITH SIDEBAR
  let page = createPageWithSidebar(sidebar);

  [...main.children].forEach(section => {
    const clone = section.cloneNode(true);
    page.main.appendChild(clone);

    if (page.page.scrollHeight > PAGE_HEIGHT) {
      page.main.removeChild(clone);

      // ✅ NEXT PAGES — NO SIDEBAR
      page = createPageWithoutSidebar();
      page.main.appendChild(clone);
    }
  });

  document.body.removeChild(temp);

  console.log(
    'Pages rendered:',
    container.querySelectorAll('.resume-page').length
  );
}


function createPageWithSidebar(sidebarNode) {
  const page = document.createElement('div');
  page.className = 'resume-page resume professional';

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
  const page = document.createElement('div');
  page.className = 'resume-page resume professional';

  const main = document.createElement('main');
  main.className = 'content_Template_1';
  main.style.paddingLeft = '20px';
  main.style.width = '100%';

  page.appendChild(main);
  refs.resumePreview.appendChild(page);

  return { page, main };
}

// ===== ZOOM CONTROL =====
let zoomLevel = 1;
const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.5;

const previewWrap = document.querySelector('.preview-wrap');
const zoomLabel = document.getElementById('zoomLabel');

function applyZoom() {
  previewWrap.style.transform = `scale(${zoomLevel})`;
  previewWrap.style.transformOrigin = 'top center';
  zoomLabel.textContent = Math.round(zoomLevel * 100) + '%';
}

document.getElementById('zoomIn').addEventListener('click', () => {
  zoomLevel = Math.min(ZOOM_MAX, zoomLevel + ZOOM_STEP);
  applyZoom();
});

document.getElementById('zoomOut').addEventListener('click', () => {
  zoomLevel = Math.max(ZOOM_MIN, zoomLevel - ZOOM_STEP);
  applyZoom();
});

// Initialize
applyZoom();




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
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
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

    company: `<svg viewBox="0 0 24 24" width="14" height="14" fill="none">
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

      <div class="side-section_Template_1">
        <div class="section-title_Template_1">
          ${ICONS.skills} Skills
        </div>
        <ul class="skills-list_Template_1">
          ${data.skills.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>

      <div class="side-section_Template_1">
        <div class="section-title_Template_1">
          ${ICONS.interests} Interests
        </div>
        <ul class="skills-list_Template_1">
          ${data.interests.map(i => `<li>${escapeHtml(i)}</li>`).join('')}
        </ul>
      </div>
    </aside>

    <main class="content_Template_1">

      <section class="section_Template_1">
        <div class="heading_Template_1">
          <h2>${ICONS.profile}<span>Profile</span></h2>
          <div class="rule"></div>
        </div>
        <p class="about_Template_1">${escapeHtml(data.summary || '')}</p>
      </section>

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
              <div class="item-sub_Template_1">${escapeHtml(exp.company)}</div>
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
          <h2>${ICONS.references}<span>References</span></h2>
          <div class="rule"></div>
        </div>
        ${data.references.map(ref => `
  <div class="ref-card-wrapper">
    <div class="ref-card_Template_1">

      ${ref.name ? `<h4>${escapeHtml(ref.name)}</h4>` : ''}

      ${(ref.campany || ref.position) ? `
        <p class="ref-line">
          ${ICONS.company}
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
    return `
      <div style="padding:6mm">
        ${p}
        <div class="name" style="margin-top:8px">${escapeHtml(data.personal.fullName || '')}</div>
        <div class="title">${escapeHtml(data.personal.title || '')}</div>
        <div class="contact small">${escapeHtml(data.personal.email || '')} • ${escapeHtml(data.personal.phone || '')} • ${escapeHtml(data.personal.website || '')}</div>
        <div style="margin-top:8px" class="section"><h4>Summary</h4><div class="small">${escapeHtml(data.summary || '')}</div></div>
        <div class="section"><h4>Experience</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.company)} <div class="meta small">${escapeHtml(exp.start || '')} — ${escapeHtml(exp.end || '')}</div><ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div>
        <div class="section"><h4>Education</h4>${data.education.map(edu => `<div class="job"><strong>${escapeHtml(edu.school)}</strong> — <strong>${escapeHtml(edu.discription)}</strong> — ${escapeHtml(edu.degree)} <div class="meta small">${escapeHtml(edu.year || '')}</div></div>`).join('')}</div>
        <div class="section"><h4>Skills</h4><div class="small">${data.skills.map(s => escapeHtml(s)).join(', ')}</div></div>
      </div>
      
    `;
  }

  function renderCreative() {
    const p = photoHtml();
    return `
      <div class="r-top">
        <div class="r-left">${p}<div style="margin-top:12px"><div class="name">${escapeHtml(data.personal.fullName || '')}</div><div class="title">${escapeHtml(data.personal.title || '')}</div><div class="contact small">${escapeHtml(data.personal.location || '')}</div><div style="margin-top:12px"><h4>Skills</h4><div class="small">${data.skills.map(s => escapeHtml(s)).join(', ')}</div></div></div></div>
        <div class="r-right"><div class="section"><h4>About</h4><div class="small">${escapeHtml(data.summary || '')}</div></div><div class="section"><h4>Experience</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.company)} <div class="meta small">${escapeHtml(exp.start || '')} — ${escapeHtml(exp.end || '')}</div><ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div><div class="section"><h4>Education</h4>${data.education.map(edu => `<div class="job"><strong>${escapeHtml(edu.school)}</strong> — ${escapeHtml(edu.degree)} <div class="meta small">${escapeHtml(edu.year || '')}</div></div>`).join('')}</div></div>
      </div>
    `;
  }

  function renderRecruiter() {
    const p = photoHtml();
    return `
      <div class="r-top">
        <div class="r-left">${p}<div style="margin-top:10px"><div class="name">${escapeHtml(data.personal.fullName || '')}</div><div class="title">${escapeHtml(data.personal.title || '')}</div><div class="contact small">${escapeHtml(data.personal.email || '')} • ${escapeHtml(data.personal.phone || '')}</div></div></div>
        <div class="r-right"><div class="section"><h4>TL;DR</h4><div class="small">${escapeHtml(data.summary || '')}</div></div><div class="section"><h4>Key wins</h4><ul class="bullets">${data.experience.slice(0, 3).map(exp => `<li><strong>${escapeHtml(exp.role)}</strong> at ${escapeHtml(exp.company)} — ${(exp.bullets || [])[0] || ''}</li>`).join('')}</ul></div><div class="section"><h4>Experience (full)</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong> — ${escapeHtml(exp.company)} <div class="meta small">${escapeHtml(exp.start || '')} — ${escapeHtml(exp.end || '')}</div><ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div></div>
      </div>
    `;
  }

  function renderATS() {
    // For ATS we purposely omit photo (many ATS prefer no images)
    return `
      <div>
        <div class="name">${escapeHtml(data.personal.fullName || '')}</div>
        <div class="title">${escapeHtml(data.personal.title || '')}</div>
        <div class="contact small">${escapeHtml(data.personal.email || '')} • ${escapeHtml(data.personal.phone || '')} • ${escapeHtml(data.personal.location || '')}</div>
        <div class="section"><h4>Summary</h4><div class="small">${escapeHtml(data.summary || '')}</div></div>
        <div class="section"><h4>Skills</h4><div class="small">${data.skills.map(s => escapeHtml(s)).join(', ')}</div></div>
        <div class="section"><h4>Experience</h4>${data.experience.map(exp => `<div class="job"><strong>${escapeHtml(exp.role)}</strong>, ${escapeHtml(exp.company)} (${escapeHtml(exp.start || '')} - ${escapeHtml(exp.end || '')})<ul class="bullets">${(exp.bullets || []).map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul></div>`).join('')}</div>
        <div class="section"><h4>Education</h4>${data.education.map(edu => `<div class="job"><strong>${escapeHtml(edu.school)}</strong> — ${escapeHtml(edu.degree)} ${escapeHtml(edu.discription)} (${escapeHtml(edu.year || '')})</div>`).join('')}</div>
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

const previewOverlay = document.querySelector('#preview-wrap-overlay');
const previewBtns = document.querySelectorAll('#previewBtn');
const editResumeBtn = document.querySelector('#editResume');
const navbar = document.querySelector('.navbar');

/* OPEN PREVIEW */
previewBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // show overlay
    previewOverlay.classList.remove('hidden');
    previewOverlay.classList.remove('opacity');

    // hide UI
    document.body.classList.add('overlay-open');
    navbar?.classList.add('hidden-ui');
  });
});

/* CLOSE PREVIEW (EDIT MODE) */
editResumeBtn.addEventListener('click', () => {
  // start overlay exit animation
  previewOverlay.classList.add('opacity');

  // restore UI
  document.body.classList.remove('overlay-open');
  navbar?.classList.remove('hidden-ui');

  setTimeout(() => {
    previewOverlay.classList.add('hidden');
  }, 450); // MUST match CSS transition
});


// show overlay when no PDF
function showpreviewOverlay() {
  previewOverlay.classList.remove("hidden");
}

function hidepreviewOverlay() {
  previewOverlay.classList.add("hidden");
}


function scalePreview() {
  const stage = document.querySelector('.preview-wrap');
  const preview = document.querySelector('#resumePreview');
  if (!stage || !preview) return;

  const w = window.innerWidth;
  let scale;

  const BASE_WIDTH = 794;   // real preview width
  const START_POINT = 510; // where scale = 0.63
  const START_SCALE = 0.63;

  if (w >= 815) {
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
