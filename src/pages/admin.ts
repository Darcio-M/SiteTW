import { store, Product, Category, loginWithGoogle, logoutAdmin } from '../store';

export async function renderAdmin(container: HTMLElement) {
  // Simple auth state for demo
  const isLoggedIn = sessionStorage.getItem('admin_logged') === 'true';

  if (!isLoggedIn) {
    renderLogin(container);
    return;
  }

  renderDashboard(container);
}

function renderLogin(container: HTMLElement) {
  container.innerHTML = `
    <div class="min-h-screen flex items-center justify-center bg-sleek-bg py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl soft-shadow border border-sleek-border">
        <div>
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-sleek-surface">
            <i data-lucide="lock" class="h-6 w-6 text-sleek-accent"></i>
          </div>
          <h2 class="mt-6 text-center text-3xl font-serif text-sleek-text">
            Área Restrita
          </h2>
          <p class="mt-2 text-center text-sm font-sans text-sleek-text-light">
            Apenas para administração do site.
          </p>
        </div>
        <div class="mt-8">
          <button id="googleLoginBtn" class="group relative flex w-full justify-center rounded-xl border border-transparent gold-gradient py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sleek-accent focus:ring-offset-2 transition-opacity">
            <svg class="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
            </svg>
            Entrar com o Google
          </button>
          <p id="loginError" class="text-red-500 text-sm font-sans text-center hidden mt-4">Acesso negado: Conta Google não autorizada.</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById('googleLoginBtn')?.addEventListener('click', async () => {
    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.classList.add('hidden');
    
    const success = await loginWithGoogle();
    
    if (success) {
      sessionStorage.setItem('admin_logged', 'true');
      renderAdmin(document.getElementById('app-content')!);
    } else {
      if (errorEl) errorEl.classList.remove('hidden');
    }
  });
}

async function renderDashboard(container: HTMLElement) {
  const products = await store.getProducts();
  const categories = await store.getCategories();
  let orders = await store.getOrders();
  
  // Sort orders by most recent first
  orders.sort((a, b) => b.createdAt - a.createdAt);

  let html = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div class="flex justify-between items-center mb-10">
        <h1 class="text-3xl font-serif text-sleek-text">Painel Administrativo</h1>
        <button id="logoutBtn" class="text-sm font-sans text-sleek-text-light hover:text-sleek-accent transition-colors">Sair</button>
      </div>

      <div class="bg-white rounded-3xl soft-shadow border border-sleek-border overflow-hidden">
        <div class="border-b border-sleek-border bg-sleek-surface p-6 flex justify-between items-center">
          <h2 class="text-xl font-serif text-sleek-text">Gerenciar Produtos</h2>
          <button id="addBtn" class="gold-gradient text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity">Adicionar Produto</button>
        </div>
        
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Imagem</th>
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Nome</th>
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Preço</th>
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Destaque</th>
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${products.map(p => `
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td class="py-3 px-4"><img src="${p.imageUrl}" class="w-12 h-12 object-cover rounded shadow-sm"></td>
                    <td class="py-3 px-4 font-medium text-gray-900">${p.name}</td>
                    <td class="py-3 px-4 text-gray-500">R$ ${p.price.toFixed(2)}</td>
                    <td class="py-3 px-4">
                      ${p.featured ? '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">Bela Cura</span>' : ''}
                      ${p.bestSeller ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium mt-1 inline-block">Best Seller</span>' : ''}
                    </td>
                    <td class="py-3 px-4">
                       <button class="text-blue-500 hover:underline mr-3 text-sm edit-btn" data-id="${p.id}">Editar</button>
                       <button class="text-red-500 hover:underline text-sm delete-btn" data-id="${p.id}">Excluir</button>
                    </td>
                  </tr>
                `).join('')}
                ${products.length === 0 ? '<tr><td colspan="5" class="py-10 text-center text-gray-400">Nenhum produto cadastrado.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Categories Section -->
      <div class="bg-white rounded-3xl soft-shadow border border-sleek-border overflow-hidden mt-12">
        <div class="border-b border-sleek-border bg-sleek-surface p-6 flex justify-between items-center">
          <h2 class="text-xl font-serif text-sleek-text">Gerenciar Categorias</h2>
        </div>
        
        <div class="p-6">
          <form id="addCategoryForm" class="flex gap-4 mb-8">
            <input type="text" id="newCategoryName" required placeholder="Nova categoria..." class="flex-grow border border-sleek-border rounded-full px-4 py-2 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors font-sans outline-none">
            <button type="submit" class="gold-gradient text-white px-6 py-2 rounded-full text-[10px] uppercase tracking-widest font-bold hover:opacity-90 transition-opacity soft-shadow">Adicionar</button>
          </form>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase font-sans tracking-wider">Nome da Categoria</th>
                  <th class="py-3 px-4 text-sm font-semibold text-gray-600 uppercase font-sans tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                ${categories.map(c => `
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors font-sans">
                    <td class="py-3 px-4 font-medium text-sleek-text">${c.name}</td>
                    <td class="py-3 px-4 text-right">
                       <button class="text-red-500 hover:underline text-sm delete-cat-btn" data-id="${c.id}">Excluir</button>
                    </td>
                  </tr>
                `).join('')}
                ${categories.length === 0 ? '<tr><td colspan="2" class="py-10 text-center text-gray-400 font-sans">Nenhuma categoria cadastrada.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Orders Section -->
      <div class="bg-white rounded-3xl soft-shadow border border-sleek-border overflow-hidden mt-12 mb-12">
        <div class="border-b border-sleek-border bg-sleek-surface p-6 flex justify-between items-center">
          <h2 class="text-xl font-serif text-sleek-text">Gerenciar Pedidos</h2>
          <button id="exportOrdersBtn" class="group relative flex justify-center rounded-full border border-sleek-border bg-white py-2 px-4 text-xs font-bold uppercase tracking-widest text-sleek-text hover:bg-gray-50 focus:outline-none transition-colors">
            Exportar XLS/CSV
          </button>
        </div>
        
        <div class="p-6">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr class="border-b border-gray-200">
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans">ID / Data</th>
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans">Cliente</th>
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans">Produto</th>
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans">Valor/Peso</th>
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans">Status</th>
                  <th class="py-3 px-4 text-xs font-semibold text-gray-600 uppercase font-sans text-right">Ação</th>
                </tr>
              </thead>
              <tbody>
                ${orders.map(o => `
                  <tr class="border-b border-gray-100 hover:bg-gray-50 transition-colors font-sans text-sm">
                    <td class="py-3 px-4">
                       <span class="font-medium text-sleek-text block">${o.id}</span>
                       <span class="text-xs text-gray-500">${new Date(o.createdAt).toLocaleString('pt-BR')}</span>
                    </td>
                    <td class="py-3 px-4">
                       <div class="font-medium text-sleek-text">CEP: ${o.cep}</div>
                       <div class="text-xs text-gray-500 max-w-[120px] truncate" title="${o.contact}">${o.contact}</div>
                    </td>
                    <td class="py-3 px-4">
                       <div class="font-medium text-sleek-text max-w-[150px] truncate" title="${o.productName}">${o.productName}</div>
                       <div class="text-xs text-gray-500">${o.quantity} unidades</div>
                    </td>
                    <td class="py-3 px-4">
                       <div class="font-medium text-sleek-text">R$ ${o.totalValue.toFixed(2)}</div>
                       <div class="text-xs text-gray-500">${o.totalWeight > 0 ? o.totalWeight + 'g' : '-'}</div>
                       ${o.shippingCost !== undefined ? `<div class="text-xs font-bold text-sleek-accent">Frete: R$ ${o.shippingCost.toFixed(2)}</div>` : ''}
                    </td>
                    <td class="py-3 px-4">
                       ${o.status === 'PENDING' ? '<span class="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full font-medium">Aguardando</span>' : ''}
                       ${o.status === 'PROCESSING' ? '<span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">Processando</span>' : ''}
                       ${o.status === 'PROCESSED' ? '<span class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium">Processado</span>' : ''}
                    </td>
                    <td class="py-3 px-4 text-right align-middle">
                       ${o.status === 'PENDING' ? `<button class="text-[10px] font-bold uppercase tracking-wider text-blue-600 border border-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white transition-colors process-order-btn block ml-auto" data-id="${o.id}">Iniciar</button>` : ''}
                       ${o.status === 'PROCESSING' ? `<button class="text-[10px] font-bold uppercase tracking-wider text-green-600 border border-green-600 px-3 py-1.5 rounded-full hover:bg-green-600 hover:text-white transition-colors finish-order-btn block ml-auto" data-id="${o.id}">Finalizar</button>` : ''}
                       ${o.status === 'PROCESSED' ? `<button class="text-[10px] font-bold uppercase tracking-wider text-white bg-[#25D366] px-3 py-1.5 rounded-full hover:bg-[#1ebe5d] transition-colors contact-client-btn block ml-auto" data-id="${o.id}">Contatar Cliente</button>` : ''}
                    </td>
                  </tr>
                `).join('')}
                ${orders.length === 0 ? '<tr><td colspan="6" class="py-10 text-center text-gray-400 font-sans">Nenhum pedido registrado.</td></tr>' : ''}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    <div id="productModal" class="fixed inset-0 bg-sleek-text/50 z-[100] hidden flex items-center justify-center p-4 backdrop-blur-sm">
      <div class="bg-white rounded-3xl soft-shadow max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-sleek-border">
        <div class="p-6 border-b border-sleek-border flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur z-10">
          <h3 class="text-xl font-serif text-sleek-text" id="modalTitle">Adicionar Produto</h3>
          <button id="closeModal" class="p-2 text-sleek-text-light hover:text-sleek-accent"><i data-lucide="x"></i></button>
        </div>
        <form id="productForm" class="p-6 space-y-6">
          <input type="hidden" id="p_id">
          <input type="hidden" id="p_existing_image">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-sleek-text mb-1">Nome do Produto</label>
                <input type="text" id="p_name" required class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
              </div>
              
              <div>
                <label class="block text-sm font-medium text-sleek-text mb-1">Categoria</label>
                <select id="p_category" required class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors bg-white">
                  ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
                </select>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-sleek-text-light uppercase tracking-wider mb-1">Preço Base (R$)</label>
                  <input type="number" step="0.01" id="p_price" required class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-sleek-text-light uppercase tracking-wider mb-1">Qtde Mínima Base</label>
                  <input type="number" id="p_minQuantity" required value="1" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-[10px] font-bold text-sleek-text-light uppercase tracking-wider mb-1">Preço Atacado (R$)</label>
                  <input type="number" step="0.01" id="p_wholesalePrice" required class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
                </div>
                <div>
                  <label class="block text-[10px] font-bold text-sleek-text-light uppercase tracking-wider mb-1">Qtde Mínima Atacado</label>
                  <input type="number" id="p_wholesaleMinQuantity" required value="10" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
                </div>
              </div>

              <div>
                <label class="block text-[10px] font-bold text-sleek-text-light uppercase tracking-wider mb-1">Peso Total por Unidade (gramas)</label>
                <input type="number" id="p_weight" required value="0" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors">
                <p class="text-xs text-sleek-text-light mt-1 font-light opacity-60">Ex: 50 para 50g, 1000 para 1kg. Não é exibido ao cliente.</p>
              </div>

              <div class="flex gap-4 pt-2">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="p_featured" class="rounded text-sleek-accent focus:ring-sleek-accent border-sleek-border">
                  <span class="text-sm font-medium text-sleek-text-light">Destaque</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" id="p_bestseller" class="rounded text-sleek-accent focus:ring-sleek-accent border-sleek-border">
                  <span class="text-sm font-medium text-sleek-text-light">Mais Vendido</span>
                </label>
              </div>
            </div>

            <div class="space-y-4 font-sans">
              <div>
                <label class="block text-sm font-medium text-sleek-text mb-1">Imagens do Produto (Múltiplas)</label>
                <input type="file" id="p_image" multiple accept="image/*" class="w-full text-sm text-sleek-text-light file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-sleek-surface file:text-sleek-accent hover:file:opacity-80 transition-opacity">
                <p class="text-xs text-sleek-text-light mt-2 opacity-60">Selecione uma ou mais imagens JPG/PNG.</p>
                <!-- Container for existing image urls to keep state hidden -->
                <input type="hidden" id="p_existing_image_urls">
                <div id="p_image_preview_container" class="mt-4 grid grid-cols-3 gap-2 empty:hidden hidden">
                   <!-- Previews will go here -->
                </div>
              </div>
            </div>
          </div>

          <div class="font-sans">
            <label class="block text-sm font-medium text-sleek-text mb-1">Descrição</label>
            <textarea id="p_desc" required rows="4" class="w-full border border-sleek-border rounded-xl p-3 text-sm focus:ring-sleek-accent focus:border-sleek-accent transition-colors"></textarea>
          </div>

          <div class="pt-6 border-t border-sleek-border flex justify-end gap-4">
            <button type="button" id="cancelProductBtn" class="bg-white border border-sleek-border text-sleek-text px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest hover:bg-gray-50 transition-colors">Voltar</button>
            <button type="submit" class="gold-gradient text-white px-8 py-3 rounded-full text-[10px] uppercase font-bold tracking-widest soft-shadow hover:opacity-90 transition-opacity">Salvar Produto</button>
          </div>
        </form>
      </div>
    </div>
  `;

  container.innerHTML = html;

  // Logout
  document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    await logoutAdmin();
    sessionStorage.removeItem('admin_logged');
    renderAdmin(container);
  });

  // Modal Logic
  const modal = document.getElementById('productModal')!;
  const form = document.getElementById('productForm') as HTMLFormElement;
  const imgPreviewContainer = document.getElementById('p_image_preview_container') as HTMLDivElement;
  const fileInput = document.getElementById('p_image') as HTMLInputElement;

  let uploadedBase64Images: string[] = [];

  function renderPreviews(urls: string[]) {
    if (urls.length === 0) {
      imgPreviewContainer.classList.add('hidden');
      imgPreviewContainer.innerHTML = '';
      return;
    }
    imgPreviewContainer.classList.remove('hidden');
    imgPreviewContainer.innerHTML = urls.map(url => `<img src="${url}" class="w-full h-24 object-cover rounded-xl shadow-sm border border-sleek-border">`).join('');
  }

  document.getElementById('addBtn')?.addEventListener('click', () => {
    form.reset();
    document.getElementById('p_id')!.setAttribute('value', '');
    document.getElementById('p_existing_image')!.setAttribute('value', '');
    document.getElementById('p_existing_image_urls')!.setAttribute('value', '[]');
    uploadedBase64Images = [];
    renderPreviews([]);
    document.getElementById('modalTitle')!.innerText = 'Adicionar Produto';
    modal.classList.remove('hidden');
  });

  document.getElementById('closeModal')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  document.getElementById('cancelProductBtn')?.addEventListener('click', () => {
    modal.classList.add('hidden');
  });

  // Handle Categories
  document.getElementById('addCategoryForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nameInput = document.getElementById('newCategoryName') as HTMLInputElement;
    const name = nameInput.value.trim();
    if (name) {
      await store.saveCategory({ id: Date.now().toString(), name });
      renderDashboard(container);
    }
  });

  document.querySelectorAll('.delete-cat-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      await store.deleteCategory(id);
      renderDashboard(container);
    });
  });

  // Handle Edit
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const p = products.find(prod => prod.id === id);
      if (!p) return;
      
      (document.getElementById('p_id') as HTMLInputElement).value = p.id;
      (document.getElementById('p_name') as HTMLInputElement).value = p.name;
      (document.getElementById('p_price') as HTMLInputElement).value = p.price.toString();
      (document.getElementById('p_minQuantity') as HTMLInputElement).value = (p.minQuantity || 1).toString();
      (document.getElementById('p_wholesalePrice') as HTMLInputElement).value = (p.wholesalePrice || p.price).toString();
      (document.getElementById('p_wholesaleMinQuantity') as HTMLInputElement).value = (p.wholesaleMinQuantity || 10).toString();
      (document.getElementById('p_weight') as HTMLInputElement).value = (p.weight || 0).toString();
      (document.getElementById('p_category') as HTMLSelectElement).value = p.category;
      (document.getElementById('p_featured') as HTMLInputElement).checked = p.featured;
      (document.getElementById('p_bestseller') as HTMLInputElement).checked = p.bestSeller;
      (document.getElementById('p_desc') as HTMLTextAreaElement).value = p.description;
      (document.getElementById('p_existing_image') as HTMLInputElement).value = p.imageUrl;
      
      const imagesList = p.imageUrls && p.imageUrls.length > 0 ? p.imageUrls : [p.imageUrl];
      (document.getElementById('p_existing_image_urls') as HTMLInputElement).value = JSON.stringify(imagesList);
      
      uploadedBase64Images = [];
      renderPreviews(imagesList);
      
      document.getElementById('modalTitle')!.innerText = 'Editar Produto';
      modal.classList.remove('hidden');
    });
  });

  // Handle Delete
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      await store.deleteProduct(id);
      renderDashboard(container); // re-render
    });
  });

  // Export Orders to CSV
  document.getElementById('exportOrdersBtn')?.addEventListener('click', () => {
    if (orders.length === 0) {
      alert('Não há pedidos para exportar.');
      return;
    }
    const headers = ['ID', 'Data', 'Produto', 'Cliente(Contato)', 'CEP', 'Peso(g)', 'Valor(R$)', 'Frete(R$)', 'Status'];
    const rows = orders.map(o => {
      const dataStr = new Date(o.createdAt).toLocaleString('pt-BR');
      const val = o.totalValue.toFixed(2).replace('.', ',');
      const frete = o.shippingCost !== undefined ? o.shippingCost.toFixed(2).replace('.', ',') : '0,00';
      const statusMap: Record<string, string> = { 'PENDING': 'Aguardando', 'PROCESSING': 'Processando', 'PROCESSED': 'Processado' };
      const status = statusMap[o.status] || o.status;
      // Wrap strings in quotes and use semicolon delimiter for pt-BR Excel compatibility
      return [o.id, dataStr, o.productName, o.contact, o.cep, o.totalWeight, val, frete, status].map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(';');
    });

    const csvContent = "\uFEFF" + headers.join(';') + '\n' + rows.join('\n'); // \uFEFF is BOM for UTF-8 in Excel
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pedidos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Handle Orders
  document.querySelectorAll('.process-order-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const o = orders.find(ord => ord.id === id);
      if (o) {
        o.status = 'PROCESSING';
        await store.updateOrder(o);
        renderDashboard(container);
      }
    });
  });

  document.querySelectorAll('.finish-order-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const o = orders.find(ord => ord.id === id);
      if (o) {
        const costStr = prompt('Informe o valor do frete (ex: 25.50):');
        if (costStr) {
          const cost = parseFloat(costStr.replace(',', '.'));
          if (!isNaN(cost) && cost >= 0) {
            o.shippingCost = cost;
            o.status = 'PROCESSED';
            await store.updateOrder(o);
            renderDashboard(container);
          } else {
            alert('Valor de frete inválido.');
          }
        }
      }
    });
  });

  document.querySelectorAll('.contact-client-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = (e.currentTarget as HTMLElement).dataset.id!;
      const o = orders.find(ord => ord.id === id);
      if (o) {
        const cleanPhone = o.contact.replace(/\D/g, '');
        // If BR doesn't have country code, add it
        const phone = cleanPhone.length <= 11 ? '55' + cleanPhone : cleanPhone;
        const msg = `Olá! O seu pedido *${o.productName}* (${o.quantity} un.) foi processado.\n\nO valor do seu pacote ficou em R$ ${o.totalValue.toFixed(2).replace('.', ',')}.\nO valor do frete para o CEP ${o.cep} é de R$ ${o.shippingCost?.toFixed(2).replace('.', ',')}.\n\nTotal do pedido: R$ ${(o.totalValue + (o.shippingCost || 0)).toFixed(2).replace('.', ',')}\n\nPodemos fechar o pedido?`;
        window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(msg)}`, '_blank');
      }
    });
  });

  // Handle Image Preview
  fileInput.addEventListener('change', async () => {
    const files = Array.from(fileInput.files || []);
    uploadedBase64Images = [];
    
    for (const file of files) {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      uploadedBase64Images.push(base64);
    }
    
    renderPreviews(uploadedBase64Images);
  });

  // Submit Form
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    let existingImageUrls = [];
    try {
       existingImageUrls = JSON.parse((document.getElementById('p_existing_image_urls') as HTMLInputElement).value || '[]');
    } catch(e) {}
    let imageUrl = (document.getElementById('p_existing_image') as HTMLInputElement).value;

    let finalUrls = uploadedBase64Images.length > 0 ? uploadedBase64Images : existingImageUrls;
    
    if (finalUrls.length === 0) {
      finalUrls = ['https://images.unsplash.com/photo-1543881477-834acdc48671?auto=format&fit=crop&w=400&q=80'];
    }
    
    imageUrl = finalUrls[0]; // fallback

    const newProduct: Product = {
      id: (document.getElementById('p_id') as HTMLInputElement).value || Date.now().toString(),
      name: (document.getElementById('p_name') as HTMLInputElement).value,
      price: parseFloat((document.getElementById('p_price') as HTMLInputElement).value),
      minQuantity: parseInt((document.getElementById('p_minQuantity') as HTMLInputElement).value) || 1,
      wholesalePrice: parseFloat((document.getElementById('p_wholesalePrice') as HTMLInputElement).value),
      wholesaleMinQuantity: parseInt((document.getElementById('p_wholesaleMinQuantity') as HTMLInputElement).value) || 10,
      weight: parseFloat((document.getElementById('p_weight') as HTMLInputElement).value) || 0,
      category: (document.getElementById('p_category') as HTMLSelectElement).value,
      description: (document.getElementById('p_desc') as HTMLTextAreaElement).value,
      featured: (document.getElementById('p_featured') as HTMLInputElement).checked,
      bestSeller: (document.getElementById('p_bestseller') as HTMLInputElement).checked,
      imageUrl,
      imageUrls: finalUrls,
      createdAt: Date.now()
    };

    await store.saveProduct(newProduct);
    modal.classList.add('hidden');
    renderDashboard(container);
  });
}
