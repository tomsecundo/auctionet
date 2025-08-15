Assignment: Build & Deploy a MERN Real-Time Auction with Secure Payments (CI/CD-Ready)

Description

Auctionet is a modern, easy-to-use online auction platform designed for people who want to buy and sell valuable items in a secure, exciting, and transparent way. Sellers can post items with detailed descriptions, images, and a starting price, while buyers can place bids in real time until the auction’s closing date. Just like a traditional auction, the highest bidder at the close wins the item — no fuss, no hidden tricks.

Payments are processed through a secure, integrated payment gateway supporting debit and credit cards, ensuring a smooth and safe transaction for both parties. With its sleek interface, mobile-friendly design, and reliable bidding system, Auctionet transforms the age-old thrill of auctions into a digital experience accessible anytime, anywhere. Whether it’s rare collectibles, luxury goods, or one-of-a-kind finds, Auctionet brings the excitement of winning right to your fingertips.

Objective

Deliver a production-ready MERN (MongoDB, Express, React, Node.js) application that supports listing items, real-time-style bidding logic, user authentication, and secure payment handoff, with a robust CI/CD pipeline, tests, and documentation.

Features

List Auctions (title, description, images, starting price, closing date)

Bidding with server-side validation (must exceed highest bid)

Winners determined at closing time (highest bid wins)

Secure Payments via integrated gateway (debit/credit cards)

Authentication & Authorization (JWT-based)

Responsive UI (mobile-friendly)

Clean REST API with predictable responses

Tech Stack

Frontend: React (Vite/CRA), optional Tailwind CSS

Backend: Node.js, Express

Database: MongoDB with Mongoose

Auth: JWT

Payments: Pluggable gateway (e.g., Stripe)

Testing: Mocha, Chai, Sinon

CI/CD: GitHub Actions

Runtime: Node.js ≥ 18 (CI can use Node 22)
