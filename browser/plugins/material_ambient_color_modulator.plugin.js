E2.p = E2.plugins["material_ambient_color_modulator"] = function(core, node)
{
	this.desc = 'Set the ambient color.';
	
	this.input_slots = [ 
		{ name: 'material', dt: core.datatypes.MATERIAL, desc: 'Input material.', def: core.renderer.material_default },
		{ name: 'color', dt: core.datatypes.COLOR, desc: 'The material ambient color.', def: core.renderer.color_black } 
	];
	
	this.output_slots = [
		{ name: 'material', dt: core.datatypes.MATERIAL, desc: 'The modified material.' }
	];
};

E2.p.prototype.update_input = function(slot, data)
{
	if(slot.index === 0)
		this.material = data;
	else
		this.color = data;
};

E2.p.prototype.update_state = function()
{
	this.material.ambient_color = this.color;
};

E2.p.prototype.update_output = function(slot)
{
	return this.material;
};

E2.p.prototype.state_changed = function(ui)
{
	if(!ui)
	{
		this.material = new Material();
		this.color = vec4.createFrom(0, 0, 0, 1);
	}
};
