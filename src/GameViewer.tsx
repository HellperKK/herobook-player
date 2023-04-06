/* eslint-disable @typescript-eslint/no-explicit-any */
import Button from "@mui/material/Button";
// import { Button } from '@mui/material';

import styled from "@emotion/styled";
import { css } from "@emotion/css";
import { marked } from "marked";
import DOMPurify from "dompurify";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

import { Choice, Game, initialGame } from "./initialStuff";

import "./App.css";

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
  const [started, setStarted] = useState(false);
  const [game, setGame] = useState<Game>(initialGame);
  const [id, setId] = useState(1);
  const [image, setImage] = useState<string | null>(null);

  async function loadData() {
    let data = (await invoke("load", {})) as string;
    if (data !== "") {
      setGame(JSON.parse(data));
    }
    return JSON.parse(data);
  }

  const page = game.pages.find((page) => page.id === id);

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

  const defs: any = {
    $state: {},
  };

  return !started ? (
    <div
      className={css`
        height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      `}
    >
      <Button
        onClick={async () => {
          const game: Game = await loadData();
          setGame(game);
          const first = game.pages.find((page) => page.isFirst);

          if (first && first.image !== "") {
            const data = (await invoke("load_image", {
              fileName: first.image,
            })) as string;
            if (data !== "") {
              setImage(data);
            }
          }

          setStarted(true);
        }}
      >
        start game
      </Button>
    </div>
  ) : (
    <div
      className={css`
        height: calc(100vh - 20%);
        padding: 10%;
        background-color: ${page.format.background ?? game.format.background};
      `}
    >
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
            __html: safeMarkdown((window as any).ejs.render(page.text, defs)),
          }}
        />
        <div
          className={css`
            display: flex;
            flex-direction: column;
          `}
        >
          {page.next.map(choiceButton)}
        </div>
      </div>
    </div>
  );
}
