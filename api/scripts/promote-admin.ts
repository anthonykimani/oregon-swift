import "reflect-metadata";
import AppDataSource from "../service/configs/ormconfig";
import { User } from "../service/models/user.entity";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx ts-node scripts/promote-admin.ts <email>");
    process.exit(1);
  }

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(User);
  const user = await repo.findOne({ where: { email } });

  if (!user) {
    console.error(`User not found: ${email}`);
    await AppDataSource.destroy();
    process.exit(1);
  }

  user.role = "admin" as any;
  user.lastUpdated = new Date();
  await repo.save(user);

  console.log(`Promoted ${email} to admin`);
  await AppDataSource.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
