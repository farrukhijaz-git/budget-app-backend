import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

// Test endpoint to create a Firebase custom token for testing
router.post('/create-test-token', async (req, res) => {
  try {
    const { uid, email, name } = req.body;
    
    if (!uid || !email) {
      return res.status(400).json({ message: 'uid and email are required' });
    }

    // Create a custom token
    const customToken = await admin.auth().createCustomToken(uid, {
      email,
      name: name || undefined
    });

    res.json({ 
      customToken,
      instructions: "Use this token to sign in on the frontend, which will give you an ID token"
    });
  } catch (error) {
    console.error('Error creating custom token:', error);
    res.status(500).json({ message: 'Failed to create token', error });
  }
});

// Test endpoint to verify a specific Firebase token
router.post('/verify-firebase-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ message: 'Token is required in request body' });
    }

    console.log('[test] Verifying Firebase token...');
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    res.json({ 
      success: true,
      decoded: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name,
        iss: decodedToken.iss,
        aud: decodedToken.aud
      }
    });
  } catch (error) {
    console.error('[test] Firebase token verification failed:', error);
    res.status(400).json({ 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Test endpoint to verify if Firebase is working
router.get('/firebase-status', (req, res) => {
  try {
    const app = admin.app();
    const projectId = app.options.projectId;
    const serviceAccount = app.options.credential;
    
    res.json({ 
      status: 'Firebase Admin is initialized',
      projectId: projectId,
      credentialType: serviceAccount ? serviceAccount.constructor.name : 'unknown'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'Firebase Admin not initialized', 
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
