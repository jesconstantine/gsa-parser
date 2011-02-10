$.ajax( {
	type : "GET",
	url : "xml/timeline.xml",
	dataType : "xml",
	success : function(xml) {
		$(xml).find("Year").each(
				function() {
					var year = $(this).attr("year");
					var entries = '<div id="y_' + year 	+ '" class="timeYear"><h2 class="timeYearHead">' + year + '</h2><ul class="timeEvents">';
					$(this).find("Event").each(
							function(i) {
								var event = $(this).text();
								entries += '<li id="e_' + year + '_' + i + '" class="timeEvent">' + event + '</li>';
							}); // close find Event
					entries += '</ul></div>';
					$(entries).appendTo("div#timeLine");
					
		}); // close find Year
	} // close xml function
}); // close ajax



