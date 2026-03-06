//You’re still getting the error because lastSkill can be undefined when data.skills is empty.
refs.addSkillBtn.addEventListener("click", () => {
  const lastSkill = data.skills[data.skills.length - 1];

  if (!lastSkill || !lastSkill.name || !lastSkill.name.trim()) {
    validateSkillAdd();
    return;
  }

  data.skills.unshift({
    id: id(),
    name: "",
    level: "basic"
  });

  renderLists();
  renderPreview();
  save();

  validateSkillAdd();
});

refs.addSkillBtn.addEventListener("click", () => {
  const firstSkill = data.skills[0];

  if (!firstSkill || !firstSkill.name || !firstSkill.name.trim()) {
    validateSkillAdd();
    return;
  }

  data.skills.unshift({ name: "" });
  renderLists();
});

//⚡ Cleaner Modern Version
refs.addSkillBtn.addEventListener("click", () => {
  const firstSkill = data.skills.at(0);

  if (!firstSkill?.name?.trim()) {
    validateSkillAdd();
    return;
  }

  data.skills.unshift({ name: "" });
  renderLists();
});