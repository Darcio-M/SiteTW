import { store } from '../store';
import { createIcons } from 'lucide';

export async function renderProduct(container: HTMLElement, id: string) {
  const product = await store.getProduct(id);
  
  if (!product) {
    container.innerHTML = '<div class="text-center py-32"><h2 class="text-2xl text-gray-400">Produto não encontrado.</h2></div>';
    return;
  }

  const categories = await store.getCategories();
  const categoryName = categories.find(c => c.id === product.category)?.name || 'Outros';
  const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(product.price);
  
  const images = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls : [product.imageUrl];

  let html = `
    <div class="bg-sleek-surface min-h-screen">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <!-- Breadcrumb -->
        <nav class="flex text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text-light mb-8 items-center gap-2">
          <a href="#home" class="hover:text-sleek-accent transition-colors">Início</a>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
          <a href="#shop" class="hover:text-sleek-accent transition-colors">Catálogo</a>
          <i data-lucide="chevron-right" class="w-4 h-4"></i>
          <span class="text-sleek-text">${product.name}</span>
        </nav>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <!-- Image Gallery -->
          <div class="relative rounded-3xl overflow-hidden acrylic-card group soft-shadow p-2">
            <!-- RESOLUÇÃO IDEAL: 1000x1000px (Quadrilátero) -->
            <div class="w-full h-full rounded-2xl overflow-hidden relative min-h-[400px]">
              <img id="mainProductImage" src="${images[0]}" alt="${product.name}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-zoom-in">
              ${images.length > 1 ? `
                <button id="prevBtn" class="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full text-sleek-text hover:bg-white soft-shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  <i data-lucide="chevron-left" class="w-5 h-5"></i>
                </button>
                <button id="nextBtn" class="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 p-3 rounded-full text-sleek-text hover:bg-white soft-shadow opacity-0 group-hover:opacity-100 transition-opacity">
                  <i data-lucide="chevron-right" class="w-5 h-5"></i>
                </button>
                <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                   ${images.map((_, i) => `<div class="w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'} img-dot" data-idx="${i}"></div>`).join('')}
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Product Info -->
          <div class="flex flex-col justify-center">
            <span class="text-[10px] uppercase tracking-[0.4em] font-semibold text-sleek-text-light opacity-60 mb-4 block">${categoryName}</span>
            <h1 class="text-4xl font-serif text-sleek-text mb-4">${product.name}</h1>
            <p class="text-2xl font-sans text-sleek-accent mb-2 font-medium">${formattedPrice}</p>
            <p class="text-xs font-sans text-sleek-text-light mb-8">
               Mínimo: ${product.minQuantity || 1} un. | Atacado a partir de ${product.wholesaleMinQuantity || 10} un. (R$ ${((product.wholesalePrice || product.price || 0)).toFixed(2).replace('.',',')}/un.)
            </p>
            
            <div class="font-sans font-light text-sleek-text-light mb-6 leading-relaxed text-sm">
              <p>${product.description}</p>
            </div>

            <!-- Quantity and CEP -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text-light mb-2">Quantidade</label>
                <input type="number" id="productQuantity" min="1" value="${product.minQuantity || 1}" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors font-sans outline-none bg-white">
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text-light mb-2">Seu CEP</label>
                <input type="text" id="productCEP" placeholder="00000-000" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors font-sans outline-none bg-white" required>
              </div>
              <div>
                <label class="block text-[10px] font-bold uppercase tracking-[0.2em] text-sleek-text-light mb-2">Seu Contato</label>
                <input type="text" id="productContact" placeholder="(00) 00000-0000" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors font-sans outline-none bg-white" required>
              </div>
            </div>
            
            <div id="priceDisplay" class="mb-8 p-4 bg-white rounded-xl border border-sleek-border font-sans text-sm transition-opacity opacity-0">
               <!-- Will update dynamcally based on qty -->
            </div>

            <div class="space-y-4 pt-8 border-t border-sleek-border">
              <a href="#" id="buyBtn" target="_blank" rel="noopener noreferrer" class="gold-gradient flex items-center justify-center w-full text-white px-8 py-4 rounded-full font-sans text-[10px] uppercase font-bold tracking-widest soft-shadow hover:opacity-90 transition-opacity">
                Comprar pelo WhatsApp
              </a>
              <p id="errorMsg" class="text-red-500 text-xs font-sans text-center hidden">Preencha o Contato, CEP e a quantidade para continuar.</p>
              <p class="text-xs text-center text-sleek-text-light font-light opacity-60">Toda personalização é acertada diretamente com nossa equipe via WhatsApp.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
  // Initialize icons for the newly injected HTML
  if (typeof createIcons !== 'undefined') {
    // using lucide createIcons from global if available or try to re-init
  }

  // --- Image Carousel Logic ---
  let currentImageIdx = 0;
  const mainImage = document.getElementById('mainProductImage') as HTMLImageElement;
  const dots = document.querySelectorAll('.img-dot');
  
  function updateImage(idx: number) {
    if (images.length === 0) return;
    currentImageIdx = (idx + images.length) % images.length;
    mainImage.src = images[currentImageIdx];
    dots.forEach((d, i) => {
      d.className = `w-2 h-2 rounded-full img-dot ${i === currentImageIdx ? 'bg-white' : 'bg-white/50'}`;
    });
  }

  document.getElementById('prevBtn')?.addEventListener('click', () => updateImage(currentImageIdx - 1));
  document.getElementById('nextBtn')?.addEventListener('click', () => updateImage(currentImageIdx + 1));
  dots.forEach(d => {
    d.addEventListener('click', (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.idx || '0');
      updateImage(idx);
    });
  });

  // --- Dynamic Pricing and WhatsApp logic ---
  const quantityInput = document.getElementById('productQuantity') as HTMLInputElement;
  const cepInput = document.getElementById('productCEP') as HTMLInputElement;
  const contactInput = document.getElementById('productContact') as HTMLInputElement;
  const buyBtn = document.getElementById('buyBtn') as HTMLAnchorElement;
  const priceDisplay = document.getElementById('priceDisplay') as HTMLDivElement;
  const errorMsg = document.getElementById('errorMsg') as HTMLParagraphElement;
  const phoneNumber = "5588992544294"; 

  function updatePriceAndLink() {
     const qty = parseInt(quantityInput.value) || 0;
     const cep = cepInput.value.trim();
     const contact = contactInput.value.trim();
     const minQ = product.minQuantity || 1;
     const wholesaleMinQ = product.wholesaleMinQuantity || 10;
     
     if (qty > 0) {
       priceDisplay.classList.remove('opacity-0');
     } else {
       priceDisplay.classList.add('opacity-0');
     }

     let currentPrice = product.price;
     let labelText = '';

     if (qty < minQ) {
       labelText = 'Tratar com o vendedor:';
     } else if (qty >= wholesaleMinQ) {
       currentPrice = product.wholesalePrice || product.price || 0;
       labelText = 'Valor (Atacado):';
     } else {
       currentPrice = product.price || 0;
       labelText = 'Valor:';
     }

     priceDisplay.innerHTML = `
       <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
         <div class="mb-2 sm:mb-0">
           <span class="text-sleek-text-light font-medium block sm:inline">${labelText} </span> 
           <span class="text-lg font-bold text-sleek-text">R$ ${(currentPrice || 0).toFixed(2).replace('.',',')} <span class="text-xs font-light">/ un.</span></span>
         </div>
         <div class="sm:ml-4 sm:pl-4 border-t sm:border-t-0 sm:border-l border-sleek-border pt-2 sm:pt-0 mt-2 sm:mt-0">
           <span class="text-sleek-accent font-bold">Total: R$ ${((currentPrice || 0) * qty).toFixed(2).replace('.',',')}</span>
         </div>
       </div>
     `;
     
     const currentUrl = window.location.href;
     const totalWeight = (product.weight || 0) * qty;
     const totalWeightStr = totalWeight > 0 ? `\nPeso Total: ${totalWeight}g` : '';
     
     const message = `Olá! Tenho interesse no produto *${product.name}*.\nLink: ${currentUrl}\nQuantidade: ${qty}${totalWeightStr}\nCEP: ${cep || 'Não informado'}\nContato Cliente: ${contact || 'Não informado'}\nPor favor, gostaria de consultar o frete e fechar o pedido.`;
     buyBtn.href = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;
    
     buyBtn.onclick = (e) => {
       if (qty <= 0 || !cep || !contact) {
         e.preventDefault();
         errorMsg.textContent = 'Preencha o Contato, CEP e a quantidade (mínima de 1) para continuar.';
         errorMsg.classList.remove('hidden');
       } else {
         errorMsg.classList.add('hidden');
       }
     };
  }

  quantityInput?.addEventListener('input', updatePriceAndLink);
  cepInput?.addEventListener('input', updatePriceAndLink);
  contactInput?.addEventListener('input', updatePriceAndLink);
  updatePriceAndLink(); 
}
