create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  price numeric not null default 0,
  stock integer not null default 0,
  category text not null default 'General',
  created_at timestamptz default now()
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id) on delete restrict,
  product_id uuid not null references products(id) on delete restrict,
  amount numeric not null default 0,
  status text not null default 'pending',
  created_at timestamptz default now()
);
