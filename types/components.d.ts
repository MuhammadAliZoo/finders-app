declare module '@/components/ClaimCompletionPopup' {
  import { ReactNode } from 'react';

  interface ClaimCompletionPopupProps {
    visible: boolean;
    onYes: () => void;
    onNo: () => void;
    onClose: () => void;
  }

  export const ClaimCompletionPopup: React.FC<ClaimCompletionPopupProps>;
} 