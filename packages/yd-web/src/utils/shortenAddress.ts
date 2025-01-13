import { formatUnits, parseUnits } from 'viem';  

export const shortenAddress = (address: string | undefined): string => {  
  if (!address) return "";  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;  
};  

/**  
 * 格式化以太坊地址，显示前5个和后3个字符  
 * @param address 完整的以太坊地址  
 * @returns 格式化后的地址  
 */  
export function formatAddress(address: string): string {  
  if (!address || address.length <= 10) return address;  
  
  return `${address.slice(0, 6)}...${address.slice(-4)}`;  
}  


/**  
 * 截断文本并添加省略号  
 * @param text 要截断的文本  
 * @param maxLength 最大允许长度  
 * @param ellipsis 省略号，默认为 '...'  
 * @returns 截断后的文本  
 */  
export function truncateText(  
  text: string,   
  maxLength: number,   
  ellipsis: string = '...'  
): string {  
  // 如果文本为空或长度小于等于最大长度，直接返回原文本  
  if (!text || text.length <= maxLength) {  
    return text;  
  }  

  // 截断并添加省略号  
  return text.slice(0, maxLength).trim() + ellipsis;  
}  


export const formatBalance = (balance: string | undefined, symbol: string | undefined): string => {  
  if (!balance || !symbol) return "";  
  const formattedBalance = parseFloat(balance).toFixed(4);  
  return `${formattedBalance} ${symbol}`;  
};


// 添加代币单位转换函数  
export const formatTokenAmount = (amount: number | bigint) => {  
  // 假设代币精度为18，如果不是请调整这个值  
  const decimals = 18;  
  const value = Number(amount) / (10 ** decimals);  
  
  // 移除末尾多余的0  
  return value.toString().replace(/\.?0+$/, '');  
}; 

export const formatNumber = (num: number) => {  
  return Number(num.toFixed(6))  
    .toString()  
    .replace(/\.?0+$/, '');  
};  

export const formatTokenBalance = (value: number): string => {  
  // 处理 0 或非数字情况  
  if (!value || isNaN(value)) return '0';  
  
  // 如果数字小于 0.000001，显示最多 6 位小数  
  if (value < 0.000001) {  
    return value.toFixed(6);  
  }  

  // 否则使用 toLocaleString 并限制小数位数  
  return value.toLocaleString('en-US', {  
    minimumFractionDigits: 0,  
    maximumFractionDigits: 4  
  });  
}; 

export const formatTokenUnits = (  
  amount: bigint | number | string,  
  decimals: number = 18,  
  displayDecimals: number = 2  
): string => {  
  try {  
    // 去除末尾的0和小数点  
    const removeTrailingZeros = (numStr: string): string => {  
      return numStr.replace(/\.?0+$/, '');  
    };  

    // 如果输入已经是数字或字符串形式  
    if (typeof amount === 'number' || typeof amount === 'string') {  
      const number = Number(amount);  
      
      if (isNaN(number)) return '0';  
      if (number === 0) return '0';  
      
      // 非常小的数字使用科学计数法  
      if (number < 0.000001) {  
        return number.toExponential(2);  
      }  
      
      // 小于 1 的数字显示更多小数位  
      if (number < 1) {  
        return removeTrailingZeros(number.toFixed(6));  
      }  
      
      // 正常显示固定小数位，去掉末尾的0  
      return removeTrailingZeros(number.toFixed(displayDecimals));  
    }  
    
    // 如果输入是 bigint，需要先格式化  
    const formatted = formatUnits(amount, decimals);  
    return formatTokenUnits(formatted, decimals, displayDecimals);  
    
  } catch (error) {  
    console.error('Format token amount error:', error);  
    return '0';  
  }  
};  