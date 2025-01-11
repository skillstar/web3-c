"use client";
import Header from "@/app/components/header";
import BuySection from "@/components/BuySection";
import CourseList from "@/components/CourseList";
import Footer from "@/app/components/Footer";
import ThreeCanvas from "@/components/ThreeCanvas";

function App() {
  return (
    // 给最外层容器添加 relative 和 z-index 创建堆叠上下文
    <div className="relative min-h-screen bg-dark-light text-gray-900 p-6">
      <Header />
      <ThreeCanvas />
      {/* 确保 main 有更高的 z-index */}
      <main className="relative max-w-4xl mx-auto mt-32 z-1">
        <BuySection />
        <section>
          <CourseList></CourseList>
        </section>
      </main>
      {/* 给 Footer 添加相对定位和 z-index */}
      <Footer />
    </div>
  );
}
export default App;
