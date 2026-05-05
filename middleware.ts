import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Routes that require admin role
  const adminRoutes = ['/admin'];

  // Check if the current path is an admin route
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));

  if (isAdminRoute) {
    // Middleware chỉ kiểm tra basic path, client-side sẽ kiểm tra token chi tiết
    // vì token được lưu ở localStorage
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};

