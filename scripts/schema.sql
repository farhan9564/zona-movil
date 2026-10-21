CREATE TABLE IF NOT EXISTS categories(id text PRIMARY KEY,name text NOT NULL);
CREATE TABLE IF NOT EXISTS products(id text PRIMARY KEY,name text NOT NULL,category text REFERENCES categories(id),price integer NOT NULL CHECK(price>0),condition text NOT NULL,description text NOT NULL DEFAULT '',image text NOT NULL DEFAULT '',active boolean NOT NULL DEFAULT false,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS reviews(id text PRIMARY KEY,name text NOT NULL,rating integer NOT NULL CHECK(rating BETWEEN 1 AND 5),text text NOT NULL,published boolean NOT NULL DEFAULT false,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS settings(id text PRIMARY KEY,value text NOT NULL);
CREATE TABLE IF NOT EXISTS orders(id text PRIMARY KEY,token_hash text NOT NULL,customer jsonb NOT NULL,items jsonb NOT NULL,total integer NOT NULL,status text NOT NULL DEFAULT 'PENDING',paypal_id text UNIQUE,paypal_mode text NOT NULL DEFAULT 'sandbox',fulfilled boolean NOT NULL DEFAULT false,created_at timestamptz DEFAULT now());
CREATE TABLE IF NOT EXISTS login_attempts(ip text PRIMARY KEY,count integer NOT NULL DEFAULT 0,window_start timestamptz NOT NULL DEFAULT now());
INSERT INTO categories(id,name) VALUES ('moviles','Móviles'),('accesorios','Accesorios'),('tarjetas-sim','Tarjetas SIM') ON CONFLICT DO NOTHING;
