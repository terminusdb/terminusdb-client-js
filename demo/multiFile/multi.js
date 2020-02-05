
var dbClient = new TerminusClient.WOQLClient();
var connection=dbClient.connect("http://195.201.12.87:6365/", "connectors wanna plans compressed","rational_warehouse");

var WOQL = TerminusClient.WOQL;

(function () {
	var fileCatcher = document.getElementById('file-catcher');
  var fileInput = document.getElementById('file-input');
  var fileListDisplay = document.getElementById('file-list-display');
  
  var fileList = [];
  var renderFileList, sendFile;
  
  fileCatcher.addEventListener('submit', function (evnt) {
  	evnt.preventDefault();
    fileList.forEach(function (file) {
    	sendFile(file);
    });
  });
  
  fileInput.addEventListener('change', function (evnt) {
 		fileList = [];

    console.log("__FILELIST___",fileInput.files);

  	for (var i = 0; i < fileInput.files.length; i++) {
    	fileList.push(fileInput.files[i]);
    }
    renderFileList();
  });
  
  renderFileList = function () {
  	fileListDisplay.innerHTML = '';
    fileList.forEach(function (file, index) {
    	var fileDisplayEl = document.createElement('p');
      fileDisplayEl.innerHTML = (index + 1) + ': ' + file.name;
      fileListDisplay.appendChild(fileDisplayEl);

      const query=WOQL.and(
            WOQL.quad("v:Element","type","Class","schema"),
            WOQL.opt().quad("v:Element","label","v:Label","schema"),
            WOQL.opt().quad("v:Element","comment","v:Comment","schema"),
            WOQL.opt().quad("v:Element","tcs:tag","v:Abstract","schema")
            )

      console.log(formData);
    
      query.execute(dbClient,formData);
    });



  };
  
  sendFile = function (file) {
  	var formData = new FormData();
    formData.set('file', file);

    var request = new XMLHttpRequest();
       
    request.open("POST", 'https://localhost');
    request.send(formData);
  };
})();