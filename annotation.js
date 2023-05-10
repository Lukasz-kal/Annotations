var path;
var structon = true;
var descrpton = true;
var analiton = true;
var fileName;
var comments = [];

var recogito = (function () {
  // Intialize Recogito
  var r = Recogito.init({
    content: "textToAnnotate",
    locale: "de",
    widgets: [
      { widget: "COMMENT" },
      {
        widget: "TAG",
        vocabulary: [
          "Strukturelement",
          "Deskriptives Element",
          "Analytisches Element",
        ],
      },
    ],
  });

  r.on("selectAnnotation", function (a) {
    console.log("selected", a);
    console.log(a.id);
  });

  r.on("createAnnotation", function (a) {
    var tagLenght = 0;
    for (i = 0; i < a.body.length; i++) {
      if (a.body[i].purpose == "tagging") tagLenght++;
    }
    if (tagLenght > 1) {
      getPopup("Bitte wählen Sie nur eine Annotationskategorie");
      r.removeAnnotation(a);
      return;
    }
    if (tagLenght == 0) {
      getPopup("Bitte wählen Sie eine Annotationskategorie");
      r.removeAnnotation(a);
      return;
    }
    console.log("created", a);
    installRenderingPatch(r);
  });

  r.on("updateAnnotation", function (annotation, previous) {
    console.log("updated", previous, "with", annotation);
  });
  document
    .getElementById("save-annotation")
    .addEventListener("click", function () {
      console.log(r.getAnnotations());
      if (
        document.getElementById("textToAnnotate").innerText == "" ||
        r.getAnnotations().length == 0
      ) {
        getPopup("Keine Daten vorhanden");
        return;
      }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(r.getAnnotations(), null, 2)], {
          type: "text/plain",
        })
      );
      a.setAttribute("download", "annotations-" + fileName + ".json");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("saved");
    });

  document
    .getElementById("load-annotation")
    .addEventListener("click", function () {
      if (document.getElementById("textToAnnotate").innerText == "") {
        getPopup("Laden Sie bitte zuerst eine Quelldatei hoch");
        return;
      }
      var input = document.createElement("input");
      input.type = "file";
      input.id = "inputFile";
      input.accept = ".json";
      input.click();
      input.onchange = function () {
        var reader = new FileReader();
        reader.readAsText(input.files[0]);
        var path = URL.createObjectURL(input.files[0]);
        r.loadAnnotations(path).then(function (a) {
          console.log("loaded", a);
          resetOnOff();
          installRenderingPatch(r);
          getPopup("Annotationen geöffnet");
        });
      };
    });

  document.getElementById("struc-onoff").addEventListener("click", function () {
    structon = !structon;
    var status = document.getElementById("struc-onoff");
    if (structon) {
      status.classList.remove("inactiv");
      status.classList.add("structure");
    } else {
      status.classList.add("inactiv");
      status.classList.remove("structure");
    }
    r.getAnnotations().forEach((annotation) => {
      if (
        annotation.body[0].value == "Strukturelement" ||
        annotation.body[1].value == "Strukturelement"
      ) {
        var elements = document.querySelectorAll(
          `[data-id="${annotation.id}"]`
        );
        for (i = 0; i < elements.length; i++) {
          element = elements[i];
          element.classList.toggle("transparent");
        }
      }
    });
  });

  document.getElementById("desc-onoff").addEventListener("click", function () {
    descrpton = !descrpton;
    var status = document.getElementById("desc-onoff");
    if (descrpton) {
      status.classList.remove("inactiv");
      status.classList.add("description");
    } else {
      status.classList.add("inactiv");
      status.classList.remove("description");
    }
    r.getAnnotations().forEach((annotation) => {
      if (
        annotation.body[0].value == "Deskriptives Element" ||
        annotation.body[1].value == "Deskriptives Element"
      ) {
        var elements = document.querySelectorAll(
          `[data-id="${annotation.id}"]`
        );
        for (i = 0; i < elements.length; i++) {
          element = elements[i];
          element.classList.toggle("transparent");
        }
      }
    });
  });

  document
    .getElementById("analit-onoff")
    .addEventListener("click", function () {
      analiton = !analiton;
      var status = document.getElementById("analit-onoff");
      if (analiton) {
        status.classList.remove("inactiv");
        status.classList.add("analyse");
      } else {
        status.classList.add("inactiv");
        status.classList.remove("analyse");
      }
      r.getAnnotations().forEach((annotation) => {
        if (
          annotation.body[0].value == "Analytisches Element" ||
          annotation.body[1].value == "Analytisches Element"
        ) {
          var elements = document.querySelectorAll(
            `[data-id="${annotation.id}"]`
          );
          for (i = 0; i < elements.length; i++) {
            element = elements[i];
            element.classList.toggle("transparent");
          }
        }
      });
    });
})();

installRenderingPatch = function (recogito) {
  const annotations = recogito.getAnnotations();
  comments = [];
  annotations.forEach((element) => {
    changeBackground(element);
    addCommentsToSection(element);
  });
  showComments();
};

changeBackground = function (annotation) {
  var value;
  if (annotation.body[0].purpose == "tagging") {
    value = annotation.body[0].value;
  } else {
    value = annotation.body[1].value;
  }
  var elements = document.querySelectorAll(`[data-id="${annotation.id}"]`);
  for (i = 0; i < elements.length; i++) {
    element = elements[i];
    if (value == "Strukturelement") {
      if (structon) element.classList.add("structure");
      else element.classList.add("transparent");
    } else if (value == "Deskriptives Element") {
      if (analiton) element.classList.add("description");
      else element.classList.add("transparent");
    } else if (value == "Analytisches Element") {
      if (descrpton) element.classList.add("analyze");
      else element.classList.add("transparent");
    }
  }
};

addCommentsToSection = function (annotation) {
  for (i = 0; i < annotation.body.length; i++) {
    if (annotation.body[i].purpose == "commenting") {
      var comment = new CommentInSection(
        annotation.id,
        annotation.body[i].value,
        annotation.target.selector[0].exact
      );
      comments.push(comment);
    }
  }
};

showComments = function () {
  var targetElement = document.getElementById("comments");
  var innerHTML = "<h3>Kommentare </h3><hr/>";
  for (i = 0; i < comments.length; i++) {
    var id = "comment-" + comments[i].id;
    innerHTML +=
      '<div><button type="button" id="' +
      id +
      '" class="btn btn-primary btn-sm comments"> <div style = "font-size:10px">' +
      '"' +
      comments[i].sourceText.substr(0, 30) +
      '"</button></div><div>' +
      comments[i].text +
      "</div></div><hr/>";
  }
  if (comments.length > 0) {
    targetElement.innerHTML = innerHTML;
  }
  document.querySelectorAll(".comments").forEach((item) => {
    item.addEventListener("click", function () {
      var targetId = item.id.substr(8);
      var elements = document.querySelectorAll(`[data-id="${targetId}"]`);
      for (i = 0; i < elements.length; i++) {
        element.scrollIntoView();
        element.classList.add("red");
        sleep(2500).then(() => {
          element.classList.remove("red");
        });
      }
    });
  });
};

document.getElementById("open-file").addEventListener("click", function () {
  var input = document.createElement("input");
  input.type = "file";
  input.id = "inputFile";
  input.accept = ".txt";
  input.click();
  input.onchange = function () {
    var reader = new FileReader();
    reader.readAsText(input.files[0]);
    fileName = input.files[0].name;
    var output = document.getElementById("textToAnnotate");
    reader.onload = function () {
      output.innerText = reader.result;
    };
    console.log(reader.result);
    resetOnOff();
    comments = [];
    getPopup("Datei geöffnet");
  };
});

resetOnOff = function () {
  structon = true;
  descrpton = true;
  analiton = true;
  var statusStruc = document.getElementById("struc-onoff");
  statusStruc.classList.remove("inactiv");
  statusStruc.classList.add("structure");
  var statusDesc = document.getElementById("desc-onoff");
  statusDesc.classList.remove("inactiv");
  statusDesc.classList.add("description");
  var statusAnalit = document.getElementById("analit-onoff");
  statusAnalit.classList.remove("inactiv");
  statusAnalit.classList.add("analyse");
};

getPopup = function (text) {
  var myInput = document.getElementById("popup");
  document.getElementById("modal-body").innerHTML = text;
  var modalEl = new bootstrap.Modal(myInput);
  modalEl.show();
};

tippy("#struc-onoff", {
  content() {
    const template = document.getElementById("struc");
    return template.innerHTML;
  },
  allowHTML: true,
  maxWidth: 280,
});

tippy("#desc-onoff", {
  content() {
    const template = document.getElementById("desc");
    return template.innerHTML;
  },
  allowHTML: true,
  maxWidth: 300,
});

tippy("#analit-onoff", {
  content() {
    const template = document.getElementById("analit");
    return template.innerHTML;
  },
  allowHTML: true,
});

class CommentInSection {
  constructor(id, text, sourceText) {
    this.id = id;
    this.text = text;
    this.sourceText = sourceText;
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
