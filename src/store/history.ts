import { decorate } from "mobx";
import RootStore from "./index";
import { toast } from "react-toastify";

const historyApiBaseUrl = 'https://api.vigorexplorer.com';
const config = {
  itemsPerPage: 15,
};

export default class HistoryStore {
  rootStore: RootStore;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
  }

  init = async () => {
    // return Promise.all([
    //   this.fetchTransfers(),
    //   this.fetchBailouts()
    // ])
  };

  public fetchTransfers = async (accountName:string, page:number) => {
    try {
      return fetch(`${historyApiBaseUrl}/accountTransfers/${accountName}?skip=${config.itemsPerPage * page}&limit=${config.itemsPerPage}&rows=false&diff=false`)
        .then(response => response.json())
        .then(result => {
          if (!result.length) {
            return [];
          }

          return result;
        });
    } catch (e) {
      toast.error(e.message, { toastId: "fetchTransfers" });
      console.error(e.message);
    }
  };

  public fetchBailouts = async (accountName:string, page:number) => {
    try {
      return fetch(`${historyApiBaseUrl}/accountBailouts/${accountName}?skip=${config.itemsPerPage * page}&limit=${config.itemsPerPage}`)
        .then(response => response.json())
        .then(result => {
          if (!result.length) {
            return [];
          }

          return result;
        });

    } catch (e) {
      toast.error(e.message, { toastId: "fetchBailouts" });
      console.error(e.message);
    }
  };
}

decorate(HistoryStore, {
  // computed properties
  // actions
});
