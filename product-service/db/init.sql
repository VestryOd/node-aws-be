CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  description text NULL,
  price numeric NULL,
  picture varchar(255) DEFAULT '/assets/pictures/9780143110439.jpg'
);

CREATE TABLE public.stocks(
  id uuid DEFAULT uuid_generate_v4(),
  count int NOT NULL,
  products_id uuid,
  foreign key (products_id) references "products" ("id")
);

insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'Where the Crawdads Sing', 'Literary, Coming of Age, Women', 23.92, '/assets/pictures/9780735219090.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'Criss Cross', 'Thrillers - Crime, Mystery & Detective - Police Procedural', 26.68, '/assets/pictures/9780316526883.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'The Institute', 'Thrillers - Suspense, Thrillers - Supernatural', 27.6, '/assets/pictures/9781982110567.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'A Minute to Midnight', 'Thrillers - Suspense, Action & Adventure', 29.90, '/assets/pictures/9781538761601.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'The Overstory', 'Literary', 17.43, '/assets/pictures/9780393356687.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'Before We Were Yours', 'Historical - General, General', 15.64, '/assets/pictures/9780425284704.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'Little Fires Everywhere', 'Literary, Asian American, Family Life - General', 15.64, '/assets/pictures/9780735224315.jpg');
insert into products (id, title, description, price, picture) values (uuid_generate_v4(), 'A Gentleman in Moscow', 'Historical - General, Literary, Political', 17.50, '/assets/pictures/9780143110439.jpg');

insert into stocks (products_id, count) select id, trunc(random()*20) from products;

commit;