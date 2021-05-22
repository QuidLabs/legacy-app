import { observable, action, decorate } from "mobx";
import RootStore from ".";

export enum MODAL_TYPES {
  CONFIRM,
  CONSTITUTION,
  DISCLAIMER,
  USER_OPEN,
  PROMPT_AMOUNT,
  CONFIRM_VIGFEE_BORROW,
  DEPOSIT_WITHDRAW_FEES,
}

export class ModalItem<T = any> {
  modalStore: ModalStore;
  type: MODAL_TYPES;
  data: T;
  resolvePromise: (args: any) => any;

  constructor(
    modalStore: ModalStore,
    type: MODAL_TYPES,
    dialogData: any,
    resolvePromise: (args: any) => any
  ) {
    this.modalStore = modalStore;
    this.type = type;
    this.data = dialogData;
    this.resolvePromise = resolvePromise;
  }

  cancel = () => {
    this.resolvePromise({ canceled: true });
    this.modalStore.modals.remove(this);
  };

  submit = (data: T) => {
    this.resolvePromise({ canceled: false, data });
    this.modalStore.modals.remove(this);
  };
}

decorate(ModalItem, {
  data: observable,
});

type OpenModalResult = {
  canceled: boolean;
  data: any;
};

export default class ModalStore {
  rootStore: RootStore;
  modals = observable.array<ModalItem>([]);

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  openModal = async (
    type: MODAL_TYPES,
    dialogData?: any
  ): Promise<OpenModalResult> => {
    return new Promise<OpenModalResult>((resolve) => {
      this.modals.push(new ModalItem(this, type, dialogData, resolve));
    }).catch((error) => {
      console.error(`Error in openModal`, error.message);
      return {
        canceled: true,
        data: null,
      };
    });
  };
}

decorate(ModalStore, {
  modals: observable,
  openModal: action,
});
