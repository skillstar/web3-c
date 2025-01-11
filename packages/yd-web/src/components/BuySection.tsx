"use client";
import IncrementAnimation from "./uc/IncrementAnimation";
import BuyYD from "./BuyYD";

function BuySection() {
  return (
    <div className="flex gap-8 items-center backdrop-blur-md rounded-lg">
      {/* 左侧部分，占据一半宽度 */}
      <div className="flex-1">
        <BuyYD />
      </div>

      {/* 右侧部分，占据一半宽度 */}
      <div className="flex-1 space-y-2">
        <h1 className="font-bold  text-3xl text-primary-light">
          Welcome to Web3 College!
        </h1>
        <p className="text-gray-300">
          Master Web3 development with technologies like React, Next.js, and
          more.
        </p>
        <div className="flex gap-4 mt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-light">
              <IncrementAnimation targetValue={50} duration={1000} />+
            </div>
            <div className="text-sm text-gray-400">Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-light">24/7</div>
            <div className="text-sm text-gray-400">Support</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-light">
              <IncrementAnimation targetValue={1000} duration={5000} />+
            </div>
            <div className="text-sm text-gray-400">Students</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BuySection;
