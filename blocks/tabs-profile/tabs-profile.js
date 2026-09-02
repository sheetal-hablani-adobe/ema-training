// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-profile-list';
  tablist.setAttribute('role', 'tablist');

  // decorate tabs and tabpanels
  const tabs = [...block.children].map((child) => child.firstElementChild);
  tabs.forEach((tab, i) => {
    const id = toClassName(tab.textContent);

    // decorate tabpanel
    const tabpanel = block.children[i];
    tabpanel.className = 'tabs-profile-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button
    const button = document.createElement('button');
    button.className = 'tabs-profile-tab';
    button.id = `tab-${id}`;

    // Build a richer tab label (avatar + name + role) by reading from the
    // panel content, matching the source. The tab label cell only carries the
    // name, so pull the avatar image and role text from the tabpanel.
    // The role is the paragraph immediately after the name paragraph (the one
    // wrapping <strong>); fall back to the first text-only paragraph that isn't
    // the name. Using the name paragraph as anchor avoids depending on the
    // image cell's position.
    const panelImg = tabpanel.querySelector('img');
    const panelParas = [...tabpanel.querySelectorAll('p')];
    const nameText = tab.textContent.trim();
    const nameParaIndex = panelParas.findIndex((p) => p.querySelector('strong'));
    let roleText = '';
    if (nameParaIndex !== -1 && panelParas[nameParaIndex + 1]) {
      roleText = panelParas[nameParaIndex + 1].textContent.trim();
    } else {
      const roleP = panelParas.find((p) => {
        const t = p.textContent.trim();
        return t && t !== nameText && !p.querySelector('img, strong');
      });
      roleText = roleP ? roleP.textContent.trim() : '';
    }

    if (panelImg) {
      const avatar = document.createElement('span');
      avatar.className = 'tabs-profile-tab-avatar';
      const img = panelImg.cloneNode(true);
      img.removeAttribute('class');
      avatar.append(img);
      button.append(avatar);
    }

    const info = document.createElement('span');
    info.className = 'tabs-profile-tab-info';
    const name = document.createElement('span');
    name.className = 'tabs-profile-tab-name';
    name.textContent = nameText;
    info.append(name);
    if (roleText) {
      const role = document.createElement('span');
      role.className = 'tabs-profile-tab-role';
      role.textContent = roleText;
      info.append(role);
    }
    button.append(info);

    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);
    tab.remove();
  });

  block.prepend(tablist);
}
