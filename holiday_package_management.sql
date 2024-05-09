-- Create a database for the project
CREATE DATABASE holiday_package_management;

-- Use the created database
USE holiday_package_management;

-- Create a table for users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT 0
);

-- Create a table for holiday packages
CREATE TABLE holiday_packages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    holiday_name VARCHAR(255) UNIQUE NOT NULL,
    duration INT NOT NULL,
    destination VARCHAR(255) NOT NULL
);

-- Create a table for user bookings
CREATE TABLE user_bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    package_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (package_id) REFERENCES holiday_packages(id)
);