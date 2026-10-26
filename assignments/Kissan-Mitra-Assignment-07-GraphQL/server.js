require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');
const pool = require('./db');

const typeDefs = fs.readFileSync(path.join(__dirname, 'schema.graphql'), 'utf8');

const productFields = `
  SELECT id, name, category, price_per_kg AS pricePerKg, unit,
         available_quantity AS availableQuantity, location,
         farmer_name AS farmerName, available
  FROM products`;

const resolvers = {
  Query: {
    products: async () => {
      const [rows] = await pool.query(`${productFields} ORDER BY id`);
      return rows.map(normalizeProduct);
    },
    product: async (_parent, { id }) => {
      const [rows] = await pool.query(`${productFields} WHERE id = ?`, [id]);
      return rows[0] ? normalizeProduct(rows[0]) : null;
    },
    availableProducts: async () => {
      const [rows] = await pool.query(`${productFields} WHERE available = TRUE AND available_quantity > 0 ORDER BY id`);
      return rows.map(normalizeProduct);
    }
  },
  Mutation: {
    addProduct: async (_parent, { input }) => {
      if (input.pricePerKg < 0 || input.availableQuantity < 0) {
        throw new Error('Price and available quantity cannot be negative.');
      }
      const [result] = await pool.execute(
        `INSERT INTO products
          (name, category, price_per_kg, unit, available_quantity, location, farmer_name, available)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          input.name.trim(), input.category.trim(), input.pricePerKg, input.unit.trim(),
          input.availableQuantity, input.location.trim(), input.farmerName.trim(),
          input.available === undefined ? input.availableQuantity > 0 : input.available
        ]
      );
      const [rows] = await pool.query(`${productFields} WHERE id = ?`, [result.insertId]);
      return normalizeProduct(rows[0]);
    }
  }
};

function normalizeProduct(row) {
  return {
    ...row,
    id: String(row.id),
    pricePerKg: Number(row.pricePerKg),
    availableQuantity: Number(row.availableQuantity),
    available: Boolean(row.available)
  };
}

async function start() {
  const server = new ApolloServer({ typeDefs, resolvers });
  const { url } = await startStandaloneServer(server, {
    listen: { port: Number(process.env.PORT || 4000) },
    cors: { origin: true }
  });
  console.log(`Kissan-Mitra GraphQL API ready at ${url}`);
  console.log('Open public/index.html with VS Code Live Server to use the demo page.');
}

start().catch((error) => {
  console.error('Could not start GraphQL server:', error.message);
  process.exitCode = 1;
});