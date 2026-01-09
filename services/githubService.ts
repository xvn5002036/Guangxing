// src/services/githubService.ts

const GITHUB_API_URL = "https://api.github.com";

// 設定您的專案資訊
const REPO_OWNER = "xvn5002036";
const REPO_NAME = "Guangxing";
const FILE_PATH = "public/data/templeData.json"; // 假設您的資料放在這裡
// 注意：為了安全，建議 Token 不要寫死，而是從 Admin 介面輸入並存到 localStorage
// const GITHUB_TOKEN = localStorage.getItem("GITHUB_TOKEN"); 

interface UpdateParams {
  content: any; // 您要存的 JSON 資料
  message: string; // Commit 訊息
  token: string; // 您的 GitHub Token
}

export const saveJsonToGithub = async ({ content, message, token }: UpdateParams) => {
  try {
    // 1. 先取得該檔案目前的 SHA (GitHub 更新檔案需要知道上一個版本的 SHA)
    const getUrl = `${GITHUB_API_URL}/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    
    const getResponse = await fetch(getUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    if (!getResponse.ok) throw new Error("無法讀取 GitHub 檔案狀態");
    
    const fileData = await getResponse.json();
    const sha = fileData.sha;

    // 2. 將 JSON 轉為 Base64 (GitHub API 要求內容必須是 Base64 編碼)
    // 這裡要處理中文編碼問題
    const jsonString = JSON.stringify(content, null, 2);
    const encodedContent = btoa(unescape(encodeURIComponent(jsonString)));

    // 3. 發送 PUT 請求更新檔案
    const putResponse = await fetch(getUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: message, // 例如："Update via Admin Panel"
        content: encodedContent,
        sha: sha, // 必須帶上剛剛拿到的 SHA
      }),
    });

    if (!putResponse.ok) {
        const error = await putResponse.json();
        throw new Error(`更新失敗: ${error.message}`);
    }

    return await putResponse.json();

  } catch (error) {
    console.error("GitHub Sync Error:", error);
    throw error;
  }
};