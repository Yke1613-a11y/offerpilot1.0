import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // 如果没有配置，返回一个空客户端或抛出错误
  if (!supabaseUrl || !supabaseKey) {
    // 返回一个最小化的客户端，避免构建错误
    return createBrowserClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createBrowserClient(supabaseUrl, supabaseKey);
}