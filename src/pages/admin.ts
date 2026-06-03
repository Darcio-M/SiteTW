import { store, Product, Category, loginWithEmail, logoutAdmin, checkAdminSession } from '../store';

export async function renderAdmin(container: HTMLElement) {
  // Check real session via Supabase
  const isLoggedIn = await checkAdminSession();

  if (!isLoggedIn) {
    // If not logged in, show login page
    sessionStorage.removeItem('admin_logged');
    renderLogin(container);
    return;
  }
  
  sessionStorage.setItem('admin_logged', 'true');

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
        <form id="loginForm" class="mt-8 space-y-6">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email-address" class="sr-only">Email</label>
              <input id="email-address" name="email" type="email" autocomplete="email" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-sleek-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sleek-accent focus:border-sleek-accent focus:z-10 sm:text-sm" placeholder="Email">
            </div>
            <div>
              <label for="password" class="sr-only">Senha</label>
              <input id="password" name="password" type="password" autocomplete="current-password" required class="appearance-none rounded-xl relative block w-full px-4 py-3 border border-sleek-border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-sleek-accent focus:border-sleek-accent focus:z-10 sm:text-sm" placeholder="Senha">
            </div>
          </div>

          <div>
            <button type="submit" id="loginBtn" class="group relative flex w-full justify-center rounded-xl border border-transparent gold-gradient py-3 px-4 text-sm font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-sleek-accent focus:ring-offset-2 transition-opacity">
              Entrar
            </button>
          </div>
          <p id="loginError" class="text-red-500 text-sm font-sans text-center hidden mt-4">Acesso negado.</p>
        </form>
      </div>
    </div>
  `;

  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('loginBtn') as HTMLButtonElement;
    const errorEl = document.getElementById('loginError');
    if (errorEl) errorEl.classList.add('hidden');
    
    if (btn) btn.disabled = true;
    if (btn) btn.innerHTML = 'Entrando...';
    
    const email = (document.getElementById('email-address') as HTMLInputElement).value;
    const password = (document.getElementById('password') as HTMLInputElement).value;
    
    const result = await loginWithEmail(email, password);
    
    if (result.success) {
      sessionStorage.setItem('admin_logged', 'true');
      renderAdmin(document.getElementById('app-content')!);
    } else {
      if (btn) btn.disabled = false;
      if (btn) btn.innerHTML = 'Entrar';
      if (errorEl) {
        errorEl.innerHTML = (result.error || 'Acesso negado: ocorreu um erro inesperado.').replace(/\n/g, '<br/>');
        errorEl.classList.remove('hidden');
      }
    }
  });
}

async function renderDashboard(container: HTMLElement) {
  const products = await store.getProducts();
  const categories = await store.getCategories();

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
                    <td class="py-3 px-4 text-gray-500">R$ ${(p.price || 0).toFixed(2)}</td>
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
