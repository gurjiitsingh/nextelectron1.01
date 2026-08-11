
import { NextRequest, NextResponse } from "next/server";
import fs from 'fs';
export const revalidate = 0;

export async function POST(req:NextRequest){
// THIS API ENDPOINT RECEIVE STATUS
//const myResponse =  req.body;

const jsonData = await req.json();
// jsonData.message
// jsonData.ordersid
// jsonData.trackingstatus
//console.log("inside send tracking status--------",jsonData.ordersid);

const filePath = 'temp/order_'+jsonData.ordersid+'.json'; 
//console.log(" file to delete --------",filePath);
fs.unlinkSync(filePath);

return NextResponse.json({"status":"ok"});
}



// function handler(req, res) { 
//     if (req.method === 'POST') 
//     { const data = req.body; // This will contain your JSON data
        
//      res.orderStatus(200).json({ message: "Data received", data }); } 
//      else 
//      { 
//         res.setHeader('Allow', ['POST']); 
//         res.orderStatus(405).end(`Method ${req.method} Not Allowed`);
//      } 
//     } 