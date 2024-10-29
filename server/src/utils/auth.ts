import { clerkClient } from '@clerk/clerk-sdk-node';

export const verifyToken = async (token: string): Promise<string | null> => {
  try {
    const { sub: userId } = await clerkClient.verifyToken(token);
    return userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

export const getUserData = async (userId: string) => {
  try {
    const user = await clerkClient.users.getUser(userId);
    return {
      id: user.id,
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress,
      imageUrl: user.imageUrl,
    };
  } catch (error) {
    console.error('Failed to get user data:', error);
    return null;
  }
};