/**
 * Login Page
 * Brightloop Subscription Management System
 */

import { authService } from '../services/api.js';

export function LoginPage() {
  return `
    <div id="login-page" class="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4">
      <div class="w-full max-w-md">
        <!-- Logo -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center gap-3 mb-4">
            <div class="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[22px]">autorenew</span>
            </div>
            <span class="text-[22px] font-bold text-on-surface tracking-tight">Brightloop</span>
          </div>
          <h1 class="text-[28px] font-bold text-on-surface mb-1">Welcome back</h1>
          <p class="text-on-surface-variant text-[14px]">Sign in to your Billing Operations account</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-sm border border-surface-container p-8">
          <form id="login-form" class="flex flex-col gap-5">
            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label for="login-email" class="text-[13px] font-semibold text-on-surface">Email address</label>
              <input
                id="login-email"
                type="email"
                required
                autocomplete="email"
                placeholder="elena@brightloop.io"
                class="px-3.5 py-2.5 border border-surface-container rounded-lg text-[14px] text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label for="login-password" class="text-[13px] font-semibold text-on-surface">Password</label>
                <button type="button" class="text-[12px] text-primary hover:underline">Forgot password?</button>
              </div>
              <div class="relative">
                <input
                  id="login-password"
                  type="password"
                  required
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full px-3.5 py-2.5 border border-surface-container rounded-lg text-[14px] text-on-surface bg-white focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
                <button type="button" id="toggle-password" class="absolute right-3 top-1/2 -translate-y-1/2 text-secondary hover:text-on-surface">
                  <span class="material-symbols-outlined text-[18px]">visibility</span>
                </button>
              </div>
            </div>

            <!-- Error message -->
            <div id="login-error" class="hidden px-3.5 py-2.5 bg-error-container/20 border border-error/30 rounded-lg text-error text-[13px] flex items-center gap-2">
              <span class="material-symbols-outlined text-[16px]">error</span>
              <span id="login-error-text"></span>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              id="login-submit"
              class="w-full py-2.5 bg-primary hover:bg-primary/90 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-[14px]"
            >
              <span id="login-btn-text">Sign in to Dashboard</span>
              <span id="login-spinner" class="hidden material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 p-3.5 bg-surface-container-low rounded-lg">
            <p class="text-[12px] font-semibold text-on-surface mb-2">Demo Credentials</p>
            <div class="space-y-1 text-[11px] text-secondary font-mono">
              <div class="flex justify-between"><span>Admin:</span><span>elena@brightloop.io / admin123</span></div>
              <div class="flex justify-between"><span>Staff:</span><span>marcus@brightloop.io / staff123</span></div>
            </div>
          </div>
        </div>

        <p class="text-center text-[12px] text-secondary mt-6">
          Brightloop Enterprise Billing v2.0 · <a href="#" class="text-primary hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  `;
}

/**
 * Attach login form behavior after the page is rendered into DOM
 */
export function initLoginPage() {
  const form = document.querySelector('#login-form');
  const emailInput = document.querySelector('#login-email');
  const passwordInput = document.querySelector('#login-password');
  const errorDiv = document.querySelector('#login-error');
  const errorText = document.querySelector('#login-error-text');
  const submitBtn = document.querySelector('#login-submit');
  const btnText = document.querySelector('#login-btn-text');
  const spinner = document.querySelector('#login-spinner');
  const togglePw = document.querySelector('#toggle-password');

  if (!form) return;

  // Toggle password visibility
  togglePw?.addEventListener('click', () => {
    const isText = passwordInput.type === 'text';
    passwordInput.type = isText ? 'password' : 'text';
    togglePw.querySelector('span').textContent = isText ? 'visibility' : 'visibility_off';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
      showError('Please enter your email and password.');
      return;
    }

    // Loading state
    submitBtn.disabled = true;
    btnText.textContent = 'Signing in...';
    spinner.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    try {
      await authService.login(email, password);
      // Redirect to dashboard
      window.location.hash = '#dashboard';
      window.location.reload();
    } catch (err) {
      showError(err.message || 'Login failed. Please try again.');
    } finally {
      submitBtn.disabled = false;
      btnText.textContent = 'Sign in to Dashboard';
      spinner.classList.add('hidden');
    }
  });

  function showError(msg) {
    errorText.textContent = msg;
    errorDiv.classList.remove('hidden');
  }
}

