var path;
var structon = true;
var descrpton = true;
var analiton = true;
var fileName;

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
          "Desktriptives Element",
          "Analitysches Element",
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
          installRenderingPatch(r);
          console.log("loaded", a);
          resetOnOff();
          getPopup("Annotationen geöffnet");
        });
      };
    });

  document.getElementById("struc-onoff").addEventListener("click", function () {
    structon = !structon;
    var status = document.getElementById("struc-onoff");
    var span =
      "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle structure'>";
    var text = "Strukturelemente An";
    if (!structon) {
      text = "Strukturelemente Aus";
    }
    addLabel(status, text, span);
    r.getAnnotations().forEach((annotation) => {
      if (annotation.body[0].value == "Strukturelement") {
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
    var span =
      "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle description'>";
    var text = "Desktriptive Elemente An";
    if (!descrpton) {
      text = "Desktriptive Elemente Aus";
    }
    addLabel(status, text, span);
    r.getAnnotations().forEach((annotation) => {
      if (annotation.body[0].value == "Desktriptives Element") {
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
      var span =
        "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle analyze'>";
      var text = "Analitysche Elemente An";
      if (!analiton) {
        text = "Analitysche Elemente Aus";
      }
      addLabel(status, text, span);
      r.getAnnotations().forEach((annotation) => {
        if (annotation.body[0].value == "Analitysches Element") {
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
  annotations.forEach((element) => {
    changeBackground(element);
  });
};

changeBackground = function (annotation) {
  var value = annotation.body[0].value;
  var elements = document.querySelectorAll(`[data-id="${annotation.id}"]`);
  for (i = 0; i < elements.length; i++) {
    element = elements[i];
    if (value == "Strukturelement") {
      if (structon) element.classList.add("structure");
      else element.classList.add("transparent");
    } else if (value == "Desktriptives Element") {
      if (analiton) element.classList.add("description");
      else element.classList.add("transparent");
    } else if (value == "Analitysches Element") {
      if (descrpton) element.classList.add("analyze");
      else element.classList.add("transparent");
    }
  }
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
      output.innerHTML = reader.result;
    };
    console.log(reader.result);
    resetOnOff();
    getPopup("Datei geöffnet");
  };
});

addLabel = function (element, text, span) {
  element.innerHTML = text + span;
};

resetOnOff = function () {
  structon = true;
  descrpton = true;
  analiton = true;
  var statusStruc = document.getElementById("struc-onoff");
  var statusDesc = document.getElementById("desc-onoff");
  var statusAnalit = document.getElementById("analit-onoff");
  addLabel(
    statusStruc,
    "Strukturelemente An",
    "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle analyze'></span>"
  );
  addLabel(
    statusDesc,
    "Desktriptive Elemente An",
    "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle description'></span>"
  );
  addLabel(
    statusAnalit,
    "Analytische Elemente An",
    "<span class='position-absolute top-100 start-50 translate-middle p-2 border border-light rounded-circle analyze'></span>"
  );
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
