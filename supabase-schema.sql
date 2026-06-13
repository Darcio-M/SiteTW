-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Admins Table
create table public.admins (
  email text primary key
);

-- Products Table
create table public.products (
  id text primary key,
  name text not null,
  description text,
  price numeric not null,
  "minQuantity" integer default 1,
  "wholesalePrice" numeric,
  "wholesaleMinQuantity" integer default 1,
  category text,
  weight numeric,
  "imageUrl" text,
  "imageUrls" text[],
  featured boolean default false,
  "bestSeller" boolean default false,
  "createdAt" bigint not null,
  sizes jsonb,
  "orderIndex" bigint
);

-- Categories Table
create table public.categories (
  id text primary key,
  name text not null
);

-- Orders Table
create table public.orders (
  id text primary key,
  "productId" text not null,
  "productName" text not null,
  quantity integer not null,
  cep text,
  contact text,
  "totalWeight" numeric,
  "totalValue" numeric,
  status text not null,
  "shippingCost" numeric,
  "createdAt" bigint not null
);

-- Set up Row Level Security (RLS)

-- Admins
alter table public.admins enable row level security;
create policy "Admins can view admins" on public.admins for select using (true);
create policy "Admins can insert admins" on public.admins for insert with check (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can delete admins" on public.admins for delete using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));

-- Products
alter table public.products enable row level security;
create policy "Public can view products" on public.products for select using (true);
create policy "Admins can insert products" on public.products for insert with check (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can update products" on public.products for update using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can delete products" on public.products for delete using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));

-- Categories
alter table public.categories enable row level security;
create policy "Public can view categories" on public.categories for select using (true);
create policy "Admins can insert categories" on public.categories for insert with check (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can update categories" on public.categories for update using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can delete categories" on public.categories for delete using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));

-- Orders
alter table public.orders enable row level security;
create policy "Public can insert orders" on public.orders for insert with check (true);
create policy "Admins can view orders" on public.orders for select using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));
create policy "Admins can update orders" on public.orders for update using (auth.email() = 'darciodfx@gmail.com' or exists (select 1 from public.admins where email = auth.email()));

