const { db } = require('./sqlite.cjs');
// =====================================================
// SALE REPORT REPOSITORY
// =====================================================

function getSalesReport(businessDate) {
  if (!businessDate) {
    throw new Error("Business date is required");
  }

  // ===================================================
  // OVERALL SALES
  // ===================================================

  const salesStats = db
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
        ) AS totalTax,

        COALESCE(
          SUM(paidAmount),
          0
        ) AS totalPaid,

        COALESCE(
          SUM(dueAmount),
          0
        ) AS totalDue

      FROM pos_order_master

      WHERE businessDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'
    `)
    .get(businessDate);


  // ===================================================
  // PAYMENT BREAKDOWN
  // ===================================================

  const paymentStats = db
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
        ) AS cash,

        COALESCE(
          SUM(
            CASE
              WHEN UPPER(mode) = 'CARD'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS card,

        COALESCE(
          SUM(
            CASE
              WHEN UPPER(mode) = 'UPI'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS upi,

        COALESCE(
          SUM(
            CASE
              WHEN UPPER(mode) = 'WALLET'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS wallet,

        COALESCE(
          SUM(
            CASE
              WHEN UPPER(mode) = 'CREDIT'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS credit

      FROM pos_order_payments

      WHERE businessDate = ?

        AND (
          isVoided IS NULL
          OR isVoided = 0
        )

        AND (
          status IS NULL
          OR UPPER(status) != 'VOIDED'
        )
    `)
    .get(businessDate);


  // ===================================================
  // CATEGORY SALES
  // ===================================================

  const categorySales = db
    .prepare(`
      SELECT

        oi.categoryId AS categoryId,

        oi.categoryName AS categoryName,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS quantity,

        COALESCE(
          SUM(oi.finalTotal),
          0
        ) AS sales

      FROM pos_order_items oi

      INNER JOIN pos_order_master om
        ON om.id = oi.orderMasterId

      WHERE om.businessDate = ?

        AND UPPER(om.orderStatus) = 'COMPLETED'

      GROUP BY
        oi.categoryId,
        oi.categoryName

      ORDER BY
        sales DESC
    `)
    .all(businessDate);


  // ===================================================
  // PRODUCT SALES
  // ===================================================

  const productSales = db
    .prepare(`
      SELECT

        oi.productId AS productId,

        oi.name AS productName,

        oi.categoryId AS categoryId,

        oi.categoryName AS categoryName,

        COALESCE(
          SUM(oi.quantity),
          0
        ) AS quantity,

        COALESCE(
          SUM(oi.finalTotal),
          0
        ) AS sales

      FROM pos_order_items oi

      INNER JOIN pos_order_master om
        ON om.id = oi.orderMasterId

      WHERE om.businessDate = ?

        AND UPPER(om.orderStatus) = 'COMPLETED'

      GROUP BY
        oi.productId,
        oi.name,
        oi.categoryId,
        oi.categoryName

      ORDER BY
        sales DESC
    `)
    .all(businessDate);


  // ===================================================
  // ORDER TYPE SALES
  // ===================================================

  const orderTypeSales = db
    .prepare(`
      SELECT

        orderType,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE businessDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        orderType

      ORDER BY
        sales DESC
    `)
    .all(businessDate);


  // ===================================================
  // STAFF SALES
  // ===================================================

  const staffSales = db
    .prepare(`
      SELECT

        createdById AS staffId,

        createdByName AS staffName,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE businessDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        createdById,
        createdByName

      ORDER BY
        sales DESC
    `)
    .all(businessDate);


  // ===================================================
  // HOURLY SALES
  // ===================================================

  const hourlySales = db
    .prepare(`
      SELECT

        strftime(
          '%H',
          createdAt / 1000,
          'unixepoch'
        ) AS hour,

        COUNT(*) AS orders,

        COALESCE(
          SUM(grandTotal),
          0
        ) AS sales

      FROM pos_order_master

      WHERE businessDate = ?

        AND UPPER(orderStatus) = 'COMPLETED'

      GROUP BY
        hour

      ORDER BY
        hour
    `)
    .all(businessDate);


  // ===================================================
  // RETURN
  // ===================================================

  return {

    overview: {
      totalOrders:
        Number(
          salesStats?.totalOrders || 0
        ),

      totalSales:
        Number(
          salesStats?.totalSales || 0
        ),

      totalDiscount:
        Number(
          salesStats?.totalDiscount || 0
        ),

      totalTax:
        Number(
          salesStats?.totalTax || 0
        ),

      totalPaid:
        Number(
          salesStats?.totalPaid || 0
        ),

      totalDue:
        Number(
          salesStats?.totalDue || 0
        ),
    },

    payments: {
      cash:
        Number(
          paymentStats?.cash || 0
        ),

      card:
        Number(
          paymentStats?.card || 0
        ),

      upi:
        Number(
          paymentStats?.upi || 0
        ),

      wallet:
        Number(
          paymentStats?.wallet || 0
        ),

      credit:
        Number(
          paymentStats?.credit || 0
        ),
    },

    categorySales,

    productSales,

    orderTypeSales,

    staffSales,

    hourlySales,
  };
}

module.exports = {
  getSalesReport,
};