const { db } = require('./sqlite.cjs');

// =====================================================
// DAY CLOSING REPOSITORY
// =====================================================


// =====================================================
// DATE HELPER
// =====================================================

function getTodayBusinessDate() {

  const now =
    new Date();

  const year =
    now.getFullYear();

  const month =
    String(
      now.getMonth() + 1
    ).padStart(2, '0');

  const day =
    String(
      now.getDate()
    ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}


// =====================================================
// GET CURRENT BUSINESS DAY
// =====================================================

function getCurrentBusinessDay() {

  const row =
    db
      .prepare(`
        SELECT *
        FROM pos_business_day
        WHERE id = 'CURRENT'
        LIMIT 1
      `)
      .get();


  if (row) {
    return row;
  }


  // ===================================================
  // SAFETY:
  // CREATE INITIAL BUSINESS DAY
  // ===================================================

  const now =
    Date.now();

  const businessDate =
    getTodayBusinessDate();


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

      openedAt:
        now,

      updatedAt:
        now,

    });


  return db
    .prepare(`
      SELECT *
      FROM pos_business_day
      WHERE id = 'CURRENT'
      LIMIT 1
    `)
    .get();
}


// =====================================================
// GET BUSINESS DATE
// =====================================================

function getBusinessDate() {

  const businessDay =
    getCurrentBusinessDay();

  return businessDay.businessDate;
}


// =====================================================
// CHECK IF NEXT BUSINESS DAY CAN BE CREATED
// =====================================================

function canCreateNextBusinessDay() {

  const current =
    getCurrentBusinessDay();


  const today =
    getTodayBusinessDate();


  /*
    Current = today
      → allowed

    Current > today
      → tomorrow/future already prepared
      → blocked

    Current < today
      → allowed
  */

  return current.businessDate <= today;
}


// =====================================================
// GET SALES SUMMARY
// =====================================================

// =====================================================
// GET SALES SUMMARY
// =====================================================

function getSummary(businessDate) {

  // ===================================================
  // ORDER SUMMARY
  // ===================================================

  const orderStats =
    db
      .prepare(`
        SELECT

          COUNT(*) AS totalOrders,

          COALESCE(
            SUM(grandTotal),
            0
          ) AS totalSales,

          COALESCE(
            SUM(discountTotal),
            0
          ) AS totalDiscount,

          COALESCE(
            SUM(taxTotal),
            0
          ) AS totalTax

        FROM pos_order_master

        WHERE businessDate = ?

      `)
      .get(businessDate);


  // ===================================================
  // PAYMENT SUMMARY
  // ===================================================

  const paymentStats =
    db
      .prepare(`
        SELECT

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'CASH'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS cashSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'CARD'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS cardSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'UPI'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS upiSales,

          COALESCE(
            SUM(
              CASE
                WHEN UPPER(mode) = 'WALLET'
                THEN amount
                ELSE 0
              END
            ),
            0
          ) AS walletSales

        FROM pos_order_payments

        WHERE businessDate = ?

          AND (
            isVoided IS NULL
            OR isVoided = 0
          )

          AND UPPER(status) != 'VOIDED'

      `)
      .get(businessDate);


  // ===================================================
  // CREDIT SALES
  // ===================================================

  const creditStats =
    db
      .prepare(`
        SELECT

          COALESCE(
            SUM(grandTotal),
            0
          ) AS creditSales

        FROM pos_order_master

        WHERE businessDate = ?

          AND UPPER(paymentMode) = 'CREDIT'

      `)
      .get(businessDate);


  // ===================================================
  // COMPLIMENTARY SALES
  // ===================================================
  //
  // IMPORTANT:
  // Your pos_order_master table currently does NOT
  // have a "complimentary" column.
  //
  // Therefore we cannot reliably calculate this yet.
  //
  // Keep it 0 until you define how a complimentary
  // order is identified.
  //

  const complimentarySales = 0;


  // ===================================================
  // RETURN SUMMARY
  // ===================================================

  return {

    totalOrders:
      Number(
        orderStats?.totalOrders || 0
      ),

    totalSales:
      Number(
        orderStats?.totalSales || 0
      ),

    totalDiscount:
      Number(
        orderStats?.totalDiscount || 0
      ),

    totalTax:
      Number(
        orderStats?.totalTax || 0
      ),

    complimentarySales:
      Number(
        complimentarySales || 0
      ),

    cashSales:
      Number(
        paymentStats?.cashSales || 0
      ),

    cardSales:
      Number(
        paymentStats?.cardSales || 0
      ),

    upiSales:
      Number(
        paymentStats?.upiSales || 0
      ),

    walletSales:
      Number(
        paymentStats?.walletSales || 0
      ),

    creditSales:
      Number(
        creditStats?.creditSales || 0
      ),

    totalRefund:
      0,

  };
}


// =====================================================
// GET EXPECTED CASH
// =====================================================

function getExpectedCash(
  businessDate
) {

  const businessDay =
    getCurrentBusinessDay();


  const summary =
    getSummary(
      businessDate
    );


  return (
    Number(
      businessDay.openingCash || 0
    ) +
    Number(
      summary.cashSales || 0
    )
  );
}


// =====================================================
// GET DAY CLOSING HISTORY
// =====================================================

function getHistory() {

  return db
    .prepare(`
      SELECT *
      FROM pos_day_closing
      ORDER BY businessDate DESC
    `)
    .all();
}


// =====================================================
// GET CLOSING BY BUSINESS DATE
// =====================================================

function getClosingByDate(
  businessDate
) {

  return db
    .prepare(`
      SELECT *
      FROM pos_day_closing
      WHERE businessDate = ?
      LIMIT 1
    `)
    .get(
      businessDate
    );
}


// =====================================================
// ALREADY CLOSED
// =====================================================

function alreadyClosed(
  businessDate
) {

  const row =
    getClosingByDate(
      businessDate
    );

  return !!row;
}


// =====================================================
// CLOSE BUSINESS DAY
// =====================================================

function closeBusinessDay({

  actualCash,

  notes = '',

  closedById = '',

  closedByName = '',

}) {

  const transaction =
    db.transaction(() => {


      // ===============================================
      // CURRENT BUSINESS DAY
      // ===============================================

      const businessDay =
        getCurrentBusinessDay();


      const businessDate =
        businessDay.businessDate;


      // ===============================================
      // PREVENT DOUBLE CLOSE
      // ===============================================

      if (
        alreadyClosed(
          businessDate
        )
      ) {

        throw new Error(
          'Business day is already closed.'
        );

      }


      // ===============================================
      // PREVENT FUTURE BUSINESS DAY
      // ===============================================

      if (
        !canCreateNextBusinessDay()
      ) {

        throw new Error(
          'Business day already prepared for tomorrow.'
        );

      }


      // ===============================================
      // SALES SUMMARY
      // ===============================================

      const summary =
        getSummary(
          businessDate
        );


      // ===============================================
      // CASH
      // ===============================================

      const openingCash =
        Number(
          businessDay.openingCash || 0
        );


      const expectedCash =
        openingCash +
        Number(
          summary.cashSales || 0
        );


      const countedCash =
        Number(
          actualCash || 0
        );


      const cashDifference =
        countedCash -
        expectedCash;


      const now =
        Date.now();


      // ===============================================
      // DAY CLOSING HISTORY
      // ===============================================

      const closingId =
        `${businessDate}-${now}`;


      db
        .prepare(`
          INSERT INTO pos_day_closing (

            id,

            businessDate,

            openedAt,
            closedAt,

            openedById,
            openedByName,

            closedById,
            closedByName,

            openingCash,

            expectedCash,
            actualCash,

            cashDifference,

            totalSales,
            totalRefund,

            totalDiscount,
            totalTax,

            cashSales,
            cardSales,
            upiSales,
            walletSales,

            creditSales,

            complimentarySales,

            totalOrders,

            syncStatus,

            createdAt

          )
          VALUES (

            @id,

            @businessDate,

            @openedAt,
            @closedAt,

            @openedById,
            @openedByName,

            @closedById,
            @closedByName,

            @openingCash,

            @expectedCash,
            @actualCash,

            @cashDifference,

            @totalSales,
            @totalRefund,

            @totalDiscount,
            @totalTax,

            @cashSales,
            @cardSales,
            @upiSales,
            @walletSales,

            @creditSales,

            @complimentarySales,

            @totalOrders,

            @syncStatus,

            @createdAt

          )
        `)
        .run({

          id:
            closingId,

          businessDate,

          openedAt:
            businessDay.openedAt,

          closedAt:
            now,

          openedById:
            businessDay.openedById || '',

          openedByName:
            businessDay.openedByName || '',

          closedById:
            closedById || '',

          closedByName:
            closedByName || '',

          openingCash,

          expectedCash,

          actualCash:
            countedCash,

          cashDifference,

          totalSales:
            summary.totalSales,

          totalRefund:
            summary.totalRefund || 0,

          totalDiscount:
            summary.totalDiscount,

          totalTax:
            summary.totalTax,

          cashSales:
            summary.cashSales,

          cardSales:
            summary.cardSales,

          upiSales:
            summary.upiSales,

          walletSales:
            summary.walletSales,

          creditSales:
            summary.creditSales,

          complimentarySales:
            summary.complimentarySales,

          totalOrders:
            summary.totalOrders,

          syncStatus:
            'PENDING',

          createdAt:
            now,

        });


      // ===============================================
      // CLOSE CURRENT BUSINESS DAY
      // ===============================================

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

          closedAt:
            now,

          closedById:
            closedById || '',

          closedByName:
            closedByName || '',

          updatedAt:
            now,

        });


      // ===============================================
      // CALCULATE NEXT BUSINESS DATE
      // ===============================================

      const currentDate =
        new Date(
          `${businessDate}T00:00:00`
        );


      const today =
        new Date();


      today.setHours(
        0,
        0,
        0,
        0
      );


      let nextDate;


      if (
        currentDate > today
      ) {

        throw new Error(
          'Business day already prepared for tomorrow.'
        );

      }


      if (
        currentDate < today
      ) {

        nextDate =
          getTodayBusinessDate();

      } else {

        currentDate.setDate(
          currentDate.getDate() + 1
        );

        nextDate =
          `${currentDate.getFullYear()}-${String(
            currentDate.getMonth() + 1
          ).padStart(2, '0')}-${String(
            currentDate.getDate()
          ).padStart(2, '0')}`;

      }


      // ===============================================
      // CREATE NEXT BUSINESS DAY
      // ===============================================

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
            closedById || '',

          openedByName:
            closedByName || '',

          openingCash:
            countedCash,

          updatedAt:
            now,

        });


      return {

        success:
          true,

        businessDate,

        nextBusinessDate:
          nextDate,

        openingCash,

        expectedCash,

        actualCash:
          countedCash,

        cashDifference,

        summary,

        closingId,

      };

    });


  return transaction();
}


// =====================================================
// EXPORT
// =====================================================

module.exports = {

  getCurrentBusinessDay,

  getBusinessDate,

  canCreateNextBusinessDay,

  getSummary,

  getExpectedCash,

  getHistory,

  getClosingByDate,

  alreadyClosed,

  closeBusinessDay,

};