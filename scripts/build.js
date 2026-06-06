const { execSync } = require("child_process");

// Supply a dummy database URL if it is not defined in the environment.
// This allows Prisma client generation to succeed during Vercel compile time.
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://dummy:dummy@localhost:5432/dummy";
}

try {
  console.log("Generating Prisma Client...");
  execSync("npx prisma generate", { stdio: "inherit" });

  console.log("Building Next.js application...");
  execSync("next build", { stdio: "inherit" });
} catch (error) {
  console.error("Build step failed:", error);
  process.exit(1);
}
