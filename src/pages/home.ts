import { store } from '../store';

export async function renderHome(container: HTMLElement) {
  const products = await store.getProducts();
  const categories = await store.getCategories();

  let html = `
    <!-- Hero Section -->
    <section class="relative h-[80vh] flex items-center justify-center overflow-hidden">
      <!-- Background elements from Sleek Theme -->
      <div class="absolute -top-20 -left-20 w-64 h-64 bg-[#F8E1EB] rounded-full blur-[80px] opacity-60"></div>
      <div class="absolute bottom-20 right-0 w-48 h-48 bg-[#E6E1F8] rounded-full blur-[60px] opacity-60"></div>
      
      <div class="relative z-10 text-center px-4 max-w-3xl mx-auto flex flex-col items-center">
        <span class="block text-[10px] font-semibold uppercase tracking-[0.4em] text-sleek-accent mb-4 opacity-0 animate-fade-in font-sans" style="animation-delay: 100ms; animation-fill-mode: forwards;">Ateliê de Luxo</span>
        <h1 class="text-5xl md:text-7xl leading-[1.1] text-sleek-text mb-6 font-serif opacity-0 animate-fade-in" style="animation-delay: 200ms; animation-fill-mode: forwards;">
          Exclusividade <br/>
          <span class="italic font-normal">e Emoção</span> em <br/>
          cada detalhe.
        </h1>
        <p class="text-sm text-sleek-text-light mb-8 max-w-sm mx-auto font-sans leading-relaxed opacity-0 animate-fade-in" style="animation-delay: 300ms; animation-fill-mode: forwards;">
          Presentes personalizados e peças exclusivas. A delicadeza do design contemporâneo unido à sofisticação dos seus melhores momentos.
        </p>
      </div>
    </section>

    <!-- Catálogo Integrado -->
    <section id="shop" class="py-24 bg-sleek-surface block relative overflow-hidden min-h-screen">
      <div class="absolute top-12 right-12 w-32 h-32 rounded-full border border-sleek-accent opacity-10"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div class="text-center mb-16 border-b border-sleek-border pb-8">
          <span class="block text-[10px] font-semibold uppercase tracking-[0.4em] text-sleek-accent mb-2">Coleções</span>
          <h2 class="text-4xl text-sleek-text mb-4 font-serif">Catálogo Completo</h2>
          <p class="text-sleek-text-light font-sans font-light">Encontre a peça perfeita para eternizar seu momento.</p>
        </div>

        <div class="flex flex-col md:flex-row gap-12">
          <!-- Sidebar Filters -->
          <aside class="w-full md:w-64 flex-shrink-0">
            <div class="mb-8">
              <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text mb-4">Pesquisa</h3>
              <div class="relative">
                <input type="text" id="searchInput" placeholder="Buscar produto..." class="w-full pl-10 pr-4 py-3 bg-white border border-sleek-border rounded-xl focus:outline-none focus:border-sleek-accent transition-colors font-sans text-sm soft-shadow">
                <i data-lucide="search" class="absolute left-3 top-3.5 w-4 h-4 text-sleek-text-light opacity-60"></i>
              </div>
            </div>

            <div class="mb-8">
              <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text mb-4">Categorias</h3>
              <ul class="space-y-3 font-sans text-sm" id="categoryFilter">
                <li>
                  <button data-id="all" class="text-sleek-accent font-medium hover:text-sleek-text transition-colors w-full text-left filter-btn">Todas as Categorias</button>
                </li>
                ${categories.map(c => `
                  <li>
                    <button data-id="${c.id}" class="text-sleek-text-light hover:text-sleek-accent transition-colors w-full text-left filter-btn">${c.name}</button>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div>
              <h3 class="text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text mb-4">Ordenar</h3>
              <select id="sortSelect" class="w-full p-3 bg-white border border-sleek-border rounded-xl focus:outline-none focus:border-sleek-accent transition-colors cursor-pointer font-sans text-sm soft-shadow">
                <option value="recent">Mais Recentes</option>
                <option value="price-asc">Menor Preço</option>
                <option value="price-desc">Maior Preço</option>
              </select>
            </div>
          </aside>

          <!-- Product Grid -->
          <div class="flex-grow">
            <div id="productGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              <!-- Products rendered via JS -->
            </div>
            <div id="emptyState" class="hidden text-center py-20">
              <div class="inline-flex w-16 h-16 bg-white border border-sleek-accent/20 text-sleek-accent rounded-full items-center justify-center mb-4">
                <i data-lucide="search" class="w-8 h-8"></i>
              </div>
              <h3 class="text-lg font-serif text-sleek-text mb-2">Nenhum produto encontrado</h3>
              <p class="text-sleek-text-light font-sans font-light text-sm">Tente ajustar seus filtros de busca.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;

  container.innerHTML = html;

  // Catalog Logic
  const grid = document.getElementById('productGrid')!;
  const emptyState = document.getElementById('emptyState')!;
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const filterBtns = document.querySelectorAll('.filter-btn');
  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;

  function updateGrid() {
    let filtered = [...products];
    
    // Search
    const term = searchInput.value.toLowerCase();
    if (term) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(term));
    }

    // Category
    const activeCatBtn = document.querySelector('.filter-btn.text-sleek-accent') as HTMLButtonElement;
    const catId = activeCatBtn ? activeCatBtn.dataset.id : 'all';
    if (catId && catId !== 'all') {
      filtered = filtered.filter(p => p.category === catId);
    }

    // Sort
    const sort = sortSelect.value;
    if (sort === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else {
      filtered.sort((a, b) => b.createdAt - a.createdAt);
    }

    if (filtered.length === 0) {
      grid.innerHTML = '';
      emptyState.classList.remove('hidden');
    } else {
      emptyState.classList.add('hidden');
      grid.innerHTML = filtered.map((p, i) => productCardHTML(p, i)).join('');
    }
  }

  searchInput.addEventListener('input', updateGrid);
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => {
        b.classList.remove('text-sleek-accent', 'font-medium');
        b.classList.add('text-sleek-text-light');
      });
      const target = e.currentTarget as HTMLButtonElement;
      target.classList.remove('text-sleek-text-light');
      target.classList.add('text-sleek-accent', 'font-medium');
      updateGrid();
    });
  });

  sortSelect.addEventListener('change', updateGrid);

  updateGrid();
}

export function productCardHTML(product: any, index: number = 0) {
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
  
  // Stagger animation up to 10 items
  const delay = Math.min(index * 75, 750);
  
  return `
    <a href="#product/${product.id}" class="group block opacity-0 animate-fade-in" style="animation-delay: ${delay}ms; animation-fill-mode: forwards;">
      <div class="relative overflow-hidden rounded-3xl acrylic-card soft-shadow mb-4 aspect-[4/5] p-2">
        <div class="w-full h-full bg-gradient-to-br from-[#FCE4EC] to-[#F3E5F5] rounded-2xl flex items-center justify-center overflow-hidden relative">
          <!-- RESOLUÇÃO IDEAL: 800x1000px -->
          <img src="${product.imageUrl}" alt="${product.name}" class="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 absolute inset-0 z-10">
          <span class="font-serif text-sleek-accent opacity-40 italic z-0">Personalizado</span>
        </div>
        <div class="absolute inset-0 bg-white/0 group-hover:bg-white/20 backdrop-blur-[2px] transition-all duration-300 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span class="bg-white/90 text-sleek-text text-[10px] font-bold uppercase tracking-widest px-6 py-3 rounded-full shadow-lg whitespace-nowrap">Ver Detalhes</span>
        </div>
      </div>
      <div class="px-2 text-center">
        <h3 class="text-sleek-text font-serif font-medium mb-1 group-hover:text-sleek-accent transition-colors">${product.name}</h3>
        <p class="text-sleek-text-light font-sans text-xs tracking-wide">${formattedPrice}</p>
      </div>
    </a>
  `;
}
