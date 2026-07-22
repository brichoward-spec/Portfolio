(async function () {
  try {
    const d = await CMS.loadJSON("/content/professional.json");

    CMS.setText("hero-eyebrow", d.eyebrow);
    CMS.setText("hero-name", d.name);
    CMS.setText("hero-profile", d.profile);

    const phone = document.getElementById("contact-phone");
    if (phone && d.contact) {
      phone.href = "tel:" + d.contact.phone.replace(/\D/g, "");
      phone.lastChild.textContent = d.contact.phone;
    }
    const email = document.getElementById("contact-email");
    if (email && d.contact) {
      email.href = "mailto:" + d.contact.email;
      email.lastChild.textContent = d.contact.email;
    }
    const linkedin = document.getElementById("contact-linkedin");
    if (linkedin && d.contact) linkedin.href = d.contact.linkedin;
    CMS.setText("contact-location", d.contact && d.contact.location);

    const resumeLink = document.getElementById("resume-link");
    if (resumeLink && d.resume_file) resumeLink.href = d.resume_file;

    const expList = document.getElementById("experience-list");
    if (expList && Array.isArray(d.experience)) {
      expList.innerHTML = "";
      d.experience.forEach((job) => {
        const item = CMS.el("div", { class: "job" });
        const head = CMS.el("div", { class: "job-head" });
        head.appendChild(CMS.el("div", { class: "job-title", html: CMS.escapeHtml(job.title) + ' <span class="job-org">— ' + CMS.escapeHtml(job.org) + "</span>" }));
        head.appendChild(CMS.el("div", { class: "job-dates", text: job.dates }));
        item.appendChild(head);
        item.appendChild(CMS.el("p", { text: job.description }));
        expList.appendChild(item);
      });
    }

    const earlierList = document.getElementById("earlier-list");
    if (earlierList && Array.isArray(d.earlier_experience)) {
      earlierList.innerHTML = "";
      d.earlier_experience.forEach((row) => {
        const item = CMS.el("div", { class: "earlier-row" });
        const left = CMS.el("div");
        left.appendChild(CMS.el("span", { class: "earlier-title", text: row.title }));
        left.appendChild(document.createTextNode(" "));
        left.appendChild(CMS.el("span", { class: "earlier-org", text: "— " + row.org }));
        item.appendChild(left);
        item.appendChild(CMS.el("div", { class: "earlier-dates", text: row.dates }));
        earlierList.appendChild(item);
      });
    }

    const skillsGrid = document.getElementById("skills-list");
    if (skillsGrid && Array.isArray(d.skills)) {
      skillsGrid.innerHTML = "";
      d.skills.forEach((skill) => {
        skillsGrid.appendChild(CMS.el("span", { class: "skill-chip", text: skill }));
      });
    }

    const eduList = document.getElementById("education-list");
    if (eduList && Array.isArray(d.education)) {
      eduList.innerHTML = "";
      d.education.forEach((edu) => {
        const row = CMS.el("div", { class: "edu-row" });
        row.appendChild(CMS.el("div", { class: "edu-school", text: edu.school }));
        row.appendChild(CMS.el("div", { class: "edu-degree", text: edu.degree }));
        eduList.appendChild(row);
      });
    }

    CMS.setText("contact-heading", d.contact_heading);
    CMS.setText("contact-sub", d.contact_sub);
  } catch (e) {
    console.error("Content load failed, showing built-in defaults.", e);
  }
})();
