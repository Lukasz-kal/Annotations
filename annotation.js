var path;
var structon = true;
var descrpton = true;
var analiton = true;

var recogito = function() {
    // Intialize Recogito
    var r = Recogito.init({
      content: 'textToAnnotate',
      locale: 'auto',
        widgets: [
        { widget: 'COMMENT' },
        { widget: 'TAG', vocabulary: [ 'Strukturelement', 'Desktriptives Element', 'Analitysches Element' ] }
      ],
    });

    r.on('selectAnnotation', function(a) {
      console.log('selected', a);
      console.log(a.id);
    });


    r.on('createAnnotation', function(a) {
      console.log('created', a);
      installRenderingPatch(r);
    });

    r.on('updateAnnotation', function(annotation, previous) {
      console.log('updated', previous, 'with', annotation);
    });


    filterByBodyType = function(bodyType) {
      return annotations.filter(function(a) {
        var bodiesOfType = Utils.getBodiesOfType(a, bodyType);
        return bodiesOfType.length > 0;
      });
    },

    document.getElementById('save-annotation').addEventListener('click', function() {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([JSON.stringify(r.getAnnotations(), null, 2)], {
      type: "text/plain"
    }));
    a.setAttribute("download", "data.txt");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    console.log("saved");
    });

    document.getElementById('load-annotation').addEventListener('click', function() {
      var input = document.createElement('input');
      input.type = 'file';
      input.id = 'inputFile';
      input.click();
      input.onchange = function() {
          var reader = new FileReader();
          reader.readAsText(input.files[0]);
          var path = URL.createObjectURL(input.files[0]);
          r.loadAnnotations(path).then(function(a) {
            installRenderingPatch(r);
            console.log('loaded', a);
          });
        }
    });

    document.getElementById('struc-onoff').addEventListener('click', function() {
      structon = !structon;
      
      r.getAnnotations().forEach(annotation => {
      if (annotation.body[0].value == "Strukturelement")
        {
          var element = document.querySelector(`[data-id="${annotation.id}"]`);
          if (structon)
          {
            document.getElementById('struc-onoff').innerHTML = "Strukturelemente aus";
            element.classList.replace("transparent", "structure"); 
          }
          else
          {
            document.getElementById('struc-onoff').innerHTML = "Strukturelemente an";
            element.classList.replace("structure", "transparent");
          }
        }
      });
    });

    document.getElementById('desc-onoff').addEventListener('click', function() {
      descrpton = !descrpton;
      r.getAnnotations().forEach(annotation => {
      if (annotation.body[0].value == "Desktriptives Element")
        {
          var element = document.querySelector(`[data-id="${annotation.id}"]`);
          if (descrpton)
          {
            document.getElementById('desc-onoff').innerHTML = "Desktriptive Elemente aus";
            element.classList.replace("transparent", "description"); 
          }
          else
          {
            document.getElementById('desc-onoff').innerHTML = "Desktriptive Elemente an";
            element.classList.replace("description", "transparent");
          }
        }
      });
    });

    document.getElementById('analit-onoff').addEventListener('click', function() {
      analiton = !analiton;
      r.getAnnotations().forEach(annotation => {
      if (annotation.body[0].value == "Analitysches Element")
        {
          var element = document.querySelector(`[data-id="${annotation.id}"]`);
          if (analiton)
          {
            document.getElementById('analit-onoff').innerHTML = "Analitysche Elemente aus";
            element.classList.replace("transparent", "analyze");
          }
          else
          {
            document.getElementById('analit-onoff').innerHTML =  "Analitysche Elemente an";
            element.classList.replace("analyze", "transparent");
          }
        }
      });
    });
  }();

  installRenderingPatch = function(recogito) {
    const annotations = recogito.getAnnotations();
    annotations.forEach(element => {
      changeBackground(element);
    });
  }

  changeBackground = function(annotation) {
    if (annotation.body[0].value == "Strukturelement")
    {
      var element = document.querySelector(`[data-id="${annotation.id}"]`);
      if (structon)
      {
        element.classList.add("structure");
      }
      else element.classList.add("transparent");
    }
    if (annotation.body[0].value == "Desktriptives Element")
    {
      var element = document.querySelector(`[data-id="${annotation.id}"]`);
      element.classList.add("description");
    }
    if (annotation.body[0].value == "Analitysches Element")
    {
      var element = document.querySelector(`[data-id="${annotation.id}"]`);
      element.classList.add("analyze");
    }
  }

  function openFile() {
    var input = document.createElement('input');
    input.type = 'file';
    input.id = 'inputFile';
    input.accept= '.txt';
    input.click();
    input.onchange = function() {
        var reader = new FileReader();
        reader.readAsText(input.files[0]);
        var path = URL.createObjectURL(input.files[0]);
        console.log(path);
        var output = document.getElementById('textToAnnotate');
        reader.onload = function() {
            output.innerHTML = reader.result;
        }
        console.log(reader.result);
    }    
  };


  