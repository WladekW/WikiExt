chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "searchDef",
    title: "Search '%s' Definition",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "searchDef") {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: createPopup,
      args: [info.selectionText],
    });
  }
});

async function createPopup(s) {
  document.querySelector(".definition_main")?.remove();

  var defStruct = (content, img, url) => {
    if (content != undefined) {
      return `<div style=";width:360px;height:fit-content;text-align:justify;max-height:70%;overflow:auto;backdrop-filter: blur(10px);background-color:#aaaaaa2f;border-radius:10px;padding:10px;display:flex;flex-direction:column;">${img ? '<img style="width: 100%;" src=' + img + ' alt="description image"/>' : ""}<div style="padding:10px;display: flex;flex-direction: column;gap: 20px;">${content}<a style="color:#88C;font-size:18px;" href="${url}" target="_blank">Learn more...</a></div></div>`;
    } else {
      return `<div style="width:360px;height:fit-content;text-align:center;max-height:70%;overflow:auto;backdrop-filter: blur(10px);background-color:#aaaaaa2f;border-radius:10px;padding:10px;display:flex;flex-direction:column;"><h1>No results found</h1></div>`;
    }
  };
  var text = "Something went wrong";
  var defMain = document.createElement("div");
  defMain.addEventListener("click", () => defMain.remove());
  defMain.style.cssText =
    "background-color:transparent;height:100vh;width:100vw;position:fixed;top:0;left:0;z-index:99999;display:flex;align-items:top;justify-content:end;padding:20px;";
  defMain.className = "definition_main";

  try {
    var resp = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${s.trim().toLowerCase().replaceAll(" ", "_")}`,
    );
    if (!resp.ok) {
      text = `Response status: ${resp.status}`;
    }
    var respJSON = await resp.json();
    text = defStruct(
      respJSON.extract_html,
      respJSON.thumbnail?.source || null,
      respJSON.content_urls?.desktop?.page || "https://en.wikipedia.org/",
    );
  } catch (error) {
    text = `Error: ${error.message}`;
  }
  defMain.innerHTML = text;
  defMain
    .querySelector("div")
    ?.addEventListener("click", (e) => e.stopPropagation());
  document.body.append(defMain);
}
