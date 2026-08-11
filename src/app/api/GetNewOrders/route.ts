export const revalidate = 0;
import fs from 'fs';
import path from 'path';



import { NextRequest, NextResponse } from "next/server";
// import { json } from 'stream/consumers';
// import { any, unknown } from 'zod';

export async function GET(req:NextRequest){

    class Order {
        AddInfo: string;
        OrderID: string | null;
        ArticleList: any | null;
        StoreData: any | null;
        ServerData: any | null;
        Customer: any | null;
    
        constructor() {
            this.AddInfo = "";
            this.OrderID = null;
            this.ArticleList = null;
            this.StoreData = null;
            this.ServerData = null;
            this.Customer = null;
        }
    }
    
    class OrderList {
        Order: Order[];
        CreateDateTime: string;
    
        constructor() {
            this.Order = [];
            this.CreateDateTime = new Date().toISOString();
        }
    }
    
    class EShopOrder {
        OrderList: OrderList;

        constructor() {
            this.OrderList = new OrderList();
        }
    }
    
    const EShopOrders = new EShopOrder();
    
    // Get all JSON files in the current directory
    const files = fs.readdirSync('temp/');
  //  console.log("--------", files)
    
    files.forEach(file => {
      //  if (path.extname(file) === '.json') {
            try {
                const rawData = fs.readFileSync("./temp/"+file, 'utf-8');
                const order = JSON.parse(rawData);
             //   console.log("order--------------------",order)
                EShopOrders.OrderList.Order.push(order);
            } catch (error) {
                console.error(`Error reading or parsing ${file}:`, error);
            }
    //    }
    });
    
    // Convert to JSON format with pretty printing
   // const myJSON = JSON.stringify(EShopOrders, null, 2);
    
    // Set response content-type to JSON (if using Express, for example)
    // res.setHeader('Content-Type', 'application/json');
    
   // console.log(myJSON);
    

   return NextResponse.json(EShopOrders);

    //my code 

// console.log(req)
//     const data = fs.readFileSync('temp/order_17401452.json');
// //console.log(JSON.parse(data));
// console.log(data)
// const Filereaded = JSON.parse(data);

//     return NextResponse.json(Filereaded);
}