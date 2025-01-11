import { AvatarComponent } from "@rainbow-me/rainbowkit";
import { shortenAddress } from "@/utils/shortenAddress";

const generateColorFromAddress = (address: string) => {
  // 生成一个颜色哈希值
  const hash = parseInt(address.slice(2, 10), 16);
  const color = `hsl(${hash % 360}, 50%, 50%)`;
  return color;
};

const CustomWalletAvatar: AvatarComponent = ({ address, ensImage, size }) => {
  return ensImage ? (
    <img
      src={ensImage}
      width={size}
      height={size}
      style={{ borderRadius: 999 }}
    />
  ) : (
    <div
      style={{
        backgroundColor: generateColorFromAddress(address),
        borderRadius: 999,
        height: size,
        width: size,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <span className="text-xs">{shortenAddress(address)}</span>
    </div>
  );
};

export default CustomWalletAvatar;
