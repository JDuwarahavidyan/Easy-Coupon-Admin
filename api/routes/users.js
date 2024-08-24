const router = require('express').Router();
const User = require('../models/User');
const verifyAdmin = require("../verifyToken");
const admin = require('firebase-admin');
const { sendEmail } = require('../mail');



// UPDATE
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
      const userRef = admin.firestore().collection('users').doc(req.params.id);
      
      await userRef.update({
          ...req.body,
          updatedAt: new Date().toISOString(),
      });

      const updatedUser = await userRef.get();
      res.status(200).json(updatedUser.data());
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// DELETE
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
      // Only admins can delete users
      await admin.auth().deleteUser(req.params.id);
      await admin.firestore().collection('users').doc(req.params.id).delete();
      res.status(200).json("User has been deleted...");
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET USER BY ID
router.get("/find/:id", verifyAdmin, async (req, res) => {
  try {
      const userDoc = await admin.firestore().collection('users').doc(req.params.id).get();
      if (!userDoc.exists) {
          return res.status(404).json("User not found");
      }

      const user = userDoc.data();
      res.status(200).json(user);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET ALL USERS - ADMIN ONLY
router.get("/", verifyAdmin, async (req, res) => {
  try {
      const query = req.query.new;
      let usersRef = admin.firestore().collection('users').orderBy('createdAt', 'desc');
      
      // Limit to 7 users if the "new" query parameter is present
      if (query) {
          usersRef = usersRef.limit(7);
      }

      const snapshot = await usersRef.get();
      const users = snapshot.docs.map(doc => doc.data());
      res.status(200).json(users);
  } catch (err) {
      res.status(500).json({ error: err.message });
  }
});

// GET USER STATS - MONTHLY USERS REGISTERED
router.get("/stats", verifyAdmin, async (req, res) => {
  try {
    const lastYear = new Date();
    lastYear.setFullYear(lastYear.getFullYear() - 1);

    const query = admin.firestore().collection('users')
      .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(lastYear));

    const snapshot = await query.get();

    const monthlyStats = {};

    snapshot.forEach(doc => {
      const createdAt = doc.data().createdAt.toDate(); // Convert Firestore Timestamp to JS Date
      const month = createdAt.getMonth() + 1; // Get month (1-12)
      monthlyStats[month] = (monthlyStats[month] || 0) + 1;
    });

    const stats = Object.keys(monthlyStats).map(month => ({
      month: parseInt(month, 10),
      total: monthlyStats[month],
    }));

    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put("/disable/:id", verifyAdmin, async (req, res) => {
  try {
    const uid = req.params.id;

    // Disable the user account in Firebase Authentication
    await admin.auth().updateUser(uid, {
      disabled: true
    });

    // Update the Firestore document to reflect the disabled status
    await admin.firestore().collection('users').doc(uid).update({
      disabled: true
    });

    // Fetch user details from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userEmail = userDoc.data().email;
    const fullName = userDoc.data().fullName;

    // Send notification email
    await sendEmail(userEmail, 'Account Suspended', fullName, 
`<p>We regret to inform you that your account has been <strong>suspended</strong>. If you believe this is a mistake or require further information, please contact the Administration at your earliest convenience.</p>

<p><strong>Important:</strong> Do not attempt to access your account until this issue is resolved.</p>

<p>Thank you for your understanding.</p>`);
      
    res.status(200).json({ message: "User account has been disabled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ENABLE USER ACCOUNT
router.put("/enable/:id", verifyAdmin, async (req, res) => {
  try {
    const uid = req.params.id;

    // Enable the user account in Firebase Authentication
    await admin.auth().updateUser(uid, {
      disabled: false
    });

    // Update the Firestore document to reflect the enabled status
    await admin.firestore().collection('users').doc(uid).update({
      disabled: false
    });

    // Fetch user details from Firestore
    const userDoc = await admin.firestore().collection('users').doc(uid).get();
    const userEmail = userDoc.data().email;
    const fullName = userDoc.data().fullName;

    // Send notification email
    await sendEmail(userEmail, 'Account Enabled', fullName, 
`<p>We are pleased to inform you that your account has been <strong>enabled</strong>. You may now log in and enjoy your meals with Easy Coupon.</p>

<p><strong>Important:</strong> If you did not request this action, please contact the Administration immediately to secure your account.</p>

<p>Thank you for your attention to this matter.</p>`);
      
      

    res.status(200).json({ message: "User account has been enabled" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});




  
module.exports = router;