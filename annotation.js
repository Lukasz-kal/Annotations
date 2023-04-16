var path;
var structon = true;
var descrpton = true;
var analiton = true;
var fileName;

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
    a.setAttribute("download", "annotations-"+fileName);
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
          element.classList.toggle("transparent"); 
        }
      });
    });

    document.getElementById('desc-onoff').addEventListener('click', function() {
      descrpton = !descrpton;
      r.getAnnotations().forEach(annotation => {
      if (annotation.body[0].value == "Desktriptives Element")
        {
          var element = document.querySelector(`[data-id="${annotation.id}"]`);
          element.classList.toggle("transparent"); 
        }
      });
    });

    document.getElementById('analit-onoff').addEventListener('click', function() {
      analiton = !analiton;
      r.getAnnotations().forEach(annotation => {
      if (annotation.body[0].value == "Analitysches Element")
        {
          var element = document.querySelector(`[data-id="${annotation.id}"]`);
          element.classList.toggle("transparent");
        }
      });
    });
  }();

  installRenderingPatch = function(recogito) {
    const annotations = recogito.getAnnotations();
    annotations.forEach(element => {
      changeBackground(element);
    });
    //addOverlappingSpans(annotations);
  }

  changeBackground = function(annotation) {
    var value = annotation.body[0].value
    var elements = document.querySelectorAll(`[data-id="${annotation.id}"]`);
    for(i=0; i < elements.length; i++)
    {
      element = elements[i];
      if (value == "Strukturelement")
      {
        if (structon) element.classList.add("structure");
        else element.classList.add("transparent");
      }
      else if (value == "Desktriptives Element")
      {
        if(analiton) element.classList.add("description");     
        else element.classList.add("transparent");
      }
      else if (value == "Analitysches Element")
      {
        if(descrpton) element.classList.add("analyze");
        else element.classList.add("transparent");
      }
    }
  }

  addOverlappingSpans = function(annotations) {    
    if (annotations.length > 1)
    {
      annotations.sort(function(a,b){
      if(a.target.selector[1].start == b.target.selector[1].start)
          return 0;
      if(a.target.selector[1].start < b.target.selector[1].start)
          return -1;
      if(a.target.selector[1].start > b.target.selector[1].start)
          return 1;
      });
      annotations.forEach((element, index) => {
        if (index < annotations.length-1)
        {
          var next = index+1;
          if (annotations[next].target.selector[1].start <= element.target.selector[1].end)
          {
            const [ domStart, domEnd ] = charOffsetsToDOMPosition([annotations[next].target.selector[1].start, element.target.selector[1].end]);
            var range = new Range();
            range.setStart(domStart.node, domStart.offset);
            range.setEnd(domEnd.node, domEnd.offset);
            var mixedArea = document.createElement('span');
            mixedArea.append(range.extractContents());
            range.insertNode(mixedArea);
            var span = mixedArea.getElementsByTagName('span')[0];
            span.classList.add('mixed');
          }
        }
      })
    }
  }

  document.getElementById('open-file').addEventListener('click', function() {
    var input = document.createElement('input');
    input.type = 'file';
    input.id = 'inputFile';
    input.accept= '.txt';
    input.click();
    input.onchange = function() {
        var reader = new FileReader();
        reader.readAsText(input.files[0]);
        fileName = input.files[0].name;
        var output = document.getElementById('textToAnnotate');
        reader.onload = function() {
            output.innerHTML = reader.result;
        }
        console.log(reader.result);
    }    
  });

  wrapRange = (range, commonRoot) => {
    const root = commonRoot ? commonRoot : this.el;

    const surround = range => {
      var wrapper = document.createElement('SPAN');
      range.surroundContents(wrapper);
      return wrapper;
    };

    if (range.startContainer === range.endContainer) {
      return [ surround(range) ];
    } else {
      var nodesBetween =
        this.textNodesBetween(range.startContainer, range.endContainer, root);

      // Start with start and end nodes
      var startRange = document.createRange();
      startRange.selectNodeContents(range.startContainer);
      startRange.setStart(range.startContainer, range.startOffset);
      var startWrapper = surround(startRange);

      var endRange = document.createRange();
      endRange.selectNode(range.endContainer);
      endRange.setEnd(range.endContainer, range.endOffset);
      var endWrapper = surround(endRange);

      var centerWrappers = nodesBetween.reverse().map(function(node) {
        const wrapper = document.createElement('SPAN');
        node.parentNode.insertBefore(wrapper, node);
        wrapper.appendChild(node);
        return wrapper;
      });

      return [ startWrapper ].concat(centerWrappers,  [ endWrapper ]);
    }
  }

  charOffsetsToDOMPosition = charOffsets => {
    const maxOffset = Math.max.apply(null, charOffsets);

    const textNodeProps = (() => {
      let start = 0;
      return walkTextNodes(document.getElementById('textToAnnotate'), maxOffset).map(function(node) {
        var nodeLength = node.textContent.length,
            nodeProps = { node: node, start: start, end: start + nodeLength };

        start += nodeLength;
        return nodeProps;
      });
    })();

    return calculateDomPositionWithin(textNodeProps, charOffsets);
  }

  walkTextNodes = (node, stopOffset) => {
    const nodes = [];

    const ni = document.createNodeIterator(node, NodeFilter.SHOW_TEXT)
    var runningOffset = 0;
    let n = ni.nextNode();
    while (n != null) {
      runningOffset += n.textContent.length;
      nodes.push(n);
      if (runningOffset > stopOffset) {
        break;
      }
      n = ni.nextNode();
    }
    return nodes
  }

  calculateDomPositionWithin = (textNodeProperties, charOffsets) => {
    var positions = [];

    textNodeProperties.forEach(function(props, i) {
      charOffsets.forEach(function(charOffset, j)  {
        if (charOffset >= props.start && charOffset <= props.end) {
          var previousOffset = (positions.length > 0) ?
                positions[positions.length - 1].charOffset : false;

          if (previousOffset !== charOffset)
            positions.push({
              charOffset: charOffset,
              node: props.node,
              offset: charOffset - props.start
            });
        }
      });

      // Break (i.e. return false) if all positions are computed
      return positions.length < charOffsets.length;
    });

    return positions;
  }

  tippy('#struc-onoff', {
    content() {
      const template = document.getElementById('struc');
      return template.innerHTML;
    },
    allowHTML: true,
  });

  tippy('#desc-onoff', {
    content() {
      const template = document.getElementById('desc');
      return template.innerHTML;
    },
    allowHTML: true,
  });

  tippy('#analit-onoff', {
    content() {
      const template = document.getElementById('analit');
      return template.innerHTML;
    },
    allowHTML: true,
  });


  