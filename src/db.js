import { v4 } from "uuid";

const links = [
  {
    id: "link-0",
    url: "www.howtographql.com",
    description: "Fullstack tutorial for GraphQL",
  },
];

const users = [];

class InMemoryDb {
  constructor() {
    console.log("called everytime per request.............");
  }
  getById(type, id) {
    if (type == "link") {
      return links.filter((link) => link?.id == id)[0];
    } else {
      return users.filter((user) => user?.email == id)[0];
    }
  }

  getLast(type) {
    if (type == "link") {
      return links.at(-1);
    } else {
      return users.at(-1);
    }
  }

  get(type) {
    if (type == "link") {
      return links;
    } else {
      return users;
    }
  }

  set(type, args) {
    if (type == "link") {
      let idCount = links.length;

      const link = {
        id: `link-${idCount++}`,
        description: args.description,
        url: args.url,
      };
      links.push(link);
      return link;
    } else {
      const user = {
        id: v4(),
        name: args.name,
        email: args.email,
        link: args.link && args.link,
      };
      users.push(user);
      return user;
    }
  }

  toString() {
    return "In memory representation of a database";
  }
}

// const db = new InMemoryDb();

// export default db;
export { InMemoryDb };
