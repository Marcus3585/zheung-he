# 大明遠航：麒麟之誓 3D

課堂用的鄭和航海遊戲。地球儀、程序性寶船、港口抉擇和隨船史官都在瀏覽器裡跑完。這一版加上副使王景弘，以及每一站的當地人物：他們的對談、分支和後果都寫在程式裡。玩註冊、史實漫遊、啟航、跟人說話、問史官、做總結，都不需要 Gemini 或其他 API 金鑰。

## 本地執行

需要 Node.js。

```bash
npm install
npm run dev
```

瀏覽器打開 `http://localhost:3000`。

評分用船上的本機準則，不呼叫任何語言模型。成績仍會按原來的 Google Apps Script 路徑嘗試上傳。沒有網絡時，上傳會顯示失敗，遊戲本身不會卡住。

## 部署到 Cloudflare

建置產出在 `dist/`。`wrangler.toml` 把這個目錄當成 Workers 靜態資源，並把找不到的路徑交回 `index.html`。

```bash
npm install
npm run build
npx wrangler login
npm run deploy
```

`npm run deploy` 就是先 `npm run build`，再 `wrangler deploy`。不要把金鑰寫進 `wrangler.toml`。

想先在本機看靜態成品：

```bash
npm run cf:preview
```

設定依據是 Cloudflare 的 [單頁應用路由](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)：`assets.not_found_handling = "single-page-application"`。

## 圖和船模

港口、寶船、史官和名冊的圖在 `public/art/`。地球表面貼圖在 `public/textures/`，建置時一起送出，不靠外網 CDN。

預設的寶船是程式畫出來的，不靠外部模型。若日後做好 `.glb`，放到 `public/models/`（說明見該資料夾），再在 `components/GlobeViz.tsx` 把 `SHIP_MODEL_URL` 設成該檔的網址。檔案讀不到時，仍會用內建的船。
