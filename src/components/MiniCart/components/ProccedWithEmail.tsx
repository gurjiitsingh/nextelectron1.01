"use client";
import React from "react";
import { useForm } from "react-hook-form"; //, Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { customerLookupZ, emailZ, TCustomerLookup, TemailZ } from "@/lib/types/addressType";
import { IoClose } from "react-icons/io5";
import { Button } from "@/components/ui/button";
//import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UseSiteContext } from "@/SiteContext/SiteContext";

const ProccedWithEmail = () => {
 
  const { emailFormToggle, setCustomerEmailG, setCustomerAddressIsComplete } =
    UseSiteContext();
  
  //const { data: session } = useSession();
 
  const router = useRouter();

  // chageDeliveryType("pickup")
  // console.log("session ----------", session)
  async function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {}

  // const {
  //   register,
  //   formState: { errors }, //, isSubmitting
  //   handleSubmit,
  // } = useForm<TemailZ>({
  //   resolver: zodResolver(emailZ),
  // });

  const {
    register,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<TCustomerLookup>({
    resolver: zodResolver(customerLookupZ),
    defaultValues: {
      identifier: "",
    },
  });

  //const userEmail = session?.user?.email as string;
  // if (session !== null) {
  //   //  setValue("email", userEmail);
  // }

  async function onSubmit(data: TCustomerLookup) {

         const identifier =
        data.identifier.trim();
    // const formData = new FormData();
    // formData.append("email", data.email);
    setCustomerAddressIsComplete(false)
    emailFormToggle(false);
    setCustomerEmailG(identifier);
    router.push(`/checkout`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-lg bg-black/20 p-4">
          <div
            className="
              w-full
              max-w-md
              rounded-3xl
              bg-white
              shadow-2xl
              border
              border-neutral-200
              overflow-hidden
            "
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h2 className="text-xl font-semibold">
                  Continue Checkout
                </h2>
    
                <p className="text-sm text-neutral-500">
                  Enter your email or mobile
                  number
                </p>
              </div>
    
              <button
                onClick={() =>
                  emailFormToggle(false)
                }
                className="
                  p-2
                  rounded-xl
                  hover:bg-neutral-100
                  transition
                "
              >
                <IoClose size={20} />
              </button>
            </div>
    
            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="p-5"
            >
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">
                  Email or Phone
                </label>
    
                <input
                  {...register("identifier")}
                  placeholder="9876543210 or abc@gmail.com"
                  autoFocus
                  className="
                    h-12
                    px-4
                    rounded-xl
                    border
                    border-neutral-300
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#00897b]
                  "
                />
    
                {errors.identifier?.message && (
                  <span className="text-sm text-red-500">
                    {errors.identifier.message}
                  </span>
                )}
              </div>
    
              <Button
                type="submit"
                disabled={isSubmitting}
                className="
                  mt-5
                  w-full
                  h-12
                  rounded-xl
                  bg-[#00897b]
                  hover:bg-[#00796b]
                  text-white
                  font-semibold
                "
              >
                {isSubmitting
                  ? "Looking up customer..."
                  : "Continue"}
              </Button>
    
              <p className="text-xs text-center text-neutral-500 mt-4">
                Returning customers will have
                their address and contact
                details filled automatically.
              </p>
            </form>
          </div>
        </div>
//     <div className="z-50 fixed inset-0 flex items-center justify-center backdrop-blur-lg p-4">
//       <div className="w-full md:w-[50%] lg:w-[30%]   rounded-2xl mx-auto flex flex-col items-center justify-center bg-slate-100 border border-slate-300">
//         <div className="flex flex-col  w-full px-2 p-2">
//           <div className="flex justify-end w-full">
//             <div>
//               <button
//                 className="px-2 py-1 bg-slate-200 rounded-md w-fit"
//                 onClick={() => {
//                   emailFormToggle(false);
//                 }}
//               >
//                 <IoClose />
//               </button>
//             </div>
//           </div>
//           <div className="flex flex-col">
//             <h2 className="text-lg text-slate-500 font-semibold ">
//               Email
//             </h2>
//           </div>
//           <form onSubmit={handleSubmit(onSubmit)}>
//             {/* <input {...register("orderDetail")} hidden /> */}
//             <div className="flex w-full flex-col gap-2  my-1  ">
//               <div className="flex flex-col gap-1">
//                 <label className="label-style">
//                   Email<span className="text-red-500"></span>
//                 </label>
//                 <input
//                   {...register("email", {
//                     onChange: (e) => {
//                       handleEmailChange(e);
//                     },
//                   })}
//                   className="input-style"
//                 />
//               {errors.email?.message && (
//   <span className="text-[0.8rem] font-medium text-destructive">
//     {errors.email.message}
//   </span>
// )}
//               </div>

            
//               <Button
//                 className="w-[200px] py-1 text-center bg-yellow-500 rounded-2xl text-[.8rem]"
//                 type="submit"
//               >
//                 Submit
//               </Button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
  );
};

export default ProccedWithEmail;
