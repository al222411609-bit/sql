CREATE DATABASE IF NOT EXISTS inventario_computo
  CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;

USE inventario_computo;

CREATE TABLE IF NOT EXISTS equipos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0
);