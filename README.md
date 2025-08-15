**Assignment: Build & Deploy a MERN Real-Time Auction with Secure Payments (CI/CD-Ready)**

---

**Description**

Auctionet is a modern, easy-to-use online auction platform designed for people who want to buy and sell valuable items in a secure, exciting, and transparent way. Sellers can post items with detailed descriptions, images, and a starting price, while buyers can place bids in real time until the auction’s closing date. Just like a traditional auction, the highest bidder at the close wins the item — no fuss, no hidden tricks.

Payments are processed through a secure, integrated payment gateway supporting debit and credit cards, ensuring a smooth and safe transaction for both parties. With its sleek interface, mobile-friendly design, and reliable bidding system, Auctionet transforms the age-old thrill of auctions into a digital experience accessible anytime, anywhere. Whether it’s rare collectibles, luxury goods, or one-of-a-kind finds, Auctionet brings the excitement of winning right to your fingertips.

**Objective**

Deliver a production-ready MERN (MongoDB, Express, React, Node.js) application that supports listing items, real-time-style bidding logic, user authentication, and secure payment handoff, with a robust CI/CD pipeline, tests, and documentation.

**Features**

1. List Auctions (title, description, images, starting price, closing date)
2. Bidding with server-side validation (must exceed highest bid)
3. Winners determined at closing time (highest bid wins)
4. Secure Payments via integrated gateway (debit/credit cards)
5. Authentication & Authorization (JWT-based)
6. Responsive UI (mobile-friendly)
7. Clean REST API with predictable responses

**Tech Stack**

1. Frontend: React (Vite/CRA), optional Tailwind CSS
2. Backend: Node.js, Express
3. Database: MongoDB with Mongoose
4. Auth: JWT
5. Payments: Pluggable gateway (e.g., Stripe)
6. Testing: Mocha, Chai, Sinon
7. CI/CD: GitHub Actions
8. Runtime: Node.js ≥ 18 (CI can use Node 22)

**Requirements**

1. Project Setup & Management
  - Initialize GitHub repository with frontend/ and backend/ workspaces.
  * Set up JIRA board with Epics, User Stories, and Subtasks.
  + Draw and include SysML diagrams:
      - Requirements Diagram
      * Block Definition Diagram (BDD)
      + Parametric Diagram (bidding and pricing constraints)

2. Backend (Node.js + Express + MongoDB)
  - Implement routes/controllers for:
      - Items: create/read/update/delete (CRUD)
      * Auction Feed: list items that are not owned by the current user
      + Bids: place/raise bid (must be a positive number and greater than highest bid), cancel bid
  * Use Mongoose models; apply validation and error handling.
  + Protect routes with JWT middleware (sets req.user.id).

3. Frontend (React)
   - Build views for:
     - Auction Feed (browse others’ items)
     * My Items (manage listings)
     + Item Create/Edit forms
     - Bidding UI with feedback on bid validity

  * Handle auth flows and token storage securely.
  + Ensure responsive, accessible design.

4. Payments
   - Integrate a card payment provider (e.g., Stripe).
   * Store only non-sensitive references (e.g., payment intent IDs).
   + Verify webhooks server-side where applicable.

Git & Branching

Use feature branches and meaningful commit messages.

Protect main branch; open Pull Requests for code review.

CI/CD Pipeline

GitHub Actions workflow to:

Install dependencies and run tests (backend unit tests with Sinon stubs).

Optionally lint.

Deploy backend (e.g., AWS EC2) and frontend (e.g., S3/CloudFront or EC2).

Document secrets/variables used in CI (without exposing values).
