"use server";
import fs from "fs";

export async function createNewOrderFile(
  cartData,
  address,
  endTotalG,
  productTotalCost,
  totalDiscountG,
  PaymentType,
  deliveryFee,
  deliveryType,
  customerNote,
  couponCode,
  couponPercent
) {
  const customAddress = JSON.parse(address);
  // console.log("cart data in create file -----------------",typeof(totalDiscountG),typeof(endTotalG));
  // console.log("productTotalCost -----------------",productTotalCost);
  // console.log("endTotalG -----------------",endTotalG);
  // console.log("discount -----------------",totalDiscountG);
  class AddInfo {}

  class SubArticle {
    constructor() {
      this.Comment = "";
      this.Price = "";
      this.Count = "";
    }
  }

  class SubArticleList {
    constructor() {
      this.SubArticle = [];
    }
  }

  class Article {
    constructor() {
      this.Price = "";
      this.ArticleSize = "";
      this.ArticleName = "";
      this.ArticleNo = "";
      this.SubArticleList = new SubArticleList();
      this.Count = "";
    }
  }

  class ArticleList {
    constructor() {
      this.Article = [];
    }
  }

  class StoreData {
    constructor() {
      this.StoreId = "";
      this.StoreName = "";
    }
  }

  class ServerData {
    constructor() {
      this.Agent = "";
      this.CreateDateTime = "";
      this.Referer = "";
      this.IpAddress = "";
    }
  }

  class DeliveryAddress {
    constructor() {
      this.LastName = customAddress.lastName;
      this.AddAddress = "";
      this.Company = "";
      this.Zip = customAddress.zipCode;
      this.Street = customAddress.addressLine1;
      this.Latitude = "";
      this.Country = "Germany";
      this.Longitude = "";
      this.HouseNo = customAddress.addressLine2;
      this.Title = "";
      this.PhoneNo = customAddress.mobNo;
      this.City = customAddress.city;
    }
  }

  class Customer {
    constructor() {
      this.DeliveryAddress = new DeliveryAddress();
    }
  }

  class Order {
    constructor(orderID) {
      this.AddInfo = new AddInfo();
      this.OrderID = orderID;
      this.ArticleList = new ArticleList();
      this.StoreData = new StoreData();
      this.ServerData = new ServerData();
      this.Customer = new Customer();
    }
  }

  class OrderList {
    constructor() {
      this.Order = [];
      this.CreateDateTime = "";
    }
  }

  class EShopOrder {
    constructor() {
      this.OrderList = new OrderList();
    }
  }

  function createNewOrder(orderID) {
    let myOrder = new Order(orderID);

    myOrder.AddInfo.PaymentType = PaymentType;
    myOrder.AddInfo.DiscountPercent = totalDiscountG;
    myOrder.AddInfo.Total = endTotalG;
    myOrder.AddInfo.DeliveryType = deliveryType || "";
    // myOrder.AddInfo.CustomerNote = "sdsdfsdfsd";
    // myOrder.AddInfo.CouponCode =  "sdfs";
    //myOrder.AddInfo.couponPercent = couponPercent || 0;
    //  myOrder.AddInfo.CustomerID = "c56";
    //   myOrder.AddInfo.TableNumber = "tn";

    myOrder.ServerData.CreateDateTime = new Date().toISOString();
    myOrder.ServerData.IpAddress = "127.0.0.1";
    myOrder.ServerData.Agent = "Mozilla/5.0";

    myOrder.StoreData.StoreName = "Masala app";

    myOrder.Customer.DeliveryAddress.LastName = customAddress.lastName;
    myOrder.Customer.DeliveryAddress.FirstName = customAddress.firstName;
    myOrder.Customer.DeliveryAddress.Street = customAddress.addressLine1;
    myOrder.Customer.DeliveryAddress.HouseNo = customAddress.addressLine2;
    myOrder.Customer.DeliveryAddress.Zip = customAddress.zipCode;
    myOrder.Customer.DeliveryAddress.City = customAddress.city;
    myOrder.Customer.DeliveryAddress.EMail = customAddress.email;
    myOrder.Customer.DeliveryAddress.PhoneNo = customAddress.mobNo;

    let article;

    cartData.map((item, i) => {
      article = new Article();
      article.Count = item.quantity;
      article.ArticleName = item.name;
      article.ArticleSize = item.productDesc;
      article.ArticleNo = i + 1;
      article.Price = item.price;
      myOrder.ArticleList.Article.push(article);
    });

    // article.Count = 1;
    // article.ArticleName = 'Pizza Hawaii';
    // article.ArticleSize = 'Mittel (ca. 32cm)';
    // article.ArticleNo = 'P22';
    // article.Price = 7.8;

    if (deliveryFee !== 0) {
      article = new Article();
      //  article.Count = item.quantity;
      article.ArticleName = "Lieferpauschale";
      //  article.ArticleSize = item.productDesc;
      //  article.ArticleNo = i+1;
      article.Price = deliveryFee;
      myOrder.ArticleList.Article.push(article);
    }

    let subArticle1 = new SubArticle();
    subArticle1.ArticleName = "Schinken";
    subArticle1.Count = 1;
    subArticle1.Price = 0.9;

    let subArticle2 = new SubArticle();
    subArticle2.ArticleName = "Putenbruststreifen";
    subArticle2.Count = 1;
    subArticle2.Price = 1.5;

    let subArticle3 = new SubArticle();
    subArticle3.Comment = "hot!";
    subArticle3.Count = 1;

    let comment = new Article();
    comment.Count = 1;
    comment.Comment = "Testbestellung: Pronto Pronto!";

    //article.SubArticleList.SubArticle.push(subArticle1, subArticle2, subArticle3);

    let json = JSON.stringify(myOrder, null, 2);

    //fs.writeFileSync(`order_${orderID}.json`, json);
    return json;
  }

  let orderID = Date.now().toString();
  let json = createNewOrder(orderID);
  //console.log(json);

  // fs.open('temp/'+orderID+'.json', 'w', function (err, json) {
  //   if (err) throw err;
  //   console.log('Saved!');
  // });

  fs.writeFile("temp/order_" + orderID + ".json", json, function (err) {
    if (err) throw err;
    console.log("Saved!");
  });

  return "success";
}
