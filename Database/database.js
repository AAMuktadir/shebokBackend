const { PrismaClient } = require("@prisma/client");

// See here: https://github.com/prisma/prisma-client-js/issues/228#issuecomment-618433162
let db;

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
}
// `stg` or `dev`
else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  db = global.prisma;
}

module.exports = db;
