const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { buildSchema, parse, validate } = require('graphql');

const source = fs.readFileSync(path.join(__dirname, '..', 'schema.graphql'), 'utf8');
const schema = buildSchema(source);

test('schema defines product catalogue queries and addProduct mutation', () => {
  const query = schema.getQueryType();
  const mutation = schema.getMutationType();
  assert.ok(query.getFields().products);
  assert.ok(query.getFields().product);
  assert.ok(query.getFields().availableProducts);
  assert.ok(mutation.getFields().addProduct);
});

test('addProduct requires the documented input fields', () => {
  const input = schema.getType('AddProductInput');
  assert.ok(input);
  const fields = input.getFields();
  for (const name of ['name', 'category', 'pricePerKg', 'unit', 'availableQuantity', 'location', 'farmerName']) {
    assert.match(String(fields[name].type), /!/);
  }
});

test('documented availableProducts query validates', () => {
  const document = parse('{ availableProducts { id name category pricePerKg unit availableQuantity location farmerName available } }');
  assert.deepEqual(validate(schema, document), []);
});

test('documented addProduct mutation validates', () => {
  const document = parse('mutation { addProduct(input: { name: "Test Crop", category: "Vegetables", pricePerKg: 12.5, unit: "kg", availableQuantity: 5, location: "Giridih", farmerName: "Demo Farmer" }) { id name pricePerKg } }');
  assert.deepEqual(validate(schema, document), []);
});
