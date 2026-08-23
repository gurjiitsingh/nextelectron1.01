const os = require('os');

const {
  doc,
  getDoc,
  setDoc,
} = require('firebase/firestore');

const {
  firestore,
} = require('../lib/firebaseClient.cjs');

const {
  db,
} = require('../db/sqlite.cjs');


// =====================================================
// CONFIG
// =====================================================

const POS_PORT = 8787;


// =====================================================
// GET LOCAL POS IP
// =====================================================

function getLocalIPAddress() {

  const interfaces =
    os.networkInterfaces();

  for (
    const name of Object.keys(interfaces)
  ) {

    const addresses =
      interfaces[name] || [];

    for (
      const address of addresses
    ) {

      // Node versions can return
      // family as "IPv4" or 4
      const isIPv4 =
        address.family === 'IPv4' ||
        address.family === 4;

      if (
        isIPv4 &&
        !address.internal
      ) {

        return address.address;

      }

    }

  }

  return '';
}


// =====================================================
// GET OUTLET
// =====================================================

function getLocalOutlet() {

  const outlet =
    db.prepare(`

      SELECT
        outletId,
        outletName,
        ownerId

      FROM outlet

      LIMIT 1

    `).get();

  return outlet || null;
}


// =====================================================
// REGISTER POS TERMINAL
// =====================================================

async function registerPosTerminal() {

  // ===================================================
  // GET LOCAL OUTLET
  // ===================================================

  const outlet =
    getLocalOutlet();


  if (!outlet) {

    throw new Error(
      'Outlet configuration not found.'
    );

  }


  if (!outlet.outletId) {

    throw new Error(
      'Outlet ID is required.'
    );

  }


  // ===================================================
  // LOCAL IP
  // ===================================================

  const ipAddress =
    getLocalIPAddress();


  if (!ipAddress) {

    throw new Error(
      'Could not detect local network IP address.'
    );

  }


  // ===================================================
  // TERMINAL ID
  // ===================================================
  //
  // Keep this stable.
  //
  // Do NOT generate a new ID every registration.
  //
  // Later we can make this a real machine/device ID.
  //

  const terminalId =
    'POS-01';


  // ===================================================
  // TERMINAL OBJECT
  // ===================================================

  const terminal = {

    terminalId:
      terminalId,

    terminalName:
      outlet.outletName
        ? `${outlet.outletName} POS`
        : 'Main POS',

    outletId:
      outlet.outletId,

    ownerId:
      outlet.ownerId || '',

    ipAddress:
      ipAddress,

    port:
      POS_PORT,

    deviceType:
      'POS',

    isActive:
      true,

    lastSeenAt:
      Date.now(),

    updatedAt:
      Date.now(),

  };


  // ===================================================
  // CHECK OUTLET EXISTS
  // ===================================================
  //
  // We still verify the outlet because the terminal
  // belongs to this outlet.
  //

  const outletRef =
    doc(
      firestore,
      'outlet',
      outlet.outletId
    );


  const outletSnapshot =
    await getDoc(outletRef);


  if (!outletSnapshot.exists()) {

    throw new Error(
      `Firestore outlet ${outlet.outletId} not found.`
    );

  }


  // ===================================================
  // POS TERMINAL DOCUMENT
  // ===================================================
  //
  // New structure:
  //
  // posTerminals
  //   └── POS-01
  //
  //     outletId
  //     ownerId
  //     ipAddress
  //     port
  //     ...
  //

  const terminalRef =
    doc(
      firestore,
      'posTerminals',
      terminalId
    );


  // ===================================================
  // SAVE / UPDATE TERMINAL
  // ===================================================

  await setDoc(
    terminalRef,
    terminal,
    {
      merge:
        true,
    }
  );


  // ===================================================
  // LOG
  // ===================================================

  console.log(
    '========================================'
  );

  console.log(
    'POS TERMINAL REGISTERED'
  );

  console.log(
    'TERMINAL ID:',
    terminalId
  );

  console.log(
    'OUTLET ID:',
    outlet.outletId
  );

  console.log(
    'IP ADDRESS:',
    ipAddress
  );

  console.log(
    'PORT:',
    POS_PORT
  );

  console.log(
    '========================================'
  );


  // ===================================================
  // RETURN
  // ===================================================

  return {

    success:
      true,

    terminal:
      terminal,

    outletId:
      outlet.outletId,

  };

}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  registerPosTerminal,

  getLocalIPAddress,

};