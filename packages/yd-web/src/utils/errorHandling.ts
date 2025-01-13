// utils/errorHandling.ts  
export const parseContractError = (error: any): string => {  
  const errorMessage = error.message || '';  
  console.log('Contract error:', errorMessage);  // 调试用  

  // 解析错误参数  
  const getErrorParams = (msg: string) => {  
    const matches = msg.match(/\((.*?)\)/);  
    return matches ? matches[1].split(',').map(s => s.trim()) : [];  
  };  

  // 处理自定义错误  
  if (errorMessage.includes('UnauthorizedAccess')) {  
    const [caller, owner] = getErrorParams(errorMessage);  
    return `您的地址 (${caller}) 没有权限执行此操作。只有合约所有者 (${owner}) 才能进行此操作。`;  
  }  

  if (errorMessage.includes('InvalidCourseId')) {  
    const [courseId, maxCourseId] = getErrorParams(errorMessage);  
    return `课程ID (${courseId}) 无效。有效范围为 1-${maxCourseId}。`;  
  }  

  if (errorMessage.includes('CourseNotActive')) {  
    const [courseId, name] = getErrorParams(errorMessage);  
    return `课程 "${name}" (ID: ${courseId}) 当前未激活，无法购买。`;  
  }  

  if (errorMessage.includes('CourseAlreadyPurchased')) {  
    const [courseId, buyer] = getErrorParams(errorMessage);  
    return `您 (${buyer}) 已经购买过课程 (ID: ${courseId})。`;  
  }  

  if (errorMessage.includes('TokenTransferFailed')) {  
    const [from, to, amount] = getErrorParams(errorMessage);  
    return `代币转账失败。从 ${from} 向 ${to} 转账 ${amount} 代币时发生错误。`;  
  }  

  if (errorMessage.includes('InvalidPrice')) {  
    const [price] = getErrorParams(errorMessage);  
    return `输入的价格 (${price}) 无效。价格必须大于0。`;  
  }  

  if (errorMessage.includes('InvalidName')) {  
    const [name] = getErrorParams(errorMessage);  
    return `课程名称无效。名称不能为空。`;  
  }  

  if (errorMessage.includes('InsufficientAllowance')) {  
    const [required, actual] = getErrorParams(errorMessage);  
    return `授权额度不足。需要 ${required} 代币，但只授权了 ${actual} 代币。`;  
  }  

  if (errorMessage.includes('InsufficientBalance')) {  
    const [account, required, actual] = getErrorParams(errorMessage);  
    return `账户 ${account} 余额不足。需要 ${required} 代币，但只有 ${actual} 代币。`;  
  }  

  // 处理钱包和网络错误  
  if (errorMessage.includes('user rejected transaction')) {  
    return '您取消了交易。';  
  }  

  if (errorMessage.includes('insufficient funds for gas')) {  
    return '钱包ETH余额不足以支付 Gas 费用。';  
  }  

  if (errorMessage.includes('network disconnected')) {  
    return '网络连接已断开，请检查您的网络连接。';  
  }  

  if (errorMessage.includes('nonce too low')) {  
    return '交易序号无效，请刷新页面重试。';  
  }  

  // 默认错误消息  
  return '操作失败，请稍后重试。如果问题持续存在，请联系支持。';  
};