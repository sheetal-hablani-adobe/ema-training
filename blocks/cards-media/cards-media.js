import { createOptimizedPicture } from '../../scripts/aem.js';

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-media-card-image';
      else div.className = 'cards-media-card-body';
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  // Make the whole card clickable when it contains a link (article cards).
  // The card keeps its real title link for accessibility; clicking anywhere
  // else on the card follows the same href.
  ul.querySelectorAll(':scope > li').forEach((li) => {
    const link = li.querySelector('a[href]');
    if (!link) return;
    li.classList.add('cards-media-card-link');
    li.addEventListener('click', (e) => {
      if (e.target.closest('a')) return; // let real links behave normally
      link.click();
    });
  });

  block.textContent = '';
  block.append(ul);
}
