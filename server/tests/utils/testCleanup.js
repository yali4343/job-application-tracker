import prisma from "../../src/lib/prisma.js";

/**
 * Clean up test user and their applications from database
 */
export async function cleanupUser(userId) {
  if (!userId) return;

  try {
    // Delete all applications owned by the user
    await prisma.application.deleteMany({
      where: { userId },
    });

    // Delete the user
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error(`Error cleaning up user ${userId}:`, error.message);
  }
}

/**
 * Clean up multiple users
 */
export async function cleanupUsers(userIds) {
  for (const userId of userIds) {
    await cleanupUser(userId);
  }
}

/**
 * Disconnect Prisma (call in afterAll of the test suite)
 */
export async function disconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch (error) {
    console.error("Error disconnecting Prisma:", error.message);
  }
}
