import { createIcons, icons } from 'lucide';
import { renderHome } from './pages/home';
import { renderProduct } from './pages/product';
import { renderAdmin } from './pages/admin';

// Initialize Layout and Router
export function initApp() {
  const root = document.querySelector<HTMLDivElement>('#root');
  if (!root) return;

  root.innerHTML = `
    <div class="min-h-screen flex flex-col font-sans text-sleek-text bg-sleek-bg transition-colors duration-300">
      <header class="acrylic-card sticky top-0 z-50 border-b border-sleek-border">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-20">
            <a href="#home" class="flex items-center group">
              <span class="font-serif text-2xl font-semibold tracking-tight text-sleek-text">TW<span class="text-sleek-accent">Acrilicos</span></span>
            </a>
            
            <nav class="hidden md:flex space-x-10">
              <a href="#home" class="text-xs uppercase tracking-[0.2em] font-medium opacity-80 hover:text-sleek-accent transition-colors">Início</a>
              <a href="#shop" class="text-xs uppercase tracking-[0.2em] font-medium opacity-80 hover:text-sleek-accent transition-colors">Catálogo</a>
            </nav>

            <div class="flex items-center space-x-6">
              <a href="https://api.whatsapp.com/send?phone=5588992544294" target="_blank" rel="noopener noreferrer" class="hidden md:flex items-center gap-2 border border-sleek-border hover:border-green-500 hover:text-green-600 px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold transition-colors">
                <i data-lucide="message-circle" class="w-4 h-4"></i> Fale Conosco
              </a>
              <button id="mobile-menu-btn" class="md:hidden opacity-60 hover:opacity-100"><i data-lucide="menu" class="w-6 h-6"></i></button>
            </div>
          </div>
        </div>
        
        <!-- Mobile menu -->
        <div id="mobile-menu" class="hidden md:hidden border-t border-sleek-border bg-white absolute w-full left-0 drop-shadow-md">
          <div class="px-4 pt-2 pb-6 space-y-2">
            <a href="#home" class="mobile-link block px-3 py-3 text-sm uppercase tracking-[0.2em] font-medium hover:text-sleek-accent hover:bg-sleek-surface rounded-md transition-colors">Início</a>
            <a href="#shop" class="mobile-link block px-3 py-3 text-sm uppercase tracking-[0.2em] font-medium hover:text-sleek-accent hover:bg-sleek-surface rounded-md transition-colors">Catálogo</a>
            <a href="https://api.whatsapp.com/send?phone=5588992544294" target="_blank" rel="noopener noreferrer" class="mobile-link flex items-center gap-2 px-3 py-3 text-sm uppercase tracking-[0.2em] font-medium text-green-600 hover:bg-green-50 rounded-md transition-colors"><i data-lucide="message-circle" class="w-4 h-4"></i> Fale Conosco</a>
          </div>
        </div>
      </header>

      <main id="app-content" class="flex-grow">
        <!-- Content injected here via Router -->
      </main>

      <footer class="bg-sleek-bg border-t border-sleek-border pt-16 pb-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <span class="font-serif text-2xl font-semibold tracking-tight text-sleek-text block mb-6">TW<span class="text-sleek-accent">Acrilicos</span></span>
            <p class="text-sleek-text-light text-sm leading-relaxed mb-6 max-w-sm">Presentes exclusivos e personalizados. A delicadeza do design contemporâneo unida à sofisticação dos seus melhores momentos.</p>
            <div class="flex gap-4">
              <a href="https://www.instagram.com/twacrilicos/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-sleek-surface flex items-center justify-center text-sleek-accent hover:bg-sleek-accent hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="https://www.instagram.com/dm3.studio/" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-sleek-surface flex items-center justify-center text-sleek-accent hover:bg-sleek-accent hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-sleek-text mb-6">Navegação</h4>
            <ul class="space-y-4 text-sm font-light">
               <li><a href="#home" class="text-sleek-text-light hover:text-sleek-accent transition-colors">Página Inicial</a></li>
              <li><a href="#shop" class="text-sleek-text-light hover:text-sleek-accent transition-colors">Todos os Produtos</a></li>
            </ul>
          </div>
          <div>
            <h4 class="text-[10px] uppercase tracking-[0.2em] font-bold text-sleek-text mb-6">Contato</h4>
            <ul class="space-y-4 text-sm font-light text-sleek-text-light">
              <li>(88) 9 9242-9454</li>
              <li>Atendimento Seg-Sab, 9h às 18h</li>
              <li><a href="#admin" class="hover:text-sleek-accent transition-colors">Administração</a></li>
            </ul>
          </div>
        </div>
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-8 border-t border-sleek-border text-center text-sleek-text-light text-xs font-light">
          &copy; ${new Date().getFullYear()} TWAcrilicos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  `;

  window.addEventListener('hashchange', handleRoute);
  handleRoute();

  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

let currentView = '';

async function handleRoute() {
  const content = document.getElementById('app-content');
  if (!content) return;
  
  let hash = window.location.hash.slice(1);
  if (!hash && window.location.pathname !== '/') {
    hash = window.location.pathname.slice(1);
  }
  if (hash.startsWith('/')) hash = hash.slice(1);
  hash = hash.split('?')[0]; // Remove any query parameters that might be appended
  hash = hash || 'home';
  const parts = hash.split('/');
  const view = parts[0];
  const id = parts[1];

  // If we are just scrolling between home and shop sections, don't re-render everything
  const isHomeOrShop = (v: string) => v === 'home' || v === 'shop';
  
  if (isHomeOrShop(view) && isHomeOrShop(currentView)) {
    if (view === 'shop') {
      const el = document.getElementById('shop');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    currentView = view;
    return; // Don't re-render
  }

  // Fade out effect
  content.style.opacity = '0';
  content.style.transition = 'opacity 0.3s ease-out';
  
  // Wait for fade out
  await new Promise(resolve => setTimeout(resolve, 300));
  
  window.scrollTo(0, 0);

  if (view === 'home' || view === 'shop') {
    await renderHome(content);
    if (view === 'shop') {
      setTimeout(() => {
        const el = document.getElementById('shop');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  } else if (view === 'product' && id) {
    await renderProduct(content, id);
  } else if (view === 'admin') {
    await renderAdmin(content);
  } else {
    content.innerHTML = '<div class="p-20 text-center"><h2 class="text-2xl text-gray-500">Página não encontrada</h2></div>';
  }

  currentView = view;

  // Refresh lucide icons
  createIcons({
    icons
  });
  
  // Fade in effect
  content.style.opacity = '1';
}
