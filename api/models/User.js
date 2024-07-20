class User {
  constructor(username, email, password, profilePic = "", isAdmin = false, status = "Approved") {
    this.username = username;
    this.email = email;
    this.password = password;
    this.profilePic = profilePic;
    this.isAdmin = isAdmin;
    this.status = status;
    this.createdAt = admin.firestore.FieldValue.serverTimestamp();
    this.updatedAt = admin.firestore.FieldValue.serverTimestamp();
  }

  static async createUser(user) {
    const userRef = db.collection("users").doc(user.username);
    await userRef.set({ ...user, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
    return userRef;
  }

  static async getUser(username) {
    const userRef = db.collection("users").doc(username);
    const doc = await userRef.get();
    if (!doc.exists) {
      throw new Error("User not found");
    }
    return doc.data();
  }

  static async updateUser(username, updateData) {
    const userRef = db.collection("users").doc(username);
    await userRef.update({ ...updateData, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
  }

  static async deleteUser(username) {
    const userRef = db.collection("users").doc(username);
    await userRef.delete();
  }
}

module.exports = User;
