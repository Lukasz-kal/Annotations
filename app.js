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

