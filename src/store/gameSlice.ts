import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import {
  Category,
  Choice,
  Format,
  Game,
  Page,
  Settings,
  Texts,
  initialCategory,
  initialChoice,
  initialGame,
  initialPage,
  initialTexts,
} from "../utils/initialStuff";
import { text } from "stream/consumers";

export interface Asset {
  name: string;
  content: string;
}

export interface AssetGroup {
  images: Array<Asset>;
  musics: Array<Asset>;
  sounds: Array<Asset>;
}

export interface GameState {
  game: Game;
  assets: AssetGroup;
  gameState: { $state: any };
  resetBool: boolean;
  visualizingStates: Array<string>;
  expert?: boolean;
}

const initialState: GameState = {
  game: initialGame,
  assets: {
    images: [],
    musics: [],
    sounds: [],
  },
  gameState: { $state: {} },
  resetBool: false,
  visualizingStates: [],
  expert: false,
};

export const gameSlice = createSlice({
  name: "game",
  initialState,
  reducers: {
    addPage: (state) => {
      state.game.pages.push(initialPage(state.game.settings.pageCount + 1));
      state.game.settings.pageCount++;
    },
    removePage: (state, action: PayloadAction<{ removeId: number }>) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.removeId
      );

      if (pageIndex === -1) {
        return;
      }

      const removeFirst = state.game.pages[pageIndex].isFirst;
      state.game.pages.splice(pageIndex, 1);

      if (removeFirst) {
        state.game.pages[0].isFirst = true;
      }
    },
    addChoice: (state, action: PayloadAction<{ pageId: number }>) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.pageId
      );

      if (pageIndex === -1) {
        return;
      }

      state.game.pages[pageIndex].next.push(initialChoice);
    },
    removeChoice: (
      state,
      action: PayloadAction<{ pageId: number; choiceIndex: number }>
    ) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.pageId
      );

      if (pageIndex === -1) {
        return;
      }

      state.game.pages[pageIndex].next.splice(action.payload.choiceIndex, 1);
    },
    loadGame: (state, action: PayloadAction<{ game: Game }>) => {
      state.game = action.payload.game;
      state.resetBool = !state.resetBool;
    },
    changePage: (
      state,
      action: PayloadAction<{ pageId: number; page: Partial<Page> }>
    ) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.pageId
      );

      if (pageIndex === -1) {
        return;
      }

      state.game.pages[pageIndex] = {
        ...state.game.pages[pageIndex],
        ...action.payload.page,
      };
    },
    changePageAt: (
      state,
      action: PayloadAction<{ page: Partial<Page>; position: number }>
    ) => {
      state.game.pages[action.payload.position] = {
        ...state.game.pages[action.payload.position],
        ...action.payload.page,
      };
    },
    changeChoice: (
      state,
      action: PayloadAction<{
        choice: Partial<Choice>;
        position: number;
        pageId: number;
      }>
    ) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.pageId
      );

      if (pageIndex === -1) {
        return;
      }

      const next = state.game.pages[pageIndex].next;
      next[action.payload.position] = {
        ...next[action.payload.position],
        ...action.payload.choice,
      };
    },
    setFirst: (state, action: PayloadAction<number>) => {
      state.game.pages.forEach((page) => {
        page.isFirst = page.id === action.payload;
      });
    },
    updateFormat: (
      state,
      action: PayloadAction<{ format: Partial<Format>; pageId: number }>
    ) => {
      const pageIndex = state.game.pages.findIndex(
        (page) => page.id == action.payload.pageId
      );

      if (pageIndex === -1) {
        return;
      }

      const page = state.game.pages[pageIndex];
      page.format = {
        ...page.format,
        ...action.payload.format,
      };
    },
    updateGlobalFormat: (state, action: PayloadAction<Format>) => {
      state.game.format = {
        ...state.game.format,
        ...action.payload,
      };
    },
    addAssets: (
      state,
      action: PayloadAction<{ assets: Array<Asset>; type: string }>
    ) => {
      switch (action.payload.type) {
        case "images":
          for (const asset of action.payload.assets) {
            const oldAsset = state.assets.images.find(
              (a) => a.name === asset.name
            );

            if (oldAsset !== undefined) {
              oldAsset.content = asset.content;
            } else {
              state.assets.images.push(asset);
            }
          }

          break;

        case "musics":
          for (const asset of action.payload.assets) {
            const oldAsset = state.assets.musics.find(
              (a) => a.name === asset.name
            );

            if (oldAsset !== undefined) {
              oldAsset.content = asset.content;
            } else {
              state.assets.musics.push(asset);
            }
          }

          break;

        case "sounds":
          for (const asset of action.payload.assets) {
            const oldAsset = state.assets.sounds.find(
              (a) => a.name === asset.name
            );

            if (oldAsset !== undefined) {
              oldAsset.content = asset.content;
            } else {
              state.assets.sounds.push(asset);
            }
          }

          break;

        default:
          break;
      }
    },
    removeAsset: (
      state,
      action: PayloadAction<{ name: string; type: string }>
    ) => {
      switch (action.payload.type) {
        case "images":
          const assetsImages = state.assets.images;

          const assetIndexImages = assetsImages.findIndex(
            (a) => a.name === action.payload.name
          );

          if (assetIndexImages === -1) {
            return;
          }

          assetsImages.splice(assetIndexImages, 1);

          state.assets.images = assetsImages;
          break;

        case "musics":
          const assetsMusic = state.assets.musics;

          const assetIndexMusic = assetsMusic.findIndex(
            (a) => a.name === action.payload.name
          );

          if (assetIndexMusic === -1) {
            return;
          }

          assetsMusic.splice(assetIndexMusic, 1);

          state.assets.musics = assetsMusic;
          break;

        case "sounds":
          const assetsSound = state.assets.sounds;

          const assetIndexSound = assetsSound.findIndex(
            (a) => a.name === action.payload.name
          );

          if (assetIndexSound === -1) {
            return;
          }

          assetsSound.splice(assetIndexSound, 1);

          state.assets.sounds = assetsSound;
          break;

        default:
          break;
      }
    },
    updateSettings: (state, action: PayloadAction<Partial<Settings>>) => {
      state.game.settings = {
        ...state.game.settings,
        ...action.payload,
      };
    },
    updateTexts: (state, action: PayloadAction<Partial<Texts>>) => {
      state.game.settings.texts = {
        ...(state.game.settings.texts ?? initialTexts),
        ...action.payload,
      };
    },
    changeGameState: (state, action: PayloadAction<any>) => {
      state.gameState = action.payload;
    },
    resetGameState: (state) => {
      state.gameState = { $state: {} };
    },
    newProject: (state) => {
      state.game = initialGame;
      state.assets = {
        images: [],
        musics: [],
        sounds: [],
      };
      state.gameState = { $state: {} };
      state.resetBool = !state.resetBool;
    },
    addCategory: (state) => {
      const settings = state.game.settings;
      if (!settings.categories) {
        settings.categories = [];
      }
      settings.categories.push(initialCategory);
    },
    removeCategory: (state, action: PayloadAction<number>) => {
      const settings = state.game.settings;
      if (!settings.categories || !(settings.categories.length > 0)) {
        return;
      }
      const categoryName = settings.categories[action.payload].name;

      settings.categories.splice(action.payload, 1);

      for (const pages of state.game.pages) {
        if (pages.category == categoryName) {
          pages.category = "";
        }
      }
    },
    changeCategory: (
      state,
      action: PayloadAction<{ category: Partial<Category>; position: number }>
    ) => {
      const settings = state.game.settings;
      if (settings.categories) {
        const category = settings.categories[action.payload.position];
        settings.categories[action.payload.position] = {
          ...category,
          ...action.payload.category,
        };
      }
    },
    changeVisualState: (
      state,
      action: PayloadAction<{ id: number; content: string }>
    ) => {
      state.visualizingStates[action.payload.id] = action.payload.content;
    },
    changeExpert: (state, action: PayloadAction<boolean>) => {
      state.expert = action.payload;
    },
  },
});

export const {
  addPage,
  addAssets,
  addChoice,
  changeChoice,
  changeGameState,
  changePage,
  changePageAt,
  loadGame,
  newProject,
  removeAsset,
  removeChoice,
  removePage,
  resetGameState,
  setFirst,
  updateFormat,
  updateGlobalFormat,
  updateSettings,
  updateTexts,
  addCategory,
  changeCategory,
  removeCategory,
  changeVisualState,
  changeExpert,
} = gameSlice.actions;

export default gameSlice.reducer;
