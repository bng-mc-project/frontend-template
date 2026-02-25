const { createApp } = Vue;

createApp({
  data() {
    return {
      menuOpen: false,
      profilePanelOpen: false,
      profileDropdownOpen: false,
      otherDropdownOpen: false,
      scrollY: 0
    };
  },
  methods: {
    isDesktop() {
      return window.matchMedia('(min-width: 1024px)').matches;
    },
    toggleMenu() {
      this.menuOpen = !this.menuOpen;
      this.profilePanelOpen = false;
    },
    openProfile() {
      if (this.isDesktop()) return;
      this.scrollY = window.scrollY;
      this.profilePanelOpen = true;
      this.menuOpen = false;
      document.documentElement.classList.add('profile-panel-open');
      document.body.classList.add('profile-panel-open');
      document.body.style.top = `-${this.scrollY}px`;
    },
    closeProfile() {
      if (!this.profilePanelOpen) return;
      this.profilePanelOpen = false;
      document.documentElement.classList.remove('profile-panel-open');
      document.body.classList.remove('profile-panel-open');
      document.body.style.top = '';
      window.scrollTo(0, this.scrollY);
    },
    toggleProfileDropdown(e) {
      if (!this.isDesktop()) return;
      e.preventDefault();
      this.profileDropdownOpen = !this.profileDropdownOpen;
    },
    toggleOtherDropdown(e) {
      e.preventDefault();
      this.otherDropdownOpen = !this.otherDropdownOpen;
    },
    async handleFormSubmit(event) {
      const form = event.target;
      if (form.hasAttribute('another')) return;
      event.preventDefault();

      const formData = new FormData(form);
      const method = (form.getAttribute('method') || 'GET').toUpperCase();
      if (method === 'POST') {
        const csrfMeta = document.querySelector('meta[name="csrf_token"]');
        if (csrfMeta?.content) {
          formData.append('csrf_token', csrfMeta.content);
        }
      }

      let url = form.getAttribute('action') || '';
      let fetchOpts = { method, credentials: 'same-origin' };
      if (method === 'POST') {
        fetchOpts.body = formData;
      } else {
        const params = new URLSearchParams(formData);
        url += (url.includes('?') ? '&' : '?') + params.toString();
      }

      try {
        const response = await fetch(url, fetchOpts);
        const text = await response.text();
        let json;
        try {
          json = JSON.parse(text);
        } catch {
          return;
        }
        if (json.status) {
          alert(json.status + ' - ' + json.message);
        }
        if (json.url) {
          window.location = json.url.startsWith('http://') || json.url.startsWith('https://')
            ? json.url
            : '/' + json.url.replace(/^\//, '');
        } else if (json.method === 'reload') {
          window.location.reload();
        }
      } catch (err) {
        console.error('Form submit error:', err);
      }
      if (typeof grecaptcha !== 'undefined' && grecaptcha.reset) {
        grecaptcha.reset();
      }
    }
  },
  mounted() {
    const onResize = () => {
      if (this.isDesktop()) {
        this.profilePanelOpen = false;
        this.menuOpen = false;
        document.documentElement.classList.remove('profile-panel-open');
        document.body.classList.remove('profile-panel-open');
        document.body.style.top = '';
      }
    };
    window.addEventListener('resize', onResize);
    this.$el.addEventListener('submit', (e) => this.handleFormSubmit(e));
    document.addEventListener('click', (e) => {
      if (this.profileDropdownOpen && !e.target.closest('.nav__dropdown.hide-mob')) {
        this.profileDropdownOpen = false;
      }
      if (this.otherDropdownOpen && !e.target.closest('.nav__dropdown--other')) {
        this.otherDropdownOpen = false;
      }
    });
  }
}).mount('#app');
