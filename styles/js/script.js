document.addEventListener('DOMContentLoaded', () => {
  const profilePanel = document.getElementById('profileMobilePanel');
  const profileBtn = document.getElementById('profileMobileBtn');
  const profilePanelClose = document.getElementById('profilePanelClose');
  const isDesktop = () => window.matchMedia('(min-width: 1024px)').matches;
  let scrollY = 0;

  const closeProfilePanel = () => {
    if (!profilePanel?.classList.contains('is-active')) return;
    profilePanel.classList.remove('is-active');
    profilePanel.setAttribute('aria-hidden', 'true');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('profile-panel-open');
    document.body.classList.remove('profile-panel-open');
    document.body.style.top = '';
    window.scrollTo(0, scrollY);
  };
  const openProfilePanel = () => {
    scrollY = window.scrollY;
    document.documentElement.classList.add('profile-panel-open');
    document.body.classList.add('profile-panel-open');
    document.body.style.top = `-${scrollY}px`;
    profilePanel.classList.add('is-active');
    profilePanel.setAttribute('aria-hidden', 'false');
    if (profileBtn) profileBtn.setAttribute('aria-expanded', 'true');
  };
  // Профиль (десктоп): клик фиксирует/открепляет dropdown; hover показывает когда откреплён
  const profileDropdownEl = document.getElementById('profileDropdown');
  const profileDropdownTrigger = document.getElementById('profileDropdownTrigger');
  if (profileDropdownTrigger && profileDropdownEl) {
    profileDropdownTrigger.addEventListener('click', (e) => {
      if (!window.matchMedia('(min-width: 1024px)').matches) return;
      e.preventDefault();
      profileDropdownEl.classList.toggle('is-active');
    });
  }

  // Основное меню (главы) — по стандарту Bulma
  document.querySelectorAll('.navbar-burger').forEach((el) => {
    el.addEventListener('click', () => {
      const targetId = el.getAttribute('data-target');
      const target = targetId ? document.getElementById(targetId) : null;
      if (target) {
        el.classList.toggle('is-active');
        el.setAttribute('aria-expanded', el.classList.contains('is-active'));
        target.classList.toggle('is-active');
        closeProfilePanel();
      }
    });
  });

  if (profileBtn && profilePanel) {
    profileBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDesktop()) return;
      openProfilePanel();
    });
  }
  if (profilePanelClose && profilePanel) {
    profilePanelClose.addEventListener('click', closeProfilePanel);
  }
  profilePanel?.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', closeProfilePanel);
  });
  window.addEventListener('resize', () => {
    if (isDesktop() && profilePanel?.classList.contains('is-active')) {
      closeProfilePanel();
    }
  });
});
