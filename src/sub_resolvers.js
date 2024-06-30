export default {
    newLink: {
        subscribe: (parent, args, ctx) => {
            // args can be paassed, info is available,context is returned from useServer for ws
            // console.log("ctx -- ==> ", "--", parent, "--", args, "--", ctx)
            // the name must be unique
            return ctx.pubsub.asyncIterator(["NEW_LINK", "NEW"])
            // return ctx.pubsub.asyncIterator(["NEW_LINK"])
          },
        resolve: payload => {
          return payload
        //   return { url: "sub_url", id: "sub_id", description: "sub_desc"} // can modifiy the payload
        },
      },
    newLink2: {
        subscribe: (parent, args, ctx) => {
            // args can be paassed, info is available,context is returned from useServer for ws
            // console.log("ctx -- ==> ", "--", parent, "--", args, "--", ctx)
            // return ctx.pubsub.asyncIterator(["NEW_LINK", "NEW"])
            return ctx.pubsub.asyncIterator(["NEW"])
          },
        resolve: payload => {
          return payload
        },
      }
}