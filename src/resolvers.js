import { subscribe } from "graphql";
import sub_resolvers from "./sub_resolvers.js";

const resolvers = {
  Query: {
    info: () => `This is the API of a Hackernews Clone`,
    feed: (_, args, ctx) => ctx.db.get("link"),
  },

  // the query above works without this, but this is useful for when customization is need
  Link: {
    id: (parent) => "LINK: " + parent.id,
    description: (parent) => parent.description,
    url: (parent) => parent.url,
  },

  Err: {
    errMsg: (parent) => parent.errMsg,
  },

  // union type needs resolving
  LinkOrErr: {
    __resolveType(obj, ctx, info) {
      // obj is what is being reurned from the parent resolver
      // console.log("obj=====  ", obj)
      // console.log("ctx=====  ", ctx)
      if (obj.id) return "Link";
      if (obj.errMsg) return "Err";
    },
  },

  User: {
    email: (parent) => "USER: " + parent.email,
  },

  Mutation: {
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
      // the name of the asyncIterator must be unique for each subscribe
      ctx.pubsub.publish(["NEW_LINK", "NEW"], ctx.db.getLast("link"))
      ctx.pubsub.publish(["NEW"], ctx.db.getLast("link"))
      return ctx.db.getLast("link");
    },

    signup(parent, args, ctx, info) {
      const user = ctx.db.getById("user", args.email);
      if (user) {
        return {
          message: `user with email ${args.email} already exist`,
        };
      }

      ctx.db.set("user", args);
      return {
        token: ctx.db.getLast("user").id,
        user: ctx.db.getLast("user"),
        message: "user created",
      };
    },

    login(parent, args, ctx, info) {
      const user = ctx.db.getById("user", args.email);
      if (!user) {
        return {
          message: `user with email ${args.email} does not exist`,
        };
      }
      return {
        token: user.id,
        user: user,
        message: "user logged in",
      };
    },
  },
  // subcription resolvers
  Subscription: {
    ...sub_resolvers,
    // newLink: {
    //   subscribe: (parent, args, ctx, info) => {
    //       console.log("ctx==> ", ctx)
    //       return ctx.pubsub.asyncIterator("NEW_LINK")
    //     },
    //   resolve: payload => {
    //     return payload
    //   },
    // }
  }
};

export { resolvers };
