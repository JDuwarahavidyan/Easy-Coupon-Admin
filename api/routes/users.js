const router = require('express').Router();
const User = require('../models/User');
const verifyAdmin = require("../verifyToken");
const admin = require('firebase-admin');
// UPDATE


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
      .where('createdAt', '>=', lastYear.toISOString());

    const snapshot = await query.get();

    const monthlyStats = {};

    snapshot.forEach(doc => {
      const month = new Date(doc.data().createdAt).getMonth() + 1;
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

  
module.exports = router;