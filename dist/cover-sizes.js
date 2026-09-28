document.querySelectorAll('.cover-sizes').forEach(section => {
 const choices = [...section.querySelectorAll('.cover-size-choice')];
 section.addEventListener('click', event => {
  const choice = event.target.closest('.cover-size-choice');
  if (!choice || !section.contains(choice)) return;
  choices.forEach(button => button.setAttribute('aria-pressed', String(button === choice)));
  section.querySelector('[data-selected-size]').textContent = choice.dataset.size;
  section.querySelector('[data-selected-description]').textContent = choice.dataset.name + '. ' + choice.dataset.description;
  section.querySelector('[data-size-enquiry]').href = choice.dataset.enquiry;
 });
});
