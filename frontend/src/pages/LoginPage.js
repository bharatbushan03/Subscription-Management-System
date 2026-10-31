import { authService } from '../services/api.js';

export function LoginPage() {
  return `
    <main class="min-h-screen bg-background flex items-center justify-center p-6">
      <form id="login-form" class="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-lg border border-surface-container/60 p-8">
        <div class="mb-6">
          <p class="text-primary font-label-sm font-bold uppercase tracking-wider">Brightloop Billing Core</p>
          <h1 id="auth-title" class="font-headline-lg text-3xl font-bold text-on-surface mt-2">Sign in</h1>
          <p id="auth-description" class="text-on-surface-variant mt-2">Use your subscription management account.</p>
        </div>
        <div id="name-field" class="hidden">
          <label class="block text-label-md font-semibold text-on-surface mb-1" for="login-name">Name</label>
          <input id="login-name" name="name" type="text" autocomplete="name" class="w-full mb-4 px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface">
        </div>
        <label class="block text-label-md font-semibold text-on-surface mb-1" for="login-email">Email</label>
        <input id="login-email" name="email" type="email" required autocomplete="email" class="w-full mb-4 px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface">
        <label class="block text-label-md font-semibold text-on-surface mb-1" for="login-password">Password</label>
        <input id="login-password" name="password" type="password" required minlength="8" autocomplete="current-password" class="w-full mb-5 px-3 py-2 rounded-lg border border-outline-variant/40 bg-surface-container-low text-on-surface">
        <p id="login-error" class="hidden text-error text-sm mb-4"></p>
        <button id="auth-submit" type="submit" class="w-full rounded-lg bg-primary text-on-primary py-2.5 font-semibold hover:bg-primary-container">Sign in</button>
        <button id="auth-toggle" type="button" class="w-full mt-3 text-primary text-sm font-semibold hover:underline">Create an account</button>
      </form>
    </main>
  `;
}

export function bindLoginForm(onSuccess) {
  let registerMode = false;
  const formElement = document.querySelector('#login-form');
  const nameField = document.querySelector('#name-field');
  const title = document.querySelector('#auth-title');
  const description = document.querySelector('#auth-description');
  const submit = document.querySelector('#auth-submit');
  const toggle = document.querySelector('#auth-toggle');
  toggle?.addEventListener('click', () => {
    registerMode = !registerMode;
    nameField.classList.toggle('hidden', !registerMode);
    nameField.querySelector('input').required = registerMode;
    title.textContent = registerMode ? 'Create account' : 'Sign in';
    description.textContent = registerMode ? 'Create your subscription management account.' : 'Use your subscription management account.';
    submit.textContent = registerMode ? 'Create account' : 'Sign in';
    toggle.textContent = registerMode ? 'Already have an account? Sign in' : 'Create an account';
  });
  document.querySelector('#login-form')?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const error = document.querySelector('#login-error');
    try {
      if (registerMode) {
        await authService.register(form.get('name'), form.get('email'), form.get('password'));
        registerMode = false;
        nameField.classList.add('hidden');
        nameField.querySelector('input').required = false;
        title.textContent = 'Sign in';
        description.textContent = 'Account created. Sign in to continue.';
        submit.textContent = 'Sign in';
        toggle.textContent = 'Create an account';
        formElement.reset();
      } else {
        await authService.login(form.get('email'), form.get('password'));
        onSuccess();
      }
    } catch (reason) {
      error.textContent = reason.message;
      error.classList.remove('hidden');
    }
  });
}
