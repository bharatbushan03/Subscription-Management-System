/**
 * Master Application Shell Layout
 */

import { Sidebar } from './Sidebar.js';
import { Header } from './Header.js';
import { CommandPalette } from '../common/CommandPalette.js';
import { store } from '../../store/index.js';

export function AppLayout({ contentHtml = '' }) {
  const state = store.getState();

  return `
    <div class="min-h-screen bg-background font-body-md text-on-surface antialiased flex flex-col">
      ${Sidebar({
        currentRoute: state.currentRoute,
        isCollapsed: state.isSidebarCollapsed
      })}

      <div class="${state.isSidebarCollapsed ? 'pl-16' : 'pl-64'} transition-all duration-300 flex-1 flex flex-col">
        ${Header({
          breadcrumbs: state.breadcrumbs,
          user: state.user,
          notificationCount: state.notifications.length,
          isCollapsed: state.isSidebarCollapsed
        })}

        <main id="page-content" class="relative pt-16 bg-background w-full px-6 py-6 min-h-screen animate-fade-in">
          ${contentHtml}
        </main>
      </div>

      ${CommandPalette({
        isOpen: state.isCommandPaletteOpen
      })}
    </div>
  `;
}

