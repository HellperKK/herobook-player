import Box from "@mui/system/Box";

import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ejs from "ejs";

import { RootState } from "../store/store";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Choice, Page, SaveState, initialTexts, } from "../utils/initialStuff";
import { evalCondition, safeMarkdown } from "../utils/utils";
import { css } from "@emotion/css";
import { Jinter } from "jintr";
import { Button, Container, Dialog, Modal, Typography } from "@mui/material";
import StyledButton from "../components/game/StyledButton";
import StyledImg from "../components/game/StyledImg";
import { invoke } from "@tauri-apps/api";
import { changeState } from "../store/playSlice";

interface AudioInfo {
  name: string,
  audio: HTMLAudioElement,
}

export default function Player() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { game, assets } = useSelector((state: RootState) => state.game);
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);

  const { id } = useParams();

  const selectedPage = game.pages.find((page: Page) => page.id === parseInt(id!, 10));
  const gameState = useMemo(() => { return { $state: {} } }, []);

  if (!selectedPage) {
    return <p>No page</p>
  }

  const audioAsset = assets.musics.find(music => music.name === selectedPage.audio)
  console.log(audioAsset, assets);
  let audio: HTMLAudioElement | null = null;
  if (audioAsset && ((audioInfo && audioInfo.name !== audioAsset.name) || !audioInfo || audioInfo.name === "no-music")) {
    if (audioInfo) {
      audioInfo.audio.pause();
    }
    audio = new Audio(audioAsset.content);
    audio.loop = true;
    audio.play();
  }

  const jinter = new Jinter(selectedPage.script ?? "")
  jinter.scope.set("$state", gameState.$state);
  jinter.interpret();

  const image = assets.images.find(image => image.name === selectedPage.image)

  const nextPage = (id: number) => {
    if (id === 0) {
      if (audio) {
        audio.pause()
      }
      if (audioInfo) {
        audioInfo.audio.pause();
      }
      navigate("/")
    }
    else {
      dispatch(changeState({ state: gameState.$state }))
      navigate(`/player/${id}`);
    }
  }

  const choiceButton = (choice: Choice, index: number) => {
    return (
      <StyledButton
        type="button"
        key={`poll_${index + 42}`}
        onClick={() => {
          nextPage(choice.pageId);
          if (audio) {
            setAudioInfo({ name: audioAsset!.name, audio })
          }
          else if(selectedPage.audio === "no-music") {
            setAudioInfo({ name: "no-music", audio: new Audio() })
          }
        }}
        color={selectedPage.format.btnColor ?? game.format.btnColor}
        dangerouslySetInnerHTML={{
          __html: safeMarkdown(` > ${choice.action}`),
        }}
      />
    );
  };

  let body = safeMarkdown(selectedPage.text);

  try {
    body = safeMarkdown(ejs.render(selectedPage.text, gameState));
  } catch (error) { }

  return (
    <Box>
      <Box
        sx={{
          padding: "10%",
          minHeight: "50vh",
          backgroundColor: selectedPage.format.background ?? game.format.background,
          overflowX: "auto",
        }}
      >
        <Box
          className="story"
          sx={{
            height: "100%",
            padding: "8px",
            backgroundColor: selectedPage.format.page ?? game.format.page,
            color: selectedPage.format.textColor ?? game.format.textColor,
          }}
        >
          <StyledButton
            type="button"
            onClick={() => {
              if (audio) {
                audio.pause()
              }
              if (audioInfo) {
                audioInfo.audio.pause();
              }
              navigate("/")
            }}
            color={selectedPage.format.btnColor ?? game.format.btnColor}
          >
            {game.settings.texts?.menu ?? initialTexts.menu}
          </StyledButton>
          {/*<StyledButton
            type="button"
            onClick={() => {
              setSaving(true);
            }}
            color={selectedPage.format.btnColor ?? game.format.btnColor}
          >
            Save
          </StyledButton>*/}
          <div
            className={css`
            text-align: center;
          `}
          >
            {image && <StyledImg src={image.content} alt="" />}
          </div>
          <p
            className="story-text"
            dangerouslySetInnerHTML={{
              __html: safeMarkdown(body),
            }}
          />
          <Box
            className="story"
            sx={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {selectedPage.next.filter((choice: Choice) => {
              const condition = choice.condition;
              return condition === undefined || condition === "" || evalCondition(gameState.$state, condition)
            }).map(choiceButton)}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
