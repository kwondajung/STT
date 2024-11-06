"use client";

import Header from "@/components/header/Header";
import "../globals.css";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Navibar from "@/components/nav/Navibar";
import { usePathname } from "next/navigation";

export default function MobileLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  // pathname이 null이 아니면 특정 경로에서 헤더와 푸터 숨기기
  // const hideHeaderFooter = pathname !== null && ["/loginInfo/*"].includes(pathname);
  const hideHeaderFooter = pathname === "/loginInfo" || pathname?.startsWith("/lesson/room");

  return (
    <div>
      {/* <div className="w-full flex flex-col min-w-[320px] max-w-[600px] px-4 mx-auto my-0  min-h-full"> */}
      <div className="w-[375px] flex flex-col mx-auto my-0  min-h-full">
        {!hideHeaderFooter && <Header />}
        <div className="mx-4">
          <main>{children}</main>
        </div>
        {!hideHeaderFooter && <Navibar />}
      </div>
    </div>
  );
}
