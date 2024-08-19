const router = require('express').Router();
const admin = require('firebase-admin');
const User = require('../models/User');

// Register a new user
router.post('/register', async (req, res) => {
    const { email, password, userName, fullName, role } = req.body;
    const db = req.db;

    try {

        const existingUser = await db.collection('users')
            .where('userName', '==', userName)
            .limit(1)
            .get();

        if (!existingUser.empty) {
            return res.status(400).json({ error: 'Username is already taken' });
        }


        const userRecord = await admin.auth().createUser({
            email,
            password,
        });


        const newUser = new User({
            id: userRecord.uid,
            email,
            userName,
            fullName,
            role,
            isFirstTime: true, 
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            studentCount: 30, 
            canteenCount: 0,  
            profilePic: null  
        });


        await db.collection('users').doc(userRecord.uid).set({
            id: newUser.id,
            email: newUser.email,
            userName: newUser.userName,
            fullName: newUser.fullName,
            isFirstTime: newUser.isFirstTime,
            createdAt: newUser.createdAt,
            updatedAt: newUser.updatedAt,
            role: newUser.role,
            studentCount: newUser.studentCount,
            canteenCount: newUser.canteenCount,
            profilePic: newUser.profilePic,
        });


        res.status(201).json({
            message: 'User registered successfully',
            uid: userRecord.uid,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Login route
router.post('/login', async (req, res) => {
    const { userName, password } = req.body;
    const db = req.db;

    try {
        const userDoc = await db.collection('users')
            .where('userName', '==', userName)
            .limit(1)
            .get();

        if (userDoc.empty) {
            return res.status(404).json({ error: 'User not found' });
        }

        const userData = userDoc.docs[0].data();

        if (userData.role !== 'admin') {
            return res.status(403).json({ error: 'Access denied' });
        }

        const email = userData.email;

        const user = await admin.auth().getUserByEmail(email);
        const userId = user.uid;

        const customToken = await admin.auth().createCustomToken(userId);

        res.status(200).json({
            customToken,
            uid: userId,
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


module.exports = router;
