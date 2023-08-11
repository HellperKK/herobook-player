/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@mui/material/Button";
// import { Button } from '@mui/material';

import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useEffect, useMemo, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import ejs from "ejs";

import { Choice, Game, initialGame, initialPage } from "./initialStuff";

import "./App.css";
import Jinter from "jintr";

type Scene = "menu" | "load" | "game"

interface SaveState {
  state: any,
  pageId: number
}

const safeMarkdown = (md: string): string => DOMPurify.sanitize(marked(md));

const StyledButton = styled.button`
  color: ${(props) => props.color};
  background-color: transparent;
  border: none;
  cursor: pointer;
`;

const StyledImg = styled.img`
  max-width: 80%;
`;

export default function GameViewer() {
  const [scene, setScene] = useState<Scene>("menu");
  const [game, setGame] = useState<Game>(initialGame);
  const [saves, setSaves] = useState<Array<number>>([]);
  const [saveId, setSaveId] = useState(0);
  const [defs, setDefs] = useState<any>({
    $state: {},
  })

  console.log(defs);

  useEffect(() => { }, []);

  const firstPage = useMemo(() => game.pages.find((page) => page.isFirst), []);
  if (!firstPage) {
    return <p>no first page!</p>
  }

  const [id, setId] = useState(firstPage.id);
  const [image, setImage] = useState<string | null>(null);
  const page = game.pages.find((page) => page.id === id);

  async function loadId() {
    const saveList = await getSaveList();
    let i = 0;
    while (saveList.includes(i)) {
      i++;
    }
    setSaveId(i);
  }

  useEffect(() => {
    loadId();
    loadData();
    (async () => {
      const saves = await getSaveList()
      setSaves(saves);
    })();
  }, [])


  if (!page) {
    return <p>missing page number {id}!</p>
  }

  const content = useMemo(
    () => ejs.render(page.text, defs),
    [page, defs]
  );

  const evalCondition = ($state: any, condition: string) => {
    const jinter = new Jinter(condition);
    jinter.scope.set("$state", $state);
    return jinter.interpret();
  };

  async function loadData() {
    let data = (await invoke("load", {})) as string;
    if (data === "") {
      return;
    }
    const game: Game = JSON.parse(data);
    setGame(game);
    const first = game.pages.find((page) => page.isFirst);

    if (first && first.image !== "") {
      setId(first.id);
      const data = (await invoke("load_image", {
        fileName: first.image,
      })) as string;
      if (data !== "") {
        setImage(data);
      }
    }

    //setScene("game");
  }

  async function loadSave(id: number) {
    let dataString = (await invoke("load_save", { id })) as string;
    let data: SaveState = JSON.parse(dataString);
    console.log(data);
    setId(data.pageId);
    setDefs({ $state: data.state });
    setScene("game");
  }

  async function getSaveList() {
    const saves = await invoke<Array<string>>("get_saves", {})
    const saveRule = /save(\d+)\.json$/;
    return saves.flatMap(save => {
      if (!saveRule.test(save)) {
        return [];
      }
      const capture = saveRule.exec(save);

      if (!capture) {
        return [];
      }

      const id = parseInt(capture[1]);
      return [id];
    });
  }

  if (page === undefined) {
    alert("non extsitant page");
    return <p>missing page</p>;
  }

  const choiceButton = (choice: Choice, index: number) => {
    return (
      <StyledButton
        type="button"
        key={`poll_${index + 42}`}
        onClick={async () => {
          setId(choice.pageId);
          const page = game.pages.find((page) => page.id === choice.pageId);

          if (page == null) {
            return;
          }

          if (page.image == "" || page.image == undefined) {
            setImage(null);
            return;
          }

          let data = (await invoke("load_image", {
            fileName: page.image,
          })) as string;
          if (data !== "") {
            setImage(data);
          }
        }}
        color={page.format.btnColor ?? game.format.btnColor}
        dangerouslySetInnerHTML={{
          __html: safeMarkdown(` > ${choice.action}`),
        }}
      />
    );
  };

  if (scene === "menu") {
    return (<div
      className={css`
        height: 100vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      `}
    >
      <Button
        onClick={() => {
          setScene('game');
          // loadData();
        }}
      >
        start game
      </Button>
      <Button
        onClick={async () => {
          const saveList = await getSaveList();
          setSaves(saveList);
          setScene("load");
        }}
        disabled={saves.length === 0}
      >
        load game
      </Button>
    </div>)
  }

  if (scene === "load") {
    return (<div><StyledButton onClick={() => {
      setScene("menu");
      (async () => {
        const saves = await getSaveList()
        setSaves(saves);
      })();
    }}>Menu</StyledButton><div
      className={css`
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >

        {saves.map((save) => (
          <Button
            onClick={() => {
              loadSave(save);
            }}
            key={save}
          >
            game {save}
          </Button>)
        )}

      </div>
    </div>)
  }

  return (
    <div
      className={css`
        height: calc(100vh - 20%);
        padding: 10%;
        background-color: ${page.format.background ?? game.format.background};
      `}
    >
      <div>
        <StyledButton onClick={() => {
          setScene("menu");
          setDefs({
            $state: {},
          });
          (async () => {
            const saves = await getSaveList()
            setSaves(saves);
          })();
        }}>Menu</StyledButton>
        <StyledButton onClick={async () => {
          invoke("save", { saveId, saveContent: JSON.stringify({ state: defs.$state, pageId: id }) })
        }}>Save</StyledButton>
      </div>
      <div
        className={css`
          background-color: ${page.format.page ?? game.format.page};
          color: ${page.format.textColor ?? game.format.textColor};
          padding: 0 4px;
        `}
      >
        <div
          className={css`
            text-align: center;
          `}
        >
          {image && <StyledImg src={image} alt="" />}
        </div>
        <p
          className="story-text"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: safeMarkdown(content),
          }}
        />
        <div
          className={css`
            display: flex;
            flex-direction: column;
          `}
        >
          {page.next.filter(choice => {
            const condition = choice.condition;
            return condition === undefined || condition === "" || evalCondition(defs.$state, condition)
          }).map(choiceButton)}
        </div>
      </div>
    </div>
  );
}
