const { db } = require("../../src/utils/db")
const reasons = [
  'Found a better solution elsewhere',
  'Features didn\'t meet my needs',
  'User interface is confusing',
  'I\'m not feeling it',
];

async function seedCancelationReasons() {
  for (const reason of reasons) {
    await db.cancelationReason.upsert({
      where: { reason },
      update: {},
      create: { reason },
    });
  }
  console.log('Cancelation reasons seeded successfully');
}

async function main() {
  await seedCancelationReasons();
  await db.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});