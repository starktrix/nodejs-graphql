import { ApolloServer, } from "apollo-server";
import { resolvers } from "./resolvers.js";
// import {typeDefs } from "./typesDef.js"
import * as fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { InMemoryDb } from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);


const server = new ApolloServer({
  typeDefs: fs.readFileSync(path.join(_dirname, "schema.graphql"), "utf8"),
  resolvers,
  // this gets called only once when the server is created, subsequent req does not re initialize
  // the class
  context: ({ req }) => ({
    db: new InMemoryDb(),
    userId: req && req.headers.authorization ? req.headers.authorization : null,
  }),
});

server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
