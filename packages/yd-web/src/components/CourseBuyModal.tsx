import { useEffect, useRef } from 'react';

interface PurchaseCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalType: 'none' | 'insufficient-approve' | 'already-purchased' | 'attempting' | 'pending' | 'confirming' | 'success' | 'error';
  courseTitle: string;
  price: number;
  errorMessage?: string;
}

export const CourseBuyModal = ({
  isOpen,
  onClose,
  modalType,
  courseTitle,
  price,
  errorMessage
}: PurchaseCourseModalProps) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (isOpen) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen]);

  return (
    <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
      <div className="modal-box bg-base-200">
        <form method="dialog">
          <button 
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 text-primary hover: text-primary-light"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        {modalType === 'already-purchased' && (
          <div className="text-center">
            <h3 className="font-bold text-lg text-warning">Already Purchased</h3>
            <p className="py-4">
              You have already purchased this course. You can access it in your learning dashboard.
            </p>
          </div>
        )}

        {modalType === 'insufficient-approve' && (
          <div className="text-center">
            <h3 className="font-bold text-lg text-error">Insufficient Approval</h3>
            <p className="py-4">
              Your approved amount is less than the course price of {price} YD.
              Please approve a higher amount first.
            </p>
          </div>
        )}

        {modalType === 'success' && (
          <div className="text-center">
            <h3 className="font-bold text-lg text-success">Purchase Successful!</h3>
            <p className="py-4 text-gray-200">
              You have successfully purchased the course: {courseTitle}
            </p>
            <p className='text-gray-200'>
              Amount deducted: {price} YD
            </p>
          </div>
        )}

        {modalType === 'error' && (
          <div className="text-center">
            <h3 className="font-bold text-lg text-error">Purchase Failed</h3>
            <p className="py-4 text-gray-200">
              {errorMessage}
            </p>
          </div>
        )}

        {(modalType === 'pending' || modalType === 'confirming') && (
          <div className="text-center">
            <h3 className="font-bold text-lg">
              {modalType === 'pending' ? 'Processing Purchase' : 'Confirming Purchase'}
            </h3>
            <div className="py-4">
              <p className="mb-4 text-gray-200">
                Please wait while we process your purchase...
              </p>
              <span className="loading loading-spinner loading-lg"></span>
            </div>
          </div>
        )}
      </div>

    </dialog>
  );
};