// ProgressTracker.tsx  
import { useState } from 'react';  
import { useAccount, useWriteContract } from 'wagmi';  

const BACKEND_URL = 'http://localhost:3000';  

export function ProgressTracker({ courseId }: { courseId: number }) {  
    const { address } = useAccount();  
    const { writeContract } = useWriteContract();  
    const [isUpdating, setIsUpdating] = useState(false);  

    const updateProgress = async (progress: number) => {  
        if (!address) return;  
        
        try {  
            setIsUpdating(true);  
            
            const response = await fetch(`${BACKEND_URL}/progress`, {  
                method: 'POST',  
                headers: { 'Content-Type': 'application/json' },  
                body: JSON.stringify({  
                    userAddress: address,  
                    courseId,  
                    progress  
                })  
            });  

            if (!response.ok) {  
                const errorData = await response.json();  
                throw new Error(errorData.message);  
            }  

            const { signature, deadline } = await response.json();  

            await writeContract({  
                address: CONTRACT_ADDRESS,  
                abi: CONTRACT_ABI,  
                functionName: 'updateProgressWithSignature',  
                args: [address, courseId, progress, deadline, signature]  
            });  

        } catch (error) {  
            console.error('Failed to update progress:', error);  
        } finally {  
            setIsUpdating(false);  
        }  
    };  

    return (  
        <div>  
            <button   
                onClick={() => updateProgress(50)}   
                disabled={isUpdating}  
            >  
                {isUpdating ? 'Updating...' : 'Update Progress'}  
            </button>  
        </div>  
    );  
}