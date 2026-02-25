const { createApp } = Vue;

createApp({
  data() {
    return {
      menuOpen: false,
      profilePanelOpen: false,
      profileDropdownOpen: false,
      otherDropdownOpen: false,
      scrollY: 0,
      selectedDonate: 'vip',
      donateServers: [
        { name: 'HiTech', logo: 'hitech_server.webp' },
        { name: 'TechnoMagic', logo: 'hitech_server.webp' }
      ],
      selectedServerIndex: 0,
      serverDropdownOpen: false,
      donateKits: [
        {
          name: 'Industrial',
          privilege: 'vip',
          cooldownDays: 7,
          itemCounts: [16, 8, 4, null, null, 1, 32, null, null, 64, null, 2, null, null, 8, 4, null, 16, null, null, null, 1, 32, 64, null, 8, null, null, 4, null, 2, 16, null, null, 1, null]
        },
        {
          name: 'Магический',
          privilege: 'premium',
          cooldownDays: 1,
          itemCounts: [null, 4, null, 8, 16, null, null, 2, 1, null, 32, null, null, 64, null, 4, 8, null, null, 1, null, 16, null, null, 2, null, 32, 64, null, null, 8, null, 4, null, 1, null]
        }
      ],
      donateFeatures: [
        { label: 'Кол-во приватов', value: '10' },
        { label: 'Сохранение брони при смерти', check: true },
        { label: 'Домашняя точка', value: '3' },
        { label: 'Участие в аукционе', check: true },
        { label: 'Приват в чате', value: '50 блоков' },
        { label: 'Цветной ник в чате', check: true },
        { label: 'Команда /fly', sublabel: 'Возможность полёта', check: true },
        { label: 'Команда /heal', sublabel: 'Восстановление здоровья', check: true },
        { label: 'Команда /feed', sublabel: 'Восстановление голода', check: true }
      ],
      selectedPeriod: '1',
      donatePeriodPrices: { '1': 99, '3': 209, 'forever': 499 },
      donatePeriodOptions: [
        { value: '1', label: 'На 1 мес' },
        { value: '3', label: 'На 3 мес', discount: '-30%' },
        { value: 'forever', label: 'Навсегда', gradient: true }
      ],
      periodDropdownOpen: false
    };
  },
  computed: {
    donateCurrentPrice() {
      return this.donatePeriodPrices[this.selectedPeriod] || 99;
    },
    selectedPeriodOption() {
      return this.donatePeriodOptions.find(o => o.value === this.selectedPeriod) || this.donatePeriodOptions[0];
    }
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
    setSelectedDonate(id) {
      this.selectedDonate = id;
      this.$nextTick(() => {
        const root = document.getElementById('app');
        const card = root && root.querySelector(`[data-donate-id="${id}"]`);
        if (card) {
          card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
        }
      });
    },
    getPrivilegeLabel(id) {
      const labels = { vip: 'VIP', premium: 'PREMIUM', deluxe: 'DELUXE', elite: 'ELITE', legend: 'LEGEND' };
      return labels[id] || id.toUpperCase();
    },
    selectServer(index) {
      this.selectedServerIndex = index;
      this.serverDropdownOpen = false;
    },
    toggleServerDropdown(e) {
      e.preventDefault();
      this.serverDropdownOpen = !this.serverDropdownOpen;
    },
    togglePeriodDropdown(e) {
      e.preventDefault();
      this.periodDropdownOpen = !this.periodDropdownOpen;
    },
    selectPeriod(value) {
      this.selectedPeriod = value;
      this.periodDropdownOpen = false;
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
    const appEl = document.getElementById('app');
    if (appEl && appEl.addEventListener) {
      appEl.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }
    document.addEventListener('click', (e) => {
      if (this.profileDropdownOpen && !e.target.closest('.nav__dropdown.hide-mob')) {
        this.profileDropdownOpen = false;
      }
      if (this.otherDropdownOpen && !e.target.closest('.nav__dropdown--other')) {
        this.otherDropdownOpen = false;
      }
      if (this.serverDropdownOpen && !e.target.closest('.donate-server-select')) {
        this.serverDropdownOpen = false;
      }
      if (this.periodDropdownOpen && !e.target.closest('.donate-period-select')) {
        this.periodDropdownOpen = false;
      }
    });

    // Перетаскивание карусели мышью при ширине экрана < 600px
    const carousel = document.querySelector('.donate-carousel');
    if (carousel) {
      let dragStartX = 0, dragStartScroll = 0, isDragging = false, didDrag = false;
      carousel.addEventListener('mousedown', (e) => {
        if (window.innerWidth >= 600) return;
        isDragging = true;
        didDrag = false;
        dragStartX = e.pageX;
        dragStartScroll = carousel.scrollLeft;
      });
      document.addEventListener('mousemove', (e) => {
        if (!isDragging || window.innerWidth >= 600) return;
        const dx = e.pageX - dragStartX;
        if (Math.abs(dx) > 5) didDrag = true;
        carousel.scrollLeft = dragStartScroll - dx;
      });
      document.addEventListener('mouseup', () => {
        if (isDragging && window.innerWidth < 600) {
          const track = carousel.querySelector('.donate-carousel__track');
          const cards = track && track.querySelectorAll('.donate-card');
          if (cards && cards.length) {
            const scrollLeft = carousel.scrollLeft;
            let nearest = 0, minDist = Infinity;
            for (let i = 0; i < cards.length; i++) {
              const target = cards[i].offsetLeft;
              const dist = Math.abs(target - scrollLeft);
              if (dist < minDist) {
                minDist = dist;
                nearest = i;
              }
            }
            const targetScroll = cards[nearest].offsetLeft;
            carousel.scrollTo({ left: targetScroll, behavior: 'smooth' });
          }
        }
        isDragging = false;
      });
      carousel.addEventListener('click', (e) => {
        if (didDrag) {
          e.preventDefault();
          e.stopPropagation();
          didDrag = false;
        }
      }, true);
    }
  }
}).mount('#app');
