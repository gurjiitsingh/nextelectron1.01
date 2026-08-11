import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const pathname = req.nextUrl.pathname;
  const session = req.auth;

  // ==========================================
  // Not logged in
  // ==========================================
  if (!session) {
    if (
      pathname.startsWith("/admin") ||
      pathname.startsWith("/driver") ||
      pathname.startsWith("/chef") ||
      pathname.startsWith("/storekeeper") ||
      pathname.startsWith("/salemanager") ||
      pathname.startsWith("/productionmanager") ||
       pathname.startsWith("/dispatchOperator") ||
      pathname.startsWith("/employee") ||
      pathname.startsWith("/dashboard")
    ) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    return NextResponse.next();
  }

  const role = session.user?.role;

  // ==========================================
  // Login page -> redirect logged-in users
  // ==========================================

  if (pathname === "/login") {
    switch (role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin", req.url));

      case "productionmanager":
        return NextResponse.redirect(new URL("/productionmanager", req.url));

         case "salemanager":
        return NextResponse.redirect(new URL("/salemanager", req.url));

         case "driver":
        return NextResponse.redirect(new URL("/driver", req.url));

         case "employee":
        return NextResponse.redirect(new URL("/employee", req.url));

         case "dispatchOperator":
        return NextResponse.redirect(new URL("/dispatchOperator", req.url));


      case "chef":
        return NextResponse.redirect(new URL("/chef", req.url));

      case "storeKeeper":
        return NextResponse.redirect(
          new URL("/storeKeeper", req.url)
        );

      default:
        return NextResponse.next();
    }
  }

  // ==========================================
  // Dashboard -> role dashboard
  // ==========================================

  if (pathname === "/dashboard") {
    switch (role) {
      case "admin":
        return NextResponse.redirect(new URL("/admin", req.url));

      case "driver":
        return NextResponse.redirect(new URL("/driver", req.url));

      case "chef":
        return NextResponse.redirect(new URL("/chef", req.url));

      case "storeKeeper":
        return NextResponse.redirect(
          new URL("/storeKeeper", req.url)
        );

      default:
        return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // ==========================================
  // Protect admin
  // ==========================================

  if (
    pathname.startsWith("/admin") &&
    role !== "admin"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // ==========================================
  // Protect driver
  // ==========================================

  if (
    pathname.startsWith("/driver") &&
    role !== "driver"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // ==========================================
  // Protect chef
  // ==========================================

  if (
    pathname.startsWith("/chef") &&
    role !== "chef"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  // ==========================================
  // Protect storeKeeper
  // ==========================================

  if (
    pathname.startsWith("/storeKeeper") &&
    role !== "storeKeeper"
  ) {
    return NextResponse.redirect(
      new URL("/dashboard", req.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/login",
    "/dashboard",
    "/admin/:path*",
    "/driver/:path*",
    "/chef/:path*",
    "/storeKeeper/:path*",
  ],
};



// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// function decodeJwt(token: string) {
//   try {
//     const payload = token.split(".")[1];
//     return JSON.parse(atob(payload));
//   } catch {
//     return null;
//   }
// }

// export function proxy(req: NextRequest) {
//   const token = req.cookies.get("rbeas_token")?.value;
//   const path = req.nextUrl.pathname;

//   // ==========================================
//   // LOGIN PAGE
//   // ==========================================

//   if (path === "/login") {
//     if (!token) {
//       return NextResponse.next();
//     }

//     const decoded = decodeJwt(token);

//     if (
//       !decoded ||
//       (decoded.exp && Date.now() >= decoded.exp * 1000)
//     ) {
//       return NextResponse.next();
//     }

//     switch (decoded.role) {
//       case "admin":
//         return NextResponse.redirect(new URL("/admin", req.url));

//       case "driver":
//         return NextResponse.redirect(new URL("/driver", req.url));

//       case "chef":
//         return NextResponse.redirect(new URL("/chef", req.url));

//       case "storeKeeper":
//         return NextResponse.redirect(
//           new URL("/storeKeeper", req.url)
//         );

//       default:
//         return NextResponse.next();
//     }
//   }

//   // ==========================================
//   // PROTECTED ROUTES
//   // ==========================================

//   if (
//     path.startsWith("/dashboard") ||
//     path.startsWith("/admin") ||
//     path.startsWith("/driver") ||
//     path.startsWith("/chef") ||
//     path.startsWith("/storeKeeper")
//   ) {
//     if (!token) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     const decoded = decodeJwt(token);

//     if (!decoded?.role) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     // token expired
//     if (
//       decoded.exp &&
//       Date.now() >= decoded.exp * 1000
//     ) {
//       return NextResponse.redirect(new URL("/login", req.url));
//     }

//     // ==========================================
//     // DASHBOARD REDIRECT
//     // ==========================================

//     if (path === "/dashboard") {
//       switch (decoded.role) {
//         case "admin":
//           return NextResponse.redirect(
//             new URL("/admin", req.url)
//           );

//         case "driver":
//           return NextResponse.redirect(
//             new URL("/driver", req.url)
//           );

//         case "chef":
//           return NextResponse.redirect(
//             new URL("/chef", req.url)
//           );

//         case "storeKeeper":
//           return NextResponse.redirect(
//             new URL("/storeKeeper", req.url)
//           );

//         default:
//           return NextResponse.redirect(
//             new URL("/login", req.url)
//           );
//       }
//     }

//     // ==========================================
//     // ROLE PROTECTION
//     // ==========================================

//     if (
//       path.startsWith("/admin") &&
//       decoded.role !== "admin"
//     ) {
//       return NextResponse.redirect(
//         new URL("/dashboard", req.url)
//       );
//     }

//     if (
//       path.startsWith("/driver") &&
//       decoded.role !== "driver"
//     ) {
//       return NextResponse.redirect(
//         new URL("/dashboard", req.url)
//       );
//     }

//     if (
//       path.startsWith("/chef") &&
//       decoded.role !== "chef"
//     ) {
//       return NextResponse.redirect(
//         new URL("/dashboard", req.url)
//       );
//     }

//     if (
//       path.startsWith("/storeKeeper") &&
//       decoded.role !== "storeKeeper"
//     ) {
//       return NextResponse.redirect(
//         new URL("/dashboard", req.url)
//       );
//     }
//       console.log("ROLE:-----------------", decoded.role);
// console.log("PATH:--------------------------", path);
//   }


//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/login",
//     "/dashboard",
//     "/admin/:path*",
//     "/driver/:path*",
//     "/chef/:path*",
//     "/storeKeeper/:path*",
//   ],
// };

// export default proxy;

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function proxy(req: NextRequest) {
//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/admin/:path*"],
// };