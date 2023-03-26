var recogito = function() {
    // Intialize Recogito
    var r = Recogito.init({
      content: 'textToAnnotate',
      locale: 'auto',
        widgets: [
        { widget: 'KOMMENTAR' },
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
      element.classList.add("structure");
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
        var output = document.getElementById('textToAnnotate');
        reader.onload = function() {
            output.innerHTML = reader.result;
        }
        console.log(reader.result);
    }    
  };


  