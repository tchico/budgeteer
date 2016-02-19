Template.categories.rendered = function(){
	$(".select2_parent").select2({
	        placeholder: "Select a parent",
	        allowClear: true
	});
	$(".select2_cat_type").select2({
	        placeholder: "Select a type",
	        allowClear: true
	});

};