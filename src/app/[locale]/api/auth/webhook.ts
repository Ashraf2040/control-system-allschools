import { WebhookEvent, WebhookHandler } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';

// Clerk Webhook to update session metadata
export const POST: WebhookHandler = async (req) => {
  try {
    const event: WebhookEvent = await req.json();
    
    // Only update session metadata when a session is created (user logs in)
    if (event.type === 'session.created') {
      const userId = event.data.user_id;
      const user = await clerkClient.users.getUser(userId);
      
      // Get the school from the user's metadata
      const school = user.publicMetadata.school || 'default';

      // Store the school in the session metadata
      await clerkClient.sessions.updateSession(event.data.id, {
        customClaims: { school },
      });

      console.log(`School set in session: ${school}`);
    }

    return new Response('OK', { status: 200 });
  } catch (error) {
    console.error('Error in webhook:', error);
    return new Response('Error', { status: 500 });
  }
};
