import '@/styles/globals.css';

// 這是 Next.js 的全域設定檔
// 我們在這裡引入了 Tailwind CSS 的樣式
// 讓整個網站都能使用 Tailwind 的樣式類別

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
