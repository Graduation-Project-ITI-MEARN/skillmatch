import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { email, password } = body;

      // 1. Call your backend API
      const backendResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
         {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify({ email, password }),
         }
      );

      const responseData = await backendResponse.json();

      // 2. DEBUG: Log what the backend actually sent
      console.log(
         "Backend Login Response:",
         JSON.stringify(responseData, null, 2)
      );

      if (!backendResponse.ok) {
         return NextResponse.json(
            { success: false, message: responseData.message || "Login failed" },
            { status: backendResponse.status }
         );
      }

      // 3. SAFE EXTRACTION: Check if user is in .data or at the root
      const payload = responseData.data || responseData;
      const user = payload?.user;
      const token = payload?.token;

      // 4. Validate to prevent crash
      if (!user || !token) {
         console.error("Missing user or token in response:", responseData);
         return NextResponse.json(
            { success: false, message: "Invalid server response structure" },
            { status: 500 }
         );
      }

      // 5. Determine Redirect URL
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

      const res = NextResponse.json({
         success: true,
         message: "Login successful",
         redirectUrl,
         user: user,
      });

      // 6. Set Cookies

      // A. HttpOnly Token (Secure)
      res.cookies.set("auth_token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7, // 7 days
         path: "/",
      });

      // B. Readable Cookies for Angular Guards
      // We convert to String() to ensure no 'undefined' errors
      res.cookies.set("user_role", String(user.role || ""), {
         httpOnly: false,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7,
         path: "/",
      });

      res.cookies.set("user_type", String(user.type || ""), {
         httpOnly: false,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7,
         path: "/",
      });

      return res;
   } catch (error) {
      console.error("Login API error:", error);
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
