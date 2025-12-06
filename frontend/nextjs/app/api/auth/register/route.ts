import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { email, password, name, type, lang } = body;

      // Set default if undefined
      const currentLang = lang || "en";

      // Call your backend API
      const backendResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({
               email,
               password,
               name,
               type,
            }),
         }
      );

      const responseData = await backendResponse.json();

      // 1. Log the actual response to the server console for debugging
      console.log("Backend Response:", JSON.stringify(responseData, null, 2));

      if (!backendResponse.ok) {
         return NextResponse.json(
            {
               success: false,
               message: responseData.message || "Registration failed",
            },
            { status: backendResponse.status }
         );
      }

      // 2. Safely extract user and token.
      // Checks if they are in 'responseData.data' OR directly in 'responseData'
      const payload = responseData.data || responseData;
      const user = payload?.user;
      const token = payload?.token;

      // 3. Validation check to prevent the crash
      if (!user || !token) {
         console.error("Missing user or token in response:", responseData);
         throw new Error("Invalid response structure from backend");
      }

      // Determine redirect URL based on role/type
      let redirectUrl = "/dashboard/";
      if (user.role === "admin") {
         redirectUrl += "admin";
      } else if (user.type === "company") {
         redirectUrl += "company";
      } else if (user.type === "candidate") {
         redirectUrl += "candidate";
      } else if (user.type === "challenger") {
         redirectUrl += "challenger";
      }

      // 3. APPEND THE LANG QUERY PARAM
      // This results in: /dashboard/company?lang=ar
      redirectUrl += `?lang=${currentLang}`;

      // Create response with cookies
      const res = NextResponse.json({
         success: true,
         message: "Registration successful",
         redirectUrl,
         user: user,
      });

      // Set httpOnly cookie for JWT token
      res.cookies.set("auth_token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7, // 7 days
         path: "/",
      });

      // Optional: Set a cookie for the language too as a backup
      res.cookies.set("app_lang", currentLang, {
         httpOnly: false,
         path: "/",
         maxAge: 60 * 60 * 24 * 30,
      });

      // Set readable cookies for routing hints
      const userRole = String(user.role || "");
      const userType = String(user.type || "");

      res.cookies.set("user_role", userRole, {
         httpOnly: false,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7,
         path: "/",
      });

      res.cookies.set("user_type", userType, {
         httpOnly: false,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7,
         path: "/",
      });

      return res;
   } catch (error) {
      console.error("Registration API error:", error);
      return NextResponse.json(
         {
            success: false,
            message:
               error instanceof Error ? error.message : "Internal server error",
         },
         { status: 500 }
      );
   }
}
