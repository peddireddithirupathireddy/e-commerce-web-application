E-Commerce Web Application

Project Description

A basic full-stack E-Commerce Web Application that allows users to browse products, add products to a shopping cart, checkout, and track orders.

The application also provides an Admin Dashboard for product management and order-status management.

Technologies Used

- HTML
- CSS
- JavaScript
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- bcryptjs

Main Features

User Features

- User registration
- User login
- Product catalog
- Add products to cart
- Increase/decrease quantity
- Checkout
- Shipping address
- View previous orders
- Track order status

Admin Features

- Admin login
- Add products
- Delete products
- View all products
- View all orders
- Update order status

Folder Structure

ecommerce-web-app/
│
├── middleware/
│   └── auth.js
│
├── models/
│   ├── Order.js
│   ├── Product.js
│   └── User.js
│
├── routes/
│   ├── auth.js
│   ├── orders.js
│   └── products.js
│
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── seed.js
└── server.js

.
