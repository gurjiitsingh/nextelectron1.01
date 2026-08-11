
import { NextResponse, NextRequest } from 'next/server';

export async function DELETE(req: NextRequest) {
    const { id } = await req.json();
   // const { id } = req.body;  
      console.log("Delete api ----", id)
//const result = await db.delete(category).where(eq(category.id, id))
return Response.json({id})
}