"use client";
import React from "react";
import { useForm } from "react-hook-form"; //, Controller
import { zodResolver } from "@hookform/resolvers/zod";
import { emailZ, TemailZ } from "@/lib/types/addressType";
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

  const {
    register,
    formState: { errors }, //, isSubmitting
    handleSubmit,
    // reset,
    //setValue,
    // getValues,
    // setError,
  } = useForm<TemailZ>({
    resolver: zodResolver(emailZ),
  });
  //const userEmail = session?.user?.email as string;
  // if (session !== null) {
  //   //  setValue("email", userEmail);
  // }

  async function onSubmit(data: TemailZ) {
    // const formData = new FormData();
    // formData.append("email", data.email);
    setCustomerAddressIsComplete(false)
    emailFormToggle(false);
    setCustomerEmailG(data.email);
    router.push(`/checkout`);
  }

  return (
    <div className="z-50 fixed inset-0 flex items-center justify-center backdrop-blur-lg p-4">
      <div className="w-full md:w-[50%] lg:w-[30%]   rounded-2xl mx-auto flex flex-col items-center justify-center bg-slate-100 border border-slate-300">
        <div className="flex flex-col  w-full px-2 p-2">
          <div className="flex justify-end w-full">
            <div>
              <button
                className="px-2 py-1 bg-slate-200 rounded-md w-fit"
                onClick={() => {
                  emailFormToggle(false);
                }}
              >
                <IoClose />
              </button>
            </div>
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg text-slate-500 font-semibold ">
              Email
            </h2>
          </div>
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* <input {...register("orderDetail")} hidden /> */}
            <div className="flex w-full flex-col gap-2  my-1  ">
              <div className="flex flex-col gap-1">
                <label className="label-style">
                  Email<span className="text-red-500"></span>
                </label>
                <input
                  {...register("email", {
                    onChange: (e) => {
                      handleEmailChange(e);
                    },
                  })}
                  className="input-style"
                />
              {errors.email?.message && (
  <span className="text-[0.8rem] font-medium text-destructive">
    {errors.email.message}
  </span>
)}
              </div>

            
              <Button
                className="w-[200px] py-1 text-center bg-yellow-500 rounded-2xl text-[.8rem]"
                type="submit"
              >
                Submit
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProccedWithEmail;
