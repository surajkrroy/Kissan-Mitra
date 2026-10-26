# Demo Recording Checklist

Record a short screen video showing the actual running app. This file is a guide; it is not a recording.

1. Show the project folder and briefly identify `schema.graphql`, `server.js`, `db.js`, `schema.sql`, and `public/index.html`.
2. Show the seeded products in MySQL or the browser.
3. Open `http://localhost:4000/` and run the `availableProducts` query.
4. Open the Kissan-Mitra page with Live Server and show the product cards before the mutation.
5. Add a sample product such as `Fresh Cauliflower`, category `Vegetables`, price `32.50`, quantity `40`, farmer `Demo Farmer`, location `Giridih, Jharkhand`.
6. Show the success message and the newly listed product.
7. Optionally verify the inserted row with `SELECT * FROM products ORDER BY id DESC LIMIT 1;`.
8. Save a screenshot before adding the product as `screenshots/before-mutation.png`.
9. Save a screenshot after adding the product as `screenshots/after-mutation.png`.
10. Upload the video and both screenshots to the team’s Google Drive folder; set link access to “Anyone with the link” if required by the course instructions. Add the video link to the team README before submission.

## Suggested terminal commands

```bash
npm install
npm start
```

Run the SQL setup once before starting the API. Ensure MySQL is running and `.env` has valid credentials.
