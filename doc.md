https://www.howtographql.com
https://graphql.org/learn/
https://www.apollographql.com/docs/apollo-server/schema/unions-interfaces


https://www.prisma.io/blog/graphql-server-basics-the-schema-ac5e2950214e
https://www.prisma.io/blog/graphql-server-basics-the-network-layer-51d97d21861


errors for accessing a field set a compulsory but not included
```js
{
  "errors": [
    {
      "message": "Cannot return null for non-nullable field Query.feed.",
      "locations": [
        {
          "line": 3,
          "column": 3
        }
      ],
      "path": [
        "feed"
      ],
      "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "stacktrace": [
            "Error: Cannot return null for non-nullable field Query.feed.",
            "    at completeValue (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\graphql\\execution\\execute.js:605:13)",
            "    at executeField (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\graphql\\execution\\execute.js:500:19)",
            "    at executeFields (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\graphql\\execution\\execute.js:414:22)",
            "    at executeOperation (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\graphql\\execution\\execute.js:344:14)",
            "    at execute (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\graphql\\execution\\execute.js:136:20)",
            "    at execute (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\apollo-server-core\\dist\\requestPipeline.js:207:48)",
            "    at processGraphQLRequest (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\apollo-server-core\\dist\\requestPipeline.js:150:34)",
            "    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)",
            "    at async processHTTPRequest (C:\\Users\\Stark\\Desktop\\tutorials\\js\\graphql\\v1\\node_modules\\apollo-server-core\\dist\\runHttpQuery.js:222:30)"
          ]
        }
      }
    }
  ],
  "data": null
}


// format
{
  "errors": : [
    {
      "message": "", 
      "location": [{}], 
      "path": [], 
      "extensions": { 
        "code": "",
        "exception": ["stacktrace": []]
        }
      
    }
  ],
  "data": {}
}
```

Error reading file

```js
import path, {dirname} from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url)
const _dirname = dirname(__filename)

// this was throwing error. I think it was using windows styling
// const _dirname =  dirname(import.meta.url)
// const _dirname = dirname(new URL(import.meta.url).pathname)

```


```js
// https://www.apollographql.com/docs/apollo-server/schema/unions-interfaces
// Resolving union/interface

// from playgorund
mutation Post {
  post(url: "www.prisma.io", description: "Prisma replaces traditional ORMs") {
    ... on Link {
      id
    }
    ... on Err {
      errMsg
    }
  }
}

```
```graphql
# resolver
Link: {
    id: (parent) => "LINK: " + parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
  },

  Err: {
    errMsg: (parent) => parent.errMsg
  },

  // union type needs resolving
  LinkOrErr: {
    __resolveType(obj, ctx, info) {
      console.log("obj=====  ", obj)
      console.log("ctx=====  ", ctx)
      if (obj.id) return "Link"
      if (obj.errMsg) return "Err"
    }
  },

```

```graphql
# typedef
type Link {
  id: ID!
  description: String!
  url: String!
}

type Err {
  errMsg: String!
}

union LinkOrErr = Link | Err

type Mutation {
  post(url: String!, description: String!): LinkOrErr! #Link!
  signup(email: String!, password: String!, name: String!): AuthPayload!
  login(email: String!, password: String!): AuthPayload!
}
```


#### Subscriptions
https://www.apollographql.com/docs/apollo-server/v3/data/subscriptions

- They are implemented over websocket

Resolvers for subscriptions are slightly different than the ones for queries and mutations:

- Rather than returning any data directly, they return an AsyncIterator which subsequently is used by the GraphQL server to push the event data to the client.

- Subscription resolvers are wrapped inside an object and need to be provided as the value for a subscribe field. You also need to provide another field called resolve that actually returns the data from the data emitted by the AsyncIterator.

```js
ctx =======  {
  db: InMemoryDb {},
  userId: 'dummy',
  pubsub: PubSub {
    ee: EventEmitter {
      _events: [Object: null prototype] {},
      _eventsCount: 0,
      _maxListeners: undefined,
      [Symbol(kCapture)]: false
    },
    subscriptions: {},
    subIdCounter: 0
  }
}
```
The pubsub can have multiple topics and be published to individually

```js

// subscriber resolver
export default {
    newLink: {
        subscribe: (parent, args, ctx) => {
            // args can be paassed, info is available,context is returned from useServer for ws
            // console.log("ctx -- ==> ", "--", parent, "--", args, "--", ctx)
            return ctx.pubsub.asyncIterator(["NEW_LINK", "NEW"]) //######################
          },
        resolve: payload => {
          return payload
        },
      }
}

// post mutation
    post: (parent, args, ctx, info) => {
      // console.log("parent ---> ", parent); //undefined
      // console.log("args ==== ", args); // url, description
      // console.log("ctx ======= ", ctx); // {}
      // console.log("info ===== ", info); // big ast object

      // returns error if no link is sent if return is not optional, otherwise returns null

      if (ctx.userId == null) {
        return { errMsg: "user not authenticated" };
      }
      ctx.db.set("link", args);
      // publish resolver
      ctx.pubsub.publish(["NEW"], ctx.db.getLast("link")) //##########################
      return ctx.db.getLast("link");
    },
```