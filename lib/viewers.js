function TerminusHTMLViewer(client, config){
	this.client = client;
	if(config && config.render){
		this.render = config.render;
	}
}

TerminusHTMLViewer.prototype.table = function(query, config){
	var span = document.createElement("span");
	var wv = new WOQLViewer(this.client, config);
	if(this.render) {
		wv.setRenderer(this.render);
	}
	else {
		var wqt = new WOQLTableViewer(config);
		wv.setRenderer(wqt);
	}
	function afterRender(rendered){
		span.appendChild(rendered);
	}
	wv.query(query).show(afterRender);
	return span;
}

//wv.setRenderer( function(wresult, wquery){
//	(rendered, result, query)
//}

TerminusHTMLViewer.prototype.chooser = function(query, config){
	var span = document.createElement("span");
	var wv = new WOQLViewer(this.client, config);
	if(this.render) {
		wv.setRenderer(this.render);
	}
	else {
		var wqt = new WOQLChoiceViewer(config);
		wv.setRenderer(wqt);
	}
	function afterRender(rendered){
		span.appendChild(rendered);
	}
	wv.query(query).show(afterRender);
	return span;
}

TerminusHTMLViewer.prototype.graph = function(query, config){}

TerminusHTMLViewer.prototype.document = function(id, config){
	var tdv = new TerminusDocumentViewer(this.client, config);
	//tdv.setRenderers("html");//sets default html style 
	return tdv.show(id);	
}



function WOQLChoiceViewer(config, choice){
	this.config = config;
	this.empty_choice = false;
	this.show_single = true;
	this.choice = choice;
	this.element_value = (config && config.element_value ? config.element_value : "v:Element");
	this.element_label = (config && config.element_label ? config.element_label : "v:Label");
}

WOQLChoiceViewer.prototype.change = function(val){
	console.log(val + " should be set ...");
}


WOQLChoiceViewer.prototype.render = function(result){
	const bindings = result.getBindings();
	var ccdom = document.createElement("span");
	ccdom.setAttribute("class", "woql-chooser");
	var ccsel = document.createElement("select");
	ccsel.setAttribute("class", " woql-chooser");
	var self = this;
	ccsel.addEventListener("change", function(){
		this.choice = this.value;
		self.change(this.value);
		this.value = "";
	});
	ccdom.appendChild(ccsel);
	var opts = this.getResultsAsOptions(bindings);
	if(opts){
		for(var i = 0; i<opts.length; i++){
			ccsel.appendChild(opts[i]);
		}
		this.options = opts;
	}
	else {
		ccdom.removeChild(ccsel);
	}
	return ccdom;
}

WOQLChoiceViewer.prototype.getResultsAsOptions = function(bindings){
	var choices = [];
	if(bindings){
		if(this.show_single == false && bindings.length < 2) return false;
		if(this.empty_choice){
			var opt1 = document.createElement("option");
			opt1.setAttribute("class", "terminus-class-choice terminus-empty-choice");
			opt1.value = "";
			opt1.appendChild(document.createTextNode(this.empty_choice));
			choices.push(opt1);
		}
		var added = [];
		for(var i = 0; i<bindings.length; i++){
			if(bindings[i][this.element_value]){
				var elid = bindings[i][this.element_value];
			}
			else {
				elid = Object.keys(bindings[i])[0];
			}
			if(elid && added.indexOf(elid) == -1){
				added.push(elid);
				var opt = document.createElement("option");
				opt.setAttribute("class", "terminus-woql-choice");
				opt.value = elid;
				if(opt.value == this.choice){
					opt.selected = true;
				}
				if(bindings[i][this.element_label]){
					var lab = bindings[i][this.element_label];
				}
				if(!lab || lab == "unknown"){
					lab = TerminusClient.FrameHelper.labelFromURL(elid);
				}
				if(lab["@value"]) lab = lab["@value"];
				opt.appendChild(document.createTextNode(lab));
				choices.push(opt);
			}
		}
	}
	return choices;
}




function WOQLTableViewer(config){
	this.config = config;
}

WOQLTableViewer.prototype.render = function(result){
	const bindings = result.getBindings();
	var tab = document.createElement("table");
	tab.setAttribute("class", "terminus-hover-table");
	var thead = document.createElement("thead");
	var thr = document.createElement("tr");
	var ordered_headings = this.orderColumns(bindings[0]);
	for(var i = 0; i<ordered_headings.length; i++){
		var th = document.createElement("th");
		th.setAttribute('class', 'terminus-table-header-full-css');
		var clab = (ordered_headings[i].indexOf("http") != -1) ? TerminusClient.FrameHelper.labelFromURL(ordered_headings[i]) : ordered_headings[i];
		th.appendChild(document.createTextNode(clab));
		thr.appendChild(th);
	}
	thead.appendChild(thr);
	tab.appendChild(thead);
	var tbody = this.getTableBody(bindings, ordered_headings);
	tab.appendChild(tbody);
	return tab;
}

WOQLTableViewer.prototype.orderColumns = function(sample){
	var ordered = [];
	for(var h in sample){
		if(ordered.indexOf(h) == -1){
			ordered.unshift(h);
		}
	}
	return ordered;
}

WOQLTableViewer.prototype.getTableBody = function(bindings, ordered_headings){
	var tbody = document.createElement("tbody");
	var self = this;
	for(var i = 0; i<bindings.length; i++){
		var tr = document.createElement("tr");
		for(var j = 0; j<ordered_headings.length; j++){
			var td = document.createElement("td");
			if(typeof bindings[i][ordered_headings[j]] == "object"){
				var lab = (bindings[i][ordered_headings[j]]['@value'] ? bindings[i][ordered_headings[j]]['@value'] : "?");
			}
			else if(typeof bindings[i][ordered_headings[j]] == "string") {
				var lab = bindings[i][ordered_headings[j]];//this.result.shorten(bindings[i][ordered_headings[j]]);
			}
			if(lab == "unknown") lab = "";
			if(lab.substring(0, 4) == "doc:"){
				//var a = this.getDocumentLocalLink(lab);
				//td.appendChild(a);
			}
			else {
				//HTMLFrameHelper.wrapShortenedText(td, lab, this.max_cell_size, this.max_word_size);
			}
			td.appendChild(document.createTextNode(lab));
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	return tbody;
}


function TerminusDocumentViewer(client, config){
	this.config = config;
	this.client = client;
	this.load_schema = false;
}

TerminusDocumentViewer.prototype.show = function(id){
	var holder = document.createElement("span");
	this.loadDocument(id)
	.then(() => {
		var d = this.render();
		if(d) holder.appendChild(d);
	});
	return holder;
}


TerminusDocumentViewer.prototype.loadDocument = function(url, cls){
	if(!url) return false;
	var self = this;
	if(url.substring(0,4) == "doc:"){
		url = url.substring(4);
	}
	return this.client.getDocument(url, {"terminus:encoding": "terminus:frame"})
	.then(function(response){
		self.loadDataFrames(response);
		if(self.load_schema){
			self.loadDocumentSchema(self.document.cls);
		}
		return response;
	});
}

TerminusDocumentViewer.prototype.loadDocumentSchema = function(cls){
	var self = this;
	var ncls = TerminusClient.FrameHelper.unshorten(cls);
	return this.client.getClassFrame(false, ncls)
	.then(function(response){
		return self.loadSchemaFrames(response, cls);
	});
}

TerminusDocumentViewer.prototype.loadDataFrames = function(dataframes, cls){
	if(!cls){
		if(this.document) cls = this.document.cls;
		else {
			if(dataframes && dataframes.length && dataframes[0] && dataframes[0].domain){
				cls = dataframes[0].domain;
			}
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls, dataframes);
		}
		else {
			this.document.loadDataFrames(dataframes);
		}
	}
	else {
		console.log("Missing Class" + " " + "Failed to add dataframes due to missing class");
	}
}

TerminusDocumentViewer.prototype.loadSchemaFrames = function(classframes, cls){
	if(!cls){
		if(classframes && classframes.length && classframes[0] && classframes[0].domain){
			cls = classframes[0].domain;
		}
	}
	if(cls){
		if(!this.document){
			this.document = new TerminusClient.ObjectFrame(cls);
		}
		if(classframes){
			this.document.loadClassFrames(classframes);
			if(!this.document.subjid){
				this.document.newDoc = true;
				this.document.fillFromSchema("_:");
			}
		}
	}
	else {
		console.log("Missing Class", "Failed to add class frames due to missing class");
	}
}

TerminusDocumentViewer.prototype.render = function(){
	if(!this.renderer && this.document){
		this.renderer = this.getObjectRenderer(this.document, this.config);
	}
	if(this.renderer.render){
		return this.renderer.render(this.document);
	}
	else {
		return this.renderer(this.document);
	}
}

TerminusDocumentViewer.prototype.getObjectRenderer = function(doc, config){
	if(config && config.render){
		return config.render;
	}
	var fd = new FilteredDocumentViewer(doc, config);
	return fd;
}

function FilteredDocumentViewer(doc, config){
	this.doc = doc;
	this.config = config;
	function onmatch(frame, rule){
		if(rule.render){
			frame.render = rule.render;
		}
	}
	this.doc.filter(config.rules, onmatch);
}

FilteredDocumentViewer.prototype.render = function(doc){
	if(doc.render){		
		return doc.render(doc);
	}
}
