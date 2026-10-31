/**
 * Toast Notification System
 * Brightloop Subscription Management System
 * Replaces browser alert()/confirm()/prompt() with proper UI
 */

export const toast = {
  _container: null,

  _getContainer() {
    if (!this._container) {
      this._container = document.createElement('div');
      this._container.id = 'toast-container';
      this._container.className = 'fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm pointer-events-none';
      document.body.appendChild(this._container);
    }
    return this._container;
  },

  show(message, type = 'info', duration = 4000) {
    const container = this._getContainer();
    const id = `toast_${Date.now()}`;

    const colors = {
      success: 'bg-[#006242] text-white border-green-800',
      error: 'bg-[#ba1a1a] text-white border-red-800',
      warning: 'bg-amber-600 text-white border-amber-700',
      info: 'bg-[#004ac6] text-white border-blue-700'
    };

    const icons = { success: 'check_circle', error: 'error', warning: 'warning', info: 'info' };

    const el = document.createElement('div');
    el.id = id;
    el.className = `pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg border ${colors[type]} text-[13px] font-medium transition-all duration-300 opacity-0 translate-x-4`;
    el.innerHTML = `
      <span class="material-symbols-outlined text-[18px] shrink-0 mt-0.5">${icons[type]}</span>
      <span class="flex-1">${message}</span>
      <button class="opacity-70 hover:opacity-100 shrink-0" onclick="document.getElementById('${id}')?.remove()">
        <span class="material-symbols-outlined text-[16px]">close</span>
      </button>
    `;
    container.appendChild(el);

    // Animate in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0)';
    });

    // Auto-remove
    if (duration > 0) {
      setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(16px)';
        setTimeout(() => el.remove(), 300);
      }, duration);
    }

    return id;
  },

  success(msg, duration) { return this.show(msg, 'success', duration); },
  error(msg, duration) { return this.show(msg, 'error', duration || 6000); },
  warning(msg, duration) { return this.show(msg, 'warning', duration); },
  info(msg, duration) { return this.show(msg, 'info', duration); }
};

/**
 * Confirmation Modal — replaces browser confirm()
 * Returns a Promise<boolean>
 */
export function confirmDialog({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', danger = false }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in';
    backdrop.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div class="p-6">
          <div class="flex items-start gap-3">
            <span class="material-symbols-outlined text-[24px] ${danger ? 'text-error' : 'text-primary'} shrink-0 mt-0.5">
              ${danger ? 'warning' : 'help'}
            </span>
            <div>
              <h3 class="font-bold text-[16px] text-on-surface mb-1">${title}</h3>
              <p class="text-[13px] text-on-surface-variant">${message}</p>
            </div>
          </div>
        </div>
        <div class="flex gap-2 px-6 pb-5 justify-end">
          <button id="dialog-cancel" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">
            ${cancelText}
          </button>
          <button id="dialog-confirm" class="px-4 py-2 rounded-lg text-[13px] font-semibold ${danger ? 'bg-error text-white hover:bg-error/90' : 'bg-primary text-white hover:bg-primary/90'} transition-colors">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('#dialog-cancel').addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });

    backdrop.querySelector('#dialog-confirm').addEventListener('click', () => {
      backdrop.remove();
      resolve(true);
    });

    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) { backdrop.remove(); resolve(false); }
    });
  });
}

/**
 * Prompt Modal — replaces browser prompt()
 * Returns a Promise<string|null>
 */
export function promptDialog({ title, message, placeholder = '', defaultValue = '' }) {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm';
    backdrop.innerHTML = `
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div class="p-6">
          <h3 class="font-bold text-[16px] text-on-surface mb-1">${title}</h3>
          <p class="text-[13px] text-on-surface-variant mb-4">${message}</p>
          <input
            id="prompt-input"
            type="text"
            value="${defaultValue}"
            placeholder="${placeholder}"
            class="w-full px-3.5 py-2.5 border border-surface-container rounded-lg text-[14px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
          />
        </div>
        <div class="flex gap-2 px-6 pb-5 justify-end">
          <button id="prompt-cancel" class="px-4 py-2 rounded-lg text-[13px] font-semibold text-on-surface hover:bg-surface-container transition-colors">Cancel</button>
          <button id="prompt-ok" class="px-4 py-2 rounded-lg text-[13px] font-semibold bg-primary text-white hover:bg-primary/90 transition-colors">OK</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    const input = backdrop.querySelector('#prompt-input');
    input.focus();
    input.select();

    const submit = () => {
      backdrop.remove();
      resolve(input.value || null);
    };

    backdrop.querySelector('#prompt-cancel').addEventListener('click', () => { backdrop.remove(); resolve(null); });
    backdrop.querySelector('#prompt-ok').addEventListener('click', submit);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { backdrop.remove(); resolve(null); } });
  });
}

