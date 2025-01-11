"use client";  

import { useState } from 'react';  
import { Pencil } from 'lucide-react';  

// 更新接口定义，包含 onEditAvatar  
interface EditableAvatarProps {  
  avatarSrc?: string;  
  onEditAvatar?: () => void; // 添加这个属性  
}  

export default function EditableAvatar({   
  avatarSrc = "/default-avatar.png",   
  onEditAvatar   
}: EditableAvatarProps) {  
  const [isOpen, setIsOpen] = useState(false);  

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {  
    const file = event.target.files?.[0];  
    if (file) {  
      // 处理文件上传逻辑  
      console.log('上传的文件:', file);  
      onEditAvatar?.(); // 安全调用  
      setIsOpen(false);  
    }  
  };  

  const handleEditClick = () => {  
    setIsOpen(true);  
    onEditAvatar?.();  
  };  

  return (  
    <div className="relative group">  
      <div className="avatar">  
        <div className="w-24 rounded-full ring ring-primary-light ring-offset-base-100 ring-offset-2 relative overflow-hidden">  
          <img   
            src={avatarSrc}   
            alt="Avatar"   
            className="w-full h-full object-cover"  
          />  
          <label   
            htmlFor="avatar-modal"   
            className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center cursor-pointer"  
            onClick={handleEditClick}  
          >  
            <Pencil className="opacity-0 group-hover:opacity-100 w-5 h-5 text-white" />  
          </label>  
        </div>  
      </div>  

      <input   
        type="checkbox"   
        id="avatar-modal"   
        className="modal-toggle"   
        checked={isOpen}   
        onChange={() => setIsOpen(!isOpen)}   
      />  
      <div className="modal" role="dialog">  
        <div className="modal-box">  
          <h3 className="font-bold text-lg">更改头像</h3>  
          <div className="py-4">  
            <input   
              type="file"   
              accept="image/*"  
              onChange={handleFileUpload}  
              className="file-input file-input-bordered w-full max-w-xs"   
            />  
          </div>  
          <div className="modal-action">  
            <label   
              htmlFor="avatar-modal"   
              className="btn"  
              onClick={() => setIsOpen(false)}  
            >  
              关闭  
            </label>  
          </div>  
        </div>  
      </div>  
    </div>  
  );  
}