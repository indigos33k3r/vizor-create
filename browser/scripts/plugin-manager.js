function PluginManager(core, base_url, registration_listener, creation_listener, ready_listener) 
{
	var that = this;

	this.base_url = base_url;
	this.core = core;
	this.keybyid = {};
	this.release_mode = false;
	this.lid = 1;
	this.context_menu = null;
	this.total = 0;
	this.loaded = 0;
	this.failed = 0;
	this._registration_listener = registration_listener;
	this._ready_listener = ready_listener

	// First check if we're running a release build by checking for the existence
	// of 'all.plugins.js'
	var url = this.base_url + '/all.plugins.js';

	$.ajax({
		url: url,
		type: 'GET',
		async: false,
		cache: true,
		success: function() 
		{
			msg('PluginMgr: Running in release mode');
			that.release_mode = true;
		},
		error: function()
		{
			msg('PluginMgr: Running in debug mode');
		}
	});

	$.ajax({
		url: this.base_url + '/plugins.json',
		dataType: 'json',
		async: false,
		cache: true,
		headers: {},
		success: function(data)
		{
			var pg_root = new PluginGroup('root');
			
			$.each(data, function(key, id) 
			{
				that.total++;
			});
			
			$.each(data, function(key, id) 
			{
				// Load the plugin, constrain filenames.
				var url = that.base_url + '/' + id + '.plugin.js';

				if(!that.release_mode)
					load_script(url, that.onload.bind(that), that.onerror.bind(that));

				that.register_plugin(pg_root, key, id);
			});
			
			if(creation_listener)
				that.context_menu = new ContextMenu(E2.dom.canvas_parent, pg_root.create_items(), creation_listener);
		}
	});

	if(this.release_mode)
	{
		this.total = 1;
		load_script(url, this.onload.bind(that), this.onerror.bind(that));
	}
}

PluginManager.prototype.register_plugin = function(pg_root, key, id)
{
	this.keybyid[id] = pg_root.insert_relative(key, id);

	if (this._registration_listener)
		this._registration_listener(key, id);

	msg('\tLoaded ' + id + ' (' + this.lid + ')');
	this.lid++;
};

PluginManager.prototype.update_state = function()
{
	if(this.loaded + this.failed === this.total)
		this._ready_listener();
};

PluginManager.prototype.onload = function()
{
	this.loaded++;
	this.update_state();
};

PluginManager.prototype.onerror = function()
{
	this.failed++;
	this.update_state();
};

PluginManager.prototype.create = function(id, node) 
{
	if (E2.plugins.hasOwnProperty(id))
	{
		var p = new E2.plugins[id](this.core, node);
		p.id = id;
		return p;
	}
		 
	console.assert(false, 'Failed to resolve plugin with id \'' + id + '\'. Please check that the right id is specified by the plugin implementation.');

	return null;
};
