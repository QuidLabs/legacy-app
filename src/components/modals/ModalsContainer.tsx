import React from 'react';
import { inject, observer } from 'mobx-react';

import { MODAL_TYPES } from '../../store/modal';
import ConfirmationModal from './Confirm';
import VigFeeBorrowConfirmationModal from './VigFeeBorrowConfirmation';
import { useStore } from '../../store/use-store';
import SignConstitutionModal from './SignConstitutionModal';
import DisclaimerModal from './DisclaimerModal';
import UserOpeningModal from './UserOpeningModal';
import AmountModal from './AmountModal';
import DepositWithdrawFeesModal from './DepositWithdrawFeesModal';

const ModalsContainer:React.FC<{}> = () => {
  const modalStore = useStore(store => store.modalStore)

  return (
    <div>
      {
        modalStore!.modals.map(modal => {
          switch (modal.type) {
            case MODAL_TYPES.CONFIRM:
              return <ConfirmationModal key={modal.type} modal={modal} />;
            case MODAL_TYPES.CONSTITUTION:
              return <SignConstitutionModal key={modal.type} modal={modal} />
            case MODAL_TYPES.DISCLAIMER:
              return <DisclaimerModal key={modal.type} modal={modal} />
            case MODAL_TYPES.USER_OPEN:
              return <UserOpeningModal key={modal.type} modal={modal} />
            case MODAL_TYPES.PROMPT_AMOUNT:
              return <AmountModal key={modal.type} modal={modal} />
            case MODAL_TYPES.DEPOSIT_WITHDRAW_FEES:
              return <DepositWithdrawFeesModal key={modal.type} modal={modal} />
            case MODAL_TYPES.CONFIRM_VIGFEE_BORROW:
              return <VigFeeBorrowConfirmationModal key={modal.type} modal={modal} />;
            default:
              return null;
          }
        })
      }
    </div>
  )
}

export default observer(ModalsContainer);
