var def = document.getElementById("def");
var defStruct = (content, img, url) => {
  if (content != undefined) {
    return `${img ? "<img src=" + img + ' alt="description image"/>' : ""}<div>${content}<a href="${url}" target="_blank">Learn more...</a></div>`;
  } else {
    return "<div><h1>No results found</h1></div>";
  }
};

async function searchDef() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url) return;
  var text = "Something went wrong";

  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      func: () => {
        return window.getSelection().toString();
      },
    },
    async (s) => {
      if (s && s[0]) {
        try {
          var resp = await fetch(
            `https://en.wikipedia.org/api/rest_v1/page/summary/${s[0].result.trim().toLowerCase().replaceAll(" ", "_")}`,
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
          console.log("text");
        } catch (error) {
          text = `Error: ${error.message}`;
        }
      }
      def.innerHTML = text;
    },
  );
}

searchDef();
