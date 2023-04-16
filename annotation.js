var path;
var structon = true;
var descrpton = true;
var analiton = true;
var fileName;

var recogito = (function () {
  // Intialize Recogito
  var r = Recogito.init({
    content: "textToAnnotate",
    locale: "auto",
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
    console.log("created", a);
    installRenderingPatch(r);
  });

  r.on("updateAnnotation", function (annotation, previous) {
    console.log("updated", previous, "with", annotation);
  });
  document
    .getElementById("save-annotation")
    .addEventListener("click", function () {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([JSON.stringify(r.getAnnotations(), null, 2)], {
          type: "text/plain",
        })
      );
      a.setAttribute("download", "annotations-" + fileName);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      console.log("saved");
    });

  document
    .getElementById("load-annotation")
    .addEventListener("click", function () {
      var input = document.createElement("input");
      input.type = "file";
      input.id = "inputFile";
      input.click();
      input.onchange = function () {
        var reader = new FileReader();
        reader.readAsText(input.files[0]);
        var path = URL.createObjectURL(input.files[0]);
        r.loadAnnotations(path).then(function (a) {
          installRenderingPatch(r);
          console.log("loaded", a);
        });
      };
    });

  document.getElementById("struc-onoff").addEventListener("click", function () {
    structon = !structon;

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
  };
});

tippy("#struc-onoff", {
  content() {
    const template = document.getElementById("struc");
    return template.innerHTML;
  },
  allowHTML: true,
});

tippy("#desc-onoff", {
  content() {
    const template = document.getElementById("desc");
    return template.innerHTML;
  },
  allowHTML: true,
});

tippy("#analit-onoff", {
  content() {
    const template = document.getElementById("analit");
    return template.innerHTML;
  },
  allowHTML: true,
});
