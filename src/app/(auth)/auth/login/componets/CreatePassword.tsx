'use client'

import { Card } from "../../../../../components/ui/card"
import { FormEvent } from "react"
//import { signIn } from "next-auth/react";// useSession
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CreatePassword = () => {

  

  const router = useRouter();

async function submitHandler(event:FormEvent<HTMLFormElement>){

event.preventDefault();
const formData = new FormData(event.currentTarget);

const loginData = {
  
  id: "kjlkjl",
  email: formData.get('email'),
  password: formData.get('password'),
 redirect: true,//if set ture, midleware will work, if set false response signIn responce will redirect
  callbackUrl:"/user"
}

//const response  = await signIn('credentials', loginData);



// if(!response?.error){
//   console.log("login--------")
//  if(response?.role === 'admin'){
//   router.push('/admin');
//  } 
//  if(response?.role === 'user'){
//   router.push('/user');
//  } 
// // router.push('/');
// // router.refresh();

// }

}


//console.log("session")

  return (
    
    <Card className="  lg:w-[70%] m-auto p-12" >
   <h1 className="text-md">Enter eamil</h1>
  
    <form onSubmit={submitHandler}>
      <div className="flex w-full flex-col gap-8  my-15 ">

        {/* register your input into the hook by invoking the "register" function */}
        <div className="flex flex-col gap-1">
          <label className="label-style">Email</label>
          <input 
          type="email" name="email" id="email"  defaultValue='g@mail.com'
          className="input-style" />
          <p className="text-[0.8rem] font-medium text-destructive">
          
          </p>
        </div>

        {/* <div className="flex flex-col gap-1">
          <label className="label-style">Password</label>
          <input
           type="password" name="password" id="password"  defaultValue='123456'
            className="input-style"
          />

          <p className="text-[0.8rem] font-medium text-destructive">
           
          </p>
        </div> */}

<p className="text-sm">Create or change Password if allready register email</p>
       
        <Button type="submit">Reset Password </Button>
      </div>
    </form>


    </Card>

 
  )
}

export default CreatePassword