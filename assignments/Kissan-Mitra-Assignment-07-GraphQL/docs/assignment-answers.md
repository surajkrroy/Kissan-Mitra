# Assignment 7 — Required README Answers

## 1. Which service did you pick?

We picked the **Catalogue / Farm Product Listing service** of Kissan-Mitra. It lets a buyer see available farm products, prices, quantity, farmer name, and location. A farmer can add a product listing through a GraphQL mutation.

## 2. Name one field a client can skip and one it cannot. Why use `!`?

- A client can skip `location` in a query selection because GraphQL lets the client choose which response fields it needs.
- A client cannot omit the required `name` argument inside `AddProductInput` when calling `addProduct`, because the schema declares it as `String!`.
- In GraphQL, `!` means non-null: the value must not be `null`. In this schema, `name: String!` and `input: AddProductInput!` are required.

## 3. Map the query/mutation to SQL

- The query `product(id: ID!)` passes the `id` argument to the `Query.product` resolver. That resolver executes `SELECT ... FROM products WHERE id = ?`; the GraphQL `id` becomes the SQL `WHERE` parameter.
- The `Mutation.addProduct` resolver executes the SQL `INSERT INTO products (...) VALUES (?, ...)`. Parameter placeholders are used rather than string concatenation.
