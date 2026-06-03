import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 公开路径 - 不需要验证
const publicPaths = [
  '/invite',
  '/api/jd/analyze',  // 分析接口需要邀请码，但因为要调用AI，这里暂时放行
];

// 需要验证的路径
const protectedPaths = ['/dashboard', '/'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否有邀请码 Cookie
  const inviteVerified = request.cookies.get('offerpilot_verified');
  
  // 如果访问受保护的路径且没有验证 Cookie，重定向到邀请码页面
  const isProtected = protectedPaths.some(path => pathname.startsWith(path));
  const isPublic = publicPaths.some(path => pathname.startsWith(path));
  
  if (isProtected && !inviteVerified) {
    const inviteUrl = new URL('/invite', request.url);
    inviteUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(inviteUrl);
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};