interface SaveState {
  state: any,
  pageId: number
}

interface Choice {
  action: string;
  pageId: number;
  condition?: string;
}

interface Format {
  textColor?: string;
  textFont?: string;
  btnColor?: string;
  btnFont?: string;
  background?: string;
  page?: string;
}

interface Page {
  id: number;
  isFirst: boolean;
  name: string;
  text: string;
  next: Array<Choice>;
  format: Format;
  image: string;
  category?: string;
  script?: string;
}

interface Category {
  name: string;
  visible: boolean;
}

interface Texts {
  play: string;
  continue: string;
  quit: string;
  menu: string;
}

interface Settings {
  author: string;
  gameTitle: string;
  pageCount: number;
  categories?: Array<Category>;
  texts?: Texts;
}

interface Game {
  version: "1.0.0";
  settings: Settings;
  format: Required<Format>;
  pages: Array<Page>;
}

const initialTexts: Texts = {
  play: "Play",
  continue: "Continue",
  quit: "Quit",
  menu: "Menu"
}

const initialChoice = {
  action: "Go to the base page",
  pageId: 1,
};

const initialCategory = {
  name: "category name",
  visible: true,
};

function initialPage(id = 1): Page {
  return {
    id,
    isFirst: false,
    name: "EMPTY",
    text: "This is a new page",
    next: [initialChoice],
    format: {},
    image: "",
  };
}

const initialGame: Game = {
  version: "1.0.0",
  settings: {
    author: "",
    gameTitle: "",
    pageCount: 4,
    texts: initialTexts,
  },
  format: {
    textColor: "initial",
    textFont: "sans-serif",
    btnColor: "492e10",
    btnFont: "sans-serif",
    background: "#dbfffd",
    page: "#a9e5e2",
  },

  pages: [
    {
      id: 1,
      isFirst: true,
      name: "main",
      text: "What do you want for dessert ?",
      next: [
        {
          action: "Cheesecake",
          pageId: 2,
        },
        {
          action: "Vanilla ice cream",
          pageId: 3,
        },
        {
          action: "Brownie",
          pageId: 4,
        },
      ],
      format: {},
      image: "",
    },
    {
      id: 2,
      name: "cheesecake",
      isFirst: false,
      text: "You chose the best dessert ever and deserve to be my friend!",
      next: [
        {
          action: "Choose another dessert",
          pageId: 1,
        },
      ],
      format: {},
      image: "",
    },
    {
      id: 3,
      name: "vanilla",
      isFirst: false,
      text: "You are quite classical I must say. But I'm not judging you, not yet.",
      next: [
        {
          action: "Choose another dessert",
          pageId: 1,
        },
      ],
      format: {},
      image: "",
    },
    {
      id: 4,
      name: "brownie",
      isFirst: false,
      text: "I would also take that if it wasn't for the calories...",
      next: [
        {
          action: "Choose another dessert",
          pageId: 1,
        },
      ],
      format: {},
      image: "",
    },
  ],
};

export { initialChoice, initialPage, initialGame, initialCategory, initialTexts };
export type { Page, Game, Choice, Format, Settings, Category, Texts, SaveState };
