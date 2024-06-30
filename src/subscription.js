// import { ApolloServer, } from "apollo-server";
import { resolvers } from "./resolvers.js";
// import {typeDefs } from "./typesDef.js"
import * as fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { InMemoryDb } from "./db.js";

// subscription
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
import {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} from "apollo-server-core";
import express from "express";
import { createServer } from "http";

import pubsub from "./pubsub.js"




const __filename = fileURLToPath(import.meta.url);
const _dirname = dirname(__filename);

const schema = makeExecutableSchema({
  typeDefs: fs.readFileSync(path.join(_dirname, "schema.graphql"), "utf8"),
  resolvers,
});

const app = express();
const httpServer = createServer(app);

const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
});

// Save the returned server's info so we can shutdown this server later
const serverCleanup = useServer({
    schema,
    // context: (ctx, msg, args) => {
    //     // console.log("ctx ws => ", ctx.connectionParams)
    //     // console.log("msg ws => ", msg)
    //     // console.log("args ws => ", args)
    //     return {
    //         pubsub
    //     }
    // },
    context: (ctx, msg, args) => ({
            pubsub
    }),
 }, wsServer);

//  ws server can not pass in the ctx
// const pubsub = new PubSub();

// Set up ApolloServer.
const server = new ApolloServer({
  schema,
  csrfPrevention: true,
  cache: "bounded",
  context: ({ req }) => ({
      pubsub,
    db: new InMemoryDb(),
    userId: req && req.headers.authorization ? req.headers.authorization : null,
  }),
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
      },
    // persist state between user session via localstorage; check docs
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
  ],
});
await server.start();
server.applyMiddleware({ app });

const PORT = 4000;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(
    `Server is now running on http://localhost:${PORT}${server.graphqlPath}`
  );
});


// const _server = new ApolloServer({
//   typeDefs: fs.readFileSync(path.join(_dirname, "schema.graphql"), "utf8"),
//   resolvers,
//   // this gets called only once when the server is created, subsequent req does not re initialize
//   // the class
//   context: ({ req }) => ({
//     db: new InMemoryDb(),
//     userId: req && req.headers.authorization ? req.headers.authorization : null,
//     // pubsub
//   }),
// });

// _server.listen().then(({ url }) => console.log(`Server is running on ${url}`));
