(function (riot) {
	'use strict';

	riot = riot && riot.hasOwnProperty('default') ? riot['default'] : riot;

	riot.tag2('n8d-resources', '<div class="main"> <h1>Resources</h1> <virtual if="{this.manifest == null && !this.error}"> <p>Loading...</p> </virtual> <div if="{error}" class="error"> <h2>Error</h2> <p>{error.message}</p> </div> <div class="entry-wrapper"> <div each="{entry in manifest}" class="entry"> <a href="{entry.url}" target="_blank"> <div class="link-button">{entry.label}</div> </a> </div> </div> </div>', 'n8d-resources .main,[data-is="n8d-resources"] .main{ background-color: #777777; text-align: center; border-radius: 3rem; border: 1rem solid black; } n8d-resources h1,[data-is="n8d-resources"] h1{ color: #383838; user-select: none; } n8d-resources .entry-wrapper,[data-is="n8d-resources"] .entry-wrapper{ padding-bottom: 5rem; } n8d-resources .entry,[data-is="n8d-resources"] .entry{ padding-bottom: 1rem; } n8d-resources .link-button,[data-is="n8d-resources"] .link-button{ background-color: #FF0000; width: 50%; left: 25%; position: relative; color: #000000; border-radius: 1rem; user-select: none; transition-duration: 3s; font-size: 1.2rem; } n8d-resources .link-button:hover,[data-is="n8d-resources"] .link-button:hover{ color: #FF0000; background-color: #000000; transition-duration: 1s; } n8d-resources a,[data-is="n8d-resources"] a{ text-decoration: none; } n8d-resources .error,[data-is="n8d-resources"] .error{ color: #D00000; }', 'riot-src="{src}"', function(opts) {
			let tag = this;
			this.src = opts.src;
			this.manifest = null;
			this.error = null;

			this.logErr = function(err){
				tag.error = err;
				tag.update();
			};

			fetch(this.src).catch(function(err){
				tag.logErr(err);
			}).then(function(res){
				if(res.status < 400){
					return res.json();
				}
				throw res;
			}).catch(function(err){
				tag.logErr(err);
			}).then(function(json){
				tag.manifest = json;
				tag.update();
			});
	});

}(riot));
