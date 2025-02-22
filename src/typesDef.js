const typeDefs = `#graphql
    type Query {
        info: String!
        feed: [Link]!
    }

    type Link {
    id: ID!
    description: String!
    url: String!
  }

  type Mutation {
    post(url: String!, description: String!): Link!
  }
`

export { typeDefs }