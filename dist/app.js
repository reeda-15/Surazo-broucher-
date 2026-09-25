const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); }
menuButton.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation'); });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => { if (event.key === 'Escape' && navigation.classList.contains('open')) { closeMenu(); menuButton.focus(); } });
document.addEventListener('click', event => { if (!event.target.closest('.header')) closeMenu(); });
const productSelect = document.querySelector('#quote-product');
document.querySelectorAll('[data-product]').forEach(button => button.addEventListener('click', () => { productSelect.value = button.dataset.product; document.querySelector('#contact').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'}); productSelect.focus({preventScroll:true}); }));
const grades = {
 A125: ['Made for everyday footfall.', 'For pedestrian and cycle applications. Share your cover size, installation location and project requirements with our team to confirm suitability.'],
 B125: ['A fit for pedestrian spaces.', 'Listed in our brochure for footpath applications. Share the installation conditions and any vehicle access requirements so our team can confirm the appropriate specification.'],
 C250: ['Designed around the kerb.', 'For kerb and channel applications. Share your drainage layout, cover dimensions and installation conditions with our team to confirm suitability.'],
 D400: ['Ready for the road ahead.', 'For road and carriageway applications. Share your cover size, installation location and project requirements with our team to confirm suitability.']
};
const gradeTabs = [...document.querySelectorAll('[role="tab"]')];
const gradeImages = {
 A125: ['application-pedestrian.webp', 'Surazo cover in a pedestrian walkway', 'Pedestrian spaces'],
 B125: ['application-footpath.webp', 'Surazo cover on a paved footpath beside the road; the illustrated cover is marked C250', 'Footpath setting · pictured cover marked C250'],
 C250: ['application-drainage.webp', 'Surazo drainage cover beside a kerb in rainfall', 'Kerb & channel drainage'],
 D400: ['application-utilities.webp', 'Surazo square cover installed in a roadway', 'Road & carriageway applications']
};
let selectedGrade = 'D400';
function selectGrade(tab) {
 selectedGrade = tab.dataset.grade;
 gradeTabs.forEach(item => { item.setAttribute('aria-selected', String(item === tab)); item.tabIndex = item === tab ? 0 : -1; });
 document.querySelector('#grade-value').textContent = selectedGrade;
 document.querySelector('#grade-rating').textContent = selectedGrade === 'A125' ? 'Contact us to confirm the load rating' : ({B125:'12.5 T',C250:'25 T',D400:'40 T'})[selectedGrade] + ' · brochure load reference';
 document.querySelector('#grade-title').textContent = grades[selectedGrade][0];
 document.querySelector('#grade-description').textContent = grades[selectedGrade][1];
 const [image, alt, caption] = gradeImages[selectedGrade];
 document.querySelector('#grade-image').src = 'assets/' + image;
 document.querySelector('#grade-image').alt = alt;
 document.querySelector('#grade-image-caption').textContent = caption;
 document.querySelector('#load-panel').setAttribute('aria-labelledby', tab.id);
}
gradeTabs.forEach((tab,index) => {
 tab.addEventListener('click', () => selectGrade(tab));
 tab.addEventListener('keydown', event => { let next; if (event.key === 'ArrowRight') next = (index + 1) % gradeTabs.length; if (event.key === 'ArrowLeft') next = (index + gradeTabs.length - 1) % gradeTabs.length; if (event.key === 'Home') next = 0; if (event.key === 'End') next = gradeTabs.length - 1; if (next !== undefined) { event.preventDefault(); selectGrade(gradeTabs[next]); gradeTabs[next].focus(); } });
});
document.querySelector('#grade-enquire').addEventListener('click', () => { document.querySelector('#quote-grade').value = selectedGrade; });
const form = document.querySelector('#quote-form');
function enquiryText() {
 const data = new FormData(form);
 return ['Hello Surazo, I would like to request a quotation.', '', `Name: ${data.get('name').trim()}`, `Company: ${data.get('company').trim() || 'Not provided'}`, `Email: ${data.get('email').trim()}`, `Product: ${data.get('product')}`, `Load class: ${data.get('grade')}`, `Size / clear opening: ${data.get('size').trim() || 'To be discussed'}`, `Quantity: ${data.get('quantity') || 'To be discussed'}`, `Project details: ${data.get('details').trim() || 'To be discussed'}`].join('\n');
}
function showStatus(message) { const status = document.querySelector('#form-status'); status.hidden = false; status.textContent = message; }
form.addEventListener('submit', event => { event.preventDefault(); if (!form.reportValidity()) return; window.open(`https://wa.me/919766611880?text=${encodeURIComponent(enquiryText())}`, '_blank', 'noopener,noreferrer'); showStatus('Your enquiry is ready in WhatsApp. Review it and tap Send to share it with Surazo. If WhatsApp did not open, choose “Prefer email?”.'); });
document.querySelector('#email-enquiry').addEventListener('click', () => { if (!form.reportValidity()) return; window.location.href = `mailto:support@surazocovers.com?subject=${encodeURIComponent('Product quotation enquiry — Surazo')}&body=${encodeURIComponent(enquiryText())}`; showStatus('Your email app will open with a draft enquiry. Review and send it to request a quote.'); });
document.querySelector('#year').textContent = new Date().getFullYear();

const requestedProduct = new URLSearchParams(window.location.search).get('product');
if (requestedProduct && [...productSelect.options].some(option => option.value === requestedProduct)) productSelect.value = requestedProduct;
const requestedSpecs = new URLSearchParams(window.location.search);
const requestedGrade = requestedSpecs.get('grade');
const gradeSelect = document.querySelector('#quote-grade');
if ([...gradeSelect.options].some(option => option.value === requestedGrade)) gradeSelect.value = requestedGrade;
const requestedSize = requestedSpecs.get('size');
if (requestedSize) form.querySelector('[name="size"]').value = requestedSize.slice(0, 100);
