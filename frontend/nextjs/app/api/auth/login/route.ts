import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      // 1. Receive 'lang' from the frontend request
      const { email, password, lang } = body;

      // Set default if undefined
      const currentLang = lang || "en";

      const backendResponse = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
         {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
         }
      );

      const responseData = await backendResponse.json();

      if (!backendResponse.ok) {
         return NextResponse.json(
            { success: false, message: responseData.message || "Login failed" },
            { status: backendResponse.status }
         );
      }

      const payload = responseData.data || responseData;
      const user = payload?.user;
      const token = payload?.token;

      if (!user || !token) {
         return NextResponse.json(
            { success: false, message: "Invalid server response structure" },
            { status: 500 }
         );
      }

      // 2. Build the Redirect URL
      // If your Dashboard is on a different port (e.g. 4200), you might need the full URL
      // But assuming you handle the domain on the client side, we just return the path.
      let redirectUrl = "/dashboard/";

      if (user.role === "admin") redirectUrl += "admin";
      else if (user.type === "company") redirectUrl += "company";
      else if (user.type === "candidate") redirectUrl += "candidate";
      else if (user.type === "challenger") redirectUrl += "challenger";

      // 3. APPEND THE LANG QUERY PARAM
      // This results in: /dashboard/company?lang=ar
      redirectUrl += `?lang=${currentLang}`;

      const res = NextResponse.json({
         success: true,
         message: "Login successful",
         redirectUrl, // <--- Now contains ?lang=ar
         user: user,
      });

      res.cookies.set("auth_token", token, {
         httpOnly: true,
         secure: process.env.NODE_ENV === "production",
         sameSite: "lax",
         maxAge: 60 * 60 * 24 * 7,
         path: "/",
      });

      // Optional: Set a cookie for the language too as a backup
      res.cookies.set("app_lang", currentLang, {
         httpOnly: false,
         path: "/",
         maxAge: 60 * 60 * 24 * 30,
      });

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
