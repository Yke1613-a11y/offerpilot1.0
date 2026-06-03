import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 公开路径 - 不需要验证
  if (pathname === '/invite' || pathname.startsWith('/invite')) {
    return NextResponse.next();
  }
  
  // 静态资源和 API 不需要验证
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.') // 静态文件
  ) {
    return NextResponse.next();
  }
  
  // 检查是否有邀请码 Cookie
  const cookies = request.cookies.getAll();
  let isVerified = false;
  
  for (const cookie of cookies) {
    if (cookie.name === 'offerpilot_verified' && cookie.value === 'true') {
      isVerified = true;
      break;
    }
  }
  
  // 如果访问受保护的路径且没有验证 Cookie，重定向到邀请码页面
  if (!isVerified) {
    const inviteUrl = new URL('/invite', request.url);
    return NextResponse.redirect(inviteUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};