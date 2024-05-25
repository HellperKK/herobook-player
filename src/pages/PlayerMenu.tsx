import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../store/store";
import { useNavigate } from "react-router-dom";
import { initialTexts, Game, initialGame, Page } from "../utils/initialStuff";
import { css } from "@emotion/css";
import Button from "@mui/material/Button";
import { invoke } from "@tauri-apps/api/tauri";
import { Asset, addAssets, loadGame } from "../store/gameSlice";
import { useEffect } from "react";
import StyledButton from "../components/game/StyledButton";


export default function PlayerMenu() {
  const navigate = useNavigate();
  const { game } = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();

  async function loadData() {
    try {
      let data = (await invoke("load", {})) as string;
      if (data === "") {
        return;
      }
      const game: Game = JSON.parse(data);
      dispatch(loadGame({ game }))

      let databis = (await invoke("get_images", {})) as Array<Asset>;
      dispatch(addAssets({ assets: databis, type: "images" }));
      let dataMusics = (await invoke("get_musics", {})) as Array<Asset>;
      dispatch(addAssets({ assets: dataMusics, type: "musics" }));
      let dataSounds = (await invoke("get_sounds", {})) as Array<Asset>;
      dispatch(addAssets({ assets: dataSounds, type: "sounds" }));
    } catch (error) {
      const game = await fetch("./data.json").then(d => d.json())
      dispatch(loadGame({ game }))

      const assetsNames = await fetch("./assets/images/data.json").then(d => d.json())
      const assets: Array<Asset> = assetsNames.map((assetName: string) => ({ name: assetName, content: `../assets/images/${assetName}` }))
      dispatch(addAssets({ assets: assets, type: "images" }));


      const musicsNames = await fetch("./assets/musics/data.json").then(d => d.json())
      const musics: Array<Asset> = musicsNames.map((assetName: string) => ({ name: assetName, content: `../assets/musics/${assetName}` }))
      dispatch(addAssets({ assets: musics, type: "musics" }));

      const soundsNames = await fetch("./assets/sounds/data.json").then(d => d.json())
      const sounds: Array<Asset> = soundsNames.map((assetName: string) => ({ name: assetName, content: `../assets/sounds/${assetName}` }))
      dispatch(addAssets({ assets: sounds, type: "sounds" }));

      dispatch(loadGame({ game }))
    }
  }

  useEffect(() => {
    loadData();
  }, [])

  return (
    <div>
      <div
        className={css`
            height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            background-color: ${game.format.page}
          `}
      >
        <h1>{game.settings.gameTitle}</h1>
        <StyledButton
          type="button"
          color={game.format.btnColor}
          onClick={() => {
            const firstPage = game.pages.find((page: Page) => page.isFirst)

            if (firstPage) {
              navigate(`/player/${firstPage.id}`)
            }
          }}
        >
          {game.settings.texts?.play ?? initialTexts.play}
        </StyledButton>
        {/*<Button
          onClick={() => {navigate("/player/load") }}
          disabled={false}
        >
          {game.settings.texts?.continue ?? initialTexts.continue}
        </Button>*/}
        <StyledButton
          type="button"
          color={game.format.btnColor}
          onClick={() => {
            try {
              invoke('quit', {});
            } catch (error) { }
          }}
        >
          {game.settings.texts?.quit ?? initialTexts.quit}
        </StyledButton>
      </div>
    </div>)
}
