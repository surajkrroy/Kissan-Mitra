# GraphQL examples

## List available products

```graphql
query {
  availableProducts {
    id
    name
    category
    pricePerKg
    availableQuantity
    farmerName
    location
  }
}
```

## Fetch one product

```graphql
query {
  product(id: "1") {
    id
    name
    pricePerKg
    available
  }
}
```

## Add a product

```graphql
mutation {
  addProduct(input: {
    name: "Fresh Cauliflower"
    category: "Vegetables"
    pricePerKg: 32.5
    unit: "kg"
    availableQuantity: 40
    location: "Giridih, Jharkhand"
    farmerName: "Demo Farmer"
    available: true
  }) {
    id
    name
    pricePerKg
  }
}
```
