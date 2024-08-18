const router = require('express').Router();
const User = require('../models/User');
const verify = require("../verifyToken");
const admin = require('firebase-admin');
// UPDATE


// UPDATE
router.put("/:id", verify, async (req, res) => {
  if (req.user.uid === req.params.id || req.user.isAdmin) {
      try {
          const userRef = admin.firestore().collection('users').doc(req.params.id);
          await userRef.update({
              ...req.body,
              updatedAt: new Date().toISOString(),
          });

          const updatedUser = await userRef.get();
          res.status(200).json(updatedUser.data());
      } catch (err) {
          res.status(500).json(err.message);
      }
  } else {
      res.status(403).json("You can update only your account!");
  }
});

// DELETE
router.delete("/:id", verify, async (req, res) => {
  if (req.user.uid === req.params.id || req.user.isAdmin) {
      try {
          await admin.auth().deleteUser(req.params.id);
          await admin.firestore().collection('users').doc(req.params.id).delete();
          res.status(200).json("User has been deleted...");
      } catch (err) {
          res.status(500).json(err.message);
      }
  } else {
      res.status(403).json("You can delete only your account!");
  }
});

// GET USER BY ID
router.get("/find/:id", async (req, res) => {
  try {
      const userDoc = await admin.firestore().collection('users').doc(req.params.id).get();
      if (!userDoc.exists) {
          return res.status(404).json("User not found");
      }

      const user = userDoc.data();
      res.status(200).json(user);
  } catch (err) {
      res.status(500).json(err.message);
  }
});

// GET ALL USERS - ADMIN ONLY
router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
      try {
          const query = req.query.new;
          let usersRef = admin.firestore().collection('users').orderBy('createdAt', 'desc');
          if (query) {
              usersRef = usersRef.limit(7);
          }

          const snapshot = await usersRef.get();
          const users = snapshot.docs.map(doc => doc.data());
          res.status(200).json(users);
      } catch (err) {
          res.status(500).json(err.message);
      }
  } else {
      res.status(403).json("You are not allowed to see all users!");
  }
});

// GET USER STATS - MONTHLY USERS REGISTERED
router.get("/stats", verify, async (req, res) => {
  if (req.user.isAdmin) {
      const today = new Date();
      const lastYear = today.setFullYear(today.getFullYear() - 1);

      try {
          const snapshot = await admin.firestore().collection('users')
              .where('createdAt', '>=', new Date(lastYear).toISOString())
              .get();

          const monthlyStats = {};

          snapshot.forEach(doc => {
              const month = new Date(doc.data().createdAt).getMonth() + 1;
              monthlyStats[month] = (monthlyStats[month] || 0) + 1;
          });

          const stats = Object.keys(monthlyStats).map(month => ({
              month,
              total: monthlyStats[month],
          }));

          res.status(200).json(stats);
      } catch (err) {
          res.status(500).json(err.message);
      }
  } else {
      res.status(403).json("You are not allowed to see the stats!");
  }
});

module.exports = router;