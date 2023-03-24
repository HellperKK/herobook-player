/* eslint-disable @typescript-eslint/no-explicit-any */
import { Box } from "@mui/system";
// import { Button } from '@mui/material';

import styled from "@emotion/styled";
import { marked } from "marked";
import DOMPurify from "dompurify";

import { useCallback, useState } from "react";

import { Choice, Game, initialGame, initialPage } from "./initialStuff";
import { invoke } from "@tauri-apps/api/tauri";
import Button from "@mui/material/Button";

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
  const [game, setGame] = useState<Game>(initialGame);
  const [id, setId] = useState(1);
  const [message, setMessage] = useState("not loaded");

  async function loadData() {
    let data = (await invoke("load", {})) as string;
    setGame(JSON.parse(data));
    setMessage("loaded");
  }

  const page = game.pages.find((page) => page.id === id);

  if (page === undefined) {
    alert("non extsitant page");
    return <p>missing page</p>;
  }

  useCallback(async () => {
    await loadData();
  }, []);

  const choiceButton = (choice: Choice, index: number) => {
    return (
      <StyledButton
        type="button"
        key={`poll_${index + 42}`}
        onClick={() => {
          setId(choice.pageId);
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

  return (
    <Box
      sx={{
        padding: "10%",
        minHeight: "60vh",
        backgroundColor: page.format.background ?? game.format.background,
        overflowX: "auto",
      }}
    >
      {message}
      <Button onClick={loadData}>load</Button>
      <Box
        className="story"
        sx={{
          height: "100%",
          padding: "8px",
          textAlign: "center",
          backgroundColor: page.format.page ?? game.format.page,
          color: page.format.textColor ?? game.format.textColor,
        }}
      >
        <div className="story-image">
          <StyledImg src={page.image} alt="" />
          {/*
          page.image !== '' ? (
            <img src={assets.images.get(page.image)} alt="" />
          ) : (
            <Button variant="outlined">hello</Button>
          )
          */}
        </div>
        <p
          className="story-text"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: safeMarkdown(page.text),
          }}
        />
        <Box
          className="story"
          sx={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          {page.next.map(choiceButton)}
        </Box>
      </Box>
    </Box>
  );
}
