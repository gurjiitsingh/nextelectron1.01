const { db } = require('./sqlite.cjs');


// =====================================================
// HELPERS
// =====================================================

function getBusinessDate(date = new Date()) {
  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// =====================================================
// GET CURRENT BUSINESS DAY
// =====================================================

function getCurrentBusinessDay() {

  let businessDay =
    db
      .prepare(`
        SELECT *
        FROM pos_business_day
        WHERE id = 'CURRENT'
      `)
      .get();

  // ---------------------------------------------------
  // CREATE INITIAL BUSINESS DAY
  // ---------------------------------------------------

  if (!businessDay) {

    const now =
      Date.now();

    const businessDate =
      getBusinessDate();

    db
      .prepare(`
        INSERT INTO pos_business_day (
          id,
          businessDate,
          openedAt,
          openedById,
          openedByName,
          openingCash,
          isClosed,
          closedAt,
          closedById,
          closedByName,
          status,
          updatedAt
        )
        VALUES (
          'CURRENT',
          @businessDate,
          @openedAt,
          '',
          '',
          0,
          0,
          NULL,
          NULL,
          NULL,
          'OPEN',
          @updatedAt
        )
      `)
      .run({
        businessDate,
        openedAt: now,
        updatedAt: now,
      });

    businessDay =
      db
        .prepare(`
          SELECT *
          FROM pos_business_day
          WHERE id = 'CURRENT'
        `)
        .get();
  }

  return businessDay;
}


// =====================================================
// GET BUSINESS DATE
// =====================================================

function getBusinessDateCurrent() {

  const businessDay =
    getCurrentBusinessDay();

  return businessDay.businessDate;
}


// =====================================================
// CLOSE CURRENT BUSINESS DAY
// =====================================================

function closeCurrentBusinessDay(
  closedById,
  closedByName
) {

  const now =
    Date.now();

  const result =
    db
      .prepare(`
        UPDATE pos_business_day

        SET
          isClosed = 1,
          status = 'CLOSED',
          closedAt = @closedAt,
          closedById = @closedById,
          closedByName = @closedByName,
          updatedAt = @updatedAt

        WHERE id = 'CURRENT'
      `)
      .run({
        closedAt: now,
        closedById: closedById || '',
        closedByName: closedByName || '',
        updatedAt: now,
      });

  if (result.changes === 0) {
    throw new Error(
      'Current business day not found.'
    );
  }

  return getCurrentBusinessDay();
}


// =====================================================
// CAN CREATE NEXT BUSINESS DAY
// =====================================================

function canCreateNextBusinessDay() {

  const current =
    getCurrentBusinessDay();

  const today =
    getBusinessDate();

  /*
    Current = today
    → allowed

    Current = future date
    → blocked

    Current = previous date
    → allowed
  */

  return current.businessDate <= today;
}


// =====================================================
// CREATE NEXT BUSINESS DAY
// =====================================================

function createNextBusinessDay({
  openingCash = 0,
  openedById = '',
  openedByName = '',
}) {

  const current =
    getCurrentBusinessDay();

  const today =
    getBusinessDate();

  // ---------------------------------------------------
  // PREVENT DUPLICATE / FUTURE BUSINESS DAY
  // ---------------------------------------------------

  if (
    current.businessDate > today
  ) {

    throw new Error(
      'Business day already prepared for tomorrow.'
    );
  }


  // ---------------------------------------------------
  // CALCULATE NEXT DATE
  // ---------------------------------------------------

  let nextDate;


  /*
    Current = today

    Example:
    Current = 2026-08-16
    Today   = 2026-08-16

    Next = 2026-08-17
  */

  if (
    current.businessDate === today
  ) {

    const date =
      new Date();

    date.setDate(
      date.getDate() + 1
    );

    nextDate =
      getBusinessDate(date);

  } else {

    /*
      Business day is behind today.

      Example:
      Current = 2026-08-14
      Today   = 2026-08-16

      Next = 2026-08-16
    */

    nextDate =
      today;
  }


  const now =
    Date.now();


  // ---------------------------------------------------
  // UPDATE CURRENT RECORD
  //
  // We keep exactly ONE record:
  // id = CURRENT
  // ---------------------------------------------------

  db
    .prepare(`
      UPDATE pos_business_day

      SET
        businessDate = @businessDate,
        openedAt = @openedAt,
        openedById = @openedById,
        openedByName = @openedByName,
        openingCash = @openingCash,

        isClosed = 0,

        closedAt = NULL,
        closedById = NULL,
        closedByName = NULL,

        status = 'OPEN',

        updatedAt = @updatedAt

      WHERE id = 'CURRENT'
    `)
    .run({

      businessDate:
        nextDate,

      openedAt:
        now,

      openedById:
        openedById || '',

      openedByName:
        openedByName || '',

      openingCash:
        Number(openingCash) || 0,

      updatedAt:
        now,
    });


  return getCurrentBusinessDay();
}


// =====================================================
// UPDATE OPENING CASH
// =====================================================

function updateOpeningCash(
  openingCash
) {

  const result =
    db
      .prepare(`
        UPDATE pos_business_day

        SET
          openingCash = @openingCash,
          updatedAt = @updatedAt

        WHERE id = 'CURRENT'
      `)
      .run({

        openingCash:
          Number(openingCash) || 0,

        updatedAt:
          Date.now(),
      });

  if (result.changes === 0) {
    throw new Error(
      'Current business day not found.'
    );
  }

  return getCurrentBusinessDay();
}


// =====================================================
// UPDATE OPENED BY
// =====================================================

function updateOpenedBy(
  openedById,
  openedByName
) {

  const result =
    db
      .prepare(`
        UPDATE pos_business_day

        SET
          openedById = @openedById,
          openedByName = @openedByName,
          updatedAt = @updatedAt

        WHERE id = 'CURRENT'
      `)
      .run({

        openedById:
          openedById || '',

        openedByName:
          openedByName || '',

        updatedAt:
          Date.now(),
      });

  if (result.changes === 0) {
    throw new Error(
      'Current business day not found.'
    );
  }

  return getCurrentBusinessDay();
}


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  getCurrentBusinessDay,

  getBusinessDate:
    getBusinessDateCurrent,

  closeCurrentBusinessDay,

  canCreateNextBusinessDay,

  createNextBusinessDay,

  updateOpeningCash,

  updateOpenedBy,

};