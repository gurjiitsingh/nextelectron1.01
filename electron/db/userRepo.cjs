const { db } = require('./sqlite.cjs');

function clearUsers() {
  db.prepare('DELETE FROM pos_users').run();
}

function insertUsers(list) {
  const stmt = db.prepare(`
    INSERT INTO pos_users (
      userId,
      outletId,
      fullName,
      username,
      mobile,
      employeeId,
      role,
      loginPin,
      allowPosLogin,
      isActive,
      createdAt,
      updatedAt,
      syncStatus,
      lastSyncedAt
    ) VALUES (
      @userId,
      @outletId,
      @fullName,
      @username,
      @mobile,
      @employeeId,
      @role,
      @loginPin,
      @allowPosLogin,
      @isActive,
      @createdAt,
      @updatedAt,
      @syncStatus,
      @lastSyncedAt
    )
  `);

  const tx = db.transaction((rows) => {
    for (const row of rows) {
      stmt.run({
        ...row,
        allowPosLogin: row.allowPosLogin ? 1 : 0,
        isActive: row.isActive ? 1 : 0,
      });
    }
  });

  tx(list);
}

function getAllUsers() {
  return db.prepare(`
    SELECT *
    FROM pos_users
    ORDER BY fullName ASC
  `).all();
}

module.exports = {
  clearUsers,
  insertUsers,
  getAllUsers,
};