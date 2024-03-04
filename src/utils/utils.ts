import JSZip from "jszip";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { Jinter } from "jintr";

import { Choice, initialGame, Page } from "./initialStuff";
import { Asset } from "../store/gameSlice";

const readImage = (file: Blob): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.readAsDataURL(file);
  });
};

const nothing = () => {};

const download = (filename: string, text: string) => {
  const element = document.createElement("a");
  element.setAttribute(
    "href",
    `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`
  );
  element.setAttribute("download", filename);

  element.click();
};

const formatStory = (obj: Array<Page>) => {
  let count = 0;

  obj.forEach((page) => {
    count += 1;
    page.id = count;
    page.format = {};
  });

  obj.forEach((page) => {
    page.next = page.next?.map((nex: Choice) => {
      const nextPage = obj.find((p) => p.id === nex.pageId) ?? obj[0];

      return {
        action: nex.action,
        pageId: nextPage.id,
      };
    });
  });

  obj[0].isFirst = true;

  return [obj, count];
};

const openFiles = (
  accept: Array<string> = [],
  multiple = false
): Promise<FileList> => {
  return new Promise((resolve, reject) => {
    const fileSelector = document.createElement("input");
    fileSelector.type = "file";
    fileSelector.multiple = multiple;

    if (accept.length > 0) {
      fileSelector.accept = accept.join(",");
    }

    fileSelector.addEventListener("change", () => {
      if (fileSelector.files !== null) {
        resolve(fileSelector.files);
      } else {
        reject(new Error("no file selected"));
      }
    });
    fileSelector.click();
  });
};

const openAZip = async () => {
  const files = await openFiles([".zip"]);
  const file = files[0];
  const zip = new JSZip();
  return zip.loadAsync(file);
};

const loadState = async () => {
  const zip = await openAZip();
  let game = initialGame;

  const data = zip.file("data.json");
  if (data !== null) {
    const text = await data.async("text");
    game = JSON.parse(text);
  }

  const images = zip.folder("assets/images");

  let assets = new Array<Asset>();

  if (images !== null) {
    assets = await Object.entries(images.files).reduce<Promise<Array<Asset>>>(
      async (
        assetsMemoPromise: Promise<Array<Asset>>,
        pair: [string, JSZip.JSZipObject]
      ) => {
        const assetsMemo = await assetsMemoPromise;
        const matches = pair[0].match(/assets\/images\/(.+)/);
        if (matches) {
          const blob = await pair[1].async("blob");
          const img = await readImage(blob);

          assetsMemo.push({ name: matches[1], content: img });
        }
        return assetsMemo;
      },
      Promise.resolve(new Array<Asset>())
    );
  }

  return { game, assets, zip };
};

const noExt = (name: string) => name.split(".").shift();

const identity = <T>(x: T): T => x;

const safeMarkdown = (md: string): string => DOMPurify.sanitize(marked(md));

const safeFileName = (fileName: string) => fileName.replaceAll(/\s+/g, "-");

const assetPath = (assetType: string, assetName: string) =>
  `assets/${assetType}/${assetName}`;

const getExtensions = (assetType: string) => {
  switch (assetType) {
    case "image":
      return [
        "image/jpeg",
        "image/gif",
        "image/bmp",
        "image/png",
        "image/webp",
      ];
    default:
      return [];
  }
};

const evalCondition = ($state: any, condition: string) => {
  const jinter = new Jinter(condition);
  jinter.scope.set("$state", $state);
  return jinter.interpret();
};

// const fileName = (file: string) => /(.+)\..+/.exec(file)[1];

export {
  evalCondition,
  download,
  formatStory,
  openFiles,
  openAZip,
  nothing,
  identity,
  readImage,
  noExt,
  safeMarkdown,
  safeFileName,
  loadState,
  assetPath,
  getExtensions,
};
