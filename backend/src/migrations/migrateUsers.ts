// migrations/addSubscriptionFields.ts
import User from "../models/User";

async function migrateUsers() {
   const users = await User.find({
      $or: [
         { subscriptionStatus: { $exists: false } },
         { subscriptionPlan: { $exists: false } },
         { subscriptionExpiry: { $exists: false } },
         { walletBalance: { $exists: false } },
      ],
   });

   for (const user of users) {
      user.subscriptionStatus = user.subscriptionStatus || "free";
      user.subscriptionPlan = user.subscriptionPlan || null;
      user.subscriptionExpiry = user.subscriptionExpiry || null;
      user.walletBalance = user.walletBalance || 0;
      await user.save();
   }

   console.log(`✅ Migrated ${users.length} users`);
}

migrateUsers();
