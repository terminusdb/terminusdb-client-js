function TerminusDocumentViewer(client, config){
	this.config = config;
	this.client = client;
	this.load_schema = false;
}

TerminusDocumentViewer.prototype.show = function(id, then){
	this.loadDocument(id)
	.then(() => {
		const d = this.render();
		if(then){
			then(d);
		}
	});
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
	else if(typeof this.renderer == "function"){
		var x = this.renderer(this.document);
		return x;
	}
	else {
		alert("didna make it " + JSON.stringify(Object.keys(this.renderer)));
	}
}

TerminusDocumentViewer.prototype.getObjectRenderer = function(doc, config){
	if(config && config.render && typeof config.render == "function"){
		return config.render;
	}
	var fd = new FilteredDocumentViewer(doc, config, this);
	return fd;
}

function FilteredDocumentViewer(doc, config, tdv){
	this.doc = doc;
	this.config = config;
	var self = this;
	function onmatch(frame, rule){
		if(typeof rule.render != "undefined"){
			frame.render = rule.render;
		}
		else {
			if(rule.renderer){
				var renderer = self.getRenderer(rule.renderer, frame, rule.args, tdv);
			}
			else {
				if(frame.isProperty()) var renderer = self.getDefaultPropertyRenderer(config, frame, rule.args, tdv);
				else if(frame.isObject()) var renderer = self.getDefaultObjectRenderer(config, frame, rule.args, tdv);
				else if(frame.isData()) var renderer = self.getDefaultDataRenderer(config, frame, rule.args, tdv);
			}
			if(renderer && renderer.render){
				frame.render = renderer.render;
			}
		}
		if(rule.compare){
			frame.compare = rule.compare;
		}
	}
	this.doc.filter(config.rules, onmatch);
}

FilteredDocumentViewer.prototype.getRenderer = function(rendname, frame, args, tdv){
	var evalstr = "new " + rendname + "(";
	if(args) evalstr += JSON.stringify(args);
	evalstr += ");";
	try {
		var nr = eval(evalstr);
		return nr;
	}
	catch(e){
		return false;
	}
}


FilteredDocumentViewer.prototype.getDefaultObjectRenderer = function(config, frame, args, tdv){
	return this.getRenderer(config['object_renderer'], frame, args, tdv);
}

FilteredDocumentViewer.prototype.getDefaultPropertyRenderer = function(config, frame, args, tdv){
	return this.getRenderer(config['property_renderer'], frame, args, tdv);
}

FilteredDocumentViewer.prototype.getDefaultDataRenderer = function(config, frame, args, tdv){
	return this.getRenderer(config['data_renderer'], frame, args, tdv);
}

FilteredDocumentViewer.prototype.render = function(doc){
	if(doc.render){		
		return doc.render(doc);
	}
}

module.exports = TerminusDocumentViewer ;