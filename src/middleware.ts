import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 临时禁用邀请码验证，方便调试
// 恢复时删除整个文件或取消下面的注释

export function middleware(request: NextRequest) {
  // 直接放行所有请求
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};