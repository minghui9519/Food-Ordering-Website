USE foodyhub;

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  customer_name VARCHAR(120) NOT NULL,
  delivery_address VARCHAR(500) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  status ENUM('Preparing', 'Delivered', 'Cancelled') NOT NULL DEFAULT 'Preparing',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NULL,
  product_name VARCHAR(200) NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  quantity INT NOT NULL,
  line_total DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  custom_ingredients JSON,
  removed_ingredients JSON,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
);
