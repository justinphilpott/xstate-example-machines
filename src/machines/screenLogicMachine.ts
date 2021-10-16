import { createMachine } from "xstate";
import { createModel } from "xstate/lib/model";

/**
 * Used to control the screen/dialog logic in https://towerofhanoi.app
 * 
 * See visualisation here: https://stately.ai/viz/a089225e-02b9-45e4-864f-1716283596fc
 */

const screenFSMModel = createModel({
  numPegs: 3,
  numDisks: 5,
  gameBoard: Array(),
  showMoves: true,
  showTime: false,
  prevNumDisks: 5,
  prevNumPegs: 3,
});

export interface ScreenContext {
  numDisks: number;
  numPegs: number;
  gameBoard: number[][];
  showMoves: boolean;
  showTime: boolean;
  prevNumDisks: number;
  prevNumPegs: number;
}

export const initialGameBoardState = (
  numPegs: number,
  numDisks: number
): number[][] => {
  const pegs: number[][] = Array(numPegs);
  const firstPeg = Array(numDisks + 1).keys();
  pegs[0] = [...firstPeg]; // place the disks on the first peg
  pegs[0].shift(); // make 1 based

  for (let p = 1; p < numPegs; p++) {
    pegs[p] = Array();
  }

  return pegs;
};

const screenMachine = createMachine<ScreenContext>({
  id: "screenFSM",
  initial: "start",
  context: screenFSMModel.initialContext,
  states: {
    start: {
      on: {
        PLAY: {
          target: "game",
        },
        SETTINGS: {
          target: "settings",
        },
        CREDITS: {
          target: "credits",
        },
        TUTORIAL: {
          target: "tutorial",
        },
      },
    },
    settings: {
      on: {
        SAVE: {
          target: "start",
          actions: ["saveSettings"],
        },
      },
    },
    credits: {
      on: {
        EXIT: {
          target: "start",
        },
      },
    },

    /**
     * Tutorial
     */
    tutorial: {
      entry: ["initializeTutorialState"],
      exit: ["restoreStateAfterTutorial"],

      on: {
        // go to the setting screen
        SETTINGS: {
          target: "settings",
        },
        QUIT: {
          target: "start",
        },
      },
      initial: "default",
      states: {
        default: {
          on: {
            QUITCHECK: {
              target: "quitDialog",
            },
            PLAY: {
              target: "#screenFSM.game",
            },
            RESTART: {
              target: "restartDialog",
            },
          },
        },
        quitDialog: {
          on: {
            STAY: {
              target: "default",
            },
            QUIT: {
              target: "#screenFSM.start",
            },
          },
        },
        restartDialog: {
          on: {
            CANCEL: {
              target: "default",
            },
            RESTARTCONFIRM: {
              target: "default",
            },
          },
        },
      },
    },

    /**
     * Game
     */
    game: {
      entry: ["initializeGameState"], 

      initial: "default",
      states: {
        default: {
          on: {
            QUITCHECK: {
              target: "quitDialog",
            },
            RESTART: {
              target: "restartDialog",
            },
            QUIT: {
              target: "#screenFSM.start",
            },
          },
        },
        quitDialog: {
          on: {
            STAY: {
              target: "default",
            },
            QUIT: {
              target: "#screenFSM.start",
            },
          },
        },
        restartDialog: {
          on: {
            CANCEL: {
              target: "default",
            },
            RESTARTCONFIRM: {
              target: "default",
            },
          },
        },
      },
    },
  },
});
