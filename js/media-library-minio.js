// Custom Decap CMS media library backed by self-hosted MinIO instead of
// git. Dormant until MEDIA_API_BASE/API_TOKEN below are filled in and a
// collection field sets media_library: { name: "minio" } — see
// deploy/unraid/README.md. Does nothing until then; doesn't affect the
// existing git-based media fields.
(function () {
  var MEDIA_API_BASE = "https://media-api.yourdomain.com"; // the media-api container's public URL
  var API_TOKEN = "REPLACE_WITH_MEDIA_TOKEN"; // must match MEDIA_API_TOKEN in media-api's .env
  var SIGN_URL = MEDIA_API_BASE + "/sign-upload";
  var LIST_URL = MEDIA_API_BASE + "/list";

  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "style") e.style.cssText = attrs[k];
        else if (k.indexOf("on") === 0) e.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
        else e.setAttribute(k, attrs[k]);
      });
    }
    (children || []).forEach(function (c) {
      e.appendChild(c);
    });
    return e;
  }

  if (typeof CMS === "undefined" || !CMS.registerMediaLibrary) return;

  CMS.registerMediaLibrary({
    name: "minio",
    init: function (initArgs) {
      var handleInsert = initArgs.handleInsert;

      function show(opts) {
        var overlay = el("div", {
          style:
            "position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);" +
            "display:flex;align-items:center;justify-content:center;font-family:sans-serif;",
        });
        var panel = el("div", {
          style: "background:#fff;border-radius:10px;width:min(720px,90vw);max-height:80vh;overflow:auto;padding:24px;",
        });

        function close() {
          overlay.remove();
        }

        var closeBtn = el(
          "button",
          {
            style: "float:right;padding:6px 12px;border-radius:6px;border:1px solid #ccc;background:#fff;cursor:pointer;",
            onclick: close,
          },
          [document.createTextNode("Close")]
        );
        var title = el("h2", { style: "margin:0 0 16px;font-size:18px;" }, [
          document.createTextNode("Media (self-hosted)"),
        ]);
        var status = el("div", { style: "margin-bottom:12px;color:#666;font-size:13px;" }, [
          document.createTextNode("Loading…"),
        ]);
        var grid = el("div", {
          style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:10px;margin-bottom:20px;",
        });

        var uploadInput = el("input", {
          type: "file",
          accept: opts.imagesOnly ? "image/*" : undefined,
        });
        var uploadBtn = el(
          "button",
          {
            style: "margin-left:10px;padding:8px 14px;border-radius:6px;border:1px solid #ccc;background:#f5f5f5;cursor:pointer;",
            onclick: function () {
              uploadFile();
            },
          },
          [document.createTextNode("Upload")]
        );
        var uploadRow = el("div", { style: "margin-bottom:16px;" }, [uploadInput, uploadBtn]);

        panel.appendChild(closeBtn);
        panel.appendChild(title);
        panel.appendChild(uploadRow);
        panel.appendChild(status);
        panel.appendChild(grid);
        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        function pick(file) {
          handleInsert(opts.allowMultiple ? [file.url] : file.url);
          close();
        }

        function renderFiles(files) {
          grid.innerHTML = "";
          files.forEach(function (f) {
            grid.appendChild(
              el("img", {
                src: f.url,
                title: f.name,
                style: "width:100%;height:90px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid transparent;",
                onclick: function () {
                  pick(f);
                },
              })
            );
          });
        }

        function loadFiles() {
          status.textContent = "Loading…";
          fetch(LIST_URL, { headers: { "x-media-token": API_TOKEN } })
            .then(function (r) {
              if (!r.ok) throw new Error("list failed: " + r.status);
              return r.json();
            })
            .then(function (data) {
              status.textContent = data.files.length + " file(s)";
              renderFiles(data.files);
            })
            .catch(function (err) {
              status.textContent = "Could not load media library: " + err.message;
            });
        }

        function uploadFile() {
          var file = uploadInput.files[0];
          if (!file) return;
          status.textContent = "Uploading…";
          fetch(SIGN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-media-token": API_TOKEN },
            body: JSON.stringify({ filename: file.name, contentType: file.type }),
          })
            .then(function (r) {
              if (!r.ok) throw new Error("sign failed: " + r.status);
              return r.json();
            })
            .then(function (data) {
              return fetch(data.uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
              }).then(function (putRes) {
                if (!putRes.ok) throw new Error("upload failed: " + putRes.status);
                return data;
              });
            })
            .then(function (data) {
              status.textContent = "Uploaded.";
              pick({ url: data.publicUrl, name: file.name });
            })
            .catch(function (err) {
              status.textContent = "Upload failed: " + err.message;
            });
        }

        loadFiles();
      }

      return {
        show: show,
        enableStandalone: function () {
          return true;
        },
      };
    },
  });
})();
