import { observable, decorate, autorun, set, action } from "mobx";
import introJs from "intro.js";
import RootStore from "./index";
import { delay } from "../utils/promise";

const extendStoreFromLocalStorage = (store: TutorialStore) => {
  let firstRun = true;

  if (typeof window === "undefined") {
    return;
  }

  // will run on change
  autorun(() => {
    // on load check if there's an existing store on localStorage and extend the store
    if (firstRun) {
      const existingStore = window.localStorage.getItem("tutorialStore");

      if (existingStore) {
        set(store, JSON.parse(existingStore));
      }
    }

    // from then on serialize and save to localStorage
    window.localStorage.setItem(
      "tutorialStore",
      JSON.stringify({
        hasSeenUserDashboardTutorial: store.hasSeenUserDashboardTutorial,
      })
    );
  });

  firstRun = false;
};

const getUserDashboardSteps = (t: any) => [
  {
    element: `#lendBox`,
    intro: t(`tutorial.step1`),
  },
  {
    element: `#lendBox .action-block`,
    intro: t(`tutorial.step2`),
  },
  {
    element: `#lendBox .header-stats`,
    intro: t(`tutorial.step3`),
  },
  {
    element: `#vigorLoansBox .collateral`,
    intro: t(`tutorial.step4`),
  },
  {
    element: `#lendBox .insurance`,
    intro: t(`tutorial.step5`),
  },
  {
    element: `#lendBox .insurance`,
    intro: t(`tutorial.step6`),
  },
  {
    element: `#lendBox .insurance`,
    intro: t(`tutorial.step7`),
  },
  {
    element: `#vigorLoansBox .collateral`,
    intro: t(`tutorial.step8`),
  },
  {
    element: `#vigorLoansBox .loan`,
    intro: t(`tutorial.step9`),
    position: "bottom-middle-aligned",
  },
  {
    element: `#vigorLoansBox .loan`,
    intro: t(`tutorial.step10`),
    position: "bottom-middle-aligned",
  },
  {
    element: `#vigorLoansBox .loan`,
    intro: t(`tutorial.step11`),
    position: "bottom-middle-aligned",
  },
  {
    element: `#vigorLoansBox .loan`,
    intro: t(`tutorial.step12`),
    position: "bottom-middle-aligned",
  },
];

export default class TutorialStore {
  rootStore: RootStore;
  hasSeenUserDashboardTutorial: boolean;

  constructor(rootStore: RootStore) {
    this.rootStore = rootStore;
    this.hasSeenUserDashboardTutorial = false;

    extendStoreFromLocalStorage(this);
  }

  async init() {};

  showUserDashboardTutorial = async (t: any) => {
    const intro = introJs();
    intro.setOptions({
      steps: getUserDashboardSteps(t),
      showBullets: false,
      showButtons: true,
      showProgress: true,
      exitOnOverlayClick: false,
      showStepNumbers: false,
      keyboardNavigation: true,
    });

    if(!this.hasSeenUserDashboardTutorial) {
      // wait some seconds when loading the page for the first time
      await delay(1500);
      this.hasSeenUserDashboardTutorial = true;
    }
    intro.start();
  };
}

decorate(TutorialStore, {
  hasSeenUserDashboardTutorial: observable,
  showUserDashboardTutorial: action,
});
